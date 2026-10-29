import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  X,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../../../context/ToastContext';
import './adminAttendance.css';

const SESSIONS = [
  { id: 1, name: 'Session 1', time: '08:00 AM - 10:00 AM' },
  { id: 2, name: 'Session 2', time: '10:00 AM - 12:00 PM' },
  { id: 3, name: 'Session 3', time: '01:00 PM - 03:00 PM' },
  { id: 4, name: 'Session 4', time: '03:00 PM - 05:00 PM' },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const API_BASE = 'http://localhost:3000';

// Helper to convert any DB date or timestamp to local YYYY-MM-DD
function getRecordLocalDate(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

export default function AdminAttendance() {
  const { showToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [serverStats, setServerStats] = useState({ present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [pendingMarks, setPendingMarks] = useState({}); 
  const [showModal, setShowModal] = useState(false);
  const [activeCell, setActiveCell] = useState(null); 
  const [selection, setSelection] = useState({ status: 'Present', session: 1 });
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 🗓️ Dynamic Day Calculation
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentMonth, currentYear]);
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // 📊 Dynamic Metric Counters (Derived reactively from records + pending marks)
  const computedStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;

    (monthlyRecords || []).forEach(r => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Late') late++;
      else if (r.status === 'Absent') absent++;
    });

    // Factor in pending marks (overrides)
    Object.values(pendingMarks || {}).forEach(p => {
      const existing = (monthlyRecords || []).find(r => 
        String(r.student_id) === String(p.student_id) && 
        (getRecordLocalDate(r.attendance_date) === p.attendance_date || 
         (r.attendance_date && String(r.attendance_date).startsWith(p.attendance_date)))
      );
      if (existing) {
        if (existing.status === 'Present') present--;
        else if (existing.status === 'Late') late--;
        else if (existing.status === 'Absent') absent--;
      }
      if (p.status === 'Present') present++;
      else if (p.status === 'Late') late++;
      else if (p.status === 'Absent') absent++;
    });

    // Fall back to server stats if both are empty
    if (present === 0 && late === 0 && absent === 0 && serverStats) {
      return {
        present: Number(serverStats.present) || 0,
        late: Number(serverStats.late) || 0,
        absent: Number(serverStats.absent) || 0,
      };
    }

    return { 
      present: Math.max(0, present), 
      late: Math.max(0, late), 
      absent: Math.max(0, absent) 
    };
  }, [monthlyRecords, pendingMarks, serverStats]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const mon = String(currentMonth).padStart(2, '0');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [gridRes, statRes, historyRes] = await Promise.allSettled([
        fetch(`${API_BASE}/admin/attendance-grid?month=${mon}&year=${currentYear}`, { signal: controller.signal })
          .then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch(`${API_BASE}/admin/attendance-stats?month=${mon}&year=${currentYear}`, { signal: controller.signal })
          .then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch(`${API_BASE}/admin/attendance-logs`, { signal: controller.signal })
          .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      ]);

      clearTimeout(timeoutId);

      if (gridRes.status === 'fulfilled' && gridRes.value?.ok) {
        setStudents(gridRes.value.students || []);
        setMonthlyRecords(gridRes.value.attendance || gridRes.value.logs || []);
      } else {
        console.warn("Attendance grid fetch issue:", gridRes.reason || gridRes.value);
      }

      if (statRes.status === 'fulfilled' && statRes.value?.ok) {
        setServerStats(statRes.value.stats || { present: 0, late: 0, absent: 0 });
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.ok) {
        setHistory(historyRes.value.history || historyRes.value.logs || []);
      }
    } catch (err) {
      console.error("Attendance fetch error:", err);
      showToast("Unable to fetch attendance matrix. Please retry.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const navigateMonth = (dir) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m > 12) { m = 1; y++; }
    else if (m < 1) { m = 12; y--; }
    setCurrentMonth(m);
    setCurrentYear(y);
    setPendingMarks({});
  };

  const handleCellClick = (studentId, day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setActiveCell({ studentId, date: dateStr, day });
    
    const existing = pendingMarks[`${studentId}_${dateStr}`] || 
      (monthlyRecords || []).find(r => 
        String(r.student_id) === String(studentId) && 
        (getRecordLocalDate(r.attendance_date) === dateStr || 
         (r.attendance_date && String(r.attendance_date).startsWith(dateStr)))
      );

    if (existing) {
      setSelection({ 
        status: existing.status || 'Present', 
        session: existing.session_number || 1 
      });
    } else {
      setSelection({ status: 'Present', session: 1 });
    }
    setShowModal(true);
  };

  const saveToPending = () => {
    if (!activeCell) return;
    const { studentId, date } = activeCell;
    const sessionTimes = SESSIONS.find(s => s.id === selection.session) || SESSIONS[0];

    const newMark = {
      student_id: studentId,
      instructor_id: 'SYSTEM_ADMIN',
      attendance_date: date,
      status: selection.status,
      session_number: selection.status === 'Absent' ? 1 : selection.session,
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
    if (recordsToSave.length === 0) {
      showToast("No pending attendance marks to synchronize.", "info");
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/attendance-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Synchronized ${recordsToSave.length} attendance record(s) successfully!`, "success");
        setPendingMarks({});
        await fetchInitialData();
      } else {
        showToast(data.message || "Failed to synchronize attendance.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("Network error while synchronizing records.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/attendance-clear`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        setHistory([]);
        setMonthlyRecords([]);
        setPendingMarks({});
        setServerStats({ present: 0, late: 0, absent: 0 });
        setShowClearModal(false);
        showToast("All attendance records purged globally.", "info");
      } else {
        showToast(data.message || "Failed to purge records.", "error");
      }
    } catch (err) {
      console.error("Clear logs error:", err);
      showToast("Network error while purging records.", "error");
    } finally {
      setClearing(false);
    }
  };

  const handleCellStatus = (studentId, day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const pending = pendingMarks[`${studentId}_${dateStr}`];
    if (pending) return pending;

    if (!monthlyRecords || !Array.isArray(monthlyRecords)) return null;

    return monthlyRecords.find(r => 
      String(r.student_id) === String(studentId) && 
      (getRecordLocalDate(r.attendance_date) === dateStr || 
       (r.attendance_date && String(r.attendance_date).startsWith(dateStr)))
    );
  };

  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
      if (!s) return false;
      const term = (searchTerm || '').toLowerCase().trim();
      if (!term) return true;
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const sId = String(s.student_id || '').toLowerCase();
      return fullName.includes(term) || sId.includes(term);
    });
  }, [students, searchTerm]);

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

  const pendingCount = Object.keys(pendingMarks).length;

  return (
    <div className="adm-attendance-container">
      {/* 🧭 HEADER BANNER */}
      <header className="adm-header-banner">
        <div className="adm-banner-left">
          <h1>Global Verification Matrix</h1>
          <p>Administrative oversight and lesson progression audit</p>
        </div>
        <button 
          className="danger-purge" 
          onClick={() => setShowClearModal(true)}
          title="Purge all attendance logs"
        >
          <Trash2 size={18} /> Purge Records
        </button>
      </header>

      {/* 📊 SUMMARY CARDS (Dynamically calculated) */}
      <div className="summary-cards-row">
        <div className="att__summary_card glass-card card-present">
          <div className="summary_card_info">
            <div className="summary-card-label">
              <CheckCircle size={18} color="#10b981" /> Present Total
            </div>
            <div className="summary-card-val val-present">{computedStats.present}</div>
          </div>
        </div>
        <div className="att__summary_card glass-card card-late">
          <div className="summary_card_info">
            <div className="summary-card-label">
              <Clock size={18} color="#fcc419" /> Late Total
            </div>
            <div className="summary-card-val val-late">{computedStats.late}</div>
          </div>
        </div>
        <div className="att__summary_card glass-card card-absent">
          <div className="summary_card_info">
            <div className="summary-card-label">
              <AlertCircle size={18} color="#ef4444" /> Absent Total
            </div>
            <div className="summary-card-val val-absent">{computedStats.absent}</div>
          </div>
        </div>
      </div>

      {/* 📅 REGISTER GRID */}
      <div className="adm-grid-matrix-card glass-card">
        {/* Controls Bar */}
        <div className="adm-controls-row">
          {/* Month / Year Navigator */}
          <div className="adm-month-nav-compact">
            <button 
              className="adm-nav-btn-sm" 
              onClick={() => navigateMonth(-1)}
              title="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="adm-current-view">
              <Calendar size={20} color="#E11B22" />
              <span>{MONTH_NAMES[currentMonth - 1]} {currentYear}</span>
            </div>
            <button 
              className="adm-nav-btn-sm" 
              onClick={() => navigateMonth(1)}
              title="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Search Box */}
          <div className="adm-search-box">
            <Search size={18} color="#8892b0" />
            <input 
              type="text" 
              placeholder="Audit student identity or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="adm-actions-group">
            <button 
              className={`adm-btn-action primary-red ${pendingCount > 0 ? 'has-pending' : ''}`} 
              onClick={submitAttendance} 
              disabled={syncing || pendingCount === 0}
              title={pendingCount > 0 ? `Synchronize ${pendingCount} mark(s)` : 'No pending marks'}
            >
              {syncing ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              <span>{syncing ? 'Saving...' : `Synchronize Grid ${pendingCount > 0 ? `(${pendingCount})` : ''}`}</span>
            </button>
            <button 
              className="adm-btn-action" 
              onClick={fetchInitialData}
              disabled={loading}
              title="Refresh attendance records"
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="adm-table-scroll-container">
          <table className="adm-grid-table">
            <thead>
              <tr>
                <th className="identity-col">Student Identity</th>
                {daysArray.map(day => (
                  <th key={day} className="day-col">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading State Overlay / Row */}
              {loading && (
                <tr>
                  <td colSpan={daysInMonth + 1} className="state-cell-container">
                    <div className="empty-state-box">
                      <Loader2 size={36} className="spin" color="#E11B22" />
                      <span className="empty-state-title">Loading global attendance matrix...</span>
                      <span className="empty-state-desc">Fetching records for {MONTH_NAMES[currentMonth - 1]} {currentYear}</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={daysInMonth + 1} className="state-cell-container">
                    <div className="empty-state-box">
                      <AlertCircle size={36} color="#fcc419" />
                      <span className="empty-state-title">No attendance records found for this period</span>
                      <span className="empty-state-desc">
                        {searchTerm ? `No student matched "${searchTerm}"` : `Zero student profiles found for ${MONTH_NAMES[currentMonth - 1]} ${currentYear}.`}
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Loaded Grid */}
              {!loading && filteredStudents.map(student => (
                <tr key={student?.student_id}>
                  <td className="identity-col">
                    <div className="identity-cell-content">
                      <div className="student-name">
                        {student?.first_name} {student?.last_name}
                      </div>
                      <div className="student-sub-id">
                        {student?.student_id}
                      </div>
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const mark = handleCellStatus(student?.student_id, day);
                    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isPending = Boolean(pendingMarks[`${student?.student_id}_${dateStr}`]);

                    let statusClass = 'empty';
                    let displayChar = '+';

                    if (mark) {
                      if (mark.status === 'Present') {
                        statusClass = 'present';
                        displayChar = mark.session_number ? `S${mark.session_number}` : 'P';
                      } else if (mark.status === 'Late') {
                        statusClass = 'late';
                        displayChar = 'L';
                      } else if (mark.status === 'Absent') {
                        statusClass = 'absent';
                        displayChar = 'A';
                      }
                    }

                    return (
                      <td key={day} className="day-col">
                        <button 
                          type="button"
                          className={`att-cell-admin ${statusClass} ${isPending ? 'pending-highlight' : ''}`}
                          onClick={() => handleCellClick(student?.student_id, day)}
                          title={`${student?.first_name} ${student?.last_name} - Day ${day} (${mark?.status || 'Unmarked'})${isPending ? ' [Pending Save]' : ''}`}
                        >
                          {displayChar}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📜 HISTORICAL AUDIT LOGS */}
      <section className="historical-records-section">
        <div className="section-title-row">
          <History size={24} color="#E11B22" />
          <h2>Administrative Audit Logs</h2>
          <span className="logs-count-badge">{history.length} Records</span>
        </div>
        <div className="historical-table-card glass-card">
          <table className="historical-table">
            <thead>
              <tr>
                <th>Log Date</th>
                <th>Student Identity</th>
                <th>Verification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>
                    No historical logs recorded.
                  </td>
                </tr>
              ) : (
                history.map((rec, idx) => (
                  <tr key={rec.id || idx}>
                    <td className="log-date-cell">
                      {safeFormatDate(rec.attendance_date)}
                    </td>
                    <td className="log-student-cell">
                      <strong>{rec.first_name} {rec.last_name}</strong>
                      <span className="log-std-id">{rec.student_id}</span>
                    </td>
                    <td className="log-verification-cell">
                      {rec.status === 'Absent' ? (
                        <span className="text-muted">No session attended</span>
                      ) : (
                        <span>Slot {rec.session_number || 1} verified by {rec.instructor_fname ? `${rec.instructor_fname} ${rec.instructor_lname || ''}` : 'Admin'}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill pill-${rec.status ? rec.status.toLowerCase() : 'present'}`}>
                        {rec.status ? rec.status.toUpperCase() : 'PRESENT'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📝 MARKING MODAL */}
      {showModal && (
        <div className="marking-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="marking-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <ShieldCheck size={28} color="#E11B22" />
              <h3>Administrative Override</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-target-info">
              Date: <strong>{activeCell?.date}</strong>
            </div>
            
            <p className="modal-subheading">AUDIT VERIFICATION STATUS</p>
            <div className="status-selector">
              {['Present', 'Late', 'Absent'].map(s => (
                <button 
                  key={s} 
                  type="button"
                  className={`status-opt opt-${s.toLowerCase()} ${selection.status === s ? 'active' : ''}`}
                  onClick={() => setSelection(prev => ({ ...prev, status: s }))}
                >
                  {selection.status === s && <Check size={16} />}
                  <span>{s}</span>
                </button>
              ))}
            </div>

            {selection.status !== 'Absent' && (
              <>
                <p className="modal-subheading">ASSIGN SYSTEM SESSION</p>
                <div className="session-selector">
                  {SESSIONS.map(session => (
                    <div 
                      key={session.id} 
                      className={`session-opt ${selection.session === session.id ? 'active' : ''}`}
                      onClick={() => setSelection(prev => ({ ...prev, session: session.id }))}
                    >
                      <div className="session-opt-name">{session.name}</div>
                      <div className="session-opt-time">{session.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>DISCARD</button>
              <button className="btn-primary" onClick={saveToPending}>CONFIRM OVERRIDE</button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ PURGE MODAL */}
      {showClearModal && (
        <div className="marking-modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="marking-modal glass-card purge-modal-box" onClick={e => e.stopPropagation()}>
            <Trash2 size={44} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h3>Confirm System Purge</h3>
            <p className="purge-warning-text">
              Warning: You are initiating a destructive purge of all historical attendance records globally. This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowClearModal(false)} disabled={clearing}>
                ABORT
              </button>
              <button 
                className="btn-danger" 
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
