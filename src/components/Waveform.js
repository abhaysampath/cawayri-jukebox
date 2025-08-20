import React from 'react';
import '../css/waveform.css';

export default function Waveform({ isPlaying = false }) {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className={`waveform ${isPlaying ? 'playing' : ''}`}>
      {bars.map((bar) => (
        <div
          key={bar}
          className="waveform-bar"
          style={{
            animationDelay: `${bar * 0.1}s`,
            animationDuration: `${0.5 + (bar % 3) * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}