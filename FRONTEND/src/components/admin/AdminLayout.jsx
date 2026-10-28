import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './sidebar.css';

export default function AdminLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #070a10 0%, #0f1420 50%, #070a10 100%)',
      position: 'relative'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(185, 28, 28, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-100px',
        right: '10%',
        pointerEvents: 'none',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>

      <Sidebar />
      <main style={{
        marginLeft: '280px', // Matches sidebar width
        flex: 1,
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
