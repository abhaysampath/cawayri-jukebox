import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import './css/video-bg.css';
import './css/menu-bar.css';
import './css/player.css';
import './css/about.css';
import './css/contact.css';

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState('Music Player');
  const [phase, setPhase] = useState(1); // 1 = bg1, 2 = bg2

  return (
    <MainLayout
      phase={phase}
      setPhase={setPhase}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      songIndex={songIndex}
      setSongIndex={setSongIndex}
    />
  );
}
