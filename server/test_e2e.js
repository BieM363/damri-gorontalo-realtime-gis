import { io } from 'socket.io-client';

console.log('Testing End-to-End WebSocket connection to http://localhost:5001...');

const socket = io('http://localhost:5001', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ WebSocket Connected successfully! Socket ID:', socket.id);
});

socket.on('fleet:init', (data) => {
  console.log(`✅ fleet:init received: ${data.routes.length} routes, ${data.stops.length} stops, ${data.fleet.length} buses.`);
});

socket.on('fleet:telemetry', (payload) => {
  console.log(`✅ fleet:telemetry received! Active buses count: ${payload.fleet.length}`);
  const sampleBus = payload.fleet[0];
  console.log(`🚌 Sample Bus [${sampleBus.label} (${sampleBus.plateNumber})]: Coords=[${sampleBus.lat.toFixed(4)}, ${sampleBus.lng.toFixed(4)}], Bearing=${sampleBus.bearing}°, Speed=${sampleBus.speedKmh} km/h, Occupancy=${sampleBus.occupancy}/${sampleBus.capacity} (${sampleBus.occupancyStatus}), NextStop=${sampleBus.nextStop?.name} (ETA: ${sampleBus.nextStop?.etaMinutes}m)`);
  
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Timeout waiting for telemetry stream');
  process.exit(1);
}, 6000);
