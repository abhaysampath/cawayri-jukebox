import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import SongConfig from '../config/songConfig';
import MoodManager from './MoodManager';
import MarqueeText from './MarqueeText';
import '../css/song-player.css';

export default function SongPlayer({ songIndex, setSongIndex }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const soundRef = useRef(null);
  const current = SongConfig[songIndex];

  const unlockAudio = async () => {
    if (!audioUnlocked && Howler.ctx) {
      try {
        await Howler.ctx.resume();
        setAudioUnlocked(true);
      } catch (error) {
        console.warn('Failed to unlock audio context:', error);
      }
    }
  };

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }
    
    soundRef.current = new Howl({
      src: current.src,
      html5: true,
      volume: 1,
      preload: true,
      onend: () => setIsPlaying(false),
      onplayerror: () => setIsPlaying(false)
    });
    
    MoodManager.setMood(current.color);
    setProgress(0);
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [current]);
  useEffect(() => {
    if (!soundRef.current) return;

    let interval;
    if (isPlaying) {
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        Promise.resolve(playPromise).then(() => {
          interval = setInterval(() => {
            const seek = soundRef.current.seek();
            const duration = soundRef.current.duration();
            if (typeof seek === 'number' && duration > 0) {
              setProgress((seek / duration) * 100);
            }
          }, 500);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        interval = setInterval(() => {
          const seek = soundRef.current.seek();
          const duration = soundRef.current.duration();
          if (typeof seek === 'number' && duration > 0) {
            setProgress((seek / duration) * 100);
          }
        }, 500);
      }
    } else {
      if (soundRef.current) {
        soundRef.current.pause();
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSong = () => {
    setSongIndex((i) => (i + 1) % SongConfig.length);
    setIsPlaying(false);
  };

  const prevSong = () => {
    setSongIndex((i) => i === 0 ? SongConfig.length - 1 : i - 1);
    setIsPlaying(false);
  };

  const togglePlayPause = async () => {
    await unlockAudio();
    
    if (!isPlaying) {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        try {
          await Howler.ctx.resume();
        } catch (error) {
          console.warn('Failed to resume AudioContext:', error);
          return;
        }
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="song-player" onClick={unlockAudio}>
      <MarqueeText text={current.scrollText} />
      <h3 className="title-artist">
        {current.title} – {current.artist || 'Cawayri'}
      </h3>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="player-controls">
        <button onClick={prevSong} className="control-btn">⏮</button>
        <button onClick={togglePlayPause} className="control-btn play-btn">
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button onClick={nextSong} className="control-btn">⏭</button>
      </div>
      {!audioUnlocked && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Click to enable audio
        </div>
      )}
    </div>
  );
}
