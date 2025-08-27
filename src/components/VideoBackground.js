import React, { useEffect, useRef, useState } from 'react';
import videoConfig from '../config/videoConfig';

export default function VideoBackground() {
  const videoRef = useRef(null);
  const preloadRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(1);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const pickVideoForOrder = (order) => {
    const candidates = videoConfig.filter(v => v.order === order);
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const pickHoldVideo = () => {
    const holds = videoConfig.filter(v => v.order === "HOLD");
    return holds[Math.floor(Math.random() * holds.length)];
  };

  // Handle user interaction to enable autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Retry video play if it previously failed
      const video = videoRef.current;
      if (video && video.paused && video.readyState >= 2) {
        video.play().catch(err => console.warn("Retry play failed:", err));
      }
    };

    // Listen for any user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let currentConfig;
    const maxOrder = Math.max(...videoConfig.map(v => typeof v.order === "number" ? v.order : 0));
    
    if (stepIndex > maxOrder) {
      currentConfig = pickHoldVideo();
    } else {
      currentConfig = pickVideoForOrder(stepIndex);
    }

    if (!currentConfig) return;

    video.src = `/video/${currentConfig.file}`;
    video.playbackRate = currentConfig.speed;
    video.currentTime = currentConfig.startTime || 0;
    video.loop = false;

    const handleLoaded = () => {
      // Use a more robust approach to ensure video is ready to play
      const tryPlay = async () => {
        try {
          // Wait a bit to ensure video is fully ready
          await new Promise(resolve => setTimeout(resolve, 100));
          await video.play();
        } catch (err) {
          console.warn("Play blocked:", err);
          // If play fails and we don't have user interaction yet, wait for it
          if (!hasUserInteracted) {
            console.log("Waiting for user interaction to enable video autoplay");
          }
        }
      };
      
      // Only try to play if video has enough data buffered
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        tryPlay();
      } else {
        // Wait for more data to be loaded
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          tryPlay();
        };
        video.addEventListener('canplay', onCanPlay);
      }
    };

    let repeatCounter = 0;

    const handleEnd = () => {
      if (repeatCounter < currentConfig.repeat) {
        repeatCounter++;
        if (currentConfig.loopStart !== null) {
          video.currentTime = currentConfig.loopStart;
        } else {
          video.currentTime = currentConfig.startTime || 0;
        }
        // Add retry logic for repeated play attempts
        video.play().catch(err => console.warn("Repeat play failed:", err));
      } else {
        setStepIndex(prev => prev + 1);
      }
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("ended", handleEnd);

    // Also add error handling for video loading issues
    const handleError = (e) => {
      console.warn("Video error:", e);
      // Try to recover by moving to next video
      setTimeout(() => setStepIndex(prev => prev + 1), 1000);
    };
    video.addEventListener("error", handleError);

    if (preloadRef.current) {
      let nextConfig;
      if (stepIndex >= maxOrder) {
        nextConfig = pickHoldVideo();
      } else {
        nextConfig = pickVideoForOrder(stepIndex + 1);
      }
      if (nextConfig) {
        preloadRef.current.src = `/video/${nextConfig.file}`;
        preloadRef.current.load();
      }
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("ended", handleEnd);
      video.removeEventListener("error", handleError);
    };
  }, [stepIndex, hasUserInteracted]);

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      <video ref={preloadRef} style={{ display: 'none' }} preload="auto" />
    </>
  );
}
