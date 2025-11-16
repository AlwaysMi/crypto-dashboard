import React from 'react';

/**
 * Komponen UI yang dapat digunakan kembali untuk merender menu tab.
 * Menerima daftar tab dan menangani klik.
 */
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
