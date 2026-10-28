import React from 'react';
import logo from '../../assets/logo.png';
import './globalLogo.css';

export default function GlobalLogo({ className = '', layout = 'horizontal', hideTextDesktop = false }) {
  // layout can be 'horizontal' or 'vertical'
  return (
    <div className={`global-logo-container layout-${layout} ${className} ${hideTextDesktop ? 'hide-text-desktop' : ''}`}>
      <div className="global-logo-circle">
        <img src={logo} alt="Thisara Driving School Logo" className="global-logo-img" />
      </div>
      <div className="global-logo-text-wrapper">
        <span className="global-logo-text-title text-brand-red">THISARA</span>
        <span className="global-logo-text-subtitle text-brand-red">DRIVING SCHOOL</span>
      </div>
    </div>
  );
}
