import React from 'react';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import './instructorNotifications.css';

export default function InstructorNotifications() {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  return (
    <div className="instr-notifications-page">
      <div className="instr-notifications-card">
        <NotificationCenter userId={user.userId} role="Instructor" />
      </div>
    </div>
  );
}
