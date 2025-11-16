import React from 'react';

function CoinTable({ data, onCoinClick, onSortRequest, sortConfig, selectedCoinId }) {
  return (
    <table className="coin-table fade-in">
      <thead>
        <tr>
          {/* Kolom yang dapat disortir memanggil 'onSortRequest' dengan 'key' unik */}
          <th className="sortable-header" onClick={() => onSortRequest('name')}>
            Aset
            <span className="sort-arrow">
              {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          
          <th className="sortable-header" onClick={() => onSortRequest('current_price')}>
            Harga (IDR)
            <span className="sort-arrow">
              {sortConfig.key === 'current_price' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
          
          <th className="sortable-header" onClick={() => onSortRequest('price_change_percentage_24h')}>
            Perubahan (24j)
            <span className="sort-arrow">
              {sortConfig.key === 'price_change_percentage_24h' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>

          <th className="sortable-header" onClick={() => onSortRequest('market_cap')}>
            Market Cap (IDR)
            <span className="sort-arrow">
              {sortConfig.key === 'market_cap' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((coin) => (
          <tr
            key={coin.id}
            // Menerapkan class 'row-highlighted' jika ID koin sesuai dengan 'selectedCoinId'
            className={`clickable-row ${coin.id === selectedCoinId ? 'row-highlighted' : ''}`}
            onClick={() => onCoinClick(coin)} 
          >
            <td data-label="Aset">
              <div className="coin-info">
                <img src={coin.image} alt={coin.name} width="28" height="28" />
                <div className="coin-info-name">
                    <span className="symbol">{coin.symbol.toUpperCase()}</span>
                </div>
              </div>
            </td>
            <td data-label="Harga">
                {coin.current_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </td>
            <td data-label="Perubahan (24j)">
              <span className={`change ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}`}>
                {(coin.price_change_percentage_24h ?? 0) > 0 ? '+' : ''}
                {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
              </span>
            </td>
            <td data-label="Market Cap">
              {coin.market_cap.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CoinTable;
