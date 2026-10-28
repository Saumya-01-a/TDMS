import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Library, 
  User, 
  Package, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  CheckSquare, 
  MapPin,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import GlobalLogo from '../common/GlobalLogo';
import ContactAdmin from '../notifications/ContactAdmin';
import './studentSidebar.css';

export default function StudentSidebar() {
  const location = useLocation();
  const { name, designation, avatar, loading } = useUserProfile();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Still need user object for ContactAdmin senderId
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
    { id: 'notifications', label: 'Notifications', path: '/student/notifications', icon: <Bell size={20} /> },
    { id: 'materials', label: 'Study Materials', path: '/student/materials', icon: <Library size={20} /> },
    { id: 'profile', label: 'My Profile', path: '/student/profile', icon: <User size={20} /> },
    { id: 'packages', label: 'Packages', path: '/student/packages', icon: <Package size={20} /> },
    { id: 'schedule', label: 'Schedule', path: '/student/schedule', icon: <Calendar size={20} /> },
    { id: 'progress', label: 'Progress', path: '/student/progress', icon: <TrendingUp size={20} /> },
    { id: 'payment', label: 'Payment', path: '/student/payment', icon: <CreditCard size={20} /> },
    { id: 'attendance', label: 'Attendance', path: '/student/attendance', icon: <CheckSquare size={20} /> },
    { id: 'routes', label: 'My Routes', path: '/student/routes', icon: <MapPin size={20} /> },
  ];

  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="stuSb__sidebar">
      {/* Brand Section */}
      <div className="stuSb__brand">
        <GlobalLogo layout="horizontal" />
      </div>

      {/* Navigation Menu */}
      <nav className="stuSb__nav">
        <ul className="stuSb__menuList">
          {menuItems.map((item) => (
            <li key={item.id} className="stuSb__menuItem">
              <Link
                to={item.path}
                className={`stuSb__menuLink ${isActive(item.path) ? 'stuSb__active' : ''}`}
              >
                <span className="stuSb__menuIcon">{item.icon}</span>
                <span className="stuSb__menuLabel">{item.label}</span>
              </Link>
            </li>
          ))}
          
          {/* Contact Admin Action */}
          <li className="stuSb__menuItem" style={{ marginTop: 'auto', borderTop: '1px solid rgba(225, 27, 34, 0.1)', paddingTop: '1.5rem' }}>
            <button 
              className="stuSb__menuLink contact-btn-sidebar" 
              onClick={() => setIsContactOpen(true)}
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <span className="stuSb__menuIcon"><MessageCircle size={20} color="#E11B22" /></span>
              <span className="stuSb__menuLabel" style={{ color: '#E11B22', fontWeight: '800' }}>Contact Admin</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Contact Admin Modal */}
      <ContactAdmin 
        senderId={user.userId} 
        senderRole="Student" 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

      {/* User Panel */}
      <div className="stuSb__userPanel">
        <div className="stuSb__userCard glass-card">
          <div className="stuSb__userAvatar">{loading ? "" : avatar}</div>
          <div className="stuSb__userInfo">
            <div className="stuSb__username">
              {loading ? <div className="skeleton skeleton-text skeleton-name"></div> : name}
            </div>
            <div className="stuSb__designation">
              {loading ? <div className="skeleton skeleton-text skeleton-role"></div> : designation}
            </div>
            <button className="stuSb__logoutBtn" onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
