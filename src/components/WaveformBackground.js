import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

export default function WaveformBackground({ audioContext, analyserNode, isPlaying }) {
  const stageRef = useRef();
  const animationRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(128));
  
  // Wave configuration
  const waveCount = 4;
  const baseAmplitude = 30;
  const waveSpeed = 0.002; // Slower animation speed
  const waveOffset = Math.PI / waveCount;
  
  // Initialize frequency data array
  useEffect(() => {
    if (analyserNode) {
      analyserNode.fftSize = 256;
      setFrequencyData(new Uint8Array(analyserNode.frequencyBinCount));
    }
  }, [analyserNode]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Animation loop
  useEffect(() => {
    let time = 0;
    
    // Generate wave points based on audio data
    const generateWavePoints = (width, height, time, waveIndex, audioData, playing) => {
      const points = [];
      const segments = 120; // More segments for smoother curves
      const centerY = height / 2 + (waveIndex - waveCount / 2) * 70;
      
      // Calculate average frequency for this wave with better distribution
      const startIndex = Math.floor((waveIndex / waveCount) * audioData.length);
      const endIndex = Math.floor(((waveIndex + 1) / waveCount) * audioData.length);
      const dataSlice = audioData.slice(startIndex, endIndex);
      
      let avgFrequency = 0.3; // Base amplitude when not playing
      if (playing && dataSlice.length > 0) {
        const sum = dataSlice.reduce((sum, val) => sum + val, 0);
        avgFrequency = (sum / dataSlice.length) / 255;
        // Add some bass boost for lower frequency waves
        if (waveIndex < waveCount / 2) {
          avgFrequency *= 1.3;
        }
      }
      
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const normalizedX = x / width;
        
        // Multiple wave phases for complex motion
        const wavePhase = time + waveIndex * waveOffset + (normalizedX * Math.PI * 2);
        const secondaryPhase = time * 0.7 + waveIndex * 0.5 + (normalizedX * Math.PI * 3);
        const tertiaryPhase = time * 0.3 + waveIndex * 0.3 + (normalizedX * Math.PI);
        
        // Dynamic amplitude based on audio and position
        const baseAmp = baseAmplitude * (0.4 + avgFrequency * 1.8);
        const positionMultiplier = 1 - Math.abs(normalizedX - 0.5) * 0.3; // Fade towards edges
        
        // Complex wave composition for flowing water effect
        const y = centerY + 
          Math.sin(wavePhase) * baseAmp * 0.6 * positionMultiplier +
          Math.sin(secondaryPhase) * baseAmp * 0.25 * positionMultiplier +
          Math.sin(tertiaryPhase) * baseAmp * 0.15 * positionMultiplier +
          // Add some noise for organic feel
          (Math.random() - 0.5) * 2 * avgFrequency;
        
        points.push(x, y);
      }
      
      return points;
    };
    
    const animate = () => {
      time += waveSpeed;
      
      // Get frequency data if analyser is available
      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(frequencyData);
      }
      
      // Update wave positions
      if (stageRef.current) {
        const layer = stageRef.current.findOne('Layer');
        if (layer) {
          layer.children.forEach((line, index) => {
            const points = generateWavePoints(
              dimensions.width,
              dimensions.height,
              time,
              index,
              frequencyData,
              isPlaying
            );
            line.points(points);
          });
          layer.batchDraw();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, analyserNode, frequencyData, isPlaying, baseAmplitude, waveCount, waveOffset, waveSpeed]);
  
  // Create wave lines with gradients
  const createWaveLines = () => {
    const lines = [];
    
    for (let i = 0; i < waveCount; i++) {
      const opacity = 0.25 - (i * 0.03); // Reduced opacity for lighter effect
      const strokeWidth = 2.5 + i * 0.8;
      
      // Create gradient colors based on wave index with more variety
      const hue = 190 + (i * 25); // Blue to cyan to teal spectrum
      const saturation = 60 + (i * 5);
      const lightness = 75 + (i * 3);
      const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
      
      lines.push(
        <Line
          key={i}
          points={[]}
          stroke={color}
          strokeWidth={strokeWidth}
          tension={0.4} // Smoother curves
          lineCap="round"
          lineJoin="round"
          shadowBlur={15 + i * 3}
          shadowColor={color}
          shadowOpacity={0.4}
          globalCompositeOperation="screen" // Additive blending for glow effect
        />
      );
    }
    
    return lines;
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: `
          radial-gradient(ellipse at top left, rgba(125, 141, 172, 0.6), transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(169, 157, 144, 0.6), transparent 50%),
          linear-gradient(135deg, rgba(100, 120, 150, 0.7), rgba(140, 130, 120, 0.7))
        `,
        overflow: 'hidden',
        backdropFilter: 'blur(1px)', // Subtle background blur
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
      >
        <Layer>
          {createWaveLines()}
        </Layer>
      </Stage>
    </div>
  );
}