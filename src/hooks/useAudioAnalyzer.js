import { useEffect, useRef, useState } from 'react';
import { Howler } from 'howler';

export function useAudioAnalyzer(sound, isPlaying) {
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const [audioData, setAudioData] = useState(null);

  useEffect(() => {
    if (!sound || !isPlaying) {
      // Clean up animation when not playing
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setAudioData(null);
      return;
    }

    const setupAnalyzer = () => {
      try {
        // Get the Web Audio API context from Howler
        const ctx = Howler.ctx;
        if (!ctx) {
          console.warn('Web Audio Context not available');
          return;
        }

        // Ensure context is running
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Create analyzer node if not exists
        if (!analyzerRef.current) {
          analyzerRef.current = ctx.createAnalyser();
          analyzerRef.current.fftSize = 256; // Good balance of resolution and performance
          analyzerRef.current.smoothingTimeConstant = 0.85; // Smooth transitions
          
          const bufferLength = analyzerRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
        }

        // Try to connect to the audio source
        // Howler uses different internal structures depending on the audio type
        let connected = false;

        // Try to get the source node from Howler's internal structure
        if (sound._sounds && sound._sounds.length > 0) {
          const howlSound = sound._sounds[0];
          
          // For HTML5 audio
          if (howlSound._node) {
            try {
              if (!sourceNodeRef.current) {
                sourceNodeRef.current = ctx.createMediaElementSource(howlSound._node);
              }
              sourceNodeRef.current.connect(analyzerRef.current);
              analyzerRef.current.connect(ctx.destination);
              connected = true;
            } catch (error) {
              console.warn('Failed to connect HTML5 audio source:', error);
            }
          }
          
          // For Web Audio API sources
          if (!connected && howlSound._source) {
            try {
              howlSound._source.connect(analyzerRef.current);
              analyzerRef.current.connect(ctx.destination);
              connected = true;
            } catch (error) {
              console.warn('Failed to connect Web Audio source:', error);
            }
          }
        }

        if (!connected) {
          console.warn('Could not connect audio analyzer to source');
          // Generate fake data for visual effect
          generateFakeAudioData();
          return;
        }

        // Start the animation loop for getting frequency data
        const updateAudioData = () => {
          if (analyzerRef.current && dataArrayRef.current && isPlaying) {
            analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
            
            // Normalize the data to 0-1 range and reduce amplitude for subtler effect
            const normalizedData = Array.from(dataArrayRef.current).map(value => (value / 255) * 0.4);
            setAudioData(normalizedData);
            
            animationRef.current = requestAnimationFrame(updateAudioData);
          }
        };

        updateAudioData();

      } catch (error) {
        console.warn('Audio analysis setup failed:', error);
        generateFakeAudioData();
      }
    };

    // Generate fake audio data for visual effect when real analysis fails
    const generateFakeAudioData = () => {
      const updateFakeData = () => {
        if (isPlaying) {
          const fakeData = Array.from({ length: 128 }, (_, i) => {
            // Create some basic rhythmic patterns
            const time = Date.now() * 0.001;
            const bass = Math.sin(time * 2) * 0.3;
            const mid = Math.sin(time * 4 + i * 0.1) * 0.2;
            const high = Math.sin(time * 8 + i * 0.05) * 0.1;
            return Math.max(0, (bass + mid + high) * 0.5);
          });
          
          setAudioData(fakeData);
          animationRef.current = requestAnimationFrame(updateFakeData);
        }
      };
      
      updateFakeData();
    };

    // Small delay to ensure sound is loaded and playing
    const timeout = setTimeout(setupAnalyzer, 200);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [sound, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      }
    };
  }, []);

  return audioData;
}