import React, { useState } from 'react';
import { 
  Navigation2, 
  MapPin, 
  ArrowRightLeft, 
  Bus, 
  Clock, 
  Ticket, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatDistance, formatDuration, getDensityBadge } from '../utils/formatters';
import { soundFx } from '../utils/audio';

export const PassengerTripPlanner = ({
  stops = [],
  routes = [],
  fleet = [],
  onSelectBus,
  onSelectRoute
}) => {
  const [originStopId, setOriginStopId] = useState('stop-dungingi');
  const [destStopId, setDestStopId] = useState('stop-airport');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Quick preset shortcuts
  const presets = [
    { title: '✈️ Bandara Djalaluddin', origin: 'stop-dungingi', dest: 'stop-airport' },
    { title: '⚓ Pelabuhan Kwandang', origin: 'stop-dungingi', dest: 'stop-kwandang' },
    { title: '🐋 Hiu Paus Botubarani', origin: 'stop-taruna', dest: 'stop-botubarani' },
    { title: '🏙️ Manado Malalayang', origin: 'stop-dungingi', dest: 'stop-manado' }
  ];

  // Swap origin and destination
  const handleSwapStops = () => {
    const temp = originStopId;
    setOriginStopId(destStopId);
    setDestStopId(temp);
    soundFx.playClick();
  };

  // Find matching route that contains both stops
  const matchingRoute = routes.find(r => 
    r.stopIds.includes(originStopId) && r.stopIds.includes(destStopId)
  );

  // Find active buses on the matching route
  const activeBusesOnRoute = fleet.filter(b => b.routeId === matchingRoute?.id);

  // Find nearest approaching bus to origin stop
  const nearestBus = activeBusesOnRoute
    .filter(b => b.upcomingStops && b.upcomingStops.some(s => s.stopId === originStopId))
    .map(b => {
      const stopInfo = b.upcomingStops.find(s => s.stopId === originStopId);
      return {
        ...b,
        stopEtaMinutes: stopInfo ? stopInfo.etaMinutes : 5,
        stopDistKm: stopInfo ? stopInfo.distanceKm : 2
      };
    })
    .sort((a, b) => a.stopEtaMinutes - b.stopEtaMinutes)[0] || activeBusesOnRoute[0];

  const handleSimulateBooking = () => {
    soundFx.playArrivalChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  return (
    <div className="w-full md:w-96 h-full bg-white/95 backdrop-blur-md flex flex-col z-20 shrink-0 border-r border-slate-200 shadow-xl text-slate-800">
      {/* Planner Header */}
      <div className="p-4 border-b border-slate-200 bg-[#f8fafc] space-y-3">
        <div className="flex items-center gap-2 text-[#003366]">
          <Navigation2 className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-sm text-[#003366] uppercase tracking-wider">
            Rencanakan Perjalanan
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Cari jadwal bus DAMRI, estimasi waktu tunggu halte, dan tiket online.
        </p>

        {/* Quick Route Preset Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOriginStopId(preset.origin);
                setDestStopId(preset.dest);
                soundFx.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 whitespace-nowrap border border-slate-300 font-semibold transition-colors shadow-sm"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Stop Pickers Form */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
        <div className="relative space-y-2">
          {/* Origin Stop */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-[#003366]" />
              <span>Titik Naik (Halte Keberangkatan)</span>
            </label>
            <select
              value={originStopId}
              onChange={(e) => {
                setOriginStopId(e.target.value);
                soundFx.playClick();
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#003366] font-semibold shadow-sm"
            >
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name} ({stop.city})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button in Middle */}
          <div className="flex justify-center -my-1">
            <button
              onClick={handleSwapStops}
              title="Tukar Titik Asal & Tujuan"
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-sm transition-transform active:rotate-180"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Stop */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Titik Turun (Halte Tujuan)</span>
            </label>
            <select
              value={destStopId}
              onChange={(e) => {
                setDestStopId(e.target.value);
                soundFx.playClick();
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#003366] font-semibold shadow-sm"
            >
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name} ({stop.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trip Calculation Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f0f4f9]">
        {matchingRoute ? (
          <div className="space-y-3">
            {/* Route Summary Card */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: matchingRoute.color }} 
                  />
                  <span className="font-black text-sm text-[#003366]">
                    {matchingRoute.code} - {matchingRoute.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#003366] text-[10px] font-extrabold font-mono">
                  {matchingRoute.type}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Estimasi Biaya</div>
                  <div className="font-mono font-black text-xs text-amber-600">
                    {formatCurrency(matchingRoute.fare)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Jarak Rute</div>
                  <div className="font-mono font-black text-xs text-slate-800">
                    {formatDistance(matchingRoute.distanceKm)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Waktu Tempuh</div>
                  <div className="font-mono font-black text-xs text-slate-800">
                    {formatDuration(matchingRoute.avgTravelMinutes)}
                  </div>
                </div>
              </div>
            </div>

            {/* Nearest Approaching Bus Live Card */}
            {nearestBus ? (
              <div 
                onClick={() => {
                  onSelectBus && onSelectBus(nearestBus);
                  soundFx.playClick();
                }}
                className="p-3.5 rounded-xl bg-white hover:bg-blue-50/50 border-2 border-[#003366] shadow-md cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-amber-500" />
                    <span className="font-black text-xs text-[#003366]">
                      Bus Terdekat: {nearestBus.label} ({nearestBus.plateNumber})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    {nearestBus.speedKmh} km/jam
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <div>
                      <div className="text-[10px] text-amber-800 font-medium">Tiba di Halte Keberangkatan:</div>
                      <div className="text-xs font-bold text-slate-800">
                        {stops.find(s => s.id === originStopId)?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-black text-[#003366]">
                      {nearestBus.stopEtaMinutes || 4} mnt
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono font-medium">
                      {formatDistance(nearestBus.stopDistKm || 2.4)} lagi
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 text-center">
                Belum ada armada aktif di koridor ini.
              </div>
            )}

            {/* Simulate Ticket Reservation Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSimulateBooking}
                className="w-full py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Simulasi Pesan Tiket DAMRI ({formatCurrency(matchingRoute.fare)})</span>
              </button>

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>E-Tiket DAMRI Berhasil Dipesan! Kursi Anda telah dikonfirmasi.</span>
                </div>
              )}
            </div>

            {/* Operating Schedule Info */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5 text-xs text-slate-700">
              <div className="font-extrabold text-[#003366] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Informasi Operasional</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                <div>Jam Layanan: {matchingRoute.operatingHours}</div>
                <div>Interval Keberangkatan: Setiap {matchingRoute.headwayMin} menit</div>
                <div>Metode Bayar: QRIS, Kartu Uang Elektronik, Tunai di Loket DAMRI</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-xs font-bold text-slate-800">
              Trayek Langsung Tidak Ditemukan
            </div>
            <p className="text-[11px] text-slate-500">
              Pilih titik transit di <strong>Terminal Dungingi</strong> untuk berpindah antar-trayek Trans-Sulawesi.
            </p>
          </div>
        )}
      </div>

      {/* Footer Watermark */}
      <div className="p-2.5 bg-white border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
        DAMRI Transit Planner • Built by <span className="font-bold text-[#003366]">BieM363</span>
      </div>
    </div>
  );
};
