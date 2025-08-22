import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import SongConfig from '../config/songConfig';
import MoodManager from './MoodManager';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon, DownloadSimpleIcon, ShareIcon, CopySimpleIcon } from '@phosphor-icons/react';
import { AudioVisualizer } from 'react-audio-visualize';
import MarqueeText from './MarqueeText';
import useScrubSeek from '../hooks/useScrubSeek';
import '../css/song-player.css';
import '../css/modal.css';
import '../css/download-modal.css';

export default function SongPlayer({ songIndex, setSongIndex, onSongTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [vizWidth, setVizWidth] = useState(0);
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('mp3');
  const [downloadEmail, setDownloadEmail] = useState('');
  const [subscribe, setSubscribe] = useState(true);

  const soundRef = useRef(null);
  const playerRef = useRef(null);
  const waveformRef = useRef(null);
  const hitareaRef = useRef(null);
  const isRepeatingRef = useRef(false);
  const isShufflingRef = useRef(false);
  const current = SongConfig[songIndex];
  const currentSlug = String(current?.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const currentURL = (() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('song', currentSlug);
      return url.toString();
    } catch {
      return window.location.href;
    }
  })();

  const unlockAudio = useCallback(async () => {
    if (!audioUnlocked && Howler.ctx) {
      try {
        await Howler.ctx.resume();
        setAudioUnlocked(true);
      } catch (error) {
        console.warn('Failed to unlock audio context:', error);
      }
    }
  }, [audioUnlocked]);
  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = currentURL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };
  const shareURL = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: current.title, url: currentURL, text: `${current.title} – ${current.artist || 'Cawayri'}` });
      } catch {}
    } else {
      copyURL();
    }
  };
  const closeDownloadDialog = () => setShowDownloadModal(false);
  const submitDownloadRequest = (e) => {
    e.preventDefault();
    // Placeholder flow; backend/mailing-list integration goes elsewhere
    alert(`We will email a ${downloadFormat.toUpperCase()} download link to ${downloadEmail} after verifying your signup.`);
    setShowDownloadModal(false);
    setDownloadEmail('');
  };
  const { onMouseDown, onTouchStart } = useScrubSeek({ hitareaRef, waveformRef, soundRef, setElapsed, unlockAudio });
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

  return (
    <div>
      {showDownloadModal && (
        <div className="modal-overlay" onClick={closeDownloadDialog}>
          <div className="download-modal-window" onClick={(e)=>e.stopPropagation()}>
            <div className="download-header">
              <h2>Get this track</h2>
              <button className="close-btn" type="button" onClick={closeDownloadDialog}>&times;</button>
            </div>
            <div className="download-body">
              <div className="meta">
                <div className="title">{current.title} – {current.artist || 'Cawayri'}</div>
                <div className="info">Size: {audioBlob ? (Math.max(1, (audioBlob.size / 1024 / 1024)).toFixed(2)) : '—'} MB</div>
              </div>
              <form onSubmit={submitDownloadRequest} autoComplete="off">
                <input type="email" required placeholder="your@email.com" value={downloadEmail} onChange={(e)=>setDownloadEmail(e.target.value)} />
                <div className="row">
                  <div className='format-label'><input type="radio" name="format" value="mp3" checked={downloadFormat==='mp3'} onChange={() => setDownloadFormat('mp3')} /> mp3</div>
                  <div className='format-label'><input type="radio" name="format" value="wav" checked={downloadFormat==='wav'} onChange={() => setDownloadFormat('wav')} /> wav</div>
                  <div className="mailing-list">
                    <input className='mailing-list-checkbox' id="dlSubscribe" type="checkbox" checked={subscribe} onChange={(e)=>setSubscribe(e.target.checked)} />
                    <label className='mailing-list-label' htmlFor="dlSubscribe">Add me to mailing list</label>
                  </div>
                </div>
                <button type="submit" className="download-btn" disabled={!subscribe}>Send Download to E-mail</button>
              </form>
              <div className="share-inline">
                <div className="meta"><div className="title">Share</div></div>
                <div className="url-box readonly" title={currentURL}>
                  <input type="text" readOnly value={currentURL} onFocus={(e)=>e.target.select()} />
                  <button className="icon-inline" onClick={copyURL} title="Copy URL"><CopySimpleIcon size={16} /></button>
                  <button className="icon-inline" onClick={shareURL} title="Share"><ShareIcon size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
              <span>Click ▶ to enable audio</span>
            </div>
            {isPlaying && !showUnlockOverlay && (
              <div className="waveform-marquee" aria-hidden="true">
                <MarqueeText text={current.scrollText} />
              </div>
            )}
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
        <div className="player-controls">
          <button onClick={handlePrevSong} className="control-btn"><SkipBackIcon /></button>
          <button onClick={togglePlayPause} className="control-btn play-btn">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={handleNextSong} className="control-btn"><SkipForwardIcon /></button>
        </div>
        <div className="player-controls secondary-controls">
          <button className="icon-btn" onClick={() => setShowDownloadModal(true)} title="Download / Share"><DownloadSimpleIcon /></button>
          <button className={`icon-btn ${isRepeating ? 'active' : ''}`}
            onClick={() => setIsRepeating(!isRepeating)}
            title="Repeat"><RepeatIcon />
          </button>
          <button className={`icon-btn ${isShuffling ? 'active' : ''}`}
            onClick={() => setIsShuffling(!isShuffling)}
            title="Shuffle"><ShuffleIcon />
          </button>
          <button className="icon-btn" onClick={shareURL} title="Share"><ShareIcon /></button>
        </div>
      </div>
    </div>
  );
}
