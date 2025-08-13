
import { useRef, useState } from "react";
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
            Cawayri is a Brooklyn-based electronic artist and DJ weaving
            together Bollywood, Carnatic music, and 90s R&amp;B into emotionally
            rich, groove-heavy sets. A classically trained Carnatic vocalist
            with years of live music experience in NYC, Connecticut, and New
            Jersey, he brings a deep musical lineage into every performance. His
            sound is introspective, textured, and transportive—like stepping
            into a vivid dream or memory from another life.
          </p>
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
