import React, { useState } from 'react';
import './notifications.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Payment Received',
      description: 'Your payment for the driving package has been successfully processed.',
      date: '2 hours ago',
      type: 'success',
      isNew: true,
    },
    {
      id: 2,
      title: 'New Study Material',
      description: 'Your instructor has uploaded new study materials for Traffic Rules.',
      date: '5 hours ago',
      type: 'info',
      isNew: true,
    },
    {
      id: 3,
      title: 'Lesson Reminder',
      description: 'You have a lesson scheduled tomorrow at 10:00 AM with Ahmed Hassan.',
      date: '1 day ago',
      type: 'warning',
      isNew: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isNew: false })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isNew: false } : n
    ));
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return '#22c55e';
      case 'info': return '#3b82f6';
      case 'warning': return '#eab308';
      default: return '#9ca3af';
    }
  };

  return (
    <div className="notifications-page-wrapper">
      <h1 className="page-title">Notifications</h1>

      <div className="notifications-header-bar">
        <div className="header-bar-left">
          <span className="bell-icon">🔔</span>
          <span className="unread-count">{unreadCount} unread</span>
        </div>
        <button className="mark-all-btn" onClick={handleMarkAllRead}>
          Mark All as Read
        </button>
      </div>

      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className="notification-card"
            style={{ borderLeftColor: getTypeColor(notification.type) }}
          >
            {notification.isNew && <div className="new-badge">NEW</div>}
            
            <div className="notification-body">
              <h3 className="notification-title">{notification.title}</h3>
              <p className="notification-description">{notification.description}</p>
              <p className="notification-time">{notification.date}</p>
            </div>

            <div className="notification-actions">
              {notification.isNew && (
                <button 
                  className="action-btn check-btn"
                  onClick={() => handleMarkRead(notification.id)}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDelete(notification.id)}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
