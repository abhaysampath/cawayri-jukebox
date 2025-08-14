
import React, { useRef, useState } from "react";
import { FaInstagram, FaTiktok, FaSoundcloud, FaBandcamp, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import '../css/about.css';

const galleryImages = [
  { src: '/photos/about-gallery/cawayri-bne-1.png', alt: 'Cawayri at Best Night Ever in El Santo (Brooklyn, NYC)' },
  { src: '/photos/about-gallery/cawayri-bne-2.png', alt: 'Cawayri at Best Night Ever in El Santo (Brooklyn, NYC)' },
  { src: '/photos/about-gallery/cawayri-eris-1.jpg', alt: 'Cawayri at Eris Open Decks (Brooklyn, NYC)' },
  { src: '/photos/about-gallery/cawayri-basement-1.jpg', alt: 'Making Music in the Basement Studio (Brooklyn, NYC)' },
  { src: '/photos/about-gallery/cawayri-bne-3.jpg', alt: 'Cawayri at Best Night Ever in El Santo (Brooklyn, NYC)' },
  { src: '/photos/about-gallery/cawayri-basement-2.jpg', alt: 'Basement Recording Studio (Brooklyn, NYC)' },
];

export default function AboutWindow({ onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const overlayRef = useRef();

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose && onClose();
    }
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <motion.div
        className="about-window"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="about-header">
          <h2>About Cawayri</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="about-body">
          <p>
            Welcome to <strong>Cawayri Jukebox</strong>, a showcase for the music of <strong>Cawayri</strong>—a Brooklyn-based electronic musician and DJ blending Bollywood, Indian classical, and dreamy electronic textures with 90s R&amp;B. Dive into original tracks, remixes, and immersive sets that transport you into cinematic, groove-heavy soundscapes.
            <br /><br />
            I'm <strong>Abhay Sampath</strong>, the developer behind this site. By day, I'm a fullstack software developer with 12+ years of professional experience building web apps and software systems, and many more years of tinkering around on my own; by night, I'm a musician and producer trying to explore new sonic territory. This project is my way of bringing both worlds together using code and creativity to build a platform for music, interaction, and discovery.
            <br /><br />
            <strong>Cawayri Jukebox</strong> is a labor of love, and I'm excited to share it with you. Thank you for being here!
            <br /><br />
            <strong>Let's connect!</strong> I'm always open to feedback, collaboration, and new ideas. Feel free to reach out if you'd like to chat or learn more
          </p>
        </div>
        <div className="social-links-container">
            <a href="mailto:cawayri@gmail.com" className="social-link" title="Email">
              <FaEnvelope size={24} />
            </a>
            <a href="https://instagram.com/cawayri" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
              <FaInstagram size={24} />
            </a>
            <a href="https://tiktok.com/@cawayri" target="_blank" rel="noopener noreferrer" className="social-link" title="TikTok">
              <FaTiktok size={24} />
            </a>
            <a href="https://soundcloud.com/cawayri" target="_blank" rel="noopener noreferrer" className="social-link" title="SoundCloud">
              <FaSoundcloud size={24} />
            </a>
            <a href="https://cawayri.bandcamp.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Bandcamp">
              <FaBandcamp size={24} />
            </a>
        </div>
        <div className="gallery-scroll">
          {galleryImages.map((img, idx) => (
            <motion.div
              key={idx}
              className="gallery-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => setLightboxIndex(idx)}
            >
              <img src={img.src} alt={img.alt} />
            </motion.div>
          ))}
        </div>
      </motion.div>
      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={galleryImages.map((img) => ({ src: img.src }))}
        />
      )}
    </div>
  );
}
