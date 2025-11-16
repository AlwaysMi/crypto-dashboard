import React, { useMemo } from 'react';

// === Fungsi Helper (Pemformatan) ===

/**
 * Memformat nilai USD ke mata uang IDR (misal: "Rp 1.600.000").
 */
const formatCurrencyIDR = (usdValue, rate) => {
  if (!rate || !usdValue) return '-';

  const numValue = parseFloat(usdValue);
  if (isNaN(numValue) || numValue === 0) return '-';

  const idrValue = numValue * rate;

  return idrValue.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, 
  });
};

/**
 * Memformat nilai USD besar ke format IDR singkat (misal: "Rp 1,5T").
 */
const formatLargeNumberIDR = (usdValue, rate) => {
  if (!rate || !usdValue) return '-';

  const numValue = parseFloat(usdValue);
  if (isNaN(numValue) || numValue === 0) return '-';

  const idrValue = numValue * rate;

  if (idrValue > 1_000_000_000_000) {
    return `Rp ${(idrValue / 1_000_000_000_000).toFixed(2)}T`; // Triliun
  }
  if (idrValue > 1_000_000_000) {
    return `Rp ${(idrValue / 1_000_000_000).toFixed(2)}M`; // Miliar
  }
  if (idrValue > 1_000_000) {
    return `Rp ${(idrValue / 1_000_000).toFixed(2)}Jt`; // Juta
  }
  return `Rp ${idrValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
};

// === Komponen Utama ===

const FuturesContractTable = ({ data, sortConfig, onSortRequest, idrPerUsd }) => {
  
  // Mengurutkan data menggunakan useMemo agar tidak dihitung ulang di setiap render
  const sortedData = useMemo(() => {
    let sortableData = [...data];
    const { key, direction } = sortConfig;

    // Daftar 'key' yang harus diperlakukan sebagai Angka (meskipun tipenya string)
    const numericStringKeys = ['price', 'price_percentage_change_24h', 'funding_rate', 'volume_24h'];

    // Sorting default (berdasarkan volume) di-handle di App.jsx
    if (key === 'volume_24h_rank') {
      return sortableData;
    }

    // Logika sorting kustom
    if (key) {
      sortableData.sort((a, b) => {
        const sortDirection = direction === 'ascending' ? 1 : -1;
        const aValue = a[key];
        const bValue = b[key];

        // Jika 'key' ada di daftar numeric, parse sebagai angka
        if (numericStringKeys.includes(key)) {
          const aNum = parseFloat(aValue) || 0;
          const bNum = parseFloat(bValue) || 0;
          return (aNum - bNum) * sortDirection;
        }

        // Jika string murni (misal: 'symbol'), gunakan localeCompare
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue, undefined, { sensitivity: 'base' }) * sortDirection;
        }

        // Fallback
        return (aValue - bValue) * sortDirection;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  return (
    <table className="futures-table fade-in">
      <thead>
        <tr>
          <th className="sortable-header" onClick={() => onSortRequest('symbol')}>
            Kontrak
            <span className="sort-arrow">
              {sortConfig.key === 'symbol' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          <th className="sortable-header" onClick={() => onSortRequest('price')}>
            Harga Kontrak
            <span className="sort-arrow">
              {sortConfig.key === 'price' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          <th className="sortable-header" onClick={() => onSortRequest('price_percentage_change_24h')}>
            Perubahan (24j)
            <span className="sort-arrow">
              {sortConfig.key === 'price_percentage_change_24h' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          <th className="sortable-header" onClick={() => onSortRequest('funding_rate')}>
            Funding Rate
            <span className="sort-arrow">
              {sortConfig.key === 'funding_rate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          <th className="sortable-header" onClick={() => onSortRequest('volume_24h')}>
            Volume 24j (IDR)
            <span className="sort-arrow">
              {sortConfig.key === 'volume_24h' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => {
          const fundingRate = parseFloat(item.funding_rate ?? 0) * 100;
          const isFundingPositive = fundingRate > 0;
          const fundingColor = fundingRate === 0 ? '' : (isFundingPositive ? 'positive' : 'negative');

          return (
            <tr key={`${item.market}-${item.symbol}-${index}`}>
              {/* Kolom Kontrak */}
              <td>
                <strong>{item.symbol}</strong>
                <div className="col-market">{item.market}</div>
              </td>
              {/* Kolom Harga */}
              <td className="col-price">
                {formatCurrencyIDR(item.price, idrPerUsd)}
              </td>
              {/* Kolom Perubahan 24j */}
              <td>
                {(() => {
                  const change = parseFloat(item.price_percentage_change_24h) || 0;
                  const isChangePositive = change > 0;
                  const changeColor = change === 0 ? '' : (isChangePositive ? 'positive' : 'negative');

                  return (
                    <span className={`funding-rate ${changeColor}`}>
                      {isChangePositive ? '+' : ''}
                      {change.toFixed(2)}%
                    </span>
                  );
                })()}
              </td>
              {/* Kolom Funding Rate */}
              <td>
                <span className={`funding-rate ${fundingColor}`}>
                  {isFundingPositive ? '+' : ''}
                  {fundingRate.toFixed(4)}%
                </span>
              </td>
              {/* Kolom Volume 24j */}
              <td className="col-volume">
                {formatLargeNumberIDR(item.volume_24h, idrPerUsd)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default FuturesContractTable;
