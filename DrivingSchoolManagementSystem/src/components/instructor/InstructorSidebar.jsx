import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Library, 
  Users, 
  Calendar, 
  Car, 
  CheckSquare, 
  MapPin, 
  User,
  LogOut,
  Hash,
  MessageCircle
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import GlobalLogo from "../common/GlobalLogo";
import ContactAdmin from '../notifications/ContactAdmin';
import './instructorSidebar.css';

export default function InstructorSidebar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { name, designation, avatar, loading } = useUserProfile();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Still need userId for ContactAdmin
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const userId = user.userId;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/instructor' },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/instructor/notifications' },
    { id: 'materials', label: 'Study Materials', icon: <Library size={20} />, path: '/instructor/materials' },
    { id: 'students', label: 'Students', icon: <Users size={20} />, path: '/instructor/students' },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} />, path: '/instructor/schedule' },
    { id: 'vehicles', label: 'Vehicles', icon: <Car size={20} />, path: '/instructor/vehicles' },
    { id: 'attendance', label: 'Attendance', icon: <CheckSquare size={20} />, path: '/instructor/attendance' },
    { id: 'gps', label: 'GPS Tracking', icon: <MapPin size={20} />, path: '/instructor/gps' },
    { id: 'profile', label: 'My Profile', icon: <User size={20} />, path: '/instructor/profile' },
  ];

  const isActive = (path) => {
    if (path === '/instructor') {
      return location.pathname === '/instructor' || location.pathname === '/instructor/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleMenuScroll = (e) => {
    setIsScrolled(e.target.scrollTop > 0);
  };

  return (
    <aside className="ins-sidebar">
      {/* Logo Section */}
      <div className="ins-brand">
        <GlobalLogo layout="horizontal" />
      </div>

      {/* Menu Section */}
      <nav className="ins-nav" onScroll={handleMenuScroll}>
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`ins-menuItem ${isActive(item.path) ? 'ins-active' : ''}`}
          >
            <span className="ins-menuIcon">{item.icon}</span>
            <span className="ins-menuLabel">{item.label}</span>
          </Link>
        ))}

        {/* Contact Admin Action */}
        <button 
          className="ins-menuItem contact-btn-sidebar" 
          onClick={() => setIsContactOpen(true)}
          style={{ marginTop: 'auto', borderTop: '1px solid rgba(225, 27, 34, 0.1)', paddingTop: '1.5rem', background: 'transparent', border: 'none', width: '100%' }}
        >
          <span className="ins-menuIcon"><MessageCircle size={20} color="#E11B22" /></span>
          <span className="ins-menuLabel" style={{ color: '#E11B22', fontWeight: '700' }}>Contact Admin</span>
        </button>
      </nav>

      {/* Contact Admin Modal */}
      <ContactAdmin 
        senderId={userId} 
        senderRole="Instructor" 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

      {/* Professional User Profile Card */}
      <div className="ins-userPanel">
        <div className="ins-profileCard glass-card">
          <div className="ins-profileMain">
            <div className="ins-profileAvatar">
              {loading ? "" : avatar}
            </div>
            <div className="ins-profileDetail">
              <div className="ins-profileName">
                {loading ? <div className="skeleton skeleton-text skeleton-name"></div> : name}
              </div>
              <div className="ins-profileMeta">
                {loading ? <div className="skeleton skeleton-text skeleton-role"></div> : designation}
              </div>
            </div>
          </div>
          
          <button className="ins-profileLogoutBtn" onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/login';
          }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
