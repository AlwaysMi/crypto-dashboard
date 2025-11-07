  import React from 'react';
  import { Line } from 'react-chartjs-2';
  import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
    TimeSeriesScale
  } from 'chart.js';

  import 'chartjs-adapter-date-fns'; 
  import { id } from 'date-fns/locale';

  ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
    TimeSeriesScale
  );

  ChartJS.defaults.color = '#f0f0f0';

  const MainChart = ({ data, coinName }) => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Grafik Harga 7 Hari untuk ${coinName}`,
          color: '#f0f0f0',
          font: {
            size: 16
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'var(--card-background)',
          titleColor: 'var(--subtle-text-color)',
          bodyColor: 'var(--text-color)',
          borderColor: 'var(--border-color)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          // --- PERBAIKAN: Tambahkan batasan untuk menghindari duplikasi dan overcrowd ---
          type: 'timeseries', 
          time: {
            unit: 'day', // Tetap per hari untuk labels bersih; ubah ke 'hour' jika ingin detail jam
            displayFormats: {
              day: 'dd/MM' // Format tanggal
            },
            adapters: {
              date: {
                locale: id
              }
            }
          },
          ticks: {
            color: '#f0f0f0',
            maxTicksLimit: 7, // --- BARU: Batasi labels ke 7 (satu per hari) untuk menghindari duplikasi ---
            // Jika ingin detail per jam, ubah maxTicksLimit ke 24 atau lebih, dan unit ke 'hour'
          },
          grid: {
            color: 'rgba(56, 60, 65, 0.5)'
          }
        },
        y: {
          type: 'linear',
          ticks: {
            color: '#f0f0f0',
            callback: function(value) {
              if (value >= 1000000000) {
                return 'Rp ' + (value / 1000000000) + ' M';
              }
              if (value >= 1000000) {
                return 'Rp ' + (value / 1000000) + ' Jt';
              }
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(value);
            }
          },
          grid: {
            color: 'var(--border-color)'
          }
        }
      }
    };

    if (!data) {
      return (
        <div style={{ height: '400px', display: 'grid', placeContent: 'center' }}>
          <p style={{ color: 'var(--subtle-text-color)' }}>Memuat data grafik...</p>
        </div>
      );
    }

    return (
      <div style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    );
  };

  export default MainChart;
  
