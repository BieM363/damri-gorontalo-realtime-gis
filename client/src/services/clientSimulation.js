/**
 * DAMRI Gorontalo Real-Time Client-Side Simulation & Telemetry Engine
 * Engineered by: BieM363 (https://github.com/BieM363)
 */

import * as turf from '@turf/turf';
import { routes } from '../data/routes';
import { stops } from '../data/stops';
import { initialFleet } from '../data/fleet';

export class ClientSimulationEngine {
  constructor({ onTelemetry, onArrival, onLog }) {
    this.onTelemetry = onTelemetry;
    this.onArrival = onArrival;
    this.onLog = onLog;

    this.timer = null;
    this.tickIntervalMs = 1000;

    this.fleet = JSON.parse(JSON.stringify(initialFleet));
    this.routes = routes;
    this.stops = stops;

    this.config = {
      speedMultiplier: 1,
      isPaused: false,
      trafficIncidents: [],
      sosActive: false
    };

    this.routeLines = new Map();
    this.stopPositions = new Map();
    this.initSpatialCache();
  }

  initSpatialCache() {
    for (const route of this.routes) {
      // Turf expects [lng, lat]
      const turfCoords = route.coordinates.map(coord => [coord[1], coord[0]]);
      const line = turf.lineString(turfCoords);
      const lengthKm = turf.length(line, { units: 'kilometers' });
      this.routeLines.set(route.id, { line, lengthKm });

      // Pre-calculate stops along route
      const stopsOnRoute = [];
      for (const stopId of route.stopIds) {
        const stop = this.stops.find(s => s.id === stopId);
        if (stop) {
          const stopPt = turf.point([stop.coords[1], stop.coords[0]]);
          const snapped = turf.nearestPointOnLine(line, stopPt, { units: 'kilometers' });
          stopsOnRoute.push({
            stopId: stop.id,
            name: stop.name,
            type: stop.type,
            coords: stop.coords,
            locationKm: snapped.properties.location
          });
        }
      }
      // Sort stops by location along the line
      stopsOnRoute.sort((a, b) => a.locationKm - b.locationKm);
      this.stopPositions.set(route.id, stopsOnRoute);
    }
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.tickIntervalMs);
    // Send immediate initial tick
    this.tick();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  setSpeed(multiplier) {
    this.config.speedMultiplier = multiplier;
  }

  setPaused(isPaused) {
    this.config.isPaused = isPaused;
  }

  triggerIncident(incident) {
    const existing = this.config.trafficIncidents.find(i => i.id === incident.id);
    if (!existing) {
      this.config.trafficIncidents.push(incident);
      if (this.onLog) {
        this.onLog(`⚠️ Peringatan Lalu Lintas: ${incident.title} di ${incident.location}`);
      }
    }
  }

  clearIncidents() {
    this.config.trafficIncidents = [];
    if (this.onLog) {
      this.onLog(`✅ Semua insiden lalu lintas telah ditangani & jalur lancar kembali.`);
    }
  }

  triggerSOS(busId, reason) {
    this.config.sosActive = true;
    this.fleet = this.fleet.map(b => {
      if (b.id === busId) {
        return { ...b, status: 'emergency', speedKmh: 0 };
      }
      return b;
    });
    const bus = this.fleet.find(b => b.id === busId);
    if (this.onLog && bus) {
      this.onLog(`🚨 DARURAT SOS: ${bus.label} (${bus.plateNumber}) memicu sinyal darurat! Alasan: ${reason || 'Kerusakan Mesin'}`);
    }
  }

  resolveSOS(busId) {
    this.fleet = this.fleet.map(b => {
      if (b.id === busId) {
        return { ...b, status: 'in_transit' };
      }
      return b;
    });
    const hasOtherEmergency = this.fleet.some(b => b.status === 'emergency');
    this.config.sosActive = hasOtherEmergency;
    const bus = this.fleet.find(b => b.id === busId);
    if (this.onLog && bus) {
      this.onLog(`🛡️ Status SOS ${bus.label} telah dinonaktifkan. Armada melanjutkan rute.`);
    }
  }

  tick() {
    if (this.config.isPaused) return;

    const multiplier = this.config.speedMultiplier || 1;
    const updatedTelemetryList = [];

    for (const bus of this.fleet) {
      if (bus.status === 'emergency') {
        const telemetry = this.computeBusTelemetry(bus);
        updatedTelemetryList.push(telemetry);
        continue;
      }

      const routeCache = this.routeLines.get(bus.routeId);
      if (!routeCache) continue;

      const { lengthKm } = routeCache;

      // Handle dwelling at stops
      if (bus.status === 'dwelling') {
        bus.dwellTicks = (bus.dwellTicks || 0) + 1;
        if (bus.dwellTicks >= 6) {
          bus.status = 'in_transit';
          bus.dwellTicks = 0;
          const maxCap = bus.capacity;
          const change = Math.floor(Math.random() * 7) - 3;
          bus.occupancy = Math.max(3, Math.min(maxCap, bus.occupancy + change));
          if (this.onLog) {
            this.onLog(`🚌 ${bus.label} berangkat melanjutkan perjalanan. Okupansi: ${bus.occupancy}/${maxCap} pax.`);
          }
        }
        const telemetry = this.computeBusTelemetry(bus);
        updatedTelemetryList.push(telemetry);
        continue;
      }

      // Base speed with random realistic jitter
      let baseSpeed = 45;
      if (bus.routeId === 'route-marisa') baseSpeed = 58;
      else if (bus.routeId === 'route-city-tour') baseSpeed = 35;
      else if (bus.routeId === 'route-airport') baseSpeed = 50;

      const speedJitter = (Math.random() * 10 - 5);
      bus.speedKmh = Math.max(25, Math.min(85, Math.round(baseSpeed + speedJitter)));

      // Check if near traffic incident
      const hasTraffic = this.config.trafficIncidents.some(inc => inc.routeId === bus.routeId);
      if (hasTraffic) {
        bus.speedKmh = Math.round(bus.speedKmh * 0.4);
      }

      // Distance moved in this tick (1 second)
      const distDeltaKm = (bus.speedKmh / 3600) * multiplier;
      const progressDelta = distDeltaKm / lengthKm;

      let newProgress = bus.progress + (progressDelta * bus.direction);

      if (newProgress >= 1.0) {
        newProgress = 1.0;
        bus.direction = -1;
        bus.status = 'dwelling';
        bus.dwellTicks = 0;
        if (this.onLog) {
          this.onLog(`🏁 ${bus.label} tiba di stasiun akhir. Putar balik trayek.`);
        }
      } else if (newProgress <= 0.0) {
        newProgress = 0.0;
        bus.direction = 1;
        bus.status = 'dwelling';
        bus.dwellTicks = 0;
        if (this.onLog) {
          this.onLog(`🏁 ${bus.label} tiba di stasiun awal. Mulai perjalanan balik.`);
        }
      }

      bus.progress = newProgress;
      bus.odometerKm = (bus.odometerKm || 100000) + Math.round(distDeltaKm * 10) / 10;

      bus.engineTempC = Math.min(95, Math.max(78, 82 + Math.floor((bus.speedKmh / 80) * 8)));
      if (Math.random() < 0.05) {
        bus.fuelPercent = Math.max(15, bus.fuelPercent - 0.1);
      }

      const telemetry = this.computeBusTelemetry(bus);
      this.checkStopProximity(bus, telemetry);
      updatedTelemetryList.push(telemetry);
    }

    if (this.onTelemetry) {
      this.onTelemetry({
        fleet: updatedTelemetryList,
        trafficIncidents: this.config.trafficIncidents,
        sosActive: this.config.sosActive
      });
    }
  }

  computeBusTelemetry(bus) {
    const routeCache = this.routeLines.get(bus.routeId);
    if (!routeCache) return bus;

    const { line, lengthKm } = routeCache;
    const currentDistKm = Math.max(0, Math.min(lengthKm, bus.progress * lengthKm));

    const currentPoint = turf.along(line, currentDistKm, { units: 'kilometers' });
    const [currentLng, currentLat] = currentPoint.geometry.coordinates;

    const lookAheadDist = Math.max(0, Math.min(lengthKm, currentDistKm + (0.08 * bus.direction)));
    const lookAheadPoint = turf.along(line, lookAheadDist, { units: 'kilometers' });
    let bearingDeg = turf.bearing(currentPoint, lookAheadPoint);
    if (bearingDeg < 0) bearingDeg += 360;

    const stopsOnRoute = this.stopPositions.get(bus.routeId) || [];
    let nextStop = null;
    let distanceToNextStopKm = 0;
    let etaMinutes = 0;
    const allStopEtas = [];

    const orderedStops = bus.direction === 1 
      ? [...stopsOnRoute] 
      : [...stopsOnRoute].reverse();

    for (const stop of orderedStops) {
      let isAhead = false;
      let distKm = 0;

      if (bus.direction === 1) {
        isAhead = stop.locationKm >= currentDistKm;
        distKm = stop.locationKm - currentDistKm;
      } else {
        isAhead = stop.locationKm <= currentDistKm;
        distKm = currentDistKm - stop.locationKm;
      }

      if (isAhead) {
        if (!nextStop) {
          nextStop = stop;
          distanceToNextStopKm = Math.round(distKm * 10) / 10;
          const avgSpeed = Math.max(bus.speedKmh, 35);
          etaMinutes = Math.max(1, Math.round((distKm / avgSpeed) * 60));
        }

        const avgSpeed = Math.max(bus.speedKmh, 35);
        const stopEta = Math.max(1, Math.round((distKm / avgSpeed) * 60));
        allStopEtas.push({
          stopId: stop.stopId,
          name: stop.name,
          coords: stop.coords,
          distanceKm: Math.round(distKm * 10) / 10,
          etaMinutes: stopEta
        });
      }
    }

    if (!nextStop && orderedStops.length > 0) {
      nextStop = orderedStops[0];
      distanceToNextStopKm = 0.5;
      etaMinutes = 1;
    }

    const route = this.routes.find(r => r.id === bus.routeId);

    return {
      ...bus,
      lat: currentLat,
      lng: currentLng,
      bearing: Math.round(bearingDeg),
      routeCode: route ? route.code : '',
      routeName: route ? route.name : '',
      routeColor: route ? route.color : '#00f0ff',
      nextStop: nextStop ? {
        id: nextStop.stopId,
        name: nextStop.name,
        type: nextStop.type,
        distanceKm: distanceToNextStopKm,
        etaMinutes: etaMinutes
      } : null,
      upcomingStops: allStopEtas,
      occupancyPercent: Math.round((bus.occupancy / bus.capacity) * 100),
      occupancyStatus: bus.occupancy >= bus.capacity * 0.9 
        ? 'penuh' 
        : bus.occupancy >= bus.capacity * 0.6 
          ? 'sedang' 
          : 'lengang'
    };
  }

  checkStopProximity(bus, telemetry) {
    if (!telemetry.nextStop || bus.status === 'dwelling') return;

    if (telemetry.nextStop.distanceKm <= 0.15) {
      bus.status = 'dwelling';
      bus.dwellTicks = 0;
      bus.speedKmh = 0;

      if (this.onLog) {
        this.onLog(`📍 ${bus.label} tiba di ${telemetry.nextStop.name}. Menaikkan/menurunkan penumpang.`);
      }

      if (this.onArrival) {
        this.onArrival({
          busId: bus.id,
          busLabel: bus.label,
          stopId: telemetry.nextStop.id,
          stopName: telemetry.nextStop.name,
          occupancy: bus.occupancy,
          time: new Date().toISOString()
        });
      }
    }
  }

  getInitialState() {
    const initialTelemetry = this.fleet.map(b => this.computeBusTelemetry(b));
    return {
      routes: this.routes,
      stops: this.stops,
      fleet: initialTelemetry,
      config: this.config
    };
  }
}
