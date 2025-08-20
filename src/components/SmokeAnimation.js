import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/smoke-animation.css';

export default function SmokeAnimation({ text, onComplete, isVisible }) {
  const [showText, setShowText] = useState(true);
  const [smokeParticles, setSmokeParticles] = useState([]);

  useEffect(() => {
    if (isVisible && showText) {
      // After 3 seconds, start the smoke animation
      const timer = setTimeout(() => {
        setShowText(false);
        // Create smoke particles
        const particles = Array.from({ length: 12 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: 50 + Math.random() * 20,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 1,
        }));
        setSmokeParticles(particles);
        
        // Complete the animation after smoke dissipates
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, showText, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="smoke-animation-container">
      <AnimatePresence>
        {showText && (
          <motion.div
            className="smoke-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.2,
              filter: "blur(4px)"
            }}
            transition={{ 
              duration: 0.8,
              exit: { duration: 1.5 }
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!showText && smokeParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="smoke-particle"
            initial={{ 
              opacity: 0.8,
              scale: 0.2,
              x: `${particle.x}%`,
              y: `${particle.y}%`
            }}
            animate={{ 
              opacity: 0,
              scale: 2,
              x: `${particle.x + (Math.random() - 0.5) * 40}%`,
              y: `${particle.y - 30 - Math.random() * 20}%`,
            }}
            transition={{ 
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}