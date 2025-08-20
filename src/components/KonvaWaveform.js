import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Howler } from 'howler';
import '../css/konva-waveform.css';

const KonvaWaveform = ({ isPlaying }) => {
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [waveforms, setWaveforms] = useState([]);
  const animationRef = useRef();
  const stageRef = useRef();
  
  // Initialize Web Audio API analyzer
  useEffect(() => {
    if (Howler.ctx && !analyser) {
      try {
        const audioAnalyser = Howler.ctx.createAnalyser();
        audioAnalyser.fftSize = 256;
        audioAnalyser.smoothingTimeConstant = 0.8;
        
        // Try multiple connection approaches for better compatibility
        try {
          // Method 1: Connect to destination
          const gainNode = Howler.ctx.createGain();
          gainNode.connect(audioAnalyser);
          audioAnalyser.connect(Howler.ctx.destination);
          
          // Set as master gain replacement
          if (Howler.masterGain) {
            Howler.masterGain.disconnect();
            Howler.masterGain.connect(gainNode);
          }
          
          console.log('Audio analyzer connected via gainNode');
        } catch (e) {
          // Method 2: Direct connection
          if (Howler.masterGain) {
            Howler.masterGain.connect(audioAnalyser);
            audioAnalyser.connect(Howler.ctx.destination);
          }
          console.log('Audio analyzer connected directly');
        }
        
        const bufferLength = audioAnalyser.frequencyBinCount;
        const dataArr = new Uint8Array(bufferLength);
        
        setAnalyser(audioAnalyser);
        setDataArray(dataArr);
        
        console.log('Audio analyzer initialized with buffer length:', bufferLength);
      } catch (error) {
        console.warn('Failed to initialize audio analyzer:', error);
      }
    }
  }, [analyser]);

  // Generate initial waveforms
  useEffect(() => {
    const initialWaveforms = [];
    for (let i = 0; i < 5; i++) {
      initialWaveforms.push({
        id: i,
        points: generateWavePoints(window.innerWidth, 200 + i * 80, i),
        opacity: 0.4 + (i * 0.15),
        strokeWidth: 3 + (i * 0.5),
        phase: i * Math.PI / 3,
        frequency: 0.005 + (i * 0.003),
        amplitude: 40 + (i * 15),
        color: `hsl(${190 + i * 15}, 70%, ${60 + i * 8}%)`,
      });
    }
    setWaveforms(initialWaveforms);
  }, []);

  // Generate wave points
  const generateWavePoints = (width, baseY, waveIndex) => {
    const points = [];
    const segments = 120;
    
    for (let x = 0; x <= width; x += width / segments) {
      points.push(x, baseY);
    }
    return points;
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      let audioInfluence = 0;
      let hasAudioData = false;
      
      // Get frequency data from audio if available
      if (analyser && dataArray) {
        try {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          audioInfluence = average / 255;
          hasAudioData = average > 0;
          
          // Debug: log audio data occasionally
          if (Math.random() < 0.01) { // 1% chance to log
            console.log('Audio data - average:', average, 'influence:', audioInfluence);
          }
        } catch (error) {
          console.warn('Error getting audio data:', error);
        }
      }
      
      // Update waveforms based on audio data or create flowing effect without audio
      setWaveforms(prevWaveforms => 
        prevWaveforms.map((wave, index) => {
          const newPoints = [];
          const segments = 120;
          const time = Date.now() * 0.001;
          
          for (let i = 0; i <= window.innerWidth; i += window.innerWidth / segments) {
            let audioWaveInfluence = 0;
            
            if (hasAudioData && dataArray) {
              // Use different frequency ranges for different waves
              const freqRange = Math.floor(dataArray.length / prevWaveforms.length);
              const startFreq = index * freqRange;
              const endFreq = Math.min(startFreq + freqRange, dataArray.length - 1);
              const segmentIndex = Math.floor((i / window.innerWidth) * (endFreq - startFreq)) + startFreq;
              audioWaveInfluence = (dataArray[segmentIndex] / 255) * wave.amplitude * 1.5;
            }
            
            // Create flowing water effect (always present)
            const baseWave = Math.sin((i * wave.frequency) + (time * 2) + wave.phase) * wave.amplitude;
            const flowingEffect = Math.sin((i * 0.004) + (time * 1.8) + wave.phase) * 20;
            const secondaryFlow = Math.cos((i * 0.002) + (time * 1.2) + wave.phase * 1.5) * 10;
            
            // Enhanced movement when playing
            const playingMultiplier = isPlaying ? 1.5 : 0.8;
            const audioBoost = isPlaying ? audioInfluence * 30 : 0;
            
            const y = (200 + index * 80) + 
                     (baseWave * playingMultiplier) + 
                     (flowingEffect * playingMultiplier) + 
                     secondaryFlow + 
                     audioWaveInfluence + 
                     audioBoost;
            
            newPoints.push(i, y);
          }
          
          return {
            ...wave,
            points: newPoints,
            opacity: Math.max(0.3, wave.opacity + (isPlaying ? audioInfluence * 0.4 : 0)),
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, dataArray]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="konva-waveform-container">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="konva-stage"
      >
        <Layer>
          {waveforms.map((wave) => (
            <Line
              key={wave.id}
              points={wave.points}
              stroke={wave.color}
              strokeWidth={wave.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              shadowColor={wave.color}
              shadowBlur={15}
              shadowOffset={{ x: 0, y: 0 }}
              opacity={wave.opacity}
            />
          ))}
          
          {/* Additional water ripple effects */}
          {waveforms.slice(0, 3).map((wave) => (
            <Line
              key={`ripple-${wave.id}`}
              points={wave.points.map((point, idx) => 
                idx % 2 === 0 ? point : point + Math.sin(Date.now() * 0.005 + idx) * 5
              )}
              stroke={wave.color}
              strokeWidth={wave.strokeWidth * 0.3}
              tension={0.8}
              lineCap="round"
              lineJoin="round"
              dash={[8, 8]}
              opacity={wave.opacity * 0.4}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaWaveform;