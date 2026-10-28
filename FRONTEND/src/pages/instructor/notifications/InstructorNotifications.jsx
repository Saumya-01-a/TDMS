import React from 'react';
import InstructorSidebar from '../../../components/instructor/InstructorSidebar';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import MessageComposer from '../../../components/notifications/MessageComposer';
import './instructorNotifications.css';

export default function InstructorNotifications() {
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const uid = user.user_id || user.userId || user.instructor_id;

  return (
    <div className="insNotif__pageWrapper">
      <InstructorSidebar />
      
      <main className="insNotif__main">
        <div className="insNotif__container">
          <div className="insNotif__grid">
            <div className="insNotif__card glass-panel">
              <NotificationCenter userId={uid} role="Instructor" />
            </div>
            
            <div className="insNotif__composer glass-panel">
              <MessageComposer senderId={uid} senderRole="Instructor" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
