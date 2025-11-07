import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import MainChart from './components/MainChart';
import CoinTable from './components/CoinTable';
import Marquee from './components/Marquee';
import TabMenu from './components/TabMenu';
import logoA from './assets/A.png'; 
import './App.css';

const API_BASE_URL = '/api/v3';

// --- MODIFIED: Tambahkan Ikon SVG ---
// Ikon-ikon ini akan kita gunakan di OverviewCard
const IconTrending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#F59E0B' }}>
    <path d="M8.657 5.615c.39-.39 1.023-.39 1.414 0l4.242 4.242a.5.5 0 0 1 0 .707l-4.242 4.242a.999.999 0 1 1-1.414-1.414L11.586 10H4.5a.5.5 0 0 1 0-1h7.086l-2.929-2.929a.5.5 0 0 1 0-.707z" />
    <path d="M1.343 4.657a.5.5 0 0 1 0-.707l4.242-4.242a.999.999 0 1 1 1.414 1.414L4.414 4H11.5a.5.5 0 0 1 0 1H4.414l2.585 2.585a.5.5 0 0 1-.707.707L1.343 4.657z" />
  </svg>
);

const IconGainers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#10B981' }}>
    <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
  </svg>
);

const IconLosers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#EF4444' }}>
    <path fillRule="evenodd" d="M8 1a.5.5 0 0 0-.5.5v11.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 13.293V1.5A.5.5 0 0 0 8 1z" />
  </svg>
);

// --- MODIFIED: Kustom Hook untuk Debounce ---
// Ini akan menunda eksekusi sampai pengguna berhenti berinteraksi
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // Set timeout untuk update value setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Bersihkan timeout jika value berubah (misal: user klik lagi)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya re-run jika value atau delay berubah
  return debouncedValue;
}

// --- MODIFIED: OverviewCard menerima prop 'icon' ---
const OverviewCard = ({ title, items, icon }) => (
  <div className="overview-card">
    {/* Tambahkan style flex untuk mensejajarkan ikon dan judul */}
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon} {/* Render ikon di sini */}
      {title}
    </h3>
    <div className="overview-list">
      {items.map(item => (
        <div key={item.id} className="overview-list-item">
          <img src={item.image} alt={item.name} />
          <div className="overview-name">
            <strong>{item.symbol.toUpperCase()}</strong>
            <span className="price">
              {(item.current_price ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </span>
          </div>
          <span className={`change ${(item.price_change_percentage_24h ?? 0) > 0 ? 'positive' : 'negative'}`}>
            {(item.price_change_percentage_24h ?? 0) > 0 ? '+' : ''}
            {(item.price_change_percentage_24h ?? 0).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  </div>
);


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFutures, setIsLoadingFutures] = useState(false);
  const [futuresLoadError, setFuturesLoadError] = useState(false);

  const [selectedCoin, setSelectedCoin] = useState({ id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' });
  const [chartData, setChartData] = useState(null);
  
  // --- MODIFIED: Terapkan Debounce pada selectedCoin ---
  // Kita tunda 500ms. Jika user klik koin lain dalam 500ms, panggilan API sebelumnya dibatalkan.
  const debouncedSelectedCoin = useDebounce(selectedCoin, 500);
  
  const [spotMarketData, setSpotMarketData] = useState([]);
  const [futuresMarketData, setFuturesMarketData] = useState([]);
  
  const [globalMetrics, setGlobalMetrics] = useState([]);
  const [trendingData, setTrendingData] = useState([]); // Ini adalah array ID
  
  const [activeMarketTab, setActiveMarketTab] = useState('Spot');
  const [activeSubTab, setActiveSubTab] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'ascending' });
  const [showAll, setShowAll] = useState(false);

  // === DATA FETCHING ===
  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=250&page=1&sparkline=true`
      );
      setSpotMarketData(response.data); 
      const metrics = response.data.slice(0, 10).map(coin => ({
        category: 'Spot',
        name: coin.symbol.toUpperCase(),
        icon: coin.image,
        change: coin.price_change_percentage_24h ?? 0,
        value: (coin.current_price ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
      }));
      setGlobalMetrics(metrics);
      if (response.data.length > 0 && selectedCoin.id === 'bitcoin') {
        const defaultCoin = response.data[0];
        setSelectedCoin({
          id: defaultCoin.id,
          name: defaultCoin.name,
          symbol: defaultCoin.symbol,
          image: defaultCoin.image
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data market:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFuturesData = async (retryCount = 0) => {
    if (spotMarketData.length === 0) {
      console.log('Spot data not ready, skipping futures fetch'); 
      return;
    }
    setIsLoadingFutures(true);
    setFuturesLoadError(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await axios.get(`${API_BASE_URL}/derivatives`);
      console.log('Futures data fetched:', response.data.length, 'contracts'); 

      const futuresCoinIds = new Set(
        response.data
          .map(contract => contract.index_id?.toLowerCase())
          .filter(id => id)
      );
      console.log('Futures IDs (normalized):', Array.from(futuresCoinIds)); 

      const filteredFutures = spotMarketData.filter(coin => 
        futuresCoinIds.has(coin.symbol.toLowerCase())
      );
      console.log('Filtered futures data:', filteredFutures.length, 'items'); 

      setFuturesMarketData(filteredFutures);
    } catch (error) {
      console.error(`Error fetching futures data (attempt ${retryCount + 1}):`, error); 
      if (retryCount < 2) {
        console.log(`Retrying fetchFuturesData in 2 seconds...`);
        setTimeout(() => fetchFuturesData(retryCount + 1), 2000);
      } else {
        setFuturesMarketData([]);
        setFuturesLoadError(true);
      }
    } finally {
      setIsLoadingFutures(false);
    }
  };

  const fetchTrendingData = async () => {
    try {
      const trendResponse = await axios.get(`${API_BASE_URL}/search/trending`);
      // Simpan array ID dari data trending
      const trendingIDs = trendResponse.data.coins.map(c => c.item.id);
      setTrendingData(trendingIDs);
    }
     catch (error)
     {
      console.error("Gagal mengambil data trending:", error);
    }
  };

  // --- MODIFIED: Logika fetchChartData diupdate ---
  const fetchChartData = async () => {
    // Gunakan 'debouncedSelectedCoin' untuk ID dan Nama
    if (!debouncedSelectedCoin.id) return;
    setChartData(null); // Tampilkan "Loading chart..."
    try {
      const chartResponse = await axios.get(
        `${API_BASE_URL}/coins/${debouncedSelectedCoin.id}/market_chart?vs_currency=idr&days=7`
      );
      const uniquePrices = [];
      const seenTimestamps = new Set();
      chartResponse.data.prices.forEach(([timestamp, price]) => {
        if (!seenTimestamps.has(timestamp)) {
          seenTimestamps.add(timestamp);
          uniquePrices.push([timestamp, price]);
        }
      });
      const processedData = {
        datasets: [{
          // Gunakan nama dari koin yang di-debounce
          label: `Harga ${debouncedSelectedCoin.name} (IDR)`,
          data: uniquePrices.map(([timestamp, price]) => ({
            x: timestamp,
            y: price
          })),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          pointRadius: 0,
          tension: 0.4,
        }],
      };
      setChartData(processedData);
    } catch (error) {
      console.error(`Gagal mengambil data grafik untuk ${debouncedSelectedCoin.id}:`, error);
      if (error.response && error.response.status === 429) {
        console.error("RATE LIMIT TERKENA! Debounce telah aktif, tetapi mungkin Anda mengklik terlalu cepat.");
        // Di sini kita bisa set state untuk error UI jika perlu
      }
    }
  };

  // === EFEK (useEffect) ===
  useEffect(() => {
    fetchMarketData();
    fetchTrendingData(); // Pastikan ini dipanggil saat load
  }, []); 

  useEffect(() => {
    if (activeMarketTab === 'Futures' && spotMarketData.length > 0) {
      fetchFuturesData();
    }
  }, [activeMarketTab, spotMarketData]);

  // --- MODIFIED: useEffect untuk chart sekarang bergantung pada 'debouncedSelectedCoin' ---
  // Ini hanya akan berjalan 500ms SETELAH user berhenti mengklik.
  useEffect(() => {
    fetchChartData();
  }, [debouncedSelectedCoin]);

  // === LOGIKA FILTER & SORT (useMemo) ===
  const activeMarketData = useMemo(() => {
    return activeMarketTab === 'Spot' ? spotMarketData : futuresMarketData;
  }, [activeMarketTab, spotMarketData, futuresMarketData]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = [];
    if (activeSubTab === 'Trending') {
        // Gunakan trendingData (array ID) untuk memfilter spotMarketData
        if (trendingData.length > 0 && activeMarketTab === 'Spot') {
            filtered = spotMarketData.filter(coin => trendingData.includes(coin.id));
        } else {
            filtered = [];
        }
    } else {
        filtered = [...activeMarketData];
        if (activeSubTab === 'Gainers') {
          filtered = filtered.filter(coin => (coin.price_change_percentage_24h ?? 0) > 0);
        } else if (activeSubTab === 'Losers') {
          filtered = filtered.filter(coin => (coin.price_change_percentage_24h ?? 0) <= 0);
        }
    }
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? 0;
      const bValue = b[sortConfig.key] ?? 0;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    console.log('Filtered and sorted data for', activeMarketTab, ':', filtered.length, 'items'); 
    
    return filtered;
  }, [
      activeMarketData,
      spotMarketData, 
      activeSubTab, 
      activeMarketTab, 
      sortConfig, 
      trendingData // Tambahkan trendingData sebagai dependensi
  ]);

  const dataForTable = useMemo(() => {
    if (showAll) {
      return filteredAndSortedData;
    }
    return filteredAndSortedData.slice(0, 10);
  }, [filteredAndSortedData, showAll]);

  // --- MODIFIED: Tambahkan memo untuk Top Trending ---
  const topTrending = useMemo(() => 
    // Filter spotMarketData berdasarkan ID di trendingData
    spotMarketData
      .filter(coin => trendingData.includes(coin.id))
      .slice(0, 5), 
  [spotMarketData, trendingData]);

  const topGainers = useMemo(() => 
    [...activeMarketData]
      .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
      .slice(0, 5), 
  [activeMarketData]);
  
  const topLosers = useMemo(() => 
    [...activeMarketData]
      .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0))
      .slice(0, 5), 
  [activeMarketData]);


  // === HANDLERS ===
  const handleCoinClick = (coin) => {
    // Ini akan update state 'live'
    // 'debouncedSelectedCoin' akan update 500ms kemudian
    setSelectedCoin({ id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image });
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key, direction });
  };

  // === RENDER JSX ===
  return (
    <div className="app-wrapper"> 
      <header className="global-header">
        <div className="logo-container">
          <span className="logo-text-iam">I</span>
          <img src={logoA} alt="A" className="logo-text-image" />
          <span className="logo-text-iam">M</span>
          <span className="logo-text-crypto">Crypto</span>
        </div>
        <div className="menu-icon">
          ☰
        </div>
      </header>

      {globalMetrics.length > 0 && (
        <Marquee items={globalMetrics} />
      )}
      
      <div className="dashboard-container">
        {isLoading ? (
          <div className="loading-fullscreen">
            <p>Memuat data pasar...</p>
          </div>
        ) : (
          <>
            <h1>Market</h1>
            <TabMenu 
              tabs={['Spot', 'Futures']} 
              activeTab={activeMarketTab}
              onTabClick={setActiveMarketTab}
            />
            {/* --- MODIFIED: Tampilkan 3 OverviewCard dengan ikon --- */}
            <div className="overview-container">
              <OverviewCard 
                title="Sedang Trending" 
                items={topTrending} 
                icon={<IconTrending />} 
              />
              <OverviewCard 
                title="Top Gainers" 
                items={topGainers} 
                icon={<IconGainers />}
              />
              <OverviewCard 
                title="Top Losers" 
                items={topLosers} 
                icon={<IconLosers />}
              />
            </div>
            <TabMenu 
              tabs={['Semua', 'Trending', 'Gainers', 'Losers']}
              activeTab={activeSubTab}
              onTabClick={setActiveSubTab}
              scrollable={true}
            />
            <div className="filter-sort-container">
              <select onChange={handleSortChange} value={`${sortConfig.key}-${sortConfig.direction}`}>
                <option value="market_cap_rank-ascending">Urutkan (Peringkat Market)</option>
                <option value="price_change_percentage_24h-descending">Top Gainers 24j</option>
                <option value="price_change_percentage_24h-ascending">Top Losers 24j</option>
                <option value="name-ascending">Nama (A-Z)</option>
                <option value="name-descending">Nama (Z-A)</option>
              </select>
            </div>
            <div className="chart-container">
              {chartData ? (
                // Judul chart akan update instan dari 'selectedCoin'
                <MainChart data={chartData} coinName={selectedCoin.name} />
              ) : (
                <p style={{textAlign: 'center', color: 'var(--subtle-text-color)'}}>Loading chart...</p>
              )}
            </div>
            <div className="table-container">
              {dataForTable.length > 0 ? (
                <CoinTable 
                  data={dataForTable}
                  onCoinClick={handleCoinClick} 
                />
              ) : (
                <p style={{textAlign: 'center', color: 'var(--subtle-text-color)', padding: '20px'}}>
                  {(() => {
                    if (activeMarketTab === 'Futures') {
                      if (isLoadingFutures) {
                        return 'Memuat data futures...'; 
                      }
                      if (futuresLoadError) {
                        return 'Gagal memuat data futures setelah percobaan ulang. Coba lagi nanti.';
                      }
                      if (activeSubTab === 'Trending') {
                         return 'Data trending tidak tersedia untuk futures.';
                      }
                      return 'Tidak ada aset futures yang tersedia.';
                    }

                    if (activeMarketTab === 'Spot') {
                        if (activeSubTab === 'Trending') {
                          return 'Data trending tidak ditemukan.';
                        }
                        return 'Tidak ada aset yang ditemukan untuk filter ini.';
                    }
                    
                    return 'Tidak ada aset yang ditemukan.'; // Fallback
                  })()}
                </p>
              )}

              {filteredAndSortedData.length > 10 && (
                <div className="see-all-container">
                  <button onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${filteredAndSortedData.length} Aset)`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;


