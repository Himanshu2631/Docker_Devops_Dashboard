import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);

  useEffect(() => {
    socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleDockerEvent = (event) => setLastEvent(event);
    const handleDockerStats = (data) => setRealTimeStats(data);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('server:connected', handleConnect);
    socketService.on('docker:event', handleDockerEvent);
    socketService.on('docker:stats', handleDockerStats);

    setIsConnected(socketService.isConnected());

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('server:connected', handleConnect);
      socketService.off('docker:event', handleDockerEvent);
      socketService.off('docker:stats', handleDockerStats);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, lastEvent, realTimeStats, socket: socketService }}>
      {children}
    </SocketContext.Provider>
  );
};
