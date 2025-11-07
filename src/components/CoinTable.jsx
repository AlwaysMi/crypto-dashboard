// src/components/CoinTable.jsx

import React from 'react';

function CoinTable({ data, onCoinClick }) {
  return (
    <table className="coin-table">
      <thead>
        <tr>
          <th>Aset</th>
          <th>Harga (IDR)</th>
          <th>Perubahan (24j)</th>
          <th>Market Cap (IDR)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((coin) => (
          <tr
            key={coin.id}
            className="clickable-row"
            onClick={() => onCoinClick(coin)} 
          >
            {/* data-label adalah untuk tampilan mobile (Req #10) */}
            <td data-label="Aset">
              <div className="coin-name">
                <img src={coin.image} alt={coin.name} width="28" height="28" />
                <div className="coin-id-symbol">
                    <strong>{coin.name}</strong>
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
