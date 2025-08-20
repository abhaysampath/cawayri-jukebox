import React, { useState, useEffect, useCallback } from 'react';
import WaveformBackground from './WaveformBackground';
import Header from './Header';
import SongPlayer from './SongPlayer';
import ContactForm from './ContactForm';
import AboutWindow from './AboutWindow';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

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
  const [audioState, setAudioState] = useState({ sound: null, isPlaying: false, currentSong: null });
  
  // Get audio data for waveform visualization
  const audioData = useAudioAnalyzer(audioState.sound, audioState.isPlaying);

  useEffect(() => {
    setShowAbout(activeMenu === 'About');
    setShowContact(activeMenu === 'Contact');
  }, [activeMenu]);

  const handleAudioStateChange = useCallback((newAudioState) => {
    setAudioState(newAudioState);
  }, []);

  return (
    <div className="video-bg-container">
      <WaveformBackground audioData={audioData} isPlaying={audioState.isPlaying} />
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
        <SongPlayer 
          songIndex={songIndex} 
          setSongIndex={setSongIndex} 
          onSongTimeUpdate={setCurrentSongInfo}
          onAudioStateChange={handleAudioStateChange}
        />
      </div>
    </div>
  );
}
