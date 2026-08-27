import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { FleetSidebar } from './components/FleetSidebar';
import { BusDetailDrawer } from './components/BusDetailDrawer';
import { DispatcherPanel } from './components/DispatcherPanel';
import { AnalyticsModal } from './components/AnalyticsModal';
import { useSocket } from './hooks/useSocket';
import { ShieldAlert, AlertTriangle, Eye } from 'lucide-react';
import { soundFx } from './utils/audio';

export function App() {
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [followMode, setFollowMode] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDispatcherPanelOpen, setIsDispatcherPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false); // Clean Map Mode

  const {
    isConnected,
    latencyMs,
    routes,
    stops,
    fleet,
    simulationConfig,
    logs,
    setSimulationSpeed,
    togglePauseSimulation,
    triggerTrafficIncident,
    clearTrafficIncidents,
    triggerSOS,
    resolveSOS
  } = useSocket();

  // Find currently selected bus object dynamically from latest telemetry stream
  const selectedBus = fleet.find(b => b.id === selectedBusId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f4f9] text-slate-800 select-none">
      {/* Top Navigation Bar */}
      <Navbar
        isConnected={isConnected}
        latencyMs={latencyMs}
        activeFleetCount={fleet.length}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onToggleDispatcher={() => setIsDispatcherPanelOpen(prev => !prev)}
        isDispatcherOpen={isDispatcherPanelOpen}
        zenMode={zenMode}
        setZenMode={setZenMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Workspace: Sidebar & Map Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Side Pane: Fleet List (Hidden when Zen Mode or manually closed) */}
        {!zenMode && (
          <FleetSidebar
            fleet={fleet}
            routes={routes}
            selectedBus={selectedBus}
            setSelectedBus={(bus) => {
              setSelectedBusId(bus ? bus.id : null);
              setFollowMode(true);
            }}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        )}

        {/* Center/Right Map GIS Viewer */}
        <main className="flex-1 relative h-full w-full">
          <MapView
            routes={routes}
            stops={stops}
            fleet={fleet}
            selectedBus={selectedBus}
            setSelectedBus={(bus) => {
              setSelectedBusId(bus ? bus.id : null);
            }}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            trafficIncidents={simulationConfig.trafficIncidents}
            followMode={followMode}
            setFollowMode={setFollowMode}
            zenMode={zenMode}
          />

          {/* Zen Mode Floating Pill Banner to quickly restore UI */}
          {zenMode && (
            <div className="absolute top-4 left-4 z-20 animate-in fade-in duration-200">
              <button
                onClick={() => {
                  setZenMode(false);
                  setIsSidebarOpen(true);
                  soundFx.playClick();
                }}
                className="py-2 px-3.5 rounded-xl bg-white/95 text-[#003366] hover:text-[#002244] border-2 border-[#003366] font-extrabold text-xs shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Eye className="w-4 h-4 text-[#003366]" />
                <span>Tampilkan Panel & Informasi</span>
              </button>
            </div>
          )}

          {/* Quick Dispatcher Floating Toggle button on bottom right */}
          {!zenMode && !isDispatcherPanelOpen && (
            <button
              onClick={() => {
                setIsDispatcherPanelOpen(true);
                soundFx.playClick();
              }}
              className="absolute bottom-4 right-4 z-20 py-2.5 px-4 rounded-xl bg-white/95 border-2 border-[#003366] text-[#003366] font-black text-xs shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Kontrol Dispatcher ({simulationConfig.speedMultiplier || 1}x)</span>
            </button>
          )}

          {/* Emergency SOS Global Banner Alert */}
          {simulationConfig.sosActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl emergency-pulse border border-white">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>PERINGATAN: Sinyal Darurat SOS Armada Bus Sedang Aktif!</span>
            </div>
          )}

          {/* Bus Telemetry Inspector Drawer */}
          {!zenMode && selectedBus && (
            <BusDetailDrawer
              bus={selectedBus}
              onClose={() => {
                setSelectedBusId(null);
                setFollowMode(false);
              }}
              followMode={followMode}
              setFollowMode={setFollowMode}
              onTriggerSOS={triggerSOS}
              onResolveSOS={resolveSOS}
            />
          )}

          {/* Dispatcher Simulation Control Overlay */}
          {!zenMode && (
            <DispatcherPanel
              simulationConfig={simulationConfig}
              onSetSpeed={setSimulationSpeed}
              onTogglePause={togglePauseSimulation}
              onTriggerIncident={triggerTrafficIncident}
              onClearIncidents={clearTrafficIncidents}
              onTriggerSOS={triggerSOS}
              onResolveSOS={resolveSOS}
              fleet={fleet}
              logs={logs}
              isOpen={isDispatcherPanelOpen}
              onClose={() => setIsDispatcherPanelOpen(false)}
            />
          )}
        </main>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        routes={routes}
        fleet={fleet}
      />
    </div>
  );
}
