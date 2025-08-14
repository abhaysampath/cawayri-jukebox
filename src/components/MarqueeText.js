import React from 'react';
import '../css/marquee-text.css';

export default function MarqueeText({ text }) {
  return (
    <div className="marquee-container">
      <div className="marquee">
        <span>{text}</span>
      </div>
    </div>
  );
}
