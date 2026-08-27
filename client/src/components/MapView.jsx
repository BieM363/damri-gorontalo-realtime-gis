import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polyline, 
  useMap, 
  Marker, 
  Popup
} from 'react-leaflet';
import L from 'leaflet';
import { BusMarker } from './BusMarker';
import { StopMarker } from './StopMarker';
import { 
  Layers, 
  Compass, 
  Navigation, 
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../utils/audio';

const BASEMAPS = {
  osm_transit: {
    name: 'Peta Terang DAMRI (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  carto_light: {
    name: 'Positron GIS (Terang)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    name: 'Satelit Hybrid ESRI',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  carto_dark: {
    name: 'Dark Matter (Malam)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  }
};

const MapController = ({ selectedBus, selectedRoute, followMode }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBus && followMode && selectedBus.lat && selectedBus.lng) {
      map.panTo([selectedBus.lat, selectedBus.lng], {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedBus?.lat, selectedBus?.lng, followMode, map]);

  useEffect(() => {
    if (selectedRoute && selectedRoute.coordinates && selectedRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedRoute.coordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
    }
  }, [selectedRoute?.id, map]);

  return null;
};

const createIncidentIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center" style="width: 34px; height: 34px;">
      <div class="absolute inset-0 rounded-full bg-amber-500/40 radar-wave"></div>
      <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-incident-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

export const MapView = ({
  routes = [],
  stops = [],
  fleet = [],
  selectedBus,
  setSelectedBus,
  selectedRoute,
  setSelectedRoute,
  trafficIncidents = [],
  followMode,
  setFollowMode,
  zenMode
}) => {
  const [currentBasemap, setCurrentBasemap] = useState('osm_transit');
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const mapRef = useRef(null);

  // Center of Gorontalo Province
  const GORONTALO_CENTER = [0.6300, 122.9600];

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(GORONTALO_CENTER, 10, { animate: true });
      soundFx.playClick();
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={GORONTALO_CENTER}
        zoom={10}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <MapController 
          selectedBus={selectedBus}
          selectedRoute={selectedRoute}
          followMode={followMode}
        />

        {/* Basemap Layer */}
        <TileLayer
          key={currentBasemap}
          url={BASEMAPS[currentBasemap].url}
          attribution={BASEMAPS[currentBasemap].attribution}
          maxZoom={19}
        />

        {/* GeoJSON Route Polylines strictly along Gorontalo roads */}
        {routes.map((route) => {
          const isSelected = selectedRoute?.id === route.id || selectedBus?.routeId === route.id;
          return (
            <React.Fragment key={route.id}>
              {/* Outer Glow Polyline */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: route.color || '#00f0ff',
                  weight: isSelected ? 8 : 4,
                  opacity: isSelected ? 0.95 : 0.5,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedRoute(route);
                    soundFx.playClick();
                  }
                }}
              />
              {/* Center highlight for selected route */}
              {isSelected && (
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Transit Stops Markers */}
        {stops.map((stop) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            fleet={fleet}
            routes={routes}
            onSelectStop={() => {
              soundFx.playClick();
            }}
          />
        ))}

        {/* Live Moving Bus Markers */}
        {fleet.map((bus) => (
          <BusMarker
            key={bus.id}
            bus={bus}
            isSelected={selectedBus?.id === bus.id}
            onSelect={(b) => {
              setSelectedBus(b);
              soundFx.playClick();
            }}
          />
        ))}

        {/* Traffic Delay / Road Incidents */}
        {trafficIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat || 0.6550, incident.lng || 122.8400]}
            icon={createIncidentIcon()}
          >
            <Popup className="custom-popup">
              <div className="text-xs space-y-1 text-slate-200">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Rekayasa Lalu Lintas Aktif</span>
                </div>
                <p className="text-slate-300">{incident.reason || 'Perbaikan Jalan Trans-Sulawesi'}</p>
                <div className="text-[10px] text-amber-300/80 font-mono">
                  Tambahan Delay: +{incident.delayMin || 15} Menit
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Basemap Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            title="Ganti Lapisan Peta Basemap"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 text-xs font-bold text-[#003366] hover:text-[#002244] border border-slate-300 shadow-xl transition-all hover:scale-105"
          >
            <Layers className="w-4 h-4 text-[#003366]" />
            <span className="hidden sm:inline">{BASEMAPS[currentBasemap].name}</span>
          </button>

          {showBasemapMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 space-y-1 z-30 shadow-2xl border-2 border-[#003366]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#003366] px-2 py-1 border-b border-slate-100">
                Pilih Tampilan Peta GIS
              </div>
              {Object.entries(BASEMAPS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentBasemap(key);
                    setShowBasemapMenu(false);
                    soundFx.playClick();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    currentBasemap === key
                      ? 'bg-blue-50 text-[#003366] font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.name}</span>
                  {currentBasemap === key && <span className="text-amber-500 font-extrabold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset View Center Button */}
        <button
          onClick={handleResetView}
          title="Pusatkan Peta ke Wilayah Gorontalo"
          className="flex items-center justify-center p-2.5 rounded-xl bg-white/95 text-[#003366] hover:text-[#002244] border border-slate-300 shadow-xl transition-all hover:scale-105"
        >
          <Compass className="w-4 h-4 text-[#003366]" />
        </button>

        {/* Toggle Follow Selected Bus */}
        {selectedBus && (
          <button
            onClick={() => {
              setFollowMode(!followMode);
              soundFx.playClick();
            }}
            title={followMode ? 'Hentikan Mengikuti Bus' : 'Ikuti Gerak Bus Secara Otomatis'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-xl border transition-all ${
              followMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse'
                : 'bg-white/95 text-[#003366] hover:text-amber-600 border-slate-300'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{followMode ? 'Following' : 'Follow'}</span>
          </button>
        )}
      </div>

      {/* Map Legend Overlay at Bottom Left (Hidden when in Zen Mode) */}
      {!zenMode && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 rounded-xl p-3 border border-slate-300 shadow-xl text-[11px] space-y-1.5 hidden md:block max-w-xs animate-in fade-in duration-300">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#003366] flex items-center justify-between">
            <span>Kapasitas Kursi Bus DAMRI</span>
            <span className="text-[9px] text-slate-400 font-mono">BieM363 GIS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700 text-[10px] font-medium">Tersedia (&lt;60%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700 text-[10px] font-medium">Sedang (60-90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-700 text-[10px] font-medium">Penuh (&gt;90%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
