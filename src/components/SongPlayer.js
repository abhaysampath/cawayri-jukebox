import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import SongConfig from '../config/songConfig';
import MoodManager from './MoodManager';
import MarqueeText from './MarqueeText';
import '../css/song-player.css';

export default function SongPlayer({ songIndex, setSongIndex, onSongTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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
    
    MoodManager.setMood(current.color || '#FFFFFF');
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
      const update = () => {
        const seek = soundRef.current.seek();
        const duration = soundRef.current.duration();
        if (typeof seek === 'number' && duration > 0) {
          setProgress((seek / duration) * 100);
          setElapsed(Math.floor(seek));
          if (onSongTimeUpdate) onSongTimeUpdate({ title: current.title, elapsed: Math.floor(seek) });
        }
      };
      if (playPromise !== undefined) {
        Promise.resolve(playPromise).then(() => {
          interval = setInterval(update, 500);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        interval = setInterval(update, 500);
      }
    } else {
      if (soundRef.current) {
        soundRef.current.pause();
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onSongTimeUpdate, current.title]);

  const nextSong = useCallback(() => {
    setSongIndex((prev) => {
      if (isShuffling) {
        let next;
        do {
          next = Math.floor(Math.random() * SongConfig.length);
        } while (next === prev);
        return next;
      }
      return (prev + 1) % SongConfig.length;
    });
    setIsPlaying(false);
  }, [isShuffling, setSongIndex]);
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.onend = () => {
        if (isRepeating) {
          soundRef.current.seek(0);
          soundRef.current.play();
        } else {
          nextSong();
        }
      };
    }
  }, [isRepeating, isShuffling, nextSong]);
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
      <h3 className="title-artist">
        {current.title} – {current.artist || 'Cawayri'}
      </h3>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
      <MarqueeText text={current.scrollText} />
      <div className="player-controls">
        <button
          className={`icon-btn ${isShuffling ? 'active' : ''}`}
          onClick={() => setIsShuffling(!isShuffling)}
          title="Shuffle"
        >
          🔀
        </button>
        <button onClick={prevSong} className="control-btn">⏮</button>
        <button onClick={togglePlayPause} className="control-btn play-btn">
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button onClick={nextSong} className="control-btn">⏭</button>
        <button
          className={`icon-btn ${isRepeating ? 'active' : ''}`}
          onClick={() => setIsRepeating(!isRepeating)}
          title="Repeat"
        >
          🔁
        </button>
      </div>
      {!audioUnlocked && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Click to enable audio
        </div>
      )}
    </div>
  );
}
