import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { getDensityBadge, formatSpeed } from '../utils/formatters';

// Helper to create dynamic HTML Leaflet divIcon with bearing rotation & DAMRI styling
const createBusDivIcon = (bus, isSelected) => {
  const density = getDensityBadge(bus.occupancy, bus.capacity);
  const isEmergency = bus.status === 'emergency';
  const isDwelling = bus.status === 'dwelling';
  const bearing = bus.bearing || 0;
  const routeColor = bus.routeColor || '#003366';

  const html = `
    <div class="relative flex items-center justify-center pointer-events-auto" style="width: 46px; height: 46px;">
      <!-- Emergency Warning Pulse -->
      ${isEmergency ? `
        <div class="absolute inset-0 rounded-full emergency-pulse"></div>
      ` : ''}

      <!-- Radar Ping for moving bus -->
      ${!isEmergency && !isDwelling && bus.speedKmh > 0 ? `
        <div class="absolute inset-0 rounded-full bg-blue-500/25 radar-wave"></div>
      ` : ''}

      <!-- Selection Ring -->
      ${isSelected ? `
        <div class="absolute -inset-1.5 rounded-full border-3 border-amber-400 animate-pulse" style="box-shadow: 0 0 14px #f59e0b;"></div>
      ` : ''}

      <!-- Rotated Bus Icon Base -->
      <div 
        class="relative w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-700 ease-out shadow-lg"
        style="
          background: ${isEmergency ? '#dc2626' : '#003366'};
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0, 51, 102, 0.35);
        "
      >
        <!-- Direction Arrow / Bus Icon rotated by bearing -->
        <div style="transform: rotate(${bearing}deg); transition: transform 0.8s ease-in-out;" class="flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Front Arrow Pointer (Yellow) -->
            <polygon points="12,1 17,8 14,8 14,18 10,18 10,8 7,8" fill="#fbbf24" stroke="#ffffff" stroke-width="0.75" />
            <!-- Bus Body -->
            <rect x="7" y="9" width="10" height="11" rx="2" fill="#002244" stroke="#fbbf24" stroke-width="1.2"/>
            <!-- Windshield -->
            <rect x="8.5" y="10.5" width="7" height="3" rx="0.8" fill="#93c5fd" />
            <!-- Headlights -->
            <circle cx="8.5" cy="7.5" r="1" fill="#fbbf24" />
            <circle cx="15.5" cy="7.5" r="1" fill="#fbbf24" />
          </svg>
        </div>

        <!-- Density / Status Badge at top right -->
        <div 
          class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-slate-900 border-2 border-white shadow-sm"
          style="background-color: ${isEmergency ? '#ef4444' : density.dotColor};"
          title="Status Okupansi: ${density.label}"
        >
          ${isEmergency ? '!' : bus.occupancy}
        </div>
      </div>

      <!-- Bus Plate Mini Pill Label Below -->
      <div 
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-white border border-[#003366] text-[9px] font-mono font-bold text-[#003366] whitespace-nowrap shadow-md"
        style="border-color: ${isSelected ? '#f59e0b' : '#003366'};"
      >
        ${bus.label}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-bus-marker',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23]
  });
};

export const BusMarker = ({ bus, isSelected, onSelect }) => {
  if (!bus || bus.lat === undefined || bus.lng === undefined) return null;

  const density = getDensityBadge(bus.occupancy, bus.capacity);
  const isEmergency = bus.status === 'emergency';
  const isDwelling = bus.status === 'dwelling';

  return (
    <Marker
      position={[bus.lat, bus.lng]}
      icon={createBusDivIcon(bus, isSelected)}
      eventHandlers={{
        click: () => onSelect(bus)
      }}
    >
      <Tooltip direction="top" offset={[0, -24]} opacity={0.98} permanent={false}>
        <div className="text-xs p-1 space-y-1 bg-[#003366] text-white rounded-lg">
          <div className="flex items-center justify-between gap-3 border-b border-blue-400/40 pb-1">
            <span className="font-extrabold text-amber-300">{bus.label} ({bus.plateNumber})</span>
            <span className="font-mono text-white font-bold">{formatSpeed(bus.speedKmh)}</span>
          </div>
          <div className="text-[11px] text-blue-100 font-medium truncate max-w-[180px]">
            {bus.routeName || bus.routeId}
          </div>
          <div className="flex items-center justify-between text-[10px] gap-2 pt-0.5">
            <span className={`px-1.5 py-0.5 rounded font-bold border text-[9px] ${density.color}`}>
              {density.label.split(' ')[0]} ({bus.occupancy}/{bus.capacity})
            </span>
            <span className="text-amber-300 font-mono font-semibold">
              {isEmergency ? '🚨 SOS' : isDwelling ? '⏸️ Halte' : `➡️ ${bus.nextStop?.name?.substring(0, 14) || 'Rute'}...`}
            </span>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};
