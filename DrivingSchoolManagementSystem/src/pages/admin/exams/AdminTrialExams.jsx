import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Trash2, 
  Search, 
  X, 
  AlertTriangle,
  Users,
  ShieldCheck,
  Briefcase,
  User,
  Clock
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { io } from 'socket.io-client';
import './adminTrialExams.css';

export default function AdminTrialExams() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trialDates, setTrialDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  // Socket for real-time updates
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('trial_update', () => fetchTrialDates());
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchTrialDates();
    fetchAllStudents();
  }, [currentMonth]);

  const fetchTrialDates = async () => {
    try {
      const res = await fetch('http://localhost:3000/trials/dates');
      const data = await res.json();
      if (data.ok) setTrialDates(data.trials);
    } catch (err) { console.error("Fetch trial dates error:", err); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await fetch('http://localhost:3000/student/all');
      const data = await res.json();
      setAllStudents(data || []);
    } catch (err) { console.error("Fetch students error:", err); }
  };

  const fetchAssignedStudents = async (trialId) => {
    if (!trialId) return;
    setLoadingAssigned(true);
    try {
      const res = await fetch(`http://localhost:3000/trials/students/${trialId}`);
      const data = await res.json();
      if (data.ok) setAssignedStudents(data.students);
    } catch (err) { 
      console.error("Fetch assigned error:", err); 
    } finally {
      setLoadingAssigned(false);
    }
  };

  const handleToggleTrial = async (date) => {
    // 🛡️ UTC/TIMEZONE FIX: Set the date to midday (12:00:00) before formatting
    const midDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    const formattedDate = format(midDayDate, 'yyyy-MM-dd');
    
    // Improved comparison using isSameDay for robustness
    const isAlreadyTrial = trialDates.find(t => isSameDay(new Date(t.trial_date), midDayDate));
    
    if (isAlreadyTrial) {
      setSelectedDate(isAlreadyTrial);
      fetchAssignedStudents(isAlreadyTrial.id);
      setShowManagePanel(true);
    } else {
      if (window.confirm(`Mark ${format(date, 'PPP')} as a Trial Examination Date?`)) {
        try {
          const res = await fetch('http://localhost:3000/trials/toggle', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ trial_date: formattedDate })
          });
          const data = await res.json();
          if (data.ok) fetchTrialDates();
        } catch (err) { alert("Server communication failure."); }
      }
    }
  };

  const assignStudent = async (student) => {
    if (!selectedDate) return;
    if (window.confirm(`Are you sure you want to add ${student.first_name} to the Trial Date: ${format(new Date(selectedDate.trial_date), 'PPP')}?`)) {
      // 🛡️ DOUBLE-ASSIGNMENT PREVENTION
      const isAlreadyAssigned = assignedStudents.some(as => as.student_id === student.student_id);
      if (isAlreadyAssigned) {
        alert(`${student.first_name} is already assigned to this trial session.`);
        setSearchTerm("");
        return;
      }

      setLoadingAssigned(true);
      try {
        const res = await fetch('http://localhost:3000/trials/assign', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            trialId: selectedDate.id, 
            studentId: student.student_id,
            instructorId: student.instructor_id 
          })
        });
        const data = await res.json();
        if (data.ok) {
          // Force immediate refresh and clear search
          await fetchAssignedStudents(selectedDate.id);
          setSearchTerm("");
          // Small temporary alert/feedback (Success Notification)
          const successMsg = document.createElement('div');
          successMsg.className = 'assignment-status-toast';
          successMsg.innerText = `✅ ${student.first_name} Added Successfully`;
          document.body.appendChild(successMsg);
          setTimeout(() => successMsg.remove(), 3000);
        } else {
          alert(data.message || "Failed to assign student.");
        }
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoadingAssigned(false);
      }
    }
  };

  const removeStudent = async (assignmentId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from this Trial session?`)) {
      try {
        const res = await fetch(`http://localhost:3000/trials/remove/${assignmentId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) fetchAssignedStudents(selectedDate.id);
      } catch (err) { console.error(err); }
    }
  };

  // Calendar Logic
  const renderHeader = () => (
    <div className="adm-calendar-header glass-card">
      <div className="calendar-title">
         <CalendarIcon size={24} className="text-brand-red" />
         <h2>Trial Examination Calendar</h2>
      </div>
      <div className="calendar-nav">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></button>
        <div className="current-month">{format(currentMonth, 'MMMM yyyy')}</div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="calendar-days-row">
        {days.map(d => <div key={d} className="day-name">{d}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="calendar-cells-grid">
        {calendarDays.map(day => {
          // 🛡️ UTC/TIMEZONE FIX: Use midday centering for comparison
          const midDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0);
          const trial = trialDates.find(t => isSameDay(new Date(t.trial_date), midDay));
          const isSelected = selectedDate && isSameDay(new Date(selectedDate.trial_date), midDay);

          return (
            <div 
              key={day.toString()} 
              className={`calendar-cell ${!isSameMonth(day, monthStart) ? 'disabled' : ''} ${trial ? 'is-trial' : ''} ${isSelected ? 'active-select' : ''}`}
              onClick={() => handleToggleTrial(day)}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {trial && <div className="trial-badge">TRIAL</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredStudents = allStudents.filter(s => 
    (s.first_name + " " + s.last_name).toLowerCase().includes(searchTerm.toLowerCase()) &&
    !assignedStudents.some(as => as.student_id === s.student_id)
  );

  return (
    <div className="adm-trials-page">
      <div className="adm-trials-main">
        {renderHeader()}
        <div className="adm-calendar-container glass-card">
          {renderDays()}
          {renderCells()}
        </div>
        
        <div className="adm-trials-legend glass-card">
           <div className="legend-item"><div className="dot default"></div> Normal Day</div>
           <div className="legend-item"><div className="dot trial"></div> Trial Examination Day</div>
           <div className="legend-item"><div className="dot active"></div> Selected for Management</div>
        </div>
      </div>

      {/* 🚀 SIDE PANEL: STUDENT MANAGEMENT */}
      <aside className={`adm-manage-panel glass-card ${showManagePanel ? 'open' : ''}`}>
        <div className="panel-header">
           <div className="p-title-wrap">
              <Users size={20} className="text-brand-red" />
              <h3>Manage Students</h3>
           </div>
           <button className="close-panel" onClick={() => setShowManagePanel(false)}><X size={20}/></button>
        </div>

        {selectedDate && (
          <div className="panel-date-info">
             <div className="p-date-badge">
                <CalendarIcon size={14} />
                <span>{format(new Date(selectedDate.trial_date), 'PPP')}</span>
             </div>
          </div>
        )}

        <div className="panel-search-section">
          <div className="student-search-box">
             <Search size={18} className="search-ico" />
             <input 
               type="text" 
               placeholder="Search students to assign..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             {searchTerm && (
               <div className="search-results glass-card">
                  {filteredStudents.slice(0, 5).map(s => (
                    <div key={s.student_id} className="search-item" onClick={() => assignStudent(s)}>
                       <div className="s-avatar">{s.first_name[0]}</div>
                       <div className="s-info">
                          <span className="s-name">{s.first_name} {s.last_name}</span>
                          <span className="s-id">{s.student_id}</span>
                       </div>
                       <UserPlus size={16} />
                    </div>
                  ))}
                  {filteredStudents.length === 0 && <p className="no-result" style={{padding: '1rem', color: '#8892b0', fontSize: '0.8rem'}}>No matching students</p>}
               </div>
             )}
          </div>
        </div>

        <div className="assigned-list">
           <div className="list-label">ASSIGNED STUDENTS ({assignedStudents.length})</div>
           
           {loadingAssigned ? (
             <div className="empty-assignments">
                <Clock className="spin-slow" size={32} />
                <p>Syncing assigned candidates...</p>
             </div>
           ) : (
             <>
               {assignedStudents.map(s => (
                 <div key={s.id} className="assigned-item glass-card">
                    <div className="a-user">
                       <div className="a-avatar">{s.first_name[0]}</div>
                       <div className="a-meta">
                          <span className="a-name">{s.first_name} {s.last_name}</span>
                          <span className="a-pkg">{s.package_name || "Standard Package"}</span>
                       </div>
                    </div>
                    <button className="a-remove" onClick={() => removeStudent(s.id, s.first_name)}><Trash2 size={16} /></button>
                 </div>
               ))}
               {assignedStudents.length === 0 && (
                 <div className="empty-assignments">
                    <AlertTriangle size={32} />
                    <p>No students assigned to this trial date yet.</p>
                 </div>
               )}
             </>
           )}
        </div>
      </aside>
    </div>
  );
}

// Map Helper (Not used in Trial but kept for standard pattern)
function ChangeView({ center }) {
  return null;
}
