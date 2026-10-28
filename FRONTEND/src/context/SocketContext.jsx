import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const newSocket = io('http://localhost:3000', { withCredentials: true });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket Connected:', newSocket.id);
      if (user.userId) {
        newSocket.emit('register', user.userId);
        console.log('👤 Socket Registered:', user.userId);
      }
    });

    // 📩 Global Notification Listener
    newSocket.on('new_notification', (notification) => {
      console.log('📩 Real-time Notification:', notification);
      // Dispatch a custom window event that NotificationCenter.js listens to
      window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
    });

    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
