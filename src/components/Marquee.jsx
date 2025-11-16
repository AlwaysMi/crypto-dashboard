import React from 'react';

/**
 * Komponen Marquee untuk animasi scroll horizontal yang mulus.
 * Menduplikasi 'items' untuk menciptakan efek looping tanpa batas.
 */
const Marquee = ({ items, renderItem }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Fungsi untuk merender daftar item.
  // 'isClone' digunakan untuk membuat 'key' yang unik bagi daftar duplikat.
  const renderList = (isClone = false) =>
    items.map((item, index) => {
      // Key yang unik sangat penting untuk mencegah bug re-render React
      const uniqueKey = `${item.category}-${item.name}-${index}${isClone ? '-clone' : ''}`;
      return renderItem(item, uniqueKey);
    });

  return (
    <div className="marquee-wrapper" aria-hidden="true">
      <div className="marquee-content">
        {/* Render daftar asli */}
        {renderList(false)}
        
        {/* Render daftar klon (duplikat) untuk efek looping */}
        {renderList(true)}
      </div>
    </div>
  );
};

export default Marquee;
