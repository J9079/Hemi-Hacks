import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveEvent, setLiveEvent] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [driverAlert, setDriverAlert] = useState(null);
  const audioContextRef = useRef(null);

  // Synthesize dispatch chime sound using browser Web Audio API (no external audio files required!)
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Two-tone attention chime (660Hz then 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn('Audio alert playback error:', err);
    }
  };

  useEffect(() => {
    // Connect to server (supports custom backend URL if deployed separately)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to real-time rescue mesh:', s.id);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Join rooms when user changes
  useEffect(() => {
    if (!socket || !user) return;

    // Join personal user room
    socket.emit('join_room', `user:${user.id || user._id}`);

    // Join role room
    if (user.role) {
      socket.emit('join_room', `role:${user.role}`);
    }

    // Universal event listeners
    const handleEvent = (eventName) => (payload) => {
      console.log(`[Socket Event: ${eventName}]`, payload);
      setLiveEvent({ event: eventName, payload, timestamp: Date.now() });

      // Trigger audio chime for dispatch events
      playAlertSound();

      // If user is DRIVER and event is pickup request, create high-priority driver alert
      if (user.role === 'DRIVER' && (eventName === 'DRIVER_ASSIGNED' || eventName === 'MATCH_FOUND')) {
        setDriverAlert({
          title: payload.title || '🚨 NEW NEARBY FOOD RESCUE REQUEST!',
          message: payload.message,
          relatedDonationId: payload.relatedDonationId,
          timestamp: Date.now()
        });
      }

      // Add toast notification
      if (payload?.title && payload?.message) {
        addToast(payload.title, payload.message, payload.type);
      }
    };

    const events = [
      'notification',
      'role_notification',
      'DONATION_CREATED',
      'MATCH_FOUND',
      'NGO_ACCEPTED',
      'DRIVER_ASSIGNED',
      'PICKUP_STARTED',
      'FOOD_PICKED_UP',
      'DELIVERY_STARTED',
      'DELIVERY_COMPLETED',
      'DONATION_EXPIRING'
    ];

    events.forEach(evt => socket.on(evt, handleEvent(evt)));

    return () => {
      events.forEach(evt => socket.off(evt));
      socket.emit('leave_room', `user:${user.id || user._id}`);
      if (user.role) socket.emit('leave_room', `role:${user.role}`);
    };
  }, [socket, user, soundEnabled]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, title, message, type }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 7000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearDriverAlert = () => setDriverAlert(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveEvent,
        toasts,
        removeToast,
        driverAlert,
        clearDriverAlert,
        playAlertSound,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start justify-between transition-all transform animate-slide-in"
          >
            <div className="flex-1 mr-2">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-semibold text-emerald-400">{toast.title}</h4>
              </div>
              <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
