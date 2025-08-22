import { useCallback, useEffect, useRef } from 'react';

// Hook contract:
// inputs: hitareaRef, waveformRef, soundRef, setElapsed(fn), unlockAudio(fn)
// outputs: { onMouseDown, onTouchStart }
export default function useScrubSeek({ hitareaRef, waveformRef, soundRef, setElapsed, unlockAudio }) {
  const isScrubbingRef = useRef(false);

  const seekFromClientX = useCallback((clientX) => {
    const el = hitareaRef.current || waveformRef.current;
    const snd = soundRef.current;
    if (!el || !snd) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const duration = snd.duration();
    if (!duration || !isFinite(duration)) return;
    const t = ratio * duration;
    try {
      snd.seek(t);
      setElapsed(Math.floor(t));
    } catch {}
  }, [hitareaRef, waveformRef, soundRef, setElapsed]);

  const onMouseMove = useCallback((e) => {
    if (!isScrubbingRef.current) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
  }, [seekFromClientX]);

  const onMouseUp = useCallback(() => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback((e) => {
    unlockAudio && unlockAudio();
    isScrubbingRef.current = true;
    seekFromClientX(e.clientX);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onMouseMove, onMouseUp, seekFromClientX, unlockAudio]);

  const onTouchMove = useCallback((e) => {
    if (!isScrubbingRef.current) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    seekFromClientX(touch.clientX);
  }, [seekFromClientX]);

  const onTouchEnd = useCallback(() => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  }, [onTouchMove]);

  const onTouchStart = useCallback((e) => {
    unlockAudio && unlockAudio();
    isScrubbingRef.current = true;
    const touch = e.touches && e.touches[0];
    if (touch) seekFromClientX(touch.clientX);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  }, [onTouchMove, onTouchEnd, seekFromClientX, unlockAudio]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  return { onMouseDown, onTouchStart };
}
