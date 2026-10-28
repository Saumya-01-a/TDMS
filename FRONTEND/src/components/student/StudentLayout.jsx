import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import './studentLayout.css';

export default function StudentLayout() {
  return (
    <div className="stu_layout__shell">
      <StudentSidebar />
      <main className="stu_layout__main">
        <div className="stu_layout__glow"></div>
        <div className="stu_layout__page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
