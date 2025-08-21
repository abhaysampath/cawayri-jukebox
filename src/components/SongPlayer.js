import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import SongConfig from '../config/songConfig';
import MoodManager from './MoodManager';
import MarqueeText from './MarqueeText';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon } from '@phosphor-icons/react';
import '../css/song-player.css';

export default function SongPlayer({ songIndex, setSongIndex, onSongTimeUpdate, onAudioContextUpdate, onPlayingStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const soundRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const current = SongConfig[songIndex];

  const unlockAudio = async () => {
    if (!audioUnlocked && Howler.ctx) {
      try {
        await Howler.ctx.resume();
        setAudioUnlocked(true);
        setupAudioAnalyser();
      } catch (error) {
        console.warn('Failed to unlock audio context:', error);
      }
    }
  };

  const setupAudioAnalyser = () => {
    if (Howler.ctx && !analyserRef.current) {
      try {
        // Create analyser node
        analyserRef.current = Howler.ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        // Connect to destination
        analyserRef.current.connect(Howler.ctx.destination);
        
        // Pass audio context and analyser to parent
        if (onAudioContextUpdate) {
          onAudioContextUpdate({
            audioContext: Howler.ctx,
            analyserNode: analyserRef.current
          });
        }
      } catch (error) {
        console.warn('Failed to setup audio analyser:', error);
      }
    }
  };
  const shouldPlayRef = useRef(false);
  const handleNextSong = () => {
    shouldPlayRef.current = isPlaying;
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
  };
  const handlePrevSong = () => {
    shouldPlayRef.current = isPlaying;
    setSongIndex((i) => i === 0 ? SongConfig.length - 1 : i - 1);
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
      onload: () => {
        // Connect audio to analyser when loaded
        if (analyserRef.current && soundRef.current) {
          const sound = soundRef.current;
          // Get the audio node from Howler
          if (sound._sounds && sound._sounds[0] && sound._sounds[0]._node) {
            if (sourceRef.current) {
              sourceRef.current.disconnect();
            }
            try {
              sourceRef.current = Howler.ctx.createMediaElementSource(sound._sounds[0]._node);
              sourceRef.current.connect(analyserRef.current);
            } catch (error) {
              // Audio element might already be connected
              console.warn('Audio source connection warning:', error);
            }
          }
        }
      },
      onend: () => {
        if (isRepeating) {
          soundRef.current.seek(0);
          soundRef.current.play();
        } else {
          shouldPlayRef.current = true;
          setSongIndex((prev) => {
            const shuffle = typeof isShuffling === 'function' ? isShuffling() : isShuffling;
            if (shuffle) {
              let next;
              do {
                next = Math.floor(Math.random() * SongConfig.length);
              } while (next === prev);
              return next;
            }
            return (prev + 1) % SongConfig.length;
          });
        }
      },
      onplayerror: () => setIsPlaying(false)
    });

    MoodManager.setMood(current.color || '#fb8f61');
    setProgress(0);
    if (shouldPlayRef.current) {
      setIsPlaying(true);
      shouldPlayRef.current = false;
    }
    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [current, setSongIndex, isRepeating, isShuffling]);
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
          const elapsed = Math.floor(seek);
          if (onSongTimeUpdate) onSongTimeUpdate({ title: current.title, elapsed });
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
    
    // Update playing state for waveform
    if (onPlayingStateChange) {
      onPlayingStateChange(isPlaying);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, onSongTimeUpdate, current.title, onPlayingStateChange]);

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
        <button className={`icon-btn ${isRepeating ? 'active' : ''}`}
          onClick={() => setIsRepeating(!isRepeating)}
          title="Repeat"><RepeatIcon /></button>
        <button onClick={handlePrevSong} className="control-btn"><SkipBackIcon /></button>
        <button onClick={togglePlayPause} className="control-btn play-btn">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={handleNextSong} className="control-btn"><SkipForwardIcon /></button>
        <button className={`icon-btn ${isShuffling ? 'active' : ''}`}
          onClick={() => setIsShuffling(!isShuffling)}
          title="Shuffle"><ShuffleIcon /></button>
      </div>
      {!audioUnlocked && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Click to enable audio
        </div>
      )}
    </div>
  );
}
