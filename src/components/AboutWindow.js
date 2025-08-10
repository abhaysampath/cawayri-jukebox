import { motion } from 'framer-motion';

function AboutWindow() {
  return (
    <motion.div
      className="about-window"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
    >
      <h2>About Me</h2>
      <p>
        Cawayri is a Brooklyn-based electronic artist and DJ weaving together Bollywood,
        Carnatic music, and 90s R&B into emotionally rich, groove-heavy sets.
        A classically trained Carnatic vocalist with years of live music experience 
        around NYC and Connecticut and New Jersey, he brings a deep musical lineage 
        into every performance. His sound is introspective, textured, and transportive, 
        like stepping into a vivid dream or memory from another life. 
      </p>
      <div className="gallery">
        <img src="/images/pic1.jpg" alt="Cawayri live" />
        <img src="/images/pic2.jpg" alt="Studio work" />
        <img src="/images/pic3.jpg" alt="Crowd shot" />
      </div>
    </motion.div>
  );
}

export default AboutWindow;