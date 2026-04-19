import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Library, 
  Users, 
  UserPlus, 
  Car, 
  Package, 
  CreditCard, 
  Calendar, 
  CheckSquare, 
  MapPin, 
  FileEdit, 
  User,
  LogOut
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import logo from "../../assets/logo.png";
import GlobalLogo from "../common/GlobalLogo";
import './sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const { name, designation, avatar, loading } = useUserProfile();

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/admin/notifications' },
    { id: 'materials', label: 'Study Materials', icon: <Library size={20} />, path: '/admin/materials' },
    { id: 'students', label: 'Students', icon: <Users size={20} />, path: '/admin/students' },
    { id: 'instructors', label: 'Instructors', icon: <UserPlus size={20} />, path: '/admin/instructors' },
    { id: 'vehicles', label: 'Vehicles', icon: <Car size={20} />, path: '/admin/vehicles' },
    { id: 'packages', label: 'Packages', icon: <Package size={20} />, path: '/admin/packages' },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} />, path: '/admin/appointments' },
    { id: 'attendance', label: 'Attendance', icon: <CheckSquare size={20} />, path: '/admin/attendance' },
    { id: 'tracking', label: 'GPS Tracking', icon: <MapPin size={20} />, path: '/admin/tracking' },
    { id: 'exams', label: 'Trial Exams', icon: <FileEdit size={20} />, path: '/admin/exams' },
    { id: 'profile', label: 'My Profile', icon: <User size={20} />, path: '/admin/profile' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="ins-brand">
        <GlobalLogo layout="horizontal" />
      </div>

      {/* Menu items */}
      <nav className="sidebar-menu">
        {/* Static Dashboard Link (No Active State) */}
        <Link 
          to="/admin" 
          className="menu-item text-slate-400"
        >
          <span className="menu-icon"><LayoutDashboard size={20} /></span>
          <span className="menu-label">Dashboard</span>
        </Link>

        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'bg-white/10 border-l-4 border-red-600' : 'text-slate-400'}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card Section */}
      <div className="ins-userPanel">
        <div className="ins-profileCard glass-card">
          <div className="ins-profileTop">
            <div className="ins-profileAvatar">
              {loading ? "" : avatar}
            </div>
            <div className="ins-profileInfo">
              {loading ? (
                <>
                  <div className="ins-profileName skeleton skeleton-text skeleton-name"></div>
                  <div className="ins-profileRole skeleton skeleton-text skeleton-role"></div>
                </>
              ) : (
                <>
                  <div className="ins-profileName">{name}</div>
                  <div className="ins-profileRole">{designation}</div>
                </>
              )}
            </div>
          </div>
          <button className="ins-profileLogout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
