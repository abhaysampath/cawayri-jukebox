import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import '../css/contact.css';

export default function ContactForm({ onClose, formData, setFormData }) {
  const overlayRef = useRef();
  const formRef = useRef();
  const safeFormData = formData || { name: '', email: '', message: '', mailingList: true };

  const submitForm = async () => {
    if (!safeFormData.name && !safeFormData.email && !safeFormData.message) return;
    const data = new FormData();
    data.append('name', safeFormData.name);
    data.append('email', safeFormData.email);
    data.append('message', safeFormData.message);
    try {
      await fetch(process.env.REACT_APP_FORMSPREE_ENDPOINT, {
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
    const { name, type, checked, value } = e.target;
    setFormData({
      ...safeFormData,
      [name]: type === 'checkbox' ? checked : value
    });
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
        <div className="contact-body">
          <form className="form" ref={formRef} onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              name="name"
              placeholder="Name"
              autoComplete='name'
              value={safeFormData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete='email'
              value={safeFormData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Message"
              autoComplete='message'
              value={safeFormData.message}
              onChange={handleChange}
              required
            ></textarea>
            <div className="contact-footer">
              <div className='mailing-list'>
                <input className='mailing-list-checkbox'
                  type="checkbox"
                  name="mailingList"
                  checked={!!safeFormData.mailingList}
                  onChange={handleChange}
                  id="mailingListCheckbox"
                />
                <label htmlFor="mailingListCheckbox" className='mailing-list-label'>
                  Add me to mailing list
                </label>
              </div>
              <button className="contact-submit-btn" type="submit">Send</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
