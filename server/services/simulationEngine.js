/**
 * Real-Time GPS Simulation & Geodesic Telemetry Engine
 * Engineered by: BieM363 (https://github.com/BieM363)
 */

import * as turf from '@turf/turf';
import { fleetStore } from './store.js';

export class SimulationEngine {
  constructor(io) {
    this.io = io;
    this.timer = null;
    this.tickIntervalMs = 1000; // 1 tick per second
    this.routeLines = new Map(); // Cache turf lineStrings
    this.stopPositions = new Map(); // Cache stop projection on routes
    this.initSpatialCache();
  }

  initSpatialCache() {
    const routes = fleetStore.getRoutes();
    const stops = fleetStore.getStops();

    for (const route of routes) {
      // Turf expects [lng, lat]
      const turfCoords = route.coordinates.map(coord => [coord[1], coord[0]]);
      const line = turf.lineString(turfCoords);
      const lengthKm = turf.length(line, { units: 'kilometers' });
      this.routeLines.set(route.id, { line, lengthKm });

      // Pre-calculate stops along route
      const stopsOnRoute = [];
      for (const stopId of route.stopIds) {
        const stop = stops.find(s => s.id === stopId);
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
    console.log('🚀 DAMRI Gorontalo Real-Time Fleet Simulation Engine started (1Hz tick).');
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  tick() {
    const config = fleetStore.getSimulationConfig();
    if (config.isPaused) return;

    const fleet = fleetStore.getFleet();
    const multiplier = config.speedMultiplier || 1;
    const updatedTelemetryList = [];

    for (const bus of fleet) {
      if (bus.status === 'emergency') {
        // Bus is broken down / emergency, send static telemetry
        const telemetry = this.computeBusTelemetry(bus);
        updatedTelemetryList.push(telemetry);
        continue;
      }

      const routeCache = this.routeLines.get(bus.routeId);
      if (!routeCache) continue;

      const { line, lengthKm } = routeCache;

      // Handle dwelling at stops
      if (bus.status === 'dwelling') {
        bus.dwellTicks = (bus.dwellTicks || 0) + 1;
        if (bus.dwellTicks >= 6) { // Dwelling for ~6 seconds
          bus.status = 'in_transit';
          bus.dwellTicks = 0;
          // Random passenger change on departure
          const maxCap = bus.capacity;
          const change = Math.floor(Math.random() * 7) - 3;
          bus.occupancy = Math.max(3, Math.min(maxCap, bus.occupancy + change));
          fleetStore.logEvent(`🚌 ${bus.label} berangkat melanjutkan perjalanan. Okupansi: ${bus.occupancy}/${maxCap} pax.`);
        }
        const telemetry = this.computeBusTelemetry(bus);
        updatedTelemetryList.push(telemetry);
        continue;
      }

      // Base speed with random realistic jitter
      let baseSpeed = 45;
      if (bus.routeId === 'route-manado') baseSpeed = 65;
      else if (bus.routeId === 'route-marisa') baseSpeed = 58;
      else if (bus.routeId === 'route-city-tour') baseSpeed = 35;
      else if (bus.routeId === 'route-airport') baseSpeed = 50;

      // Random speed fluctuations (-5 to +5 km/h)
      const speedJitter = (Math.random() * 10 - 5);
      bus.speedKmh = Math.max(25, Math.min(85, Math.round(baseSpeed + speedJitter)));

      // Check if near traffic incident
      const hasTraffic = config.trafficIncidents.some(inc => inc.routeId === bus.routeId);
      if (hasTraffic) {
        bus.speedKmh = Math.round(bus.speedKmh * 0.4); // 60% slowdown
      }

      // Distance moved in this tick (1 second)
      // speed in km/h -> km/s = speed / 3600
      const distDeltaKm = (bus.speedKmh / 3600) * multiplier;
      const progressDelta = distDeltaKm / lengthKm;

      let newProgress = bus.progress + (progressDelta * bus.direction);

      // Check boundaries and turn around
      if (newProgress >= 1.0) {
        newProgress = 1.0;
        bus.direction = -1;
        bus.status = 'dwelling';
        bus.dwellTicks = 0;
        fleetStore.logEvent(`🏁 ${bus.label} tiba di stasiun akhir. Putar balik trayek.`);
      } else if (newProgress <= 0.0) {
        newProgress = 0.0;
        bus.direction = 1;
        bus.status = 'dwelling';
        bus.dwellTicks = 0;
        fleetStore.logEvent(`🏁 ${bus.label} tiba di stasiun awal. Mulai perjalanan balik.`);
      }

      bus.progress = newProgress;
      bus.odometerKm = (bus.odometerKm || 100000) + Math.round(distDeltaKm * 10) / 10;

      // Engine temperature & fuel dynamics
      bus.engineTempC = Math.min(95, Math.max(78, 82 + Math.floor((bus.speedKmh / 80) * 8)));
      if (Math.random() < 0.05) {
        bus.fuelPercent = Math.max(15, bus.fuelPercent - 0.1);
      }

      // Compute full spatial telemetry
      const telemetry = this.computeBusTelemetry(bus);

      // Check if bus arrived at a stop
      this.checkStopProximity(bus, telemetry);

      updatedTelemetryList.push(telemetry);
    }

    // Broadcast live telemetry update to all connected WebSockets
    this.io.emit('fleet:telemetry', {
      timestamp: new Date().toISOString(),
      fleet: updatedTelemetryList,
      trafficIncidents: config.trafficIncidents,
      sosActive: config.sosActive
    });
  }

  computeBusTelemetry(bus) {
    const routeCache = this.routeLines.get(bus.routeId);
    if (!routeCache) return bus;

    const { line, lengthKm } = routeCache;
    const currentDistKm = Math.max(0, Math.min(lengthKm, bus.progress * lengthKm));

    // Current point on route
    const currentPoint = turf.along(line, currentDistKm, { units: 'kilometers' });
    const [currentLng, currentLat] = currentPoint.geometry.coordinates;

    // Bearing calculation (sample 0.05km ahead in direction)
    const lookAheadDist = Math.max(0, Math.min(lengthKm, currentDistKm + (0.08 * bus.direction)));
    const lookAheadPoint = turf.along(line, lookAheadDist, { units: 'kilometers' });
    let bearingDeg = turf.bearing(currentPoint, lookAheadPoint);
    if (bearingDeg < 0) bearingDeg += 360;

    // Stops calculations & Next Stop ETA
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

    // If reached end of list, next is terminal
    if (!nextStop && orderedStops.length > 0) {
      nextStop = orderedStops[0];
      distanceToNextStopKm = 0.5;
      etaMinutes = 1;
    }

    const route = fleetStore.getRouteById(bus.routeId);

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

    // If within 0.15 km (150 meters) of the next stop
    if (telemetry.nextStop.distanceKm <= 0.15) {
      bus.status = 'dwelling';
      bus.dwellTicks = 0;
      bus.speedKmh = 0;

      fleetStore.logEvent(`📍 ${bus.label} tiba di ${telemetry.nextStop.name}. Menaikkan/menurunkan penumpang.`);
      this.io.emit('bus:arrived', {
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
