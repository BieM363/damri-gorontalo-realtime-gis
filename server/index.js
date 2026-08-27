/**
 * ============================================================================
 * DAMRI GORONTALO REAL-TIME FLEET GIS & TRANSIT SERVER
 * Developed & Engineered by: BieM363
 * GitHub: https://github.com/BieM363/damri-gorontalo-realtime-gis
 * ============================================================================
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fleetStore } from './services/store.js';
import { SimulationEngine } from './services/simulationEngine.js';

const app = express();
const server = http.createServer(app);

// Enable CORS for client
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const simEngine = new SimulationEngine(io);

// ==================== REST API ENDPOINTS ==================== //

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DAMRI Gorontalo Real-Time Fleet GIS API',
    author: 'BieM363',
    github: 'https://github.com/BieM363/damri-gorontalo-realtime-gis',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Get all routes GeoJSON
app.get('/api/routes', (req, res) => {
  res.json({
    success: true,
    data: fleetStore.getRoutes()
  });
});

// Get all transit stops
app.get('/api/stops', (req, res) => {
  res.json({
    success: true,
    data: fleetStore.getStops()
  });
});

// Get current fleet telemetry snapshot
app.get('/api/fleet', (req, res) => {
  const fleet = fleetStore.getFleet().map(b => simEngine.computeBusTelemetry(b));
  res.json({
    success: true,
    data: fleet
  });
});

// Get system analytics and telemetry statistics
app.get('/api/stats', (req, res) => {
  const fleet = fleetStore.getFleet();
  const totalOccupancy = fleet.reduce((acc, b) => acc + (b.occupancy || 0), 0);
  const totalCapacity = fleet.reduce((acc, b) => acc + (b.capacity || 0), 0);
  const avgSpeed = Math.round(fleet.reduce((acc, b) => acc + (b.speedKmh || 0), 0) / (fleet.length || 1));
  const totalKmToday = Math.round(fleet.reduce((acc, b) => acc + (b.odometerKm % 1000), 0) + 1240);

  res.json({
    success: true,
    data: {
      totalFleet: fleet.length,
      activeFleet: fleet.filter(b => b.status !== 'emergency').length,
      totalRoutes: fleetStore.getRoutes().length,
      totalStops: fleetStore.getStops().length,
      totalPassengersOnboard: totalOccupancy,
      totalPassengerCapacity: totalCapacity,
      averageLoadFactorPercent: Math.round((totalOccupancy / totalCapacity) * 100),
      averageFleetSpeedKmh: avgSpeed,
      onTimePerformanceRate: 98.6,
      totalKmTraveledToday: totalKmToday,
      activeIncidents: fleetStore.getSimulationConfig().trafficIncidents.length,
      serverTimeWita: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA'
    }
  });
});

// Get recent dispatcher logs
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    data: fleetStore.getRecentLogs()
  });
});

// Control simulation via REST
app.post('/api/simulation/config', (req, res) => {
  const { speedMultiplier, isPaused } = req.body;
  if (speedMultiplier !== undefined) {
    fleetStore.setSpeedMultiplier(Number(speedMultiplier));
  }
  if (isPaused !== undefined) {
    fleetStore.setPaused(Boolean(isPaused));
  }
  io.emit('sim:config_updated', fleetStore.getSimulationConfig());
  res.json({ success: true, config: fleetStore.getSimulationConfig() });
});

// ==================== WEBSOCKETS (SOCKET.IO) ==================== //

io.on('connection', (socket) => {
  console.log(`🔌 GIS Client connected: ${socket.id}`);

  // Send complete initial state
  const fleetSnapshot = fleetStore.getFleet().map(b => simEngine.computeBusTelemetry(b));
  socket.emit('fleet:init', {
    routes: fleetStore.getRoutes(),
    stops: fleetStore.getStops(),
    fleet: fleetSnapshot,
    config: fleetStore.getSimulationConfig(),
    logs: fleetStore.getRecentLogs()
  });

  // Client adjusts simulation speed
  socket.on('sim:set_speed', (multiplier) => {
    fleetStore.setSpeedMultiplier(multiplier);
    fleetStore.logEvent(`⚡ Kecepatan simulasi disetel ke ${multiplier}x`);
    io.emit('sim:config_updated', fleetStore.getSimulationConfig());
  });

  // Client toggles pause
  socket.on('sim:set_paused', (isPaused) => {
    fleetStore.setPaused(isPaused);
    fleetStore.logEvent(isPaused ? '⏸️ Simulasi armada dijeda (PAUSED)' : '▶️ Simulasi armada dilanjutkan (RESUMED)');
    io.emit('sim:config_updated', fleetStore.getSimulationConfig());
  });

  // Client triggers traffic incident
  socket.on('sim:trigger_incident', (incident) => {
    fleetStore.addTrafficIncident(incident);
    io.emit('sim:incident_added', incident);
  });

  // Client clears incidents
  socket.on('sim:clear_incidents', () => {
    fleetStore.clearTrafficIncidents();
    io.emit('sim:incidents_cleared');
  });

  // Bus SOS Trigger
  socket.on('bus:trigger_sos', ({ busId, reason }) => {
    fleetStore.triggerSOS(busId, reason);
    io.emit('bus:sos_state', { busId, active: true, reason });
  });

  // Bus SOS Resolve
  socket.on('bus:resolve_sos', ({ busId }) => {
    fleetStore.resolveSOS(busId);
    io.emit('bus:sos_state', { busId, active: false });
  });

  // Latency ping test
  socket.on('client:ping', (clientTimestamp, callback) => {
    if (typeof callback === 'function') {
      callback({
        clientTimestamp,
        serverTimestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start background GPS simulation engine
simEngine.start();

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  🚍 DAMRI GORONTALO GIS - REAL-TIME TRANSIT SERVER    `);
  console.log(`  📡 WebSocket & REST API running on http://localhost:${PORT}`);
  console.log(`  🗺️ Coverage: Trans-Sulawesi & Wilayah Gorontalo     `);
  console.log(`  👨‍💻 Developed & Maintained by: BieM363                `);
  console.log(`=======================================================`);
});
