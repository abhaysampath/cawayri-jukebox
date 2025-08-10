import React, { useEffect, useRef } from 'react';

export default function VideoBackground({ phase, setPhase }) {
  const videoRef = useRef(null);
  const preloadRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoaded = () => {
      video.play().catch((err) => console.warn("Play blocked:", err));
    };

    if (phase === 1) {
      video.src = "/video/bg1.webm";
      video.playbackRate = 1.2;
      video.loop = false;
      
      if (preloadRef.current) {
        preloadRef.current.src = "/video/bg2-1.webm";
        preloadRef.current.load();
      }
      
      const handleEnd = () => setPhase(2);
      video.addEventListener("ended", handleEnd);
      video.play();

      return () => {
        video.removeEventListener("ended", handleEnd);
        video.removeEventListener("loadeddata", handleLoaded);
      };
    }
    
    if (phase === 2) {
      video.src = "/video/bg2-1.webm";
      video.playbackRate = 0.9;
      video.loop = false;
      
      const handleEnd = () => {
        video.currentTime = 7.2;
        setPhase(3);
      };
      
      video.addEventListener("ended", handleEnd);
      video.addEventListener("loadeddata", handleLoaded);
      
      return () => {
        video.removeEventListener("ended", handleEnd);
        video.removeEventListener("loadeddata", handleLoaded);
      };
    }
    
    if (phase === 3) {
      const loopStart = 7.2;
      video.src = "/video/bg2-1.webm";
      video.playbackRate = 1.0;
      video.loop = false;

      const handleTimeUpdate = () => {
        if (video.currentTime >= video.duration) {
          video.currentTime = loopStart;
        }
      };

      const handleLoadedForLoop = () => {
        video.currentTime = loopStart;
        video.play();
      };
      
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadeddata", handleLoadedForLoop);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadeddata", handleLoadedForLoop);
      };
    }
  }, [phase, setPhase]);

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
      <video ref={preloadRef} style={{ display: 'none' }} />
    </>
  );
}
