import React from 'react';
import { Outlet } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import './instructorLayout.css';

export default function InstructorLayout() {
  return (
    <div className="ins-page">
      <InstructorSidebar />
      <main className="ins-mainContent">
        <div className="ins-contentWrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
