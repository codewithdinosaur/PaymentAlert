import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(config.socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setConnected(false);
    });

    socketInstance.on('connected', (data) => {
      console.log('Connected confirmation:', data);
    });

    socketInstance.on('new_donation', (donation) => {
      console.log('💰 New donation received:', donation);
      setDonations((prev) => [donation, ...prev].slice(0, 10));
    });

    socketInstance.on('recent_donations', (data) => {
      console.log('Recent donations received:', data);
      setRecentDonations(data.donations || []);
    });

    socketInstance.on('stats_update', (stats) => {
      console.log('Stats update:', stats);
      setStats(stats);
    });

    socketInstance.on('goal_progress', (progress) => {
      console.log('Goal progress:', progress);
      setStats((prev) => ({ ...prev, goalProgress: progress }));
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const requestRecentDonations = () => {
    if (socketRef.current) {
      socketRef.current.emit('request_recent_donations');
    }
  };

  const requestStats = () => {
    if (socketRef.current) {
      socketRef.current.emit('request_stats');
    }
  };

  return {
    socket,
    connected,
    donations,
    stats,
    recentDonations,
    requestRecentDonations,
    requestStats,
  };
};
