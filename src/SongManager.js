const songs = [
  {
    title: 'First Track',
    src: '/audio/track1.mp3',
    color: '#1E1F26',
    image: 'https://images.unsplash.com/photo-1526178614423-97e0ec3bedd6',
    tempo: 120,
    mood: 40,
  },
  {
    title: 'Second Track',
    src: '/audio/track2.mp3',
    color: '#2C3E50',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    tempo: 95,
    mood: 20,
  },
  {
    title: 'Third Track',
    src: '/audio/track3.mp3',
    color: '#34495E',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    tempo: 130,
    mood: 75,
  },
];

const SongManager = {
  songs,
};

export default SongManager;
