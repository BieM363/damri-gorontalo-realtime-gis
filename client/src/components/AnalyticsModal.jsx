import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  Bus, 
  TrendingUp, 
  Gauge, 
  Users, 
  ShieldCheck, 
  Map, 
  Database,
  Code2
} from 'lucide-react';
import { formatCurrency, formatSpeed } from '../utils/formatters';

export const AnalyticsModal = ({ isOpen, onClose, routes = [], fleet = [] }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      fetch(`${apiUrl}/api/stats`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setStats(data.data);
        })
        .catch(err => console.error('Failed to fetch stats:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalOccupancy = fleet.reduce((acc, b) => acc + (b.occupancy || 0), 0);
  const totalCapacity = fleet.reduce((acc, b) => acc + (b.capacity || 0), 0);
  const loadFactor = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
  const avgSpeed = fleet.length > 0 ? Math.round(fleet.reduce((acc, b) => acc + (b.speedKmh || 0), 0) / fleet.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl border-2 border-[#003366] shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#002b66] via-[#094183] to-[#002b66] border-b-2 border-amber-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#002b66] flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Statistik Operasional & GIS DAMRI Gorontalo
              </h3>
              <p className="text-xs text-blue-100">
                Laporan Telemetri Real-Time, Load Factor, dan Kinerja Koridor Trans-Sulawesi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#f0f4f9]">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-amber-500" />
                <span>Total Armada</span>
              </div>
              <div className="text-xl font-black font-mono text-[#003366]">
                {fleet.length} <span className="text-xs text-slate-500 font-normal">Bus</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">100% Beroperasi</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Factor</span>
              </div>
              <div className="text-xl font-black font-mono text-[#003366]">
                {loadFactor}%
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-medium">
                {totalOccupancy}/{totalCapacity} Penumpang
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#003366]" />
                <span>Kecepatan Rata-rata</span>
              </div>
              <div className="text-xl font-black font-mono text-slate-800">
                {formatSpeed(avgSpeed)}
              </div>
              <div className="text-[10px] text-slate-500">Trans-Sulawesi</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>On-Time Rate</span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-600">
                98.6%
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">Standar Pelayanan Prima</div>
            </div>
          </div>

          {/* Route Performance Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-[#003366] flex items-center gap-2">
              <Map className="w-4 h-4 text-amber-500" />
              <span>Kinerja Koridor Trayek DAMRI Gorontalo</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Kode & Nama Trayek</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Jarak</th>
                    <th className="p-3">Tarif</th>
                    <th className="p-3">Armada Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {routes.map((route) => {
                    const busesOnRoute = fleet.filter(b => b.routeId === route.id);
                    return (
                      <tr key={route.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: route.color }}
                          />
                          <span className="text-[#003366]">{route.code} - {route.name}</span>
                        </td>
                        <td className="p-3 text-slate-600">{route.type}</td>
                        <td className="p-3 font-mono font-medium">{route.distanceKm} km</td>
                        <td className="p-3 font-mono font-bold text-amber-600">
                          {formatCurrency(route.fare)}
                        </td>
                        <td className="p-3 font-mono text-[#003366] font-bold">
                          {busesOnRoute.length} Bus Aktif
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* System & Spatial Architecture Diagram for Portfolio Presentation */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-extrabold text-sm text-[#003366] flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Arsitektur Sistem Real-Time GIS (Event-Driven)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="font-extrabold text-[#003366]">1. Spatial GeoJSON Engine</div>
                <p className="text-[11px] text-slate-600">
                  Interpolasi titik GPS sepanjang polyline jalan Trans-Sulawesi menggunakan perhitungan geodesik <code>@turf/turf</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="font-extrabold text-amber-900">2. WebSockets 1Hz Telemetry</div>
                <p className="text-[11px] text-slate-600">
                  Streaming telemetri dua arah (kecepatan, bearing sudut haluan 360°, estimasi ETA, & okupansi) via Socket.io.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="font-extrabold text-emerald-900">3. Dynamic Leaflet GIS Layer</div>
                <p className="text-[11px] text-slate-600">
                  Rendering marker bus berputar secara halus dengan indikator visual kapasitas penumpang & notifikasi stasiun Web Audio.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Watermark */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-200">
            DAMRI Gorontalo Real-Time Fleet Tracking GIS • System Architecture & Development by <span className="font-bold text-[#003366]">BieM363</span>
          </div>
        </div>
      </div>
    </div>
  );
};
