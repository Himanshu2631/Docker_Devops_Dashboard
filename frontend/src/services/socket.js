/**
 * services/socket.js
 * ------------------
 * Client-side Socket.IO service for real-time infrastructure events.
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to the Socket.IO server.
   */
  connect() {
    if (this.socket) return;

    console.log('🔌 Connecting to real-time event server...');

    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Real-time connection established');
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from real-time server:', reason);
    });

    // Re-attach all existing listeners if any
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  /**
   * Subscribe to a specific event.
   * @param {string} event - The event name.
   * @param {function} callback - The callback function.
   */
  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from a specific event.
   * @param {string} event - The event name.
   */
  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Disconnect the socket.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if the socket is connected.
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;
