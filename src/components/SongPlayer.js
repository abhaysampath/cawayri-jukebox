import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import SongConfig from '../config/songConfig';
import MoodManager from './MoodManager';
import MarqueeText from './MarqueeText';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon } from '@phosphor-icons/react';
import { AudioVisualizer } from 'react-audio-visualize';
import '../css/song-player.css';

export default function SongPlayer({ songIndex, setSongIndex, onSongTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [vizWidth, setVizWidth] = useState(0);
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(false);

  const soundRef = useRef(null);
  const playerRef = useRef(null);
  const waveformRef = useRef(null);
  const hitareaRef = useRef(null);
  const isRepeatingRef = useRef(false);
  const isShufflingRef = useRef(false);
  const isScrubbingRef = useRef(false);
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
      onend: () => {
        if (isRepeatingRef.current) {
          soundRef.current.seek(0);
          soundRef.current.play();
        } else {
          shouldPlayRef.current = true;
          setSongIndex((prev) => {
          const shuffle = isShufflingRef.current;
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
    setElapsed(0);
    if (shouldPlayRef.current) {
      setIsPlaying(true);
      shouldPlayRef.current = false;
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [current, setSongIndex]);
  useEffect(() => {isRepeatingRef.current = isRepeating;}, [isRepeating]);
  useEffect(() => {isShufflingRef.current = isShuffling;}, [isShuffling]);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setAudioBlob(null);
    const url = Array.isArray(current.src) ? current.src[0] : current.src;
    if (!url) return;
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {if (isMounted) setAudioBlob(blob);})
      .catch((err) => {
        if (err.name !== 'AbortError') console.warn('Audio blob fetch error:', err);
      });
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [current]);

  useEffect(() => {
    const el = waveformRef.current || playerRef.current;
    if (!el) return;
    const compute = () => setVizWidth(Math.max(1, Math.floor(el.clientWidth)));
    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, [audioBlob]);

  useEffect(() => {
    if (!soundRef.current) return;
    let interval;
    if (isPlaying) {
      const playPromise = soundRef.current.play();
      const update = () => {
        const seek = soundRef.current.seek();
        const duration = soundRef.current.duration();
        if (typeof seek === 'number' && duration > 0) {
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
      setShowUnlockOverlay(false);
    } else {
      setIsPlaying(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => setShowUnlockOverlay(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const seekFromClientX = (clientX) => {
    const el = hitareaRef.current || waveformRef.current;
    const snd = soundRef.current;
    if (!el || !snd) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const duration = snd.duration();
    if (!duration || !isFinite(duration)) return;
    const t = ratio * duration;
    try {
      snd.seek(t);
      setElapsed(Math.floor(t));
    } catch (e) {
      // ignore
    }
  };

  const onMouseMove = (e) => {
    if (!isScrubbingRef.current) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
  };
  const onMouseUp = () => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  const onMouseDown = (e) => {
    unlockAudio();
    isScrubbingRef.current = true;
    seekFromClientX(e.clientX);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const onTouchMove = (e) => {
    if (!isScrubbingRef.current) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    seekFromClientX(touch.clientX);
  };
  const onTouchEnd = () => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  };
  const onTouchStart = (e) => {
    unlockAudio();
    isScrubbingRef.current = true;
    const touch = e.touches && e.touches[0];
    if (touch) seekFromClientX(touch.clientX);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  };
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <div ref={playerRef} className="song-player" onClick={unlockAudio}>
      <h3 className="title-artist">
        {current.title} – {current.artist || 'Cawayri'}
      </h3>
      {audioBlob && (
        <div className="waveform" ref={waveformRef}>
          <div className="waveform-header">
          </div>
          <div className={`waveform-overlay ${showUnlockOverlay && !isPlaying ? 'overlay-visible' : 'overlay-hidden'}`}
            onClick={(e) => {e.stopPropagation(); unlockAudio();}}>
            <span>Click ▶️ to enable audio</span>
          </div>
          <small className="elapsed-time" aria-label="elapsed">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </small>
          <div
            className="waveform-hitarea"
            ref={hitareaRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <AudioVisualizer
              className="waveform-visualizer"
              blob={audioBlob}
              width={vizWidth}
              height={56}
              barWidth={2}
              gap={1}
              backgroundColor={'transparent'}
              barColor={'rgba(250,235,215,0.25)'}
              barPlayedColor={'#ffffff'}
              currentTime={elapsed}
            />
          </div>
        </div>
      )}
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
    </div>
  );
}
