import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { soundFx } from '../utils/audio';
import { routes as defaultRoutes } from '../data/routes';
import { stops as defaultStops } from '../data/stops';
import { ClientSimulationEngine } from '../services/clientSimulation';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLiveServer, setIsLiveServer] = useState(false);
  const [latencyMs, setLatencyMs] = useState(1);
  const [routes, setRoutes] = useState(defaultRoutes);
  const [stops, setStops] = useState(defaultStops);
  const [fleet, setFleet] = useState([]);
  const [simulationConfig, setSimulationConfig] = useState({
    speedMultiplier: 1,
    isPaused: false,
    trafficIncidents: [],
    sosActive: false
  });
  const [logs, setLogs] = useState([
    {
      id: 'EVT-INIT-1',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA',
      message: '🛰️ Sistem Pelacakan Real-Time DAMRI Gorontalo Aktif.'
    },
    {
      id: 'EVT-INIT-2',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA',
      message: '🚌 Seluruh 8 armada aktif di 5 koridor trayek Trans-Sulawesi.'
    }
  ]);
  const [latestArrival, setLatestArrival] = useState(null);

  const socketRef = useRef(null);
  const clientSimRef = useRef(null);
  const isUsingServerRef = useRef(false);

  // Helper to add logs
  const addLog = useCallback((message) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZone: 'Asia/Makassar'
    }) + ' WITA';

    setLogs(prev => [
      {
        id: 'EVT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        time: timeStr,
        message
      },
      ...prev.slice(0, 49)
    ]);
  }, []);

  useEffect(() => {
    // 1. Initialize Client-Side Simulation Engine as instant real-time source
    const clientSim = new ClientSimulationEngine({
      onTelemetry: (payload) => {
        if (!isUsingServerRef.current) {
          if (payload.fleet) setFleet(payload.fleet);
          setSimulationConfig(prev => ({
            ...prev,
            trafficIncidents: payload.trafficIncidents,
            sosActive: payload.sosActive
          }));
        }
      },
      onArrival: (event) => {
        if (!isUsingServerRef.current) {
          setLatestArrival(event);
          soundFx.playArrivalChime();
        }
      },
      onLog: (message) => {
        if (!isUsingServerRef.current) {
          addLog(message);
        }
      }
    });

    clientSimRef.current = clientSim;

    // Load initial state
    const initState = clientSim.getInitialState();
    setRoutes(initState.routes);
    setStops(initState.stops);
    setFleet(initState.fleet);
    setSimulationConfig(initState.config);
    setIsConnected(true); // Connected to engine

    // Start simulation ticks
    clientSim.start();

    // 2. Connect to WebSocket backend if configured or available
    const backendUrl = import.meta.env.VITE_API_URL;
    let socket = null;

    if (backendUrl || window.location.port === '5173') {
      const targetUrl = backendUrl || 'http://localhost:5000';
      socket = io(targetUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 3000,
        transports: ['websocket', 'polling']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        isUsingServerRef.current = true;
        setIsLiveServer(true);
        setIsConnected(true);
        clientSim.stop();
        console.log('⚡ Connected to Remote DAMRI GIS WebSocket Server');
      });

      socket.on('disconnect', () => {
        isUsingServerRef.current = false;
        setIsLiveServer(false);
        clientSim.start();
        console.log('🔄 Switched to Built-in Client Simulation Engine');
      });

      socket.on('connect_error', () => {
        isUsingServerRef.current = false;
        setIsLiveServer(false);
      });

      // Initial sync from server
      socket.on('fleet:init', (data) => {
        if (data.routes) setRoutes(data.routes);
        if (data.stops) setStops(data.stops);
        if (data.fleet) setFleet(data.fleet);
        if (data.config) setSimulationConfig(data.config);
        if (data.logs) setLogs(data.logs);
      });

      // Telemetry update from server
      socket.on('fleet:telemetry', (payload) => {
        if (isUsingServerRef.current) {
          if (payload.fleet) setFleet(payload.fleet);
          if (payload.trafficIncidents) {
            setSimulationConfig(prev => ({
              ...prev,
              trafficIncidents: payload.trafficIncidents,
              sosActive: payload.sosActive
            }));
          }
        }
      });

      socket.on('sim:config_updated', (config) => {
        if (isUsingServerRef.current) setSimulationConfig(config);
      });

      socket.on('bus:arrived', (event) => {
        if (isUsingServerRef.current) {
          setLatestArrival(event);
          soundFx.playArrivalChime();
          addLog(`📍 ${event.busLabel} tiba di ${event.stopName}`);
        }
      });

      socket.on('bus:sos_state', ({ busId, active }) => {
        if (isUsingServerRef.current) {
          if (active) soundFx.playEmergencySiren();
          setFleet(prev => prev.map(b => b.id === busId ? { ...b, status: active ? 'emergency' : 'in_transit' } : b));
        }
      });

      // Ping latency
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          const start = Date.now();
          socket.emit('client:ping', start, () => {
            setLatencyMs(Date.now() - start);
          });
        }
      }, 4000);

      return () => {
        clearInterval(pingInterval);
        socket.disconnect();
        clientSim.stop();
      };
    }

    return () => {
      clientSim.stop();
    };
  }, [addLog]);

  const setSimulationSpeed = useCallback((multiplier) => {
    if (clientSimRef.current) {
      clientSimRef.current.setSpeed(multiplier);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sim:set_speed', multiplier);
    }
    setSimulationConfig(prev => ({ ...prev, speedMultiplier: multiplier }));
    soundFx.playClick();
  }, []);

  const togglePauseSimulation = useCallback((isPaused) => {
    if (clientSimRef.current) {
      clientSimRef.current.setPaused(isPaused);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sim:set_paused', isPaused);
    }
    setSimulationConfig(prev => ({ ...prev, isPaused }));
    soundFx.playClick();
  }, []);

  const triggerTrafficIncident = useCallback((incident) => {
    if (clientSimRef.current) {
      clientSimRef.current.triggerIncident(incident);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sim:trigger_incident', incident);
    }
    soundFx.playClick();
  }, []);

  const clearTrafficIncidents = useCallback(() => {
    if (clientSimRef.current) {
      clientSimRef.current.clearIncidents();
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sim:clear_incidents');
    }
    setSimulationConfig(prev => ({ ...prev, trafficIncidents: [] }));
    soundFx.playClick();
  }, []);

  const triggerSOS = useCallback((busId, reason) => {
    if (clientSimRef.current) {
      clientSimRef.current.triggerSOS(busId, reason);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('bus:trigger_sos', { busId, reason });
    }
    soundFx.playEmergencySiren();
  }, []);

  const resolveSOS = useCallback((busId) => {
    if (clientSimRef.current) {
      clientSimRef.current.resolveSOS(busId);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('bus:resolve_sos', { busId });
    }
    soundFx.playClick();
  }, []);

  return {
    isConnected,
    isLiveServer,
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
