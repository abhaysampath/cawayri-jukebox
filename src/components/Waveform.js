import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import '../css/waveform.css';

export default function Waveform({ audioSrc, currentTime, songIndex }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const initializingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!waveformRef.current || initializingRef.current) return;
    
    initializingRef.current = true;

    // Cleanup function
    const cleanup = () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (error) {
          // Silently ignore cleanup errors
        }
        wavesurferRef.current = null;
      }
      setIsReady(false);
      initializingRef.current = false;
    };

    // Initialize WaveSurfer
    const initialize = async () => {
      try {
        cleanup(); // Clean up any existing instance
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure cleanup
        
        if (!waveformRef.current) return;

        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'rgba(251, 143, 97, 0.4)',
          progressColor: 'rgba(251, 143, 97, 0.9)',
          cursorColor: 'rgba(251, 143, 97, 1)',
          barWidth: 4,
          barRadius: 2,
          barGap: 1,
          responsive: true,
          height: 100,
          normalize: true,
          backend: 'MediaElement',
          mediaControls: false,
          interact: false,
        });

        // Set up event listeners
        wavesurferRef.current.on('ready', () => {
          console.log('Waveform ready');
          setIsReady(true);
          initializingRef.current = false;
        });
        
        wavesurferRef.current.on('error', (error) => {
          console.warn('Waveform error:', error);
          initializingRef.current = false;
        });

        // Load the audio
        if (audioSrc) {
          console.log('Loading waveform audio:', audioSrc);
          wavesurferRef.current.load(audioSrc);
        }
      } catch (error) {
        console.warn('WaveSurfer initialization error:', error);
        initializingRef.current = false;
      }
    };

    initialize();

    return cleanup;
  }, [audioSrc, songIndex]);

  // Sync current time only when ready
  useEffect(() => {
    if (!wavesurferRef.current || !isReady || typeof currentTime !== 'number') return;
    
    try {
      const duration = wavesurferRef.current.getDuration();
      if (duration > 0) {
        const progress = currentTime / duration;
        wavesurferRef.current.seekTo(progress);
      }
    } catch (error) {
      // Silently ignore seek errors
    }
  }, [currentTime, isReady]);

  return (
    <div className="waveform-container">
      <div ref={waveformRef} className="waveform" />
      {!isReady && (
        <div className="waveform-loading">
          <div style={{ color: 'rgba(251, 143, 97, 0.7)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>
            Loading waveform...
          </div>
        </div>
      )}
    </div>
  );
}