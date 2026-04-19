import React from 'react';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import './studentNotifications.css';

export default function StudentNotifications() {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  return (
    <div className="student-notifications-page">
      <div className="student-notifications-card">
        <NotificationCenter userId={user.userId} role="Student" />
      </div>
    </div>
  );
}
