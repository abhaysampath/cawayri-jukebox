import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import './css/video-bg.css';
import './css/menu-bar.css';
import './css/about.css';
import './css/contact.css';

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState('Music Player');

  React.useEffect(() => {
    document.title = 'Cawayri Jukebox';
  }, []);

  return (
    <MainLayout
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      songIndex={songIndex}
      setSongIndex={setSongIndex}
    />
  );
}
