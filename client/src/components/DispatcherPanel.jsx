import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  X,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const DispatcherPanel = ({
  simulationConfig,
  onSetSpeed,
  onTogglePause,
  onTriggerIncident,
  onClearIncidents,
  onTriggerSOS,
  onResolveSOS,
  fleet = [],
  logs = [],
  isOpen,
  onClose
}) => {
  const [selectedSosBusId, setSelectedSosBusId] = useState(fleet[0]?.id || 'BUS-DMR-01');

  if (!isOpen) return null;

  const currentSpeed = simulationConfig.speedMultiplier || 1;
  const isPaused = simulationConfig.isPaused;
  const incidents = simulationConfig.trafficIncidents || [];

  const handleSpeedChange = (spd) => {
    onSetSpeed(spd);
  };

  const handleAddIncident = (presetType) => {
    if (presetType === 'isimu_kwandang') {
      onTriggerIncident({
        routeId: 'route-kwandang',
        lat: 0.7050,
        lng: 122.8620,
        reason: 'Pekerjaan Saluran & Pembersihan Longsoran di Jalur Isimu - Kwandang',
        delayMin: 20
      });
    } else if (presetType === 'boalemo_rain') {
      onTriggerIncident({
        routeId: 'route-marisa',
        lat: 0.5650,
        lng: 122.4800,
        reason: 'Hujan Lebat & Genangan Air di Jalur Paguyaman Boalemo',
        delayMin: 15
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#003366] p-4 shadow-2xl space-y-3.5 animate-in slide-in-from-bottom-5 duration-300 text-slate-800">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2 text-[#003366]">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-sm text-[#003366] uppercase tracking-wider">
            Kontrol Simulasi Dispatcher
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Playback & Multiplier */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>Kecepatan Simulasi GPS</span>
          <span className="text-[#003366] font-mono font-black">{currentSpeed}x Speed</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play Button */}
          <button
            onClick={() => onTogglePause(!isPaused)}
            className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-md'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Lanjutkan</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Jeda (Pause)</span>
              </>
            )}
          </button>

          {/* Speed Chips */}
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => handleSpeedChange(spd)}
              className={`py-1.5 px-2.5 rounded-xl font-mono font-bold text-xs border transition-colors ${
                currentSpeed === spd
                  ? 'bg-[#003366] text-white border-[#002244] shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Traffic Delay & Incident Injector for Gorontalo */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>Simulasi Gangguan Jalan & Cuaca</span>
          {incidents.length > 0 && (
            <span className="text-amber-600 text-[10px] font-bold">
              {incidents.length} Aktif
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddIncident('isimu_kwandang')}
            className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-[10px] text-amber-900 border border-amber-300 text-left font-bold transition-colors shadow-sm"
          >
            🚧 Jalur Isimu-Kwandang
          </button>

          <button
            onClick={() => handleAddIncident('boalemo_rain')}
            className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[10px] text-[#003366] border border-blue-200 text-left font-bold transition-colors shadow-sm"
          >
            🌧️ Hujan Jalur Boalemo
          </button>
        </div>

        {incidents.length > 0 && (
          <button
            onClick={onClearIncidents}
            className="w-full py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normalkan Semua Gangguan Jalan</span>
          </button>
        )}
      </div>

      {/* SOS Emergency Simulator */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200">
        <div className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">
          Simulasi Sinyal Darurat SOS
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSosBusId}
            onChange={(e) => setSelectedSosBusId(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] text-slate-800 font-semibold"
          >
            {fleet.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.label} ({bus.plateNumber})
              </option>
            ))}
          </select>

          <button
            onClick={() => onTriggerSOS(selectedSosBusId, 'Peringatan Darurat Mesin')}
            className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-colors whitespace-nowrap"
          >
            Picu SOS 🚨
          </button>
        </div>
      </div>

      {/* Live Telemetry Feed Log Terminal */}
      <div className="space-y-1 pt-1 border-t border-slate-200">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#003366]">
            <Terminal className="w-3 h-3 text-amber-500" />
            <span>Live WebSocket Telemetry Feed</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">Mark by BieM363</span>
        </div>

        <div className="h-20 overflow-y-auto bg-slate-900 rounded-xl p-2 font-mono text-[9px] space-y-1 border border-slate-800 text-slate-200 shadow-inner">
          {logs.length > 0 ? (
            logs.slice(0, 10).map((log, idx) => (
              <div key={log.id || idx} className="leading-tight flex items-start gap-1">
                <span className="text-amber-400 shrink-0">[{log.time}]</span>
                <span className="text-slate-100">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic">Menunggu telemetri...</div>
          )}
        </div>
      </div>
    </div>
  );
};
