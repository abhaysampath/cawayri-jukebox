import React, { useState } from 'react';
import SongConfig from './config/songConfig';
import MainLayout from './components/MainLayout';
import './css/video-bg.css';
import './css/menu-bar.css';
import './css/about.css';
import './css/contact.css';

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState('Music Player');

  React.useEffect(() => {
    document.title = 'Cawayri Jukebox';
  }, []);

  const toSlug = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const slugs = React.useMemo(() => SongConfig.map(s => toSlug(s.title)), []);
  const getIndexFromURL = React.useCallback(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get('song');
      if (!q) return null;
      const idx = slugs.indexOf(q);
      return idx >= 0 ? idx : null;
    } catch {
      return null;
    }
  }, [slugs]);

  React.useEffect(() => {
    const idx = getIndexFromURL();
    if (idx != null) setSongIndex(idx);
  }, [getIndexFromURL]);

  // Update URL when songIndex changes
  React.useEffect(() => {
    const slug = slugs[songIndex];
    const url = new URL(window.location.href);
    url.searchParams.set('song', slug);
    window.history.pushState({ song: slug }, '', url.toString());
    if (typeof window.sa === 'function') {
      try { window.sa('pageview'); } catch {}
    }
  }, [songIndex, slugs]);

  React.useEffect(() => {
    const onPop = () => {
      const idx = getIndexFromURL();
      if (idx != null) setSongIndex(idx);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [getIndexFromURL]);

  return (
    <MainLayout
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      songIndex={songIndex}
      setSongIndex={setSongIndex}
    />
  );
}
