function ContactForm() {
  return (
    <form
      action="https://formspree.io/f/xldlooea"
      method="POST"
      className="contact-form"
    >
      <h2>Contact Cawayri</h2>
      <input type="text" name="name" placeholder="Your Name" required />
      <input type="email" name="email" placeholder="Your Email" required />
      <textarea name="message" placeholder="Your Message" required></textarea>
      <button type="submit">Send</button>
    </form>
  );
}
export default ContactForm;