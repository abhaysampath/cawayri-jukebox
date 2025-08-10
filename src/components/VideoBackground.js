import React, { useEffect, useRef, useState } from 'react';
import videoConfig from '../config/videoConfig';

export default function VideoBackground({ phase, setPhase }) {
  const videoRef = useRef(null);
  const preloadRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(1); 

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


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let currentConfig;
    if (stepIndex > Math.max(...videoConfig.map(v => typeof v.order === "number" ? v.order : 0))) {
        // Sequence done — go to HOLD pool
        currentConfig = pickHoldVideo();
    } else {
        currentConfig = pickVideoForOrder(stepIndex);
    }

    if (!currentConfig) return;
    video.src = `/video/${currentConfig.file}`;
    video.playbackRate = currentConfig.speed;
    video.currentTime = currentConfig.startTime || 0;
    video.loop = false;
    // video.preload = "auto";

    const handleLoaded = () => {
        video.play().catch((err) => console.warn("Play blocked:", err));
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
            video.play();
        } else {
            // Advance to next step or HOLD
            setStepIndex(prev => prev + 1);
        }
    };      
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("ended", handleEnd);
    if (preloadRef.current) {
        let nextConfig;
        if (stepIndex >= Math.max(...videoConfig.map(v => typeof v.order === "number" ? v.order : 0))) {
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
    };
}, [stepIndex]);

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
