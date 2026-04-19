import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  User, 
  Download, 
  Search, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  X,
  History,
  AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import './adminAttendance.css';

export default function AdminAttendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchGridData();
  }, [currentMonth, currentYear]);

  // Real-time synchronization
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('student_update', () => {
      console.log('🔄 Attendance Grid sync triggered by student_update');
      fetchGridData();
    });
    return () => socket.disconnect();
  }, []);

  const fetchGridData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/attendance-grid?month=${currentMonth}&year=${currentYear}`);
      const data = await res.json();
      if (data && data.ok) {
        setLogs(data.logs || []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Audit Fetch Error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    // Explicitly set the last day of the current month
    // Note: new Date(year, month, 0) gets the last day of the month before 'month' index.
    // If currentMonth is 1-indexed (1=Jan, 4=Apr), then new Date(y, 4, 0) is last day of April (30).
    const d = new Date(currentYear, currentMonth, 0);
    return d.getDate();
  }, [currentMonth, currentYear]);

  const daysArray = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= daysInMonth; i++) {
        arr.push(i);
    }
    return arr;
  }, [daysInMonth]);

  const groupedData = useMemo(() => {
    const map = {};
    if (!logs) return [];
    
    logs.forEach(log => {
      const sName = log.student_name;
      if (!map[sName]) map[sName] = { name: sName, attendance: {} };
      const day = new Date(log.attendance_date).getDate();
      map[sName].attendance[day] = log;
    });

    return Object.values(map).filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, searchTerm]);

  const navigateMonth = (dir) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m > 12) { m = 1; y++; }
    else if (m < 1) { m = 12; y--; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const handleExportCSV = () => {
    const headers = ["Student Identity", ...daysArray.map(d => `Day ${d}`)];
    const rows = groupedData.map(student => {
      const row = [student.name];
      daysArray.forEach(day => {
        const entry = student.attendance[day];
        row.push(entry ? entry.status : "-");
      });
      return row;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Administrative_Audit_${months[currentMonth-1]}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/attendance-clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) { setShowClearModal(false); fetchGridData(); }
    } catch (err) { alert("Administrative subsystem communication failure"); }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="adm-attendance-container">
      <style>{`
        .adm-table-scroll-container {
          display: block !important;
          max-width: 100% !important;
          max-height: 500px !important;
          overflow: auto !important;
          position: relative !important;
        }
        .adm-table-scroll-container::-webkit-scrollbar { height: 10px !important; }
        .adm-table-scroll-container::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5) !important; border-radius: 10px; }
        .adm-table-scroll-container::-webkit-scrollbar-thumb { background: #ff4d4d !important; border-radius: 10px; }

        .adm-grid-table {
          width: max-content !important; 
          min-width: 2200px !important; /* FORCED EXPANSION */
          border-collapse: separate !important;
          border-spacing: 0;
        }
        .day-header {
          min-width: 65px !important;
          width: 65px !important;
          flex-shrink: 0 !important;
        }
        .adm-grid-table th:first-child,
        .adm-grid-table td:first-child {
          position: sticky !important;
          left: 0 !important;
          z-index: 100 !important;
          background: #111827 !important;
          min-width: 280px !important;
          width: 280px !important;
        }
        .adm-grid-table th:first-child { z-index: 110 !important; }
      `}</style>
      {/* 🏙️ ADMIN HEADER */}
      <header className="adm-header-banner">
        <div className="adm-banner-left">
          <h1>Attendance Oversight</h1>
          <p>Global verification matrix for theoretical and practical modules</p>
        </div>
        <button className="danger-purge" id="purge-audit-btn" onClick={() => setShowClearModal(true)}>
          <Trash2 size={18} />
          <span>Purge Records</span>
        </button>
      </header>

      {/* 🚀 PERFECT MIRROR CONTROL ROW */}
      <div className="adm-controls-row">
        <div className="adm-month-nav-compact">
           <button className="adm-nav-btn-sm" onClick={() => navigateMonth(-1)}><ChevronLeft size={20} /></button>
           <div className="adm-current-view">
             <Calendar size={22} style={{ color: '#E11B22' }} />
             <span>{months[currentMonth-1]} {currentYear}</span>
           </div>
           <button className="adm-nav-btn-sm" onClick={() => navigateMonth(1)}><ChevronRight size={20} /></button>
        </div>

        <div className="adm-search-box">
           <Search size={18} style={{ color: '#8892b0' }} />
           <input 
             type="text" 
             placeholder="Audit student identity..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="adm-actions-group">
          <button className="adm-btn-action" onClick={handleExportCSV}>
            <Download size={18} /> <span>Report</span>
          </button>
          <button className="adm-btn-action primary-red" onClick={fetchGridData}>
            {loading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* 📊 THE "STRICT BOX" SCROLLABLE GRID CONTAINER */}
      <div className="adm-grid-matrix-card">
        <div className="adm-matrix-legend">
           <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div> Present</div>
           <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> Absent</div>
           <div className="legend-item"><div className="legend-dot" style={{ background: '#fcc419' }}></div> Late</div>
        </div>

        {/* 🧊 THE DEDICATED SCROLLABLE BOX */}
        <div className="adm-table-scroll-container">
           <table className="adm-grid-table">
             <thead>
               <tr>
                  <th>Student Identity</th>
                  {daysArray.map(d => <th key={d} className="day-header">{d}</th>)}
               </tr>
             </thead>
             <tbody>
                {groupedData.map((student, idx) => (
                  <tr key={idx}>
                     <td>{student.name}</td>
                     {daysArray.map(day => {
                       const log = student.attendance[day];
                       return (
                         <td key={day}>
                            <div 
                              className={`adm-audit-dot ${log ? `dot-${log.status.toLowerCase()}` : ''}`}
                              onClick={() => log && setSelectedRecord(log)}
                            >
                              {log ? (log.status === 'Absent' ? 'A' : (log.session_number || '•')) : <span style={{ opacity: 0.2 }}>•</span>}
                            </div>
                         </td>
                       );
                     })}
                  </tr>
                ))}
                {groupedData.length === 0 && !loading && (
                   <tr>
                      <td colSpan={daysInMonth + 1} style={{ textAlign: 'center', padding: '10rem' }}>
                         <AlertCircle size={48} style={{ color: '#8892b0', margin: '0 auto 1.5rem' }} />
                         <p style={{ color: '#8892b0', fontSize: '1.1rem', fontWeight: 700 }}>No audit records found in this month.</p>
                      </td>
                   </tr>
                )}
             </tbody>
           </table>
           {loading && (
              <div style={{ padding: '8rem', textAlign: 'center' }}>
                 <Loader2 size={48} className="spin" color="#E11B22" style={{ margin: '0 auto' }} />
              </div>
           )}
        </div>
      </div>

      {/* 📋 SESSION AUDIT MODAL (Read-Only) */}
      {selectedRecord && (
        <div className="diag-modal-overlay">
           <div className="diag-modal-popup glass-card shadow-2xl">
              <button className="diag-close" onClick={() => setSelectedRecord(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#8892b0', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              
              <div style={{ background: selectedRecord.status === 'Present' ? '#10b981' : '#ef4444', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                  {selectedRecord.status === 'Present' ? <ShieldCheck size={40} /> : <AlertTriangle size={40} />}
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>Session Audit</h2>
              <p style={{ color: '#E11B22', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '3rem' }}>{selectedRecord.student_name}</p>

              <div style={{ textAlign: 'left', display: 'grid', gap: '1.25rem', marginBottom: '3rem' }}>
                 {[
                   { icon: <Calendar size={20} />, label: 'Audit Date', val: new Date(selectedRecord.attendance_date).toDateString() },
                   { icon: <User size={20} />, label: 'Instructor', val: selectedRecord.instructor_name || "System Administrator" },
                   { icon: <Clock size={20} />, label: 'Time Slot', val: selectedRecord.time_slot || "08:00 AM - 10:00 AM" },
                   { icon: <History size={20} />, label: 'Verification', val: 'ARCHIVAL LOCKED', style: { color: '#10b981', fontWeight: 800 } }
                 ].map((row, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'rgba(2, 12, 27, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#E11B22' }}>{row.icon}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <label style={{ fontSize: '0.7rem', color: '#8892b0', fontWeight: 700, textTransform: 'uppercase' }}>{row.label}</label>
                         <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, ...row.style }}>{row.val}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="diag-dismiss-btn" onClick={() => setSelectedRecord(null)}>Dismiss Audit</button>
           </div>
        </div>
      )}

      {/* 🗑️ PURGE CONFIRMATION */}
      {showClearModal && (
        <div className="diag-modal-overlay">
           <div className="diag-modal-popup glass-card" style={{ maxWidth: '450px' }}>
              <div style={{ background: '#ef4444', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#fff' }}><AlertTriangle size={40} /></div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Purge Logs</h2>
              <p style={{ color: '#8892b0', marginBottom: '3rem' }}>You are initiating a permanent purge of historical sessions. This action cannot be reversed.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                 <button className="adm-btn-action" style={{ padding: '1.25rem' }} onClick={() => setShowClearModal(false)}>Abort</button>
                 <button className="diag-dismiss-btn" style={{ padding: '1.25rem', fontSize: '0.9rem' }} onClick={handleClearHistory}>Confirm Purge</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
