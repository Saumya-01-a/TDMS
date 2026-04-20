import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Users, UserPlus, Clock, Calendar, TrendingUp, Circle, CheckCircle2, AlertCircle } from 'lucide-react';
import NotificationTray from '../../../components/notifications/NotificationTray';
import './instructorDashboard.css';

export default function InstructorDashboard() {
  const [availabilityStatus, setAvailabilityStatus] = useState('Available');
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    yourStudents: 0,
    todaySessions: 0,
    trialCandidates: 0
  });
  const [trialStudents, setTrialStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Identity Resolution (Standardized)
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const uid = user.user_id || user.userId || user.instructor_id;

  const statusOptions = [
    { label: 'Available', color: '#E11B22', desc: 'Ready for lessons' },
    { label: 'Unavailable', color: '#ef4444', desc: 'Off duty' },
    { label: 'On Leave', color: '#fcc419', desc: 'Away from school' },
    { label: 'Training', color: '#3b82f6', desc: 'In private training' }
  ];

  useEffect(() => {
    if (uid) {
      fetchData();

      // Standardized Socket Connection
      const socket = io('http://127.0.0.1:3000');
      socket.emit('register', uid);

      socket.on('instructor_status_updated', (data) => {
        if (data.instructorId === uid) setAvailabilityStatus(data.status);
      });

      socket.on('trial_update', () => fetchData());
      socket.on('student_update', () => fetchData());

      return () => socket.disconnect();
    }
  }, [uid]);

  const fetchData = async () => {
    if (!uid) return;
    try {
      setLoading(true);
      // Standardized to 127.0.0.1
      const [statsRes, scheduleRes, trialsRes] = await Promise.all([
        fetch(`http://127.0.0.1:3000/instructor/stats/${uid}`),
        fetch(`http://127.0.0.1:3000/instructor/schedule/${uid}`),
        fetch(`http://127.0.0.1:3000/instructor/trial-candidates/${uid}`)
      ]);

      const stats = await statsRes.json();
      const sched = await scheduleRes.json();
      const trials = await trialsRes.json();

      if (stats.ok) setStatsData(stats.stats);
      if (sched.ok) setSchedule(sched.schedule || []);
      if (trials.ok) setTrialStudents(trials.students || []);

    } catch (err) {
      console.error("Dashboard synchronization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!uid || statusLoading) return;
    setStatusLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:3000/instructor/availability/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.ok) setAvailabilityStatus(status);
    } catch (err) {
      console.error("Status update failure:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Enrolled', value: statsData.totalStudents, icon: <Users size={24} />, color: '#E11B22' },
    { label: 'My Students', value: statsData.yourStudents, icon: <UserPlus size={24} />, color: '#fcc419' },
    { label: "Today's Lessons", value: statsData.todaySessions, icon: <Clock size={24} />, color: '#60a5fa' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const slots = [
    { id: 1, label: '08:00 AM - 10:00 AM' },
    { id: 2, label: '10:00 AM - 12:00 PM' },
    { id: 3, label: '01:00 PM - 03:00 PM' },
    { id: 4, label: '03:00 PM - 05:00 PM' },
  ];

  const getSessionFromSchedule = (dayName, slotId) => {
    return schedule.find(s => {
      const date = new Date(s.lesson_date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      return day === dayName && s.session_number === slotId;
    });
  };

  if (loading && !statsData.totalStudents) {
    return <div className="ins_dash__loading">Initializing Operational Data...</div>;
  }

  return (
    <div className="ins_dash__wrap" id="id_instructor_dashboard">
      <div className="ins_dash__container">
        <header className="ins_dash__header_row">
          <div className="ins_dash__titleSection">
            <h1 className="ins_dash__title">Instructor Control Hub</h1>
            <p className="ins_dash__subtitle">Real-time lesson tracking and student oversight.</p>
          </div>
          <NotificationTray instructorId={uid} />
        </header>

        {/* Global Row: Metrics & Status */}
        <div className="ins_dash__topRow">
          <div className="ins_dash__metricsGroup">
            {statCards.map((stat, idx) => (
              <div key={idx} className="ins_dash__statCard glass-card">
                <div className="ins_dash__statIcon" style={{ color: stat.color, background: `${stat.color}10` }}>
                  {stat.icon}
                </div>
                <div className="ins_dash__statMain">
                  <div className="ins_dash__statLabel">{stat.label}</div>
                  <div className="ins_dash__statValue">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ins_dash__statusSection glass-card">
            <h3 className="ins_dash__statusTitle">Duty Management</h3>
            <div className="ins_dash__statusColumn">
              {statusOptions.map((opt) => (
                <button
                  key={opt.label}
                  disabled={statusLoading}
                  className={`ins_dash__statusBtn ${availabilityStatus === opt.label ? 'active' : ''}`}
                  onClick={() => handleStatusChange(opt.label)}
                >
                  <Circle size={10} fill={availabilityStatus === opt.label ? opt.color : 'transparent'} color={opt.color} />
                  <span>{opt.label}</span>
                  {availabilityStatus === opt.label && <CheckCircle2 size={12} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="ins_dash__schedulePanel glass-card">
          <div className="ins_dash__panelHeader">
            <div className="ins_dash__panelTitle">
              <Calendar size={22} style={{ color: '#E11B22' }} />
              <h2>Weekly Training Overview ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</h2>
            </div>
            <div className="ins_dash__legend">
              <span className="legend-item"><span className="dot booked"></span> Booked</span>
              <span className="legend-item"><span className="dot available"></span> Available</span>
            </div>
          </div>

          <div className="ins_dash__scheduleWrapper overflow-auto">
            <table className="ins_dash__scheduleTableMain">
              <thead>
                <tr>
                  <th className="slot-col">Time Slot</th>
                  {days.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td className="ins_dash__timeSlot">{slot.label}</td>
                    {days.map(day => {
                      const session = getSessionFromSchedule(day, slot.id);
                      return (
                        <td key={`${day}-${slot.id}`} className={`ins_dash__cell ${session ? 'booked' : 'available'}`}>
                          {session ? (
                            <div className="session-info">
                              <span className="student-name">{session.first_name} {session.last_name}</span>
                              <span className="session-tag">Verified</span>
                            </div>
                          ) : (
                            <span className="empty-slot">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length === 0 && (
            <div className="empty-notice">
              <AlertCircle size={16} /> No training sessions scheduled for this week.
            </div>
          )}
        </div>

        {/* 📋 TRIAL CANDIDATES PANEL */}
        <div className="ins_dash__trialPanel glass-card" id="trial_candidates_section">
          <div className="ins_dash__panelHeader">
            <div className="ins_dash__panelTitle">
              <Users size={22} style={{ color: '#E11B22' }} />
              <h2>Critical Trial Candidates ({trialStudents.length})</h2>
            </div>
          </div>

          <div className="ins_dash__trialList">
            {trialStudents.length > 0 ? trialStudents.map(student => (
              <div key={student.student_id} className="trial-card glass-card">
                <div className="trial-avatar" style={{ backgroundColor: '#E11B22' }}>{student.first_name[0]}</div>
                <div className="trial-info">
                  <span className="trial-name">{student.first_name} {student.last_name}</span>
                  <span className="trial-date">Exam Date: {new Date(student.trial_date).toLocaleDateString()}</span>
                </div>
                <div className="trial-status-badge">ELIGIBLE</div>
              </div>
            )) : (
              <div className="empty-trials">
                <p>No students assigned for upcoming trial examinations.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="ins_dash__footer">
          <p>© 2026 Thisara Driving School Management System. Operational Hub v2.1</p>
        </footer>
      </div>
    </div>
  );
}
