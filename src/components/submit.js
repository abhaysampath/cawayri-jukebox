export async function submitContactForm({ formData, unsent = false, sessionStart, songHistory }) {
  if (!formData?.name && !formData?.email && !formData?.message) return;
  const data = new FormData();
  data.append('name', formData.name);
  data.append('email', formData.email);
  const sessionDuration = Math.round((Date.now() - (sessionStart || Date.now())) / 1000);
  const songHistoryText = (songHistory || []).map((s, i) => `#${i + 1}: ${s.title} by ${s.artist} at ${new Date(s.timestamp).toLocaleTimeString()}`).join('\n');
  const extraInfo = `\n---\nSession Duration: ${sessionDuration}s\nSong History:\n${songHistoryText}`;
  data.append('message', (unsent ? `UNSENT: ` : '') + formData.message + extraInfo);
  try {
    await fetch('https://formspree.io/f/xldlooea', {
      method: 'POST',
      body: data,
    });
  } catch (e) {}
}
