// src/components/TabMenu.jsx

import React from 'react';

// Komponen ini akan menerima:
// - tabs: Array berisi nama tab (string)
// - activeTab: Nama tab yang sedang aktif
// - onTabClick: Fungsi yang dipanggil saat tab diklik
function TabMenu({ tabs, activeTab, onTabClick, scrollable = false }) {
  return (
    <div className={`tab-menu-container ${scrollable ? 'scrollable' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabMenu;
