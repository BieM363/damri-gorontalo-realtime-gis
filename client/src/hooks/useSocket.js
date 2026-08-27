import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { soundFx } from '../utils/audio';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [simulationConfig, setSimulationConfig] = useState({
    speedMultiplier: 1,
    isPaused: false,
    trafficIncidents: [],
    sosActive: false
  });
  const [logs, setLogs] = useState([]);
  const [latestArrival, setLatestArrival] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket backend
    const socket = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to DAMRI Gorontalo Real-Time GIS Server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from GIS Server');
    });

    // Initial sync
    socket.on('fleet:init', (data) => {
      if (data.routes) setRoutes(data.routes);
      if (data.stops) setStops(data.stops);
      if (data.fleet) setFleet(data.fleet);
      if (data.config) setSimulationConfig(data.config);
      if (data.logs) setLogs(data.logs);
    });

    // High frequency telemetry update (1Hz)
    socket.on('fleet:telemetry', (payload) => {
      if (payload.fleet) {
        setFleet(payload.fleet);
      }
      if (payload.trafficIncidents) {
        setSimulationConfig(prev => ({
          ...prev,
          trafficIncidents: payload.trafficIncidents,
          sosActive: payload.sosActive
        }));
      }
    });

    // Simulation configuration update
    socket.on('sim:config_updated', (config) => {
      setSimulationConfig(config);
    });

    // Bus arrival notification
    socket.on('bus:arrived', (event) => {
      setLatestArrival(event);
      soundFx.playArrivalChime();
      // Add log
      setLogs(prev => [
        {
          id: 'EVT-' + Date.now(),
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA',
          message: `📍 ${event.busLabel} tiba di ${event.stopName}`
        },
        ...prev.slice(0, 49)
      ]);
    });

    // Bus SOS state update
    socket.on('bus:sos_state', ({ busId, active, reason }) => {
      if (active) {
        soundFx.playEmergencySiren();
      }
      setFleet(prev => prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            status: active ? 'emergency' : 'in_transit'
          };
        }
        return b;
      }));
    });

    // Measure latency ping every 4 seconds
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('client:ping', start, () => {
          const latency = Date.now() - start;
          setLatencyMs(latency);
        });
      }
    }, 4000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  }, []);

  const setSimulationSpeed = useCallback((multiplier) => {
    if (socketRef.current) {
      socketRef.current.emit('sim:set_speed', multiplier);
      soundFx.playClick();
    }
  }, []);

  const togglePauseSimulation = useCallback((isPaused) => {
    if (socketRef.current) {
      socketRef.current.emit('sim:set_paused', isPaused);
      soundFx.playClick();
    }
  }, []);

  const triggerTrafficIncident = useCallback((incident) => {
    if (socketRef.current) {
      socketRef.current.emit('sim:trigger_incident', incident);
      soundFx.playClick();
    }
  }, []);

  const clearTrafficIncidents = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('sim:clear_incidents');
      soundFx.playClick();
    }
  }, []);

  const triggerSOS = useCallback((busId, reason) => {
    if (socketRef.current) {
      socketRef.current.emit('bus:trigger_sos', { busId, reason });
      soundFx.playEmergencySiren();
    }
  }, []);

  const resolveSOS = useCallback((busId) => {
    if (socketRef.current) {
      socketRef.current.emit('bus:resolve_sos', { busId });
      soundFx.playClick();
    }
  }, []);

  return {
    isConnected,
    latencyMs,
    routes,
    stops,
    fleet,
    simulationConfig,
    logs,
    latestArrival,
    setSimulationSpeed,
    togglePauseSimulation,
    triggerTrafficIncident,
    clearTrafficIncidents,
    triggerSOS,
    resolveSOS
  };
};
