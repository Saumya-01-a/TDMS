import React, { useState } from 'react';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import MessageComposer from '../../../components/notifications/MessageComposer';
import './adminNotifications.css';

export default function AdminNotifications() {
  // Get admin info from storage (Standardized)
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const uid = user.user_id || user.userId;

  const [refreshKey, setRefreshKey] = useState(0);

  const handleMessageSent = () => {
    // Refresh the notification center to show the sent message if needed
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="adm-notif__main" id="id_adm_notif_main">
      <div className="adm-notif__container">
        <header className="adm-notif__header">
          <h1 className="adm-notif__title">Communications Hub</h1>
          <p className="adm-notif__subtitle">Orchestrate administrative broadcasts and resolve student inquiries</p>
        </header>

        <div className="adm-notif__grid">
          <div className="adm-notif__composer glass-panel">
            <h2 className="adm-section__title">Broadcast Message</h2>
            <MessageComposer adminId={uid} onMessageSent={handleMessageSent} />
          </div>
          
          <div className="adm-notif__center glass-panel">
            <h2 className="adm-section__title">Administrative Inbox</h2>
            <NotificationCenter key={refreshKey} userId={uid} role="Admin" />
          </div>
        </div>
      </div>
    </div>
  );
}