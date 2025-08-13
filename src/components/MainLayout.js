import React from 'react';
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
  return (
    <div className="video-bg-container">
      <VideoBackground />
      <div className="overlay">
        <Header activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        {activeMenu === 'About' && <AboutWindow />}
        {activeMenu === 'Contact' && <ContactForm />}
        <SongPlayer songIndex={songIndex} setSongIndex={setSongIndex} />
      </div>
    </div>
  );
}
