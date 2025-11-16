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

// Registrasi komponen Chart.js yang diperlukan
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

// Mengatur warna default teks Chart.js
ChartJS.defaults.color = '#f0f0f0';

const MainChart = ({ data, coinName, timeLabel, timeUnit, maxTicks }) => {
  
  // Konfigurasi utama untuk Chart.js
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Grafik Harga ${timeLabel} untuk ${coinName}`,
        color: '#f0f0f0',
        font: {
          size: 16
        }
      },
      // Konfigurasi Tooltip (kotak info saat hover)
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        titleColor: '#FFFFFF', 
        bodyColor: '#FFFFFF',  
        callbacks: {
          // Callback untuk JUDUL tooltip (menampilkan tanggal & jam)
          title: function(context) {
            const timestamp = context[0].parsed.x;
            const date = new Date(timestamp);
            return date.toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short'
            });
          },
          // Callback untuk BODY tooltip (menampilkan harga format IDR)
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
    // Konfigurasi Sumbu (X dan Y)
    scales: {
      x: {
        type: 'timeseries', 
        time: {
          unit: timeUnit, // 'hour' atau 'day' (dari App.jsx)
          minUnit: timeUnit === 'day' ? 'day' : undefined, // Mencegah duplikasi tanggal
          displayFormats: {
            hour: 'HH:mm',
            day: 'dd/MM'
          },
          adapters: {
            date: {
              locale: id
            }
          }
        },
        ticks: {
          color: '#f0f0f0',
          maxTicksLimit: maxTicks, // Batas jumlah label (dari App.jsx)
        },
        grid: {
          color: 'rgba(56, 60, 65, 0.5)'
        }
      },
      y: {
        type: 'linear',
        ticks: {
          color: '#f0f0f0',
          // Callback untuk memformat label Sumbu Y (Miliar/Juta)
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

  // Tampilkan placeholder jika data belum siap
  if (!data) {
    return (
      <div style={{ height: '400px', display: 'grid', placeContent: 'center' }}>
        <p style={{ color: 'var(--subtle-text-color)' }}>Memuat data grafik...</p>
      </div>
    );
  }

  // Render komponen Line Chart
  return (
    <div style={{ height: '400px' }} className="fade-in">
      <Line options={options} data={data} />
    </div>
  );
};

export default MainChart;
