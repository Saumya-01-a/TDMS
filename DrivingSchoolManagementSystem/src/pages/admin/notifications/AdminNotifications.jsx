import React, { useState } from 'react';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import MessageComposer from '../../../components/notifications/MessageComposer';
import './adminNotifications.css';

export default function AdminNotifications() {
  // Get admin info from storage
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMessageSent = () => {
    // Refresh the notification center to show the sent message if needed
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="adm-notifications-page">
      <div className="adm-notifications-grid">
        <div className="adm-composer-section">
          <MessageComposer adminId={user.userId} onMessageSent={handleMessageSent} />
        </div>
        
        <div className="adm-center-section">
          <NotificationCenter key={refreshKey} userId={user.userId} role="Admin" />
        </div>
      </div>
    </div>
  );
}