import React from 'react';
import { 
  X, 
  Bus, 
  Gauge, 
  Thermometer, 
  Fuel, 
  Phone, 
  Star, 
  Navigation, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users,
  Code2
} from 'lucide-react';
import { 
  formatSpeed, 
  formatDistance, 
  getDensityBadge 
} from '../utils/formatters';
import { soundFx } from '../utils/audio';

export const BusDetailDrawer = ({
  bus,
  onClose,
  followMode,
  setFollowMode,
  onTriggerSOS,
  onResolveSOS
}) => {
  if (!bus) return null;

  const density = getDensityBadge(bus.occupancy, bus.capacity);
  const isEmergency = bus.status === 'emergency';
  const isDwelling = bus.status === 'dwelling';

  // Generate simulated seat layout
  const totalSeats = bus.capacity || 24;
  const seatsOccupied = bus.occupancy || 12;

  const handlePlayHorn = () => {
    soundFx.playArrivalChime();
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white/95 backdrop-blur-md border-l border-slate-200 z-30 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header Banner (DAMRI Royal Blue) */}
      <div 
        className="p-4 bg-gradient-to-r from-[#002b66] via-[#094183] to-[#002b66] border-b-2 border-amber-400 text-white relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-amber-400 text-[#002b66] shadow-md"
            >
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">{bus.label}</h3>
                <span className="px-2 py-0.5 rounded bg-white text-[#002b66] font-mono text-xs font-extrabold shadow-sm">
                  {bus.plateNumber}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">{bus.model}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill Strip */}
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-blue-400/30">
          <span className="text-blue-100 font-medium truncate max-w-[220px]">
            {bus.routeName}
          </span>
          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
            isEmergency 
              ? 'bg-rose-500 text-white animate-pulse'
              : isDwelling
                ? 'bg-amber-400 text-[#002b66]'
                : 'bg-emerald-400 text-[#002b66]'
          }`}>
            {isEmergency ? '🚨 SOS DARURAT' : isDwelling ? '⏸️ DI HALTE' : '🟢 JALAN'}
          </span>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f4f9]">
        {/* Real-Time Telemetry Grid Gauges */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <Gauge className="w-3.5 h-3.5 text-[#003366]" />
              <span>Kecepatan Live</span>
            </div>
            <div className="text-lg font-mono font-black text-[#003366]">
              {formatSpeed(bus.speedKmh)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Bearing: {bus.bearing || 0}°
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kapasitas Kursi</span>
            </div>
            <div className="text-lg font-mono font-black text-slate-900">
              {bus.occupancy} / {bus.capacity} <span className="text-xs text-slate-500 font-normal">Seat</span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${density.color}`}>
              {density.label.split(' ')[0]} ({bus.occupancyPercent}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>Suhu Mesin</span>
            </div>
            <div className="text-base font-mono font-bold text-slate-800">
              {bus.engineTempC || 84}°C
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">Normal Operasional</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <Fuel className="w-3.5 h-3.5 text-blue-600" />
              <span>Bahan Bakar</span>
            </div>
            <div className="text-base font-mono font-bold text-slate-800">
              {Math.round(bus.fuelPercent || 80)}%
            </div>
            <div className="text-[10px] text-slate-500">Solar Dexlite</div>
          </div>
        </div>

        {/* Visual Seat Map (Interactive Passenger Density) */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#003366] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Denah Kursi Bus DAMRI (2-2 Layout)</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600">
              Sisa {totalSeats - seatsOccupied} Kursi
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            {/* Front of bus windshield indicator */}
            <div className="w-full text-center text-[9px] font-black tracking-widest text-[#003366] uppercase pb-1 border-b border-slate-200">
              ▲ DEPAN (KEMUDI SUPIR) ▲
            </div>

            {/* Seat Grid 2-2 */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {Array.from({ length: totalSeats }).map((_, idx) => {
                const isOccupied = idx < seatsOccupied;
                const isAisle = (idx + 1) % 4 === 2;

                return (
                  <React.Fragment key={idx}>
                    <div
                      title={`Kursi #${idx + 1}: ${isOccupied ? 'Terisi Penumpang' : 'Kosong / Tersedia'}`}
                      className={`h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all shadow-sm ${
                        isOccupied
                          ? 'bg-[#003366] text-white border border-[#002244]'
                          : 'bg-white text-emerald-700 border-2 border-emerald-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {isAisle && <div className="w-3" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Route Waypoints & Upcoming Stops Live ETA Timeline */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#003366] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Jadwal Singgah & Live ETA Halte</span>
            </span>
            <span className="text-[11px] text-[#003366] font-mono font-bold">
              Arah: {bus.direction === 1 ? 'Maju' : 'Balik'}
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {bus.upcomingStops && bus.upcomingStops.length > 0 ? (
              bus.upcomingStops.map((stop, idx) => {
                const isNext = idx === 0;
                return (
                  <div
                    key={stop.stopId}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                      isNext
                        ? 'bg-blue-50 border-[#003366] shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isNext 
                          ? 'bg-[#003366] text-white animate-pulse' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isNext ? 'text-[#003366]' : 'text-slate-800'}`}>
                          {stop.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Jarak: {formatDistance(stop.distanceKm)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono font-extrabold text-sm ${isNext ? 'text-[#003366]' : 'text-slate-700'}`}>
                        {stop.etaMinutes} <span className="text-[10px] font-normal">mnt</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium">
                        {isNext ? 'Halte Terdekat' : 'Berikutnya'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 italic">
                Armada berada di ujung trayek akhir.
              </div>
            )}
          </div>
        </div>

        {/* Driver Profile Card */}
        {bus.driver && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={bus.driver.photoUrl}
                alt={bus.driver.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
              <div>
                <div className="font-extrabold text-xs text-slate-800">{bus.driver.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    {bus.driver.rating}
                  </span>
                  <span>• {bus.driver.experienceYears} Thn Pengemudi</span>
                </div>
              </div>
            </div>

            <a
              href={`tel:${bus.driver.phone}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`Menghubungi Pengemudi DAMRI:\n${bus.driver.name} (${bus.driver.phone})`);
              }}
              className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 transition-colors"
              title="Hubungi Pengemudi"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Follow Mode Button */}
          <button
            onClick={() => {
              setFollowMode(!followMode);
              soundFx.playClick();
            }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              followMode
                ? 'bg-amber-400 text-[#002b66] border-amber-500 shadow-md animate-pulse'
                : 'bg-[#003366] hover:bg-[#002244] text-white border-[#003366]'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{followMode ? 'Sedang Mengikuti Posisi Bus di Peta' : 'Ikuti Gerak Bus Secara Live di Peta'}</span>
          </button>

          {/* Bus Horn FX Button */}
          <button
            onClick={handlePlayHorn}
            className="w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-[#003366] border border-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Bunyikan Bel Halte / Klakson Bus (Audio FX)</span>
          </button>

          {/* SOS Trigger / Resolve Button */}
          {isEmergency ? (
            <button
              onClick={() => onResolveSOS && onResolveSOS(bus.id)}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Normalkan Status Darurat (Selesai Penanganan)</span>
            </button>
          ) : (
            <button
              onClick={() => onTriggerSOS && onTriggerSOS(bus.id, 'Peringatan Gangguan Mesin Armada')}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Simulasi Sinyal Darurat SOS Dispatcher</span>
            </button>
          )}
        </div>

        {/* Drawer Signature Watermark */}
        <div className="pt-2 text-center text-[10px] text-slate-500 font-medium border-t border-slate-200">
          DAMRI Fleet Telemetry • Crafted by <span className="font-bold text-[#003366]">BieM363</span>
        </div>
      </div>
    </div>
  );
};
