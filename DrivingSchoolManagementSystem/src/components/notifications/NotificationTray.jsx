import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import './notificationTray.css';

export default function NotificationTray({ instructorId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial notifications
    fetchNotifications();

    // 2. Initialize Socket.io
    socketRef.current = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.emit('register', instructorId);

    socketRef.current.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Play subtle sound or show toast here if desired
    });

    // 3. Handle clicks outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socketRef.current.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [instructorId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:3000/notifications/${instructorId}`);
      const data = await res.json();
      if (data.ok) setNotifications(data.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/notifications/read/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:3000/notifications/read-all/${instructorId}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const clearAll = async () => {
    try {
      await fetch(`http://localhost:3000/notifications/clear/${instructorId}`, { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="nt-wrapper" ref={dropdownRef}>
      <button 
        className="nt-trigger" 
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Toggle notifications"
      >
        <Bell size={22} className="nt-bell-icon" />
        {unreadCount > 0 && <span className="nt-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="nt-dropdown shadow">
          <div className="nt-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="nt-action-link" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="nt-list">
            {notifications.length === 0 ? (
              <div className="nt-empty">No new notifications</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`nt-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className="nt-item-dot" />
                  <div className="nt-item-content">
                    <p className="nt-message">{n.message}</p>
                    <span className="nt-time">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="nt-footer">
            <button className="nt-btn-clear" onClick={clearAll}>Clear All</button>
            <button className="nt-btn-view">View All</button>
          </div>
        </div>
      )}
    </div>
  );
}
