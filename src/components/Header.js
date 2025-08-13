import React from 'react';

export default function Header({ activeMenu, setActiveMenu }) {
  const menuItems = ['About', 'Music Player', 'Contact'];

  return (
    <div className="header">
      <h1>Cawayri</h1>
      <div className="menu-bar">
        {menuItems.map((item) => (
          <span 
            key={item}
            className={`menu-item ${activeMenu === item ? 'selected' : 'dimmed'}`}
            onClick={() => setActiveMenu(item)}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
