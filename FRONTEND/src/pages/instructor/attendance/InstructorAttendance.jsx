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
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import './instructorAttendance.css';

const SESSIONS = [
  { id: 1, name: 'Session 1', time: '08:00 AM - 10:00 AM' },
  { id: 2, name: 'Session 2', time: '10:00 AM - 12:00 PM' },
  { id: 3, name: 'Session 3', time: '01:00 PM - 03:00 PM' },
  { id: 4, name: 'Session 4', time: '03:00 PM - 05:00 PM' },
];

export default function InstructorAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [pendingMarks, setPendingMarks] = useState({}); // { studentId_date: record }
  const [showModal, setShowModal] = useState(false);
  const [activeCell, setActiveCell] = useState(null); // { studentId, date }
  const [selection, setSelection] = useState({ status: 'Present', session: 1 });
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Standardized Identity Resolution (Matches Dashboard)
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const instructorId = user.user_id || user.userId || user.instructor_id || 'INST-DEFAULT';

  // 🗓️ Dynamic Day Calculation
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentMonth, currentYear]);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    fetchInitialData();
  }, [currentMonth, currentYear]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsRes, attendRes, historyRes] = await Promise.all([
        fetch(`http://127.0.0.1:3000/instructor/students/${instructorId}`),
        fetch(`http://127.0.0.1:3000/instructor/attendance/${instructorId}/${currentYear}/${currentMonth.toString().padStart(2, '0')}`),
        fetch(`http://127.0.0.1:3000/instructor/attendance-history/${instructorId}`)
      ]);

      const studentsData = await studentsRes.json();
      const attendData = await attendRes.json();
      const historyData = await historyRes.json();

      if (studentsData.ok) setStudents(studentsData.students);
      if (attendData.ok) setMonthlyRecords(attendData.attendance);
      if (historyData.ok) setHistory(historyData.history);
      
      setPendingMarks({}); 
    } catch (err) {
      console.error("Fetch attendance error:", err);
    } finally {
      setLoading(false);
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
      instructor_id: instructorId,
      attendance_date: date,
      status: selection.status,
      session_number: selection.status === 'Absent' ? null : selection.session,
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
    if (recordsToSave.length === 0) return alert("No new marks to save.");

    try {
      const res = await fetch('http://127.0.0.1:3000/instructor/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave })
      });
      const data = await res.json();
      if (data.ok) {
        alert("Attendance synchronized successfully!");
        fetchInitialData();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/instructor/attendance-history/${instructorId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        setHistory([]);
        setShowClearModal(false);
        alert("Session logs cleared successfully.");
      }
    } catch (err) {
      console.error("Clear logs error:", err);
    } finally {
      setClearing(false);
    }
  };

  const handleDownloadReport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`http://127.0.0.1:3000/instructor/attendance-export/${instructorId}/${currentYear}/${currentMonth.toString().padStart(2, '0')}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_Report_${currentYear}_${currentMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report.");
    } finally {
      setExporting(false);
    }
  };

  const getCellStatus = (studentId, day) => {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const mark = pendingMarks[`${studentId}_${dateStr}`] 
               || monthlyRecords.find(r => r.student_id === studentId && r.attendance_date.startsWith(dateStr));
    return mark;
  };

  const stats = useMemo(() => {
    const allRecords = [...monthlyRecords, ...Object.values(pendingMarks)];
    return {
      present: allRecords.filter(r => r.status === 'Present').length,
      late: allRecords.filter(r => r.status === 'Late').length,
      absent: allRecords.filter(r => r.status === 'Absent').length,
    };
  }, [monthlyRecords, pendingMarks]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="instructor-attendance">
      <header className="attendance-header">
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900 }}>Monthly Register</h1>
        <p style={{ color: '#8892b0', marginTop: '-1.5rem', marginBottom: '3rem' }}>Instructor verification grid for lesson progression</p>
      </header>

      {/* 📊 SUMMARY CARDS */}
      <div className="summary-cards-row">
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="att__summary_info">
            <CheckCircle size={22} style={{ color: '#10b981' }} />
            <div className="summary_card_label">Present Total</div>
          </div>
          <div className="summary_card_value" style={{ color: '#10b981' }}>{stats.present}</div>
        </div>
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #fcc419' }}>
          <div className="att__summary_info">
            <Clock size={22} style={{ color: '#fcc419' }} />
            <div className="summary_card_label">Late Total</div>
          </div>
          <div className="summary_card_value" style={{ color: '#fcc419' }}>{stats.late}</div>
        </div>
        <div className="att__summary_card glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="att__summary_info">
            <AlertCircle size={22} style={{ color: '#ef4444' }} />
            <div className="summary_card_label">Absent Total</div>
          </div>
          <div className="summary_card_value" style={{ color: '#ef4444' }}>{stats.absent}</div>
        </div>
      </div>

      {/* 📅 REGISTER GRID */}
      <div className="attendance-register-card glass-card">
        <div className="register-controls">
          <div className="month-navigator">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}><ChevronLeft size={22} /></button>
            <div className="month-label-container">
              <Calendar size={24} style={{ color: '#E11B22' }} />
              <span className="current-month-label">{months[currentMonth-1]} {currentYear}</span>
            </div>
            <button className="nav-btn" onClick={() => navigateMonth(1)}><ChevronRight size={22} /></button>
          </div>
          
          <div className="register-actions" style={{ display: 'flex', gap: '1.25rem' }}>
            <button className="download_report_btn" onClick={handleDownloadReport} disabled={exporting}>
              <Download size={20} /> {exporting ? 'Exporting...' : 'Download Report'}
            </button>
            <button className="save_attendance_btn" onClick={submitAttendance}>
              <Save size={20} /> Synchronize Grid
            </button>
          </div>
        </div>

        <div className="register-table-wrapper">
          <table className="attendance-grid-table">
            <thead>
              <tr>
                <th>Student Identity</th>
                {daysArray.map(day => (
                  <th key={day} className="day-header">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.student_id}>
                  <td>{student.first_name} {student.last_name}</td>
                  {daysArray.map(day => {
                    const mark = getCellStatus(student.student_id, day);
                    return (
                      <td key={day}>
                        <div 
                          className={`att-cell ${mark ? mark.status.toLowerCase() : ''}`}
                          onClick={() => handleCellClick(student.student_id, day)}
                        >
                          {mark ? (mark.status === 'Absent' ? 'A' : (mark.session_number || '•')) : '+'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                   <td colSpan={daysInMonth + 1} style={{ textAlign: 'center', padding: '5rem', color: '#8892b0' }}>
                      Zero assigned students found for the audit.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="historical-records-section">
        <div className="section-title-row">
          <div className="title-left">
            <History size={24} style={{ color: '#E11B22' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Audit Logs</h2>
          </div>
          <button className="clear_logs_btn" onClick={() => setShowClearModal(true)}>
            <Trash2 size={18} /> Purge Records
          </button>
        </div>
        <div className="historical-table-card glass-card">
          <table className="historical-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Log Date</th>
                <th>Student Identity</th>
                <th>Verification</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(rec => (
                <tr key={rec.id}>
                  <td>{format(new Date(rec.attendance_date), 'dd MMM yyyy')}</td>
                  <td>{rec.first_name} {rec.last_name}</td>
                  <td>{rec.status === 'Absent' ? '-' : `Session Slot ${rec.session_number}`}</td>
                  <td>{rec.time_slot || 'N/A'}</td>
                  <td>
                    <span className={`status-label ${rec.status.toLowerCase()}`} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', background: rec.status === 'Present' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: rec.status === 'Present' ? '#10b981' : '#ef4444' }}>
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
        <div className="marking-modal-overlay">
          <div className="marking-modal glass-card">
            <div className="modal-header">
              <AlertTriangle size={28} style={{ color: '#E11B22' }} />
              <h3>Verification Protocol</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '1rem', fontWeight: 700 }}>SELECT AUDIT STATUS</p>
            <div className="status-selector">
              {['Present', 'Late', 'Absent'].map(s => (
                <div 
                  key={s} 
                  className={`status-opt ${selection.status === s ? 'active' : ''}`}
                  onClick={() => setSelection(prev => ({ ...prev, status: s }))}
                >
                  {s}
                </div>
              ))}
            </div>

            {selection.status !== 'Absent' && (
              <>
                <p style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '1rem', fontWeight: 700 }}>ASSIGN SYSTEM SESSION</p>
                <div className="session-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                  {SESSIONS.map(session => (
                    <div 
                      key={session.id} 
                      className={`session-opt ${selection.session === session.id ? 'active' : ''}`}
                      onClick={() => setSelection(prev => ({ ...prev, session: session.id }))}
                    >
                      <div className="session-name">{session.name}</div>
                      <div className="session-time">{session.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <button className="btn-secondary" style={{ padding: '1rem', borderRadius: '12px', fontWeight: 800 }} onClick={() => setShowModal(false)}>ABORT</button>
              <button className="btn-primary" style={{ padding: '1rem', borderRadius: '12px', fontWeight: 800, background: '#E11B22', color: '#fff', border: 'none' }} onClick={saveToPending}>CONFIRM MARK</button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ PURGE MODAL */}
      {showClearModal && (
        <div className="marking-modal-overlay">
          <div className="marking-modal glass-card" style={{ textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <Trash2 size={32} style={{ color: '#ef4444' }} />
              <h3>Confirm Database Purge</h3>
            </div>
            
            <p style={{ color: '#8892b0', margin: '1.5rem 0 3rem' }}>
              Warning: You are initiating a destructive purge of all historical session logs.
            </p>

            <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowClearModal(false)}>CANCEL</button>
              <button 
                className="btn-danger" 
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 800 }}
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
