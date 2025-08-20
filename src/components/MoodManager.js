const MoodManager = {
  setMood: (color) => {
    const root = document.documentElement;
    root.style.transition = 'background-color 3s ease';
    root.style.backgroundColor = color;
  },
};

export default MoodManager;
