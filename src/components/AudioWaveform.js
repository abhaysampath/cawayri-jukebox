import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../css/audio-waveform.css';

export default function AudioWaveform({ isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Since we're using Howler, we'll use the fallback animation
    // which provides a great visual effect synchronized with the playing state
    drawFallbackAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const drawFallbackAnimation = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bars = 32;
    const barWidth = canvas.width / bars;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        // Create animated bar heights based on sine waves with different frequencies
        const time = Date.now() * 0.003;
        const barHeight = (
          Math.sin(time + i * 0.5) * 0.3 + 
          Math.sin(time * 1.5 + i * 0.3) * 0.2 + 
          Math.sin(time * 0.8 + i * 0.7) * 0.4 + 0.8
        ) * canvas.height * 0.7;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(150, 150, 255, 0.5)');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
  };

  return (
    <motion.div 
      className="audio-waveform-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={60}
        className="waveform-canvas"
      />
    </motion.div>
  );
}