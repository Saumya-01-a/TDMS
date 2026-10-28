import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Save,
  User,
  History,
  AlertCircle,
  Trash2,
  Download,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import './adminAttendance.css';

const SESSIONS = [
  { id: 1, name: 'Session 1', time: '08:00 AM - 10:00 AM' },
  { id: 2, name: 'Session 2', time: '10:00 AM - 12:00 PM' },
  { id: 3, name: 'Session 3', time: '01:00 PM - 03:00 PM' },
  { id: 4, name: 'Session 4', time: '03:00 PM - 05:00 PM' },
];

export default function AdminAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [pendingMarks, setPendingMarks] = useState({}); 
  const [showModal, setShowModal] = useState(false);
  const [activeCell, setActiveCell] = useState(null); 
  const [selection, setSelection] = useState({ status: 'Present', session: 1 });
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 🗓️ Dynamic Day Calculation
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentMonth, currentYear]);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    fetchInitialData();
  }, [currentMonth, currentYear]);

  const fetchInitialData = async () => {
    console.log("🛠️ LOG: fetchInitialData triggered");
    setLoading(true);
    try {
      const mon = currentMonth.toString().padStart(2, '0');
      const apiHost = "http://127.0.0.1:3000";
      
      console.log(`📡 Fetching grid for ${mon}/${currentYear}`);
      const gridRes = await fetch(`${apiHost}/admin/attendance-grid?month=${mon}&year=${currentYear}`);
      const gridData = await gridRes.json();
      console.log("📦 Grid received:", gridData.students?.length, "students found.");

      console.log("📡 Fetching stats...");
      const statRes = await fetch(`${apiHost}/admin/attendance-stats?month=${mon}&year=${currentYear}`);
      const statData = await statRes.json();
      
      console.log("📡 Fetching logs...");
      const historyRes = await fetch(`${apiHost}/admin/attendance-logs`);
      const historyData = await historyRes.json();

      if (gridData.ok) {
        setStudents(gridData.students || []);
        setMonthlyRecords(gridData.attendance || []);
      }
      if (statData.ok) setStats(statData.stats || { present: 0, late: 0, absent: 0 });
      if (historyData.ok) setHistory(historyData.history || historyData.logs || []);
      
      setPendingMarks({}); 
    } catch (err) {
      console.error("🚨 FETCH ERROR:", err);
    } finally {
      setLoading(false);
      console.log("🏁 Fetch complete.");
    }
  };

  const navigateMonth = (dir) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m > 12) { m = 1; y++; }
    else if (m < 1) { m = 12; y--; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const handleCellClick = (studentId, day) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setActiveCell({ studentId, date: dateStr });
    
    const existing = monthlyRecords.find(r => r.student_id === studentId && r.attendance_date.startsWith(dateStr)) 
                    || pendingMarks[`${studentId}_${dateStr}`];

    if (existing) {
      setSelection({ 
        status: existing.status, 
        session: existing.session_number || 1 
      });
    } else {
      setSelection({ status: 'Present', session: 1 });
    }
    setShowModal(true);
  };

  const saveToPending = () => {
    const { studentId, date } = activeCell;
    const sessionTimes = SESSIONS.find(s => s.id === selection.session);

    const newMark = {
      student_id: studentId,
      instructor_id: 'SYSTEM_ADMIN', // Admin marking
      attendance_date: date,
      status: selection.status,
      session_number: selection.status === 'Absent' ? 1 : selection.session, // Session 1 default for absent to satisfy backend requirement
      time_slot: selection.status === 'Absent' ? null : sessionTimes.time,
    };

    setPendingMarks(prev => ({
      ...prev,
      [`${studentId}_${date}`]: newMark
    }));
    setShowModal(false);
  };

  const submitAttendance = async () => {
    const recordsToSave = Object.values(pendingMarks);
    if (recordsToSave.length === 0) return alert("No new marks to synchronize.");

    try {
      const res = await fetch('http://127.0.0.1:3000/admin/attendance-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave })
      });
      const data = await res.json();
      if (data.ok) {
        fetchInitialData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/admin/attendance-clear`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        setHistory([]);
        setMonthlyRecords([]);
        setStats({ present: 0, late: 0, absent: 0 });
        setShowClearModal(false);
      }
    } catch (err) {
      console.error("Clear logs error:", err);
    } finally {
      setClearing(false);
    }
  };

  const handleCellStatus = (studentId, day) => {
    if (!monthlyRecords || !Array.isArray(monthlyRecords)) return null;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const pending = pendingMarks[`${studentId}_${dateStr}`];
    if (pending) return pending;

    return monthlyRecords.find(r => 
      String(r.student_id) === String(studentId) && 
      r.attendance_date && 
      r.attendance_date.toString().startsWith(dateStr)
    );
  };

  const filteredStudents = (students || []).filter(s => {
    if (!s) return false;
    const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    return name.includes((searchTerm || '').toLowerCase());
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const safeFormatDate = (dateStr) => {
    try {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return format(d, 'dd MMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="adm-attendance-container">
      <header className="adm-header-banner">
        <div className="adm-banner-left">
          <h1>Global Verification Matrix</h1>
          <p>Administrative oversight and lesson progression audit</p>
        </div>
        <button className="danger-purge" onClick={() => setShowClearModal(true)}>
          <Trash2 size={18} /> Purge Records
        </button>
      </header>

      {/* 📊 SUMMARY CARDS */}
      <div className="summary-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="summary_card_info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8892b0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} color="#10b981" /> Present Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{stats.present}</div>
          </div>
        </div>
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #fcc419', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="summary_card_info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8892b0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Clock size={18} color="#fcc419" /> Late Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fcc419' }}>{stats.late}</div>
          </div>
        </div>
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="summary_card_info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8892b0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} color="#ef4444" /> Absent Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{stats.absent}</div>
          </div>
        </div>
      </div>

      {/* 📅 REGISTER GRID */}
      <div className="adm-grid-matrix-card glass-card" style={{ padding: '1.5rem' }}>
        <div className="adm-controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <div className="adm-month-nav-compact" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="adm-nav-btn-sm" onClick={() => navigateMonth(-1)}><ChevronLeft size={20} /></button>
            <div className="adm-current-view" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#fff' }}>
              <Calendar size={22} color="#E11B22" />
              <span>{months[currentMonth-1]} {currentYear}</span>
            </div>
            <button className="adm-nav-btn-sm" onClick={() => navigateMonth(1)}><ChevronRight size={20} /></button>
          </div>
          
          <div className="adm-search-box" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={18} color="#8892b0" />
            <input 
              type="text" 
              placeholder="Audit student identity..." 
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', width: '100%', fontWeight: 600 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="adm-actions-group" style={{ display: 'flex', gap: '1rem' }}>
            <button className="adm-btn-action primary-red" onClick={submitAttendance} disabled={Object.keys(pendingMarks).length === 0}>
              <Save size={18} /> <span>Synchronize Grid</span>
            </button>
            <button className="adm-btn-action" onClick={fetchInitialData}>
              {loading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
            </button>
          </div>
        </div>

        <div className="adm-table-scroll-container" style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table className="adm-grid-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#8892b0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Identity</th>
                {daysArray.map(day => (
                  <th key={day} style={{ padding: '1rem', textAlign: 'center', color: '#8892b0', fontSize: '0.7rem' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student?.student_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#fff' }}>{student?.first_name} {student?.last_name}</td>
                  {daysArray.map(day => {
                    const mark = handleCellStatus(student?.student_id, day);
                    return (
                      <td key={day} style={{ padding: '0.25rem' }}>
                        <div 
                          className={`att-cell-admin ${mark?.status ? mark.status.toLowerCase() : ''}`}
                          onClick={() => handleCellClick(student?.student_id, day)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            background: !mark ? 'rgba(255,255,255,0.03)' : (mark.status === 'Present' ? 'rgba(16, 185, 129, 0.2)' : (mark.status === 'Absent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(252, 196, 25, 0.2)')),
                            color: !mark ? 'rgba(255,255,255,0.1)' : (mark.status === 'Present' ? '#10b981' : (mark.status === 'Absent' ? '#ef4444' : '#fcc419')),
                            border: mark && pendingMarks[`${student.student_id}_${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`] ? '2px solid #E11B22' : 'none'
                          }}
                        >
                          {mark ? (mark.status === 'Absent' ? 'A' : (mark.session_number || '•')) : '+'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                   <td colSpan={daysInMonth + 1} style={{ textAlign: 'center', padding: '5rem', color: '#8892b0' }}>
                      Zero records found for the global student audit.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
             <div style={{ padding: '5rem', textAlign: 'center' }}>
                <Loader2 size={32} className="spin" color="#E11B22" />
             </div>
          )}
        </div>
      </div>

      <section className="historical-records-section" style={{ marginTop: '3rem' }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <History size={24} color="#E11B22" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>Administrative Audit Logs</h2>
        </div>
        <div className="historical-table-card glass-card" style={{ overflow: 'hidden' }}>
          <table className="historical-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#8892b0', fontSize: '0.75rem' }}>Log Date</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#8892b0', fontSize: '0.75rem' }}>Student Identity</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#8892b0', fontSize: '0.75rem' }}>Verification</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#8892b0', fontSize: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(history || []).map((rec, idx) => (
                <tr key={rec.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: '#fff', fontSize: '0.9rem' }}>
                    {safeFormatDate(rec.attendance_date)}
                  </td>
                  <td style={{ padding: '1rem', color: '#fff', fontWeight: 700 }}>{rec.first_name} {rec.last_name}</td>
                  <td style={{ padding: '1rem', color: '#8892b0', fontSize: '0.85rem' }}>
                    {rec.status === 'Absent' ? '-' : `Slot ${rec.session_number} verified by ${rec.instructor_fname || 'Admin'}`}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        fontWeight: 800, 
                        fontSize: '0.7rem', 
                        background: rec.status === 'Present' ? 'rgba(16, 185, 129, 0.15)' : (rec.status === 'Absent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(252, 196, 25, 0.15)'), 
                        color: rec.status === 'Present' ? '#10b981' : (rec.status === 'Absent' ? '#ef4444' : '#fcc419') 
                    }}>
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📝 MARKING MODAL */}
      {showModal && (
        <div className="marking-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="marking-modal glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <ShieldCheck size={32} color="#E11B22" />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>Administrative Override</h3>
            </div>
            
            <p style={{ fontSize: '0.7rem', color: '#8892b0', marginBottom: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AUDIT VERIFICATION STATUS</p>
            <div className="status-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              {['Present', 'Late', 'Absent'].map(s => (
                <div 
                  key={s} 
                  className={`status-opt ${selection.status === s ? 'active' : ''}`}
                  onClick={() => setSelection(prev => ({ ...prev, status: s }))}
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: selection.status === s ? '#fff' : '#8892b0',
                    background: selection.status === s ? '#E11B22' : 'rgba(255,255,255,0.03)'
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {selection.status !== 'Absent' && (
              <>
                <p style={{ fontSize: '0.7rem', color: '#8892b0', marginBottom: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>ASSIGN SYSTEM SESSION</p>
                <div className="session-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                  {SESSIONS.map(session => (
                    <div 
                      key={session.id} 
                      className={`session-opt ${selection.session === session.id ? 'active' : ''}`}
                      onClick={() => setSelection(prev => ({ ...prev, session: session.id }))}
                      style={{ 
                          padding: '1rem', 
                          borderRadius: '12px', 
                          border: selection.session === session.id ? '1px solid #E11B22' : '1px solid rgba(255,255,255,0.1)', 
                          cursor: 'pointer',
                          background: selection.session === session.id ? 'rgba(225, 27, 34, 0.05)' : 'none'
                      }}
                    >
                      <div style={{ color: selection.session === session.id ? '#E11B22' : '#fff', fontWeight: 900, fontSize: '0.85rem' }}>{session.name}</div>
                      <div style={{ color: '#8892b0', fontSize: '0.7rem' }}>{session.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <button className="btn-secondary" style={{ padding: '1.25rem', borderRadius: '12px', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setShowModal(false)}>DISCARD</button>
              <button className="btn-primary" style={{ padding: '1.25rem', borderRadius: '12px', fontWeight: 800, background: '#E11B22', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={saveToPending}>CONFIRM OVERRIDE</button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ PURGE MODAL */}
      {showClearModal && (
        <div className="marking-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="marking-modal glass-card" style={{ textAlign: 'center', maxWidth: '450px', padding: '3rem' }}>
            <Trash2 size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Confirm System Purge</h3>
            <p style={{ color: '#8892b0', marginBottom: '3rem' }}>Warning: You are initiating a destructive purge of all historical attendance records globally.</p>

            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <button className="btn-secondary" style={{ padding: '1.25rem', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 800 }} onClick={() => setShowClearModal(false)}>ABORT</button>
              <button 
                className="btn-danger" 
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1.25rem', borderRadius: '12px', fontWeight: 800 }}
                onClick={handleClearLogs}
                disabled={clearing}
              >
                {clearing ? 'PURGING...' : 'YES, PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
