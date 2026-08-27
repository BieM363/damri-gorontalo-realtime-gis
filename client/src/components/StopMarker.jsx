import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Building2, MapPin, Clock, Bus } from 'lucide-react';
import { formatDistance } from '../utils/formatters';

const createStopDivIcon = (stop, isMajor, nearestBusEta) => {
  const isAirport = stop.id === 'stop-airport';
  const isTourist = stop.type === 'halte_tourist';

  let bgColor = '#003366';
  let borderColor = '#ffffff';
  let iconColor = '#ffffff';
  let iconSvg = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;

  if (isAirport) {
    borderColor = '#ffffff';
    bgColor = '#f59e0b';
    iconSvg = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
      </svg>
    `;
  } else if (isMajor) {
    borderColor = '#fbbf24';
    bgColor = '#002b66';
    iconSvg = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect width="16" height="16" x="4" y="4" rx="2"/>
        <path d="M9 22v-4h6v4"/>
        <path d="M8 4v.01"/>
        <path d="M16 4v.01"/>
        <path d="M12 4v.01"/>
        <path d="M8 8v.01"/>
        <path d="M12 8v.01"/>
        <path d="M16 8v.01"/>
      </svg>
    `;
  } else if (isTourist) {
    borderColor = '#ffffff';
    bgColor = '#0284c7';
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    `;
  }

  const size = isMajor || isAirport ? 34 : 26;
  const half = size / 2;

  const html = `
    <div class="relative flex items-center justify-center pointer-events-auto" style="width: ${size}px; height: ${size}px;">
      <!-- Glowing Pulse Ring for Major Terminals -->
      ${isMajor || isAirport ? `
        <div class="absolute inset-0 rounded-full bg-blue-600/30 radar-wave"></div>
      ` : ''}

      <div 
        class="w-full h-full rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-125"
        style="
          background-color: ${bgColor};
          border: 2.5px solid ${borderColor};
          box-shadow: 0 3px 12px rgba(0, 51, 102, 0.4);
        "
      >
        ${iconSvg}
      </div>

      <!-- ETA Badge if bus approaching within 20 mins -->
      ${nearestBusEta !== null && nearestBusEta <= 20 ? `
        <div 
          class="absolute -top-3 -right-2 px-1.5 py-0.2 rounded-full bg-amber-400 border-2 border-white text-[8px] font-mono font-black text-[#003366] shadow-md whitespace-nowrap animate-bounce"
        >
          ${nearestBusEta}m
        </div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-stop-marker',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half]
  });
};

export const StopMarker = ({ stop, fleet = [], routes = [], onSelectStop }) => {
  if (!stop || !stop.coords) return null;

  const isMajor = stop.type.includes('terminal_major') || stop.type.includes('terminal_junction');

  // Find approaching buses targeting this stop
  const approachingBuses = fleet
    .filter(bus => {
      if (!bus.upcomingStops) return false;
      return bus.upcomingStops.some(s => s.stopId === stop.id);
    })
    .map(bus => {
      const stopInfo = bus.upcomingStops.find(s => s.stopId === stop.id);
      return {
        busLabel: bus.label,
        plateNumber: bus.plateNumber,
        routeName: bus.routeName,
        speedKmh: bus.speedKmh,
        occupancy: bus.occupancy,
        capacity: bus.capacity,
        distanceKm: stopInfo ? stopInfo.distanceKm : 0,
        etaMinutes: stopInfo ? stopInfo.etaMinutes : 0
      };
    })
    .sort((a, b) => a.etaMinutes - b.etaMinutes);

  const nearestBusEta = approachingBuses.length > 0 ? approachingBuses[0].etaMinutes : null;

  return (
    <Marker
      position={stop.coords}
      icon={createStopDivIcon(stop, isMajor, nearestBusEta)}
      eventHandlers={{
        click: () => onSelectStop && onSelectStop(stop)
      }}
    >
      <Tooltip direction="bottom" offset={[0, 14]} opacity={0.95}>
        <div className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>{stop.name}</span>
          {nearestBusEta !== null && (
            <span className="text-[10px] text-amber-300 font-mono">
              ({nearestBusEta} mnt)
            </span>
          )}
        </div>
      </Tooltip>

      <Popup className="custom-popup" maxWidth={320}>
        <div className="space-y-2.5 text-xs text-slate-800">
          <div className="border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 text-[#003366] font-extrabold text-sm">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>{stop.name}</span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{stop.address}</span>
            </div>
          </div>

          {/* Approaching Buses Live ETA Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#003366]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Estimasi Kedatangan Bus (Live ETA)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {approachingBuses.length} Bus Menuju Sini
              </span>
            </div>

            {approachingBuses.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {approachingBuses.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[#003366] flex items-center gap-1.5">
                        <Bus className="w-3 h-3 text-amber-500" />
                        <span>{item.busLabel}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.plateNumber})</span>
                      </div>
                      <div className="text-[10px] text-slate-600 truncate max-w-[140px] font-medium">
                        {item.routeName}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[#003366] font-mono">
                        {item.etaMinutes} <span className="text-[10px] font-normal">mnt</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono font-semibold">
                        {formatDistance(item.distanceKm)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-500 italic text-center">
                Belum ada armada mendekat dalam 60 menit ke depan
              </div>
            )}
          </div>

          {/* Facilities Badges */}
          {stop.facilities && stop.facilities.length > 0 && (
            <div className="pt-1 border-t border-slate-200">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">Fasilitas Transit:</span>
              <div className="flex flex-wrap gap-1">
                {stop.facilities.map((fac, idx) => (
                  <span 
                    key={idx} 
                    className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[9px] text-slate-700 font-medium"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
