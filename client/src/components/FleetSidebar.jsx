import React, { useState } from 'react';
import { 
  Search, 
  Bus, 
  Gauge, 
  Users, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Code2
} from 'lucide-react';
import { formatSpeed, formatDistance, getDensityBadge } from '../utils/formatters';
import { soundFx } from '../utils/audio';

export const FleetSidebar = ({
  fleet = [],
  routes = [],
  selectedBus,
  setSelectedBus,
  selectedRoute,
  setSelectedRoute,
  isOpen,
  setIsOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRouteType, setFilterRouteType] = useState('ALL');

  if (!isOpen) {
    return (
      <div className="absolute top-20 left-4 z-20">
        <button
          onClick={() => {
            setIsOpen(true);
            soundFx.playClick();
          }}
          title="Buka Daftar Armada"
          className="p-2.5 rounded-xl bg-white/95 text-[#003366] hover:text-[#002244] border-2 border-[#003366] shadow-xl flex items-center gap-2 hover:scale-105 transition-all font-bold"
        >
          <Bus className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-mono">{fleet.length} Bus</span>
          <ChevronRight className="w-4 h-4 text-[#003366]" />
        </button>
      </div>
    );
  }

  // Filter fleet based on search and selected route
  const filteredFleet = fleet.filter((bus) => {
    const matchSearch = 
      bus.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.routeName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterRouteType !== 'ALL' && bus.routeId !== filterRouteType) {
      return false;
    }

    return true;
  });

  return (
    <aside className="w-full md:w-96 h-full bg-white/95 backdrop-blur-md flex flex-col z-20 shrink-0 border-r border-slate-200 shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-200">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-200 bg-[#f8fafc] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#003366]" />
            <h2 className="font-extrabold text-sm text-[#003366] uppercase tracking-wider">
              Armada Bus Gorontalo
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-extrabold text-[#003366]">
              {filteredFleet.length} / {fleet.length} Aktif
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                soundFx.playClick();
              }}
              title="Sembunyikan Sidebar"
              className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari armada, supir, trayek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all shadow-sm"
          />
        </div>

        {/* Route Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            onClick={() => {
              setFilterRouteType('ALL');
              soundFx.playClick();
            }}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors shadow-sm ${
              filterRouteType === 'ALL'
                ? 'bg-[#003366] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Koridor
          </button>
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => {
                setFilterRouteType(route.id);
                soundFx.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                filterRouteType === route.id
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-500 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }} />
              <span>{route.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f0f4f9]">
        {filteredFleet.length > 0 ? (
          filteredFleet.map((bus) => {
            const isSelected = selectedBus?.id === bus.id;
            const density = getDensityBadge(bus.occupancy, bus.capacity);
            const isEmergency = bus.status === 'emergency';
            const isDwelling = bus.status === 'dwelling';

            return (
              <div
                key={bus.id}
                onClick={() => {
                  setSelectedBus(bus);
                  soundFx.playClick();
                }}
                className={`p-3.5 rounded-xl transition-all cursor-pointer relative overflow-hidden border ${
                  isSelected
                    ? 'bg-blue-50/90 border-[#003366] shadow-md ring-2 ring-[#003366]/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-sm'
                }`}
              >
                {/* Route Color Accent Strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: isEmergency ? '#ef4444' : bus.routeColor || '#003366' }}
                />

                {/* Card Header: Bus Label & Speed */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ 
                        backgroundColor: isEmergency ? '#fee2e2' : `${bus.routeColor}18`,
                        color: isEmergency ? '#dc2626' : bus.routeColor || '#003366'
                      }}
                    >
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#003366] flex items-center gap-1.5">
                        <span>{bus.label}</span>
                        <span className="font-mono text-[11px] text-slate-500 font-medium">
                          • {bus.plateNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium truncate max-w-[160px]">
                        {bus.routeName}
                      </div>
                    </div>
                  </div>

                  {/* Speedometer Badge */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[#003366] font-mono font-extrabold text-xs">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatSpeed(bus.speedKmh)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {isEmergency ? '🚨 SOS' : isDwelling ? '⏸️ Halte' : '🟢 Bergerak'}
                    </span>
                  </div>
                </div>

                {/* Next Stop & ETA Row */}
                <div className="mt-2.5 p-2 rounded-lg bg-slate-100/90 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate text-[11px] font-semibold">
                      {bus.nextStop?.name || 'Terminal Akhir'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#003366] font-mono font-bold shrink-0 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{bus.nextStop?.etaMinutes || 1} mnt</span>
                  </div>
                </div>

                {/* Passenger Occupancy Indicator Bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Kapasitas:</span>
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold border ${density.color}`}>
                      {bus.occupancy} / {bus.capacity} Kursi ({bus.occupancyPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bus.occupancyPercent}%`,
                        backgroundColor: density.dotColor
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium">Tidak ada armada yang sesuai kriteria pencarian.</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer Credit Watermark */}
      <div className="p-2.5 bg-white border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
        <span>DAMRI Gorontalo GIS</span>
        <span>•</span>
        <span className="text-[#003366] font-bold">Marked by BieM363</span>
      </div>
    </aside>
  );
};
