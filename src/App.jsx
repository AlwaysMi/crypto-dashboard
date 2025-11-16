import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import MainChart from './components/MainChart';
import CoinTable from './components/CoinTable';
import Marquee from './components/Marquee';
import TabMenu from './components/TabMenu';
import FuturesContractTable from './components/FuturesContractTable';
import logoA from './assets/A.png'; 
import './App.css';
import coingeckoLogo from './assets/coingecko.png';

// === Konstanta & Konfigurasi ===

const API_BASE_URL = '/api/v3';

const IconGitHub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);
const IconTrending = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#F59E0B' }}><path d="M8.657 5.615c.39-.39 1.023-.39 1.414 0l4.242 4.242a.5.5 0 0 1 0 .707l-4.242 4.242a.999.999 0 1 1-1.414-1.414L11.586 10H4.5a.5.5 0 0 1 0-1h7.086l-2.929-2.929a.5.5 0 0 1 0-.707z" /><path d="M1.343 4.657a.5.5 0 0 1 0-.707l4.242-4.242a.999.999 0 1 1 1.414 1.414L4.414 4H11.5a.5.5 0 0 1 0 1H4.414l2.585 2.585a.5.5 0 0 1-.707.707L1.343 4.657z" /></svg>);
const IconGainers = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#10B981' }}><path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" /></svg>);
const IconLosers = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#EF4444' }}><path fillRule="evenodd" d="M8 1a.5.5 0 0 0-.5.5v11.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 13.293V1.5A.5.5 0 0 0 8 1z" /></svg>);

const CHART_OPTIONS = [
  { label: '24j', value: '1', descriptiveLabel: '24 Jam' },
  { label: '3H', value: '3', descriptiveLabel: '3 Hari' },
  { label: '7H', value: '7', descriptiveLabel: '7 Hari' },
  { label: '15H', value: '15', descriptiveLabel: '15 Hari' }
];

// === Hook Kustom ===

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// === Komponen Internal ===

const OverviewCard = ({ title, items, icon }) => (
  <div className="overview-card slide-in-up">
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon} {title}
    </h3>
    <div className="overview-list">
      {items.map(item => (
        <div key={item.id || `${item.symbol}-${item.name}`} className="overview-list-item">
          {item.image && <img src={item.image} alt={item.name} />}
          <div className="overview-name">
            <strong>{item.symbol.toUpperCase()}</strong>
            <span className="price">
              {item.isFuture ? 
                item.name :
                (item.current_price ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
              }
            </span>
          </div>
          <span className={`change ${(parseFloat(item.price_change_percentage_24h) || 0) > 0 ? 'positive' : 'negative'}`}>
            {(parseFloat(item.price_change_percentage_24h) || 0) > 0 ? '+' : ''}
            {(parseFloat(item.price_change_percentage_24h) || 0).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

// === Komponen Utama ===

function App() {
  
  // === Blok State ===
  const [idrPerUsd, setIdrPerUsd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFutures, setIsLoadingFutures] = useState(false);
  const [derivativesData, setDerivativesData] = useState([]); 
  const [chartError, setChartError] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState({ id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' });
  const [chartData, setChartData] = useState(null);
  const [spotMarketData, setSpotMarketData] = useState([]);
  const [futuresOverviewData, setFuturesOverviewData] = useState({ gainers: [], losers: [] });
  const [trendingData, setTrendingData] = useState([]); 
  const [activeMarketTab, setActiveMarketTab] = useState('Spot');
  const [activeSubTab, setActiveSubTab] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'ascending' });
  const [chartDays, setChartDays] = useState('7');
  const [isMenuOpen, setIsMenuOpen] = useState(false);  
  const debouncedSelectedCoin = useDebounce(selectedCoin, 500);

  // === Blok State Turunan & Memo (useMemo) ===
  
  const activeChartLabel = useMemo(() => {
    return CHART_OPTIONS.find(opt => opt.value === chartDays)?.descriptiveLabel || `${chartDays} Hari`;
  }, [chartDays]);

  const timeUnit = useMemo(() => {
    const days = parseInt(chartDays);
    if (days <= 1) return 'hour';
    return 'day';
  }, [chartDays]);

  const maxTicks = useMemo(() => {
    const days = parseInt(chartDays);
    if (days <= 1) return 8;
    if (days <= 7) return days + 1; 
    return 8; 
    
  }, [chartDays]);

  // === Blok Pengambilan Data (API) ===
  
  const fetchMarketData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=250&page=1&sparkline=true`
      );
      setSpotMarketData(response.data); 
      
      // Tentukan kurs IDR/USD dari data stablecoin
      const usdc = response.data.find(coin => coin.symbol.toLowerCase() === 'usdc');
      if (usdc && usdc.current_price > 0) {
        setIdrPerUsd(usdc.current_price);
      } else {
        const usdt = response.data.find(coin => coin.symbol.toLowerCase() === 'usdt');
        if (usdt && usdt.current_price > 0) {
          setIdrPerUsd(usdt.current_price);
        } else {
          setIdrPerUsd(16000); // Fallback jika tidak ditemukan
        }
      }
      
      // Set koin default (Bitcoin) jika belum dipilih
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
    }
  };

  const fetchFuturesData = async (retryCount = 0) => {
    setIsLoadingFutures(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/derivatives?include_tickers=unexpired`);
      const rawDerivatives = response.data;
      
      // --- Data untuk Overview Cards ---
      const perpetualsForOverview = rawDerivatives.filter(
        c => c.contract_type === "perpetual" && 
             (parseFloat(c.volume_24h) || 0) > 0 &&
             c.price_percentage_change_24h != null // PERBAIKAN: Nama properti API
      );
      
      // Standarisasi data agar 'OverviewCard' bisa menerima data Spot & Futures
      // PERBAIKAN: Gunakan 'price_percentage_change_24h' dari API (kanan)
      // dan petakan ke 'price_change_percentage_24h' (kiri) agar konsisten dengan Spot.
      const mapToOverviewItem = (item) => ({
        symbol: item.symbol,
        name: item.market,
        price_change_percentage_24h: item.price_percentage_change_24h, // Ini kuncinya
        isFuture: true,
      });

      const sortedGainers = [...perpetualsForOverview]
        .sort((a, b) => (parseFloat(b.price_percentage_change_24h) || 0) - (parseFloat(a.price_percentage_change_24h) || 0))
        .slice(0, 5)
        .map(mapToOverviewItem);

      const sortedLosers = [...perpetualsForOverview]
        .sort((a, b) => (parseFloat(a.price_percentage_change_24h) || 0) - (parseFloat(b.price_percentage_change_24h) || 0))
        .slice(0, 5)
        .map(mapToOverviewItem);

      setFuturesOverviewData({ gainers: sortedGainers, losers: sortedLosers });
      
      // --- Data untuk Tabel Utama ---
      const perpetualsForTable = rawDerivatives
        .filter(c => c.contract_type === "perpetual")
        .sort((a, b) => (parseFloat(b.volume_24h) || 0) - (parseFloat(a.volume_24h) || 0))
        .slice(0, 250);
        
      setDerivativesData(perpetualsForTable);

    } catch (error) {
      console.error(`Error fetching futures data (attempt ${retryCount + 1}):`, error); 
      if (retryCount < 2) {
        setTimeout(() => fetchFuturesData(retryCount + 1), 2000);
      }
    } finally {
      setIsLoadingFutures(false);
    }
  };

  const fetchTrendingData = async () => {
    try {
      const trendResponse = await axios.get(`${API_BASE_URL}/search/trending`);
      const trendingIDs = trendResponse.data.coins.map(c => c.item.id);
      setTrendingData(trendingIDs);
    }
     catch (error) {
      console.error("Gagal mengambil data trending:", error);
    }
  };

  const fetchChartData = useCallback(async () => {
    if (!debouncedSelectedCoin.id) return;
    
    if (!chartError) {
      setChartData(null); 
    }
    setChartError(false);
    
    try {
      const chartResponse = await axios.get(
        `${API_BASE_URL}/coins/${debouncedSelectedCoin.id}/market_chart?vs_currency=idr&days=${chartDays}`
      );
      
      // Filter duplikat timestamp jika ada
      const uniquePrices = chartResponse.data.prices.filter(
        ([timestamp], index, self) =>
          index === self.findIndex(([ts]) => ts === timestamp)
      );
      
      const lineTension = chartDays === '3' ? 0 : 0.4;

      const processedData = {
        datasets: [{
          label: `Harga ${debouncedSelectedCoin.name} (IDR)`,
          data: uniquePrices.map(([timestamp, price]) => ({ x: timestamp, y: price })),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          pointRadius: 0,
          tension: lineTension,
        }],
      };
      
      setChartData(processedData);
      setChartError(false);
      
    } catch (error) {
      console.error(`Gagal mengambil data grafik untuk ${debouncedSelectedCoin.id}:`, error);
      
      if (error.response && error.response.status === 429) {
        console.warn("Rate limit terdeteksi. Mencoba lagi dalam 60 detik...");
        setChartError(true);
        // PERBAIKAN BUG: Hapus chartError dari dependency array di bawah
        // agar setTimeout ini tidak memicu infinite loop.
        setTimeout(fetchChartData, 60000); 
      } else {
        setChartError(true);
      }
    }
  }, [debouncedSelectedCoin, chartDays]); // PERBAIKAN: chartError dihapus dari sini

  // === Blok Efek Samping (useEffect) ===
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await fetchMarketData();
        await Promise.all([
          fetchTrendingData(),
          fetchFuturesData()
        ]);
        
      } catch (error) {
        console.error("Gagal memuat semua data awal:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []); 

  useEffect(() => {
    // Muat ulang data futures saat tab-nya diklik (jika data spot sudah ada)
    if (activeMarketTab === 'Futures' && spotMarketData.length > 0) {
      fetchFuturesData();
    }
  }, [activeMarketTab, spotMarketData.length]);

  useEffect(() => {
    // Ambil data grafik saat koin yang dipilih (setelah di-debounce) berubah
    if (debouncedSelectedCoin.id) {
      fetchChartData();
    }
  }, [debouncedSelectedCoin, fetchChartData]);
  
  useEffect(() => {
     // Reset SubTab dan SortConfig saat MarketTab utama berubah
     if (activeMarketTab === 'Futures' && activeSubTab === 'Trending') {
       setActiveSubTab('Semua');
     }
     
     if (activeMarketTab === 'Spot') {
       setSortConfig({ key: 'market_cap_rank', direction: 'ascending' });
     } else {
       setSortConfig({ key: 'volume_24h_rank', direction: 'descending' });
     }
  }, [activeMarketTab]);

  // === Blok Penyaringan & Transformasi Data (useMemo) ===
  
  const topTrendingSpot = useMemo(() => spotMarketData.filter(coin => trendingData.includes(coin.id)).slice(0, 5), [spotMarketData, trendingData]);
  const topGainersSpot = useMemo(() => [...spotMarketData].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 5), [spotMarketData]);
  const topLosersSpot = useMemo(() => [...spotMarketData].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 5), [spotMarketData]);
  
  const filteredSpotData = useMemo(() => {
    let filtered = [];
    if (activeSubTab === 'Trending') {
      filtered = spotMarketData.filter(coin => trendingData.includes(coin.id));
    } else {
      filtered = [...spotMarketData];
      if (activeSubTab === 'Gainers') filtered = filtered.filter(coin => (coin.price_change_percentage_24h ?? 0) > 0);
      else if (activeSubTab === 'Losers') filtered = filtered.filter(coin => (coin.price_change_percentage_24h ?? 0) <= 0);
    }
    
    // Logika sorting untuk tabel Spot
    filtered.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === 'ascending' ? 1 : -1;
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue, undefined, { sensitivity: 'base' }) * direction;
      }

      const aNum = aValue ?? 0;
      const bNum = bValue ?? 0;

      if (aNum < bNum) return -1 * direction;
      if (aNum > bNum) return 1 * direction;
      return 0;
    });
    
    return filtered;
  }, [spotMarketData, activeSubTab, sortConfig, trendingData]);

  const filteredDerivativesData = useMemo(() => {
    let filtered = [...derivativesData];
    
    // PERBAIKAN: Gunakan 'price_percentage_change_24h'
    if (activeSubTab === 'Gainers') {
      filtered = filtered.filter(c => (parseFloat(c.price_percentage_change_24h) || 0) > 0);
    } else if (activeSubTab === 'Losers') {
      filtered = filtered.filter(c => (parseFloat(c.price_percentage_change_24h) || 0) <= 0);
    }
    
    return filtered;
  }, [derivativesData, activeSubTab]);

  const globalMetrics = useMemo(() => {
    const metrics = [];

    // --- Bagian SPOT ---
    if (spotMarketData.length > 0) {
      metrics.push({ type: 'header', id: 'spot-header', categoryName: 'Spot Market' });
      const top5Spot = spotMarketData.slice(0, 5);

      top5Spot.forEach((coin, index) => {
        metrics.push({
          type: 'coin',
          id: coin.id,
          icon: coin.image,
          name: coin.symbol.toUpperCase(),
          change: coin.price_change_percentage_24h ?? 0,
          value: (coin.current_price ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' } ),
        });
        if (index < top5Spot.length - 1) {
          metrics.push({ type: 'divider', id: `divider-spot-${index}` });
        }
      });
    }

    // --- Bagian FUTURES ---
    if (derivativesData.length > 0) {
      metrics.push({ type: 'header', id: 'futures-header', categoryName: 'Futures Perpetual' });
      const top5Futures = derivativesData.slice(0, 5);
      
      top5Futures.forEach((item, index) => {
        const idrPrice = (parseFloat(item.price) || 0) * (idrPerUsd || 0);
        metrics.push({
          type: 'coin',
          id: item.symbol + item.market,
          icon: null, 
          name: item.symbol,
          // PERBAIKAN: Gunakan 'price_percentage_change_24h'
          change: parseFloat(item.price_percentage_change_24h) || 0,
          value: idrPrice.toLocaleString('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }),
        });       
        if (index < top5Futures.length - 1) {
          metrics.push({ type: 'divider', id: `divider-futures-${index}` });
        }
      });
    }
    return metrics;
  }, [spotMarketData, derivativesData, idrPerUsd]); // idrPerUsd ditambahkan sebagai dependency
  
  const subTabs = useMemo(() => {
    const allTabs = ['Semua', 'Trending', 'Gainers', 'Losers'];
    if (activeMarketTab === 'Futures') {
      return allTabs.filter(tab => tab !== 'Trending');
    }
    return allTabs;
  }, [activeMarketTab]);

  // === Blok Penangan Aksi (Handlers) ===
  
  const handleCoinClick = (coin) => {
    setSelectedCoin({ id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image });
  };
  
  const handleSortRequest = (clickedKey) => {
    const defaultSort = { key: 'market_cap_rank', direction: 'ascending' };
    
    if (activeMarketTab === 'Futures') {
      defaultSort.key = 'volume_24h_rank';
      defaultSort.direction = 'descending';
    }

    const currentKey = sortConfig.key;
    const currentDirection = sortConfig.direction;

    let primarySortDir = 'ascending';
    let secondarySortDir = 'descending';

    // PERBAIKAN: Gunakan 'price_percentage_change_24h'
    const priceLikeKeys = ['current_price', 'market_cap', 'price_change_percentage_24h', 'price_percentage_change_24h', 'volume_24h', 'price', 'index_price', 'funding_rate'];
    if (priceLikeKeys.includes(clickedKey)) {
      primarySortDir = 'descending';
      secondarySortDir = 'ascending';
    }

    if (currentKey !== clickedKey) {
      setSortConfig({ key: clickedKey, direction: primarySortDir });
    } else {
      if (currentDirection === primarySortDir) {
        setSortConfig({ key: clickedKey, direction: secondarySortDir });
      } else {
        setSortConfig(defaultSort);
      }
    }
  };

  // === Blok Render Kustom ===
  
  const renderMarqueeItem = (item, key) => {
    if (item.type === 'header') {
      return (
        <div key={key} className="marquee-item-header">
          <span className="marquee-divider" aria-hidden="true">||</span>
          <span className="marquee-category-header">
            {item.categoryName.toUpperCase()}
          </span>
          <span className="marquee-divider" aria-hidden="true">||</span>
        </div>
      );
    }

    if (item.type === 'coin') {
      return (
        <div key={key} className="marquee-item-final">
          {item.icon && (
            <img src={item.icon} alt="" className="marquee-logo" />
          )}
          <span className="marquee-name">{item.name}</span>
          <span className={`marquee-change ${item.change > 0 ? 'positive' : 'negative'}`}>
            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
          </span>
          <span className="marquee-price">{item.value}</span>
        </div>
      );
    }

    if (item.type === 'divider') {
      return (
        <div key={key} className="marquee-item-divider-only">
          <span className="marquee-divider" aria-hidden="true">|</span>
        </div>
      );
    }
    return null;
  };

  // === Render Komponen (JSX) ===

  return (
    <div className="app-wrapper"> 
      <header className="global-header">
        <div className="logo-container">
          <span className="logo-text-iam">I</span>
          <img src={logoA} alt="A" className="logo-text-image" />
          <span className="logo-text-iam">M</span>
          <span className="logo-text-crypto">Crypto</span>
        </div>
        
        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </div>

        {isMenuOpen && (
          <div className="dropdown-menu">
            <a 
              // Ganti URL ini dengan link GitHub Anda
              href="https://github.com/AlwaysMi/crypto-dashboard"
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-item"
            >
              <IconGitHub /> {/* <-- 1. Tambahkan Ikon */}
              <span>Lihat Sumber</span> {/* <-- 2. Bungkus teks */}
            </a>
          </div>
        )}
      </header>

      <Marquee items={globalMetrics} renderItem={renderMarqueeItem} />
      
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
            
            <div className="overview-container">
              <OverviewCard 
                title="Top Gainers" 
                items={activeMarketTab === 'Spot' ? topGainersSpot : futuresOverviewData.gainers} 
                icon={<IconGainers />}
              />
              <OverviewCard 
                title="Top Losers" 
                items={activeMarketTab === 'Spot' ? topLosersSpot : futuresOverviewData.losers} 
                icon={<IconLosers />}
              />
            </div>
            
            <TabMenu 
              tabs={subTabs}
              activeTab={activeSubTab}
              onTabClick={setActiveSubTab}
              scrollable={true}
            />
            
            {activeMarketTab === 'Spot' && (
              <>
                <div className="chart-options-container">
                  {CHART_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`chart-option-btn ${chartDays === option.value ? 'active' : ''}`}
                      onClick={() => setChartDays(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="chart-container slide-in-up">
                  {(!chartData || chartError) ? (
                    <div style={{
                      height: '400px',
                      display: 'grid',
                      placeContent: 'center',
                      color: 'var(--subtle-text-color)'
                    }}>
                      <p>Memuat data grafik...</p>
                    </div>
                  ) : (
                    <MainChart 
                      data={chartData} 
                      coinName={selectedCoin.name}
                      timeLabel={activeChartLabel}
                      timeUnit={timeUnit}
                      maxTicks={maxTicks}
                    />
                  )}
                </div>
              </>
            )}
            
            <div className="table-container slide-in-up">
              {activeMarketTab === 'Spot' ? (
                <div className="table-scroll-wrapper"> 
                  {filteredSpotData.length > 0 ? (
                    <CoinTable 
                      data={filteredSpotData}
                      onCoinClick={handleCoinClick}
                      onSortRequest={handleSortRequest} 
                      sortConfig={sortConfig} 
                      selectedCoinId={selectedCoin.id}
                    />
                  ) : (
                    <p style={{textAlign: 'center', padding: '20px'}}>Tidak ada aset ditemukan.</p>
                  )}
                </div>
              ) : (
                <div className="table-scroll-wrapper"> 
                  {isLoadingFutures ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>Memuat data perpetuals...</p>
                  ) : (
                    <FuturesContractTable
                      data={filteredDerivativesData}
                      sortConfig={sortConfig} 
                      onSortRequest={handleSortRequest}
                      idrPerUsd={idrPerUsd} 
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <footer className="global-footer">
        <div className="footer-brand">
          
          <div className="logo-container footer-logo">
            <span className="logo-text-iam">I</span>
            <img src={logoA} alt="A" className="logo-text-image" />
            <span className="logo-text-iam">M</span>
            <span className="logo-text-crypto">Crypto</span>
          </div>
          
          <p className="footer-copyright">
            © {new Date().getFullYear()} IAMCrypto. All rights reserved.
          </p>
        </div>
        <div className="footer-attribution">
          <p>Data disediakan oleh</p>
          
          <a 
            href="https://www.coingecko.com?utm_source=iamcrypto&utm_medium=referral" 
            target="_blank" 
            rel="noopener noreferrer"
            className="coingecko-link"
          >
            <img 
                src={coingeckoLogo}
                alt="CoinGecko Logo" 
                className="coingecko-logo"
            />
            <span className="sr-only">CoinGecko</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
