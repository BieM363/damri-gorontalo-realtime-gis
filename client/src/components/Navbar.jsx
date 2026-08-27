import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Volume2, 
  VolumeX, 
  BarChart3, 
  Clock, 
  Maximize, 
  Minimize,
  Sliders,
  Eye,
  EyeOff,
  Radio,
  Github,
  Code2
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const Navbar = ({ 
  isConnected, 
  latencyMs, 
  activeFleetCount, 
  onOpenAnalytics, 
  onToggleDispatcher,
  isDispatcherOpen,
  zenMode,
  setZenMode,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const [witaTime, setWitaTime] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      // Gorontalo is UTC+8 (WITA)
      const now = new Date();
      const options = {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setWitaTime(new Intl.DateTimeFormat('id-ID', options).format(now));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playArrivalChime();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-16 w-full bg-gradient-to-r from-[#002b66] via-[#094183] to-[#002b66] border-b-2 border-amber-400 px-3 md:px-6 flex items-center justify-between z-30 relative shrink-0 shadow-lg shadow-blue-950/20 transition-all duration-300">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-400 p-0.5 shadow-md shadow-amber-500/30">
          <div className="w-full h-full bg-[#002b66] rounded-[10px] flex items-center justify-center">
            <Bus className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white flex items-center gap-1.5">
              <span>DAMRI</span>
              <span className="text-amber-400">GORONTALO</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-amber-400 text-[#002b66] shadow-sm">
              GIS LIVE
            </span>
            <a
              href="https://github.com/BieM363/damri-gorontalo-realtime-gis"
              target="_blank"
              rel="noopener noreferrer"
              title="Repository GitHub BieM363"
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/80 border border-blue-400/40 text-blue-100 hover:bg-amber-400 hover:text-blue-950 transition-all"
            >
              <Code2 className="w-3 h-3 text-amber-400" />
              <span>by BieM363</span>
            </a>
          </div>
          <p className="text-[11px] text-blue-100/80 hidden sm:block font-medium">
            Pelacakan Armada & Transit Map Trans-Sulawesi • <span className="text-amber-300 font-semibold">BieM363 Engine</span>
          </p>
        </div>
      </div>

      {/* Control Buttons & Indicators */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* WITA Digital Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#001f4d]/80 border border-blue-400/30 text-xs font-mono text-amber-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-blue-200" />
          <span>{witaTime} WITA</span>
        </div>

        {/* WebSocket Telemetry Status */}
        <div 
          title={`Status Server: ${isConnected ? 'Terhubung (Online)' : 'Terputus'} (${latencyMs}ms)`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
            isConnected
              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
              : 'bg-rose-500/20 border-rose-400/60 text-rose-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span className="font-mono text-[11px]">{isConnected ? `${latencyMs}ms` : 'Offline'}</span>
        </div>

        {/* Toggle Dispatcher Controls Panel */}
        <button
          onClick={() => {
            onToggleDispatcher();
            soundFx.playClick();
          }}
          title={isDispatcherOpen ? 'Tutup Panel Kontrol' : 'Buka Kontrol Dispatcher & Simulasi'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isDispatcherOpen
              ? 'bg-amber-400 text-[#002b66] border-amber-300 shadow-md shadow-amber-900/40'
              : 'bg-blue-900/70 hover:bg-blue-800 text-white border-blue-400/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Dispatcher</span>
        </button>

        {/* Sembunyikan / Tampilkan Panel (Zen Mode Toggle) */}
        <button
          onClick={() => {
            const nextZen = !zenMode;
            setZenMode(nextZen);
            if (nextZen) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
            soundFx.playClick();
          }}
          title={zenMode ? 'Tampilkan Semua Panel' : 'Sembunyikan Panel (Mode Peta Penuh)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            zenMode
              ? 'bg-amber-400 text-[#002b66] border-amber-300 shadow-md'
              : 'bg-blue-900/70 hover:bg-blue-800 text-white border-blue-400/40'
          }`}
        >
          {zenMode ? <Eye className="w-3.5 h-3.5 text-blue-950" /> : <EyeOff className="w-3.5 h-3.5 text-blue-200" />}
          <span className="hidden md:inline">{zenMode ? 'Panel Aktif' : 'Peta Penuh'}</span>
        </button>

        {/* Analytics Modal Button */}
        <button
          onClick={() => {
            onOpenAnalytics();
            soundFx.playClick();
          }}
          title="Buka Statistik Armada GIS"
          className="p-2 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-amber-300 border border-blue-400/40 transition-colors shadow-sm"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Aktifkan Suara Notifikasi' : 'Senyapkan Suara'}
          className={`p-2 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-blue-950/60 text-blue-300/40 border-blue-900'
              : 'bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400/30'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          title="Mode Layar Penuh"
          className="hidden md:flex p-2 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-white border border-blue-400/40 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
