import { motion } from 'framer-motion';
import '../css/about.css';

function AboutWindow() {
  return (
    <motion.div
      className="about-window"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="about-content">
        <h2>About Cawayri</h2>
        <p>
        Cawayri is a Brooklyn-based electronic artist and DJ weaving together Bollywood,
        Carnatic music, and 90s R&B into emotionally rich, groove-heavy sets.
        A classically trained Carnatic vocalist with years of live music experience 
        around NYC and Connecticut and New Jersey, he brings a deep musical lineage 
        into every performance. His sound is introspective, textured, and transportive, 
        like stepping into a vivid dream or memory from another life. 
        </p>
      </div>

      <motion.div
        className="gallery"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {[
          { src: '/images/pic1.jpg', alt: 'Cawayri live performance' },
          { src: '/images/pic2.jpg', alt: 'Studio session' },
          { src: '/images/pic3.jpg', alt: 'Crowd during a set' },
          { src: '/images/pic4.jpg', alt: 'Album artwork' },
        ].map((img, idx) => (
          <motion.div
            key={idx}
            className="gallery-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <img src={img.src} alt={img.alt} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default AboutWindow;