import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import SongManager from './SongManager';
import MoodManager from './MoodManager';

export default function SongPlayer({ songIndex, setSongIndex }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef(null);
  
  const current = SongManager.songs[songIndex];

  // Initialize sound when song changes
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
    
    return () => {
      if (soundRef.current) soundRef.current.unload();
    };
  }, [current]);

  // Handle play/pause and progress tracking
  useEffect(() => {
    if (!soundRef.current) return;
    
    let interval;
    if (isPlaying) {
      soundRef.current.play();
      interval = setInterval(() => {
        const seek = soundRef.current.seek();
        setProgress((seek / soundRef.current.duration()) * 100);
      }, 500);
    } else {
      soundRef.current.pause();
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSong = () => {
    setSongIndex((i) => (i + 1) % SongManager.songs.length);
    setIsPlaying(false);
  };

  const prevSong = () => {
    setSongIndex((i) => i === 0 ? SongManager.songs.length - 1 : i - 1);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="song-info">
      <h3>{current.title}</h3>
      <p>Cawayri</p>
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
    </div>
  );
}
