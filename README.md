# 🚍 DAMRI Gorontalo GIS - Real-Time Fleet Tracking & Transit Map

<p align="center">
  <img src="https://img.shields.io/badge/Author-BieM363-003366?style=for-the-badge&logo=github&logoColor=white" alt="Author BieM363" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Socket.io-1Hz_Telemetry-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Leaflet-GIS_Map-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Turf.js-Spatial_Engine-3887BE?style=for-the-badge" alt="Turf.js" />
</p>

> **Sistem Informasi Geografis (GIS) Pelacakan Armada Bus DAMRI & Peta Transit Real-Time Koridor Trans-Sulawesi (Gorontalo)**
> Dikembangkan & Dirancang oleh: **[BieM363](https://github.com/BieM363)**

Aplikasi Web GIS Full-Stack Real-Time berbasis **Event-Driven Architecture** dengan tema identitas resmi DAMRI (Biru Royal, Kuning Emas & Putih Bersih) untuk melacak posisi bus DAMRI secara live di sepanjang rute Trans-Sulawesi, menghitung Estimasi Waktu Kedatangan (**ETA**) di setiap halte/terminal transit, memvisualisasikan geometri trayek GeoJSON presisi, dan memantau status okupansi penumpang.

---

## 🌟 Nilai Jual & Fitur Utama Portofolio

### 1. 📍 Real-Time Bus GPS Simulation & Bearing Rotation (0–360°)
- Marker bus bergerak secara halus (*smooth real-time interpolation*) di atas garis rute jalan raya Trans-Sulawesi.
- Marker bus memiliki panah orientasi haluan yang **berputar secara dinamis (0–360° bearing)** mengikuti lekukan jalan raya dengan kalkulasi geodesik `@turf/turf`.
- Dilengkapi gelombang radar (*radar wave pulse*) pada armada yang sedang melaju dan badge indikator status darurat (*SOS pulse*).

### 2. ⏱️ Dynamic Estimated Time of Arrival (ETA) Calculator
- Perhitungan waktu kedatangan bus berikutnya di setiap halte/terminal secara matematis berdasarkan jarak sisa (*remaining distance along polyline*), kecepatan real-time (km/jam), dwell time stasiun, dan faktor gangguan lalu lintas.
- Notifikasi audio kedatangan (*two-tone transit chime*) yang disintesis langsung menggunakan **Web Audio API** saat bus tiba dalam radius 150m dari halte.

### 3. 🗺️ Route Geometry & Multi-Basemap GIS (Terang & Bersih)
- 5 Koridor Trayek resmi DAMRI Gorontalo berbasis GeoJSON presisi:
  1. **Shuttle Bandara:** Bandara Djalaluddin ⇄ Limboto ⇄ UNG ⇄ Terminal Dungingi.
  2. **Perintis Gorut:** Terminal Dungingi ⇄ Isimu ⇄ Pelabuhan Kwandang.
  3. **Trans-Sulawesi Barat:** Terminal Dungingi ⇄ Paguyaman ⇄ Boalemo ⇄ Terminal Marisa (Pohuwato).
  4. **AKDP Antar-Provinsi:** Terminal Dungingi ⇄ Atinggola ⇄ Boroko ⇄ Kotamobagu ⇄ Malalayang (Manado).
  5. **City Tour & Wisata:** Benteng Otanaha ⇄ UNG ⇄ Bundaran Taruna ⇄ Pelabuhan Leato ⇄ Pantai Hiu Paus Botubarani.
- Multi-layer Basemap: **Peta Terang DAMRI (OpenStreetMap)**, **Positron GIS (Terang)**, **Satelit Hybrid ESRI**, dan **Dark Matter (Malam)**.

### 4. 👥 Passenger Density Indicator & Seat Layout Visualizer
- Visualisasi kapasitas kursi real-time dengan kode warna:
  - 🟢 **Tersedia (< 60% okupansi)**
  - 🟡 **Sedang (60% - 90% okupansi)**
  - 🔴 **Penuh (> 90% okupansi)**
- Layout denah kursi interaktif (2-2 bus layout) di dalam *Bus Detail Drawer*.

### 5. 🎮 Dual Experience Mode:
- **Mode Penumpang (Passenger App):**
  - Cari rute antara dua titik halte/terminal.
  - Cek tarif resmi DAMRI, jarak total, dan countdown bus terdekat.
  - Simulasi pemesanan tiket dengan efek selebrasi confetti.
- **Mode Dispatcher & Command Center:**
  - Kontrol kecepatan simulasi GPS (1x, 2x, 5x, 10x).
  - Jeda / Lanjutkan simulasi (*Pause / Resume*).
  - Simulasi rekayasa lalu lintas & cuaca buruk (misal: longsor jalur Isimu-Kwandang, hujan lebat di Marisa).
  - Simulasi pemicu sinyal darurat SOS armada bus.
  - *Live WebSocket Telemetry Feed Terminal*.

---

## 🏗️ Arsitektur Teknologi (Tech Stack)

```
[ Frontend: React 18 + Vite + Leaflet / React-Leaflet + TailwindCSS + Lucide Icons + Web Audio API ]
                                   ▲ ▼  (WebSocket 1Hz / REST API)
[ Backend: Node.js + Express + Socket.io + Turf.js Spatial Engine + In-Memory Store ]
```

- **Frontend:** React 18, Vite, React-Leaflet, Leaflet, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend:** Node.js (ESM), Express, Socket.io (WebSockets 1Hz Telemetry Broadcast), `@turf/turf` (Geodesic calculations: `along`, `bearing`, `length`, `nearestPointOnLine`).
- **Creator & Maintainer:** [BieM363](https://github.com/BieM363)

---

## 🚀 Panduan Menjalankan Proyek

### 1. Jalankan Backend Server (Port 5001)
```bash
cd server
npm install
node index.js
```

### 2. Jalankan Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```

Buka browser di: **`http://localhost:5173/`**

---

## 📡 REST API & WebSocket Events

### REST Endpoints:
- `GET /api/health`: Status server, uptime & author metadata.
- `GET /api/routes`: Data GeoJSON seluruh koridor trayek Trans-Sulawesi.
- `GET /api/stops`: Titik halte, terminal tipe A/B, dan fasilitas transit.
- `GET /api/fleet`: Snapshot telemetri armada real-time.
- `GET /api/stats`: Statistik harian (Load Factor %, Kecepatan Rata-rata, On-Time Performance).
- `GET /api/logs`: Log aktivitas dispatcher terkini.

### WebSocket Events:
- `fleet:init`: Inisialisasi peta dan data rute pada saat pertama kali koneksi tersambung.
- `fleet:telemetry`: Broadcast posisi koordinat GPS, sudut bearing, kecepatan, dan ETA per 1 detik (1Hz).
- `bus:arrived`: Notifikasi armada bus tiba di halte transit.
- `bus:sos_state`: Broadcast pemicu & penyelesaian sinyal darurat armada.
- `sim:set_speed` & `sim:set_paused`: Kontrol real-time dari dispatcher ke server.

---

## 📄 Lisensi & Kredit
Dikembangkan dan dirancang oleh **BieM363** ([GitHub Profile](https://github.com/BieM363)). Data rute didasarkan pada jalur jalan nyata Trans-Sulawesi di Provinsi Gorontalo dan sekitarnya.
