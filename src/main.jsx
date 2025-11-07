import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 1. Mengimpor komponen App utama Anda

// 2. Mengimpor file CSS utama Anda.
// (Anda sudah melakukan ini di App.jsx, tapi ini adalah tempat 
// yang lebih umum untuk style global).
import './App.css'; 

// 3. Mencari div#root di index.html dan merender App di dalamnya
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
