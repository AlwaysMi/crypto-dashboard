// src/components/Marquee.jsx

import React from 'react';

// Komponen ini akan menerima 'items' (data) sebagai prop
function Marquee({ items }) {
  if (!items || items.length === 0) {
    return null; // Jangan tampilkan apa-apa jika tidak ada data
  }

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* Kita duplikat datanya agar terlihat 'infinite' */}
        {[...items, ...items].map((item, index) => (
          <div className="marquee-item" key={index}>
            <span className="category">| {item.category} |</span>
            <img src={item.icon} alt={item.name} className="marquee-icon" />
            <span className="name">{item.name}</span>
            <span className={`change ${item.change > 0 ? 'positive' : 'negative'}`}>
              {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span className="price">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
