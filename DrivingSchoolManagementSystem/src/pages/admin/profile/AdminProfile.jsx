import React from 'react';
import './adminProfile.css';

export default function AdminProfile() {
  return (
    <div className="adm-dashboard">
      <div className="adm-container">
        <h1 className="adm-title">My Profile</h1>

        {/* Profile Banner */}
        <div className="adm-profile-banner">
          <div className="adm-profile-avatar">
            <span>A</span>
          </div>
          <div className="adm-profile-info">
            <h2 className="adm-profile-name">Admin User</h2>
            <p className="adm-profile-role">Administrator</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="adm-content-card">
          <h3 className="adm-section-title">Personal Information</h3>
          <form className="adm-profile-form">
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-form-label">First Name</label>
                <input type="text" className="adm-form-input" defaultValue="Admin" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Last Name</label>
                <input type="text" className="adm-form-input" defaultValue="User" />
              </div>
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-form-label">Email</label>
                <input type="email" className="adm-form-input" defaultValue="admin@example.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Phone</label>
                <input type="tel" className="adm-form-input" defaultValue="+94 77 123 4567" />
              </div>
            </div>
            <div className="adm-form-actions">
              <button type="button" className="adm-secondary-btn">Cancel</button>
              <button type="submit" className="adm-primary-btn">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
