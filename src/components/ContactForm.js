import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../css/contact.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ContactForm({ onClose, formData, setFormData, currentSongInfo }) {
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef();
  const formRef = useRef();
  const safeFormData = formData || { name: '', email: '', message: '' };

  const submitForm = async () => {
    if (!safeFormData.name && !safeFormData.email && !safeFormData.message) return;
    if (submitted) return;
    setSubmitted(true);
    const data = new FormData();
    data.append('name', safeFormData.name);
    data.append('email', safeFormData.email);

    const songInfo = currentSongInfo?.title ?
        `\n---\nCurrent Song: ${currentSongInfo.title} (${typeof currentSongInfo.elapsed === 'number'
        ? formatTime(currentSongInfo.elapsed) : ''})` : '';
    data.append('message', safeFormData.message + songInfo);
    try {
      await fetch('https://formspree.io/f/xldlooea', {
        method: 'POST',
        body: data,
      });
    } catch (e) {}
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose && onClose();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...safeFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm(false);
    onClose && onClose();
  };


  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <motion.div
        className="contact-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="contact-header">
          <h2>Contact Cawayri</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="contact-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={safeFormData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={safeFormData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              value={safeFormData.message}
              onChange={handleChange}
              required
            ></textarea>
            <div>
              Current Song: {currentSongInfo?.title || 'Unknown'}{' '}
              {typeof currentSongInfo?.elapsed === 'number' ? `(${formatTime(currentSongInfo.elapsed)})` : ''}
            </div>
            <button className="contact-form" type="submit">Send</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
