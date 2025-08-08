import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import MoodManager from './MoodManager';
import SongManager from './SongManager';
import './styles.css';

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef(null);
  const current = SongManager.songs[songIndex];

  useEffect(() => {
    if (soundRef.current) soundRef.current.unload();
    soundRef.current = new Howl({
      src: [current.src],
      html5: true,
      volume: 1,
      onend: () => setIsPlaying(false),
    });
    MoodManager.setMood(current.color);
    setProgress(0);
  }, [songIndex]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      soundRef.current.play();
      interval = setInterval(() => {
        const seek = soundRef.current.seek();
        setProgress((seek / soundRef.current.duration()) * 100);
      }, 500);
    } else if (soundRef.current) {
      soundRef.current.pause();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const next = () => { setSongIndex((i) => (i + 1) % SongManager.songs.length); setIsPlaying(false); };
  const prev = () => { setSongIndex((i) => i === 0 ? SongManager.songs.length - 1 : i - 1); setIsPlaying(false); };

  return (
    <div className="video-bg-container">
      <video
        className="bg-video"
        src="/video/bg1.webm"
        autoPlay loop muted playsInline
      />
      <div className="overlay">
        <div className="header">
          <h1>Cawayri</h1>
          <div className="menu-bar">
            <span className="menu-item dimmed">About</span>
            <span className="menu-item selected">Music Player</span>
            <span className="menu-item dimmed">Contact</span>
          </div>
        </div>
        <div className="song-info">
          <h3>{current.title}</h3>
          <p>Cawayri</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="player-controls">
            <button onClick={prev} className="control-btn">⏮</button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn play-btn">
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button onClick={next} className="control-btn">⏭</button>
          </div>
        </div>
        {/* Mood & Tempo pills can go below or above as needed */}
      </div>
    </div>
  );
}
