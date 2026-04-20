import React from 'react';
import StudentSidebar from '../../../components/student/StudentSidebar';
import NotificationCenter from '../../../components/notifications/NotificationCenter';
import './studentNotifications.css';

export default function StudentNotifications() {
  const userString = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(userString);
  const userId = user.userId || user.user_id;

  return (
    <div className="stdNotif__pageWrapper">
      <StudentSidebar />
      
      <main className="stdNotif__main">
        <div className="stdNotif__container">
          <div className="stdNotif__card glass-panel">
             <NotificationCenter userId={userId} role="Student" />
          </div>
        </div>
      </main>
    </div>
  );
}
