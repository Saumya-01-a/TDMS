import React from 'react';
import { Outlet } from 'react-router-dom';
import InstructorSidebar from '../components/instructor/InstructorSidebar';
import '../components/instructor/instructor.css';

export default function InstructorLayout() {
  return (
    <div className="instructor-page-container">
      <InstructorSidebar />
      <div className="instructor-main-content">
        <div className="instructor-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
