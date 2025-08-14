import React, { useState, useEffect } from 'react';
import VideoBackground from './VideoBackground';
import Header from './Header';
import SongPlayer from './SongPlayer';
import ContactForm from './ContactForm';
import AboutWindow from './AboutWindow';

export default function MainLayout({ 
  activeMenu, 
  setActiveMenu, 
  songIndex, 
  setSongIndex 
}) {
  const [currentSongInfo, setCurrentSongInfo] = useState({ title: '', elapsed: 0 });
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    setShowAbout(activeMenu === 'About');
    setShowContact(activeMenu === 'Contact');
  }, [activeMenu]);

  return (
    <div className="video-bg-container">
      <VideoBackground />
      <div className="overlay">
        <Header activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        {showAbout && (
          <AboutWindow onClose={() => setActiveMenu('Music Player')} />
        )}
        {showContact && (
          <ContactForm
            onClose={() => setActiveMenu('Music Player')}
            formData={formData}
            setFormData={setFormData}
            currentSongInfo={currentSongInfo}
          />
        )}
        <SongPlayer songIndex={songIndex} setSongIndex={setSongIndex} onSongTimeUpdate={setCurrentSongInfo} />
      </div>
    </div>
  );
}
