import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

export default function WaveformBackground({ audioData = null, isPlaying = false }) {
  const stageRef = useRef();
  const animationRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [time, setTime] = useState(0);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      // Slower animation speed for more relaxing effect
      setTime(prev => prev + 0.005); // Reduced from typical 0.02 for slower movement
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Generate waveform points
  const generateWaveform = (yOffset, amplitude, frequency, phase = 0, audioMultiplier = 1) => {
    const points = [];
    const width = dimensions.width;
    const segments = 200; // Number of points to create smooth curves
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const baseWave = Math.sin((i / segments) * frequency * Math.PI * 2 + time + phase) * amplitude;
      
      // Add audio responsiveness
      let audioInfluence = 0;
      if (audioData && isPlaying) {
        // Use audio data to influence the wave amplitude
        const audioIndex = Math.floor((i / segments) * (audioData.length - 1));
        audioInfluence = (audioData[audioIndex] || 0) * audioMultiplier;
      }
      
      const y = yOffset + baseWave + audioInfluence;
      points.push(x, y);
    }
    
    return points;
  };

  // Create multiple waveform layers with different properties
  const waveforms = [
    {
      points: generateWaveform(dimensions.height * 0.3, 40, 3, 0, 0.3),
      stroke: 'rgba(123, 200, 255, 0.3)', // Light blue, very transparent
      strokeWidth: 2,
    },
    {
      points: generateWaveform(dimensions.height * 0.4, 60, 2, Math.PI / 3, 0.4),
      stroke: 'rgba(255, 165, 0, 0.25)', // Light orange, very transparent
      strokeWidth: 3,
    },
    {
      points: generateWaveform(dimensions.height * 0.6, 80, 1.5, Math.PI / 2, 0.5),
      stroke: 'rgba(147, 112, 219, 0.2)', // Light purple, very transparent
      strokeWidth: 4,
    },
    {
      points: generateWaveform(dimensions.height * 0.7, 50, 4, Math.PI, 0.35),
      stroke: 'rgba(255, 192, 203, 0.25)', // Light pink, very transparent
      strokeWidth: 2,
    },
    {
      points: generateWaveform(dimensions.height * 0.5, 70, 2.5, Math.PI * 1.5, 0.45),
      stroke: 'rgba(144, 238, 144, 0.2)', // Light green, very transparent
      strokeWidth: 3,
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' // Soft dark gradient
    }}>
      <Stage 
        width={dimensions.width} 
        height={dimensions.height}
        ref={stageRef}
      >
        <Layer>
          {waveforms.map((waveform, index) => (
            <Line
              key={index}
              points={waveform.points}
              stroke={waveform.stroke}
              strokeWidth={waveform.strokeWidth}
              tension={0.4} // Smooth curves
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}