import { routes } from '../data/routes.js';
import { stops } from '../data/stops.js';
/**
 * In-Memory Telemetry & Fleet Store
 * Engineered by: BieM363 (https://github.com/BieM363)
 */

import { initialFleet } from '../data/fleet.js';

class FleetStore {
  constructor() {
    this.routes = routes;
    this.stops = stops;
    // Clone initial fleet to maintain state
    this.fleet = JSON.parse(JSON.stringify(initialFleet));
    this.simulationConfig = {
      speedMultiplier: 1, // 1x, 2x, 5x
      isPaused: false,
      trafficIncidents: [], // e.g. { id, routeId, lat, lng, reason, delayMin }
      sosActive: false
    };
    this.eventLogs = [];
  }

  getRoutes() {
    return this.routes;
  }

  getStops() {
    return this.stops;
  }

  getRouteById(id) {
    return this.routes.find(r => r.id === id);
  }

  getStopById(id) {
    return this.stops.find(s => s.id === id);
  }

  getFleet() {
    return this.fleet;
  }

  getBusById(id) {
    return this.fleet.find(b => b.id === id);
  }

  updateBus(id, patch) {
    const bus = this.getBusById(id);
    if (bus) {
      Object.assign(bus, patch);
    }
    return bus;
  }

  getSimulationConfig() {
    return this.simulationConfig;
  }

  setSpeedMultiplier(multiplier) {
    this.simulationConfig.speedMultiplier = Math.max(0.5, Math.min(10, multiplier));
  }

  setPaused(paused) {
    this.simulationConfig.isPaused = !!paused;
  }

  addTrafficIncident(incident) {
    this.simulationConfig.trafficIncidents.push({
      id: 'INC-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...incident
    });
    this.logEvent(`⚠️ Rekayasa Lalu Lintas: ${incident.reason || 'Perbaikan Jalan Trans-Sulawesi'}`);
  }

  clearTrafficIncidents() {
    this.simulationConfig.trafficIncidents = [];
    this.logEvent('🟢 Rekayasa lalu lintas dinormalkan kembali.');
  }

  triggerSOS(busId, reason = 'Kendala Teknis Armada') {
    const bus = this.getBusById(busId);
    if (bus) {
      bus.status = 'emergency';
      bus.speedKmh = 0;
      this.simulationConfig.sosActive = true;
      this.logEvent(`🚨 DARURAT: ${bus.label} (${bus.plateNumber}) memicu sinyal SOS: ${reason}`);
    }
  }

  resolveSOS(busId) {
    const bus = this.getBusById(busId);
    if (bus) {
      bus.status = 'in_transit';
      this.simulationConfig.sosActive = false;
      this.logEvent(`✅ Sinyal Darurat ${bus.label} telah ditangani.`);
    }
  }

  logEvent(message) {
    const event = {
      id: 'EVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA',
      message
    };
    this.eventLogs.unshift(event);
    if (this.eventLogs.length > 50) {
      this.eventLogs.pop();
    }
    return event;
  }

  getRecentLogs() {
    return this.eventLogs;
  }
}

export const fleetStore = new FleetStore();
