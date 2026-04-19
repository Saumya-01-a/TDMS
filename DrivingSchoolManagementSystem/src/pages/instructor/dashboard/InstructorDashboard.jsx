import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Users, UserPlus, Clock, Calendar, TrendingUp, Circle } from 'lucide-react';
import NotificationTray from '../../../components/notifications/NotificationTray';
import './instructorDashboard.css';

export default function InstructorDashboard() {
  const [availabilityStatus, setAvailabilityStatus] = useState('Available');
  const [statsData, setStatsData] = useState({
    totalStudents: 120, 
    yourStudents: 15,   
    todaySessions: 4,
    trialCandidates: 0
  });
  const [trialStudents, setTrialStudents] = useState([]);

  // Dummy Data with Requested Sri Lankan Names
  const [schedule, setSchedule] = useState([
    { id: 101, first_name: 'Nimal', last_name: 'Kumara', session_date: new Date().toISOString(), slot_number: 1 },
    { id: 102, first_name: 'Sunethra', last_name: 'Mendis', session_date: new Date().toISOString(), slot_number: 2 },
    { id: 103, first_name: 'Priyantha', last_name: 'Silva', session_date: new Date().toISOString(), slot_number: 3 },
    { id: 104, first_name: 'Kasun', last_name: 'Silva', session_date: new Date(Date.now() + 86400000).toISOString(), slot_number: 4 },
    { id: 105, first_name: 'Amara', last_name: 'Perera', session_date: new Date(Date.now() + 86400000).toISOString(), slot_number: 1 },
  ]);

  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const userId = user.userId;

  const statusOptions = [
    { label: 'Available', color: '#E11B22', desc: 'Ready for lessons' },
    { label: 'Unavailable', color: '#ef4444', desc: 'Off duty' },
    { label: 'On Leave', color: '#fcc419', desc: 'Away from school' },
    { label: 'Training', color: '#3b82f6', desc: 'In private training' }
  ];

  useEffect(() => {
    if (userId) {
      fetchData();
      const socket = io('http://localhost:3000');
      socket.emit('register', userId);
      socket.on('instructor_status_updated', (data) => {
        if (data.instructorId === userId) setAvailabilityStatus(data.status);
      });
      // Listen for trial updates
      socket.on('trial_update', () => fetchData());
      
      return () => socket.disconnect();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [statsRes, scheduleRes, trialsRes] = await Promise.all([
        fetch(`http://localhost:3000/instructor/stats/${userId}`),
        fetch(`http://localhost:3000/instructor/schedule/${userId}`),
        fetch(`http://localhost:3000/instructor/trial-candidates/${userId}`)
      ]);
      const stats = await statsRes.json();
      const sched = await scheduleRes.json();
      const trials = await trialsRes.json();
      if (stats.ok) setStatsData(stats.stats);
      if (sched.ok && sched.schedule.length > 0) setSchedule(sched.schedule);
      if (trials.ok) setTrialStudents(trials.students);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const response = await fetch(`http://localhost:3000/instructor/availability/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.ok) setAvailabilityStatus(status);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const stats = [
    { label: 'Total Students', value: statsData.totalStudents, icon: <Users size={24} />, color: '#E11B22' },
    { label: 'Your Students', value: statsData.yourStudents, icon: <UserPlus size={24} />, color: '#fcc419' },
    { label: "Today's Sessions", value: statsData.todaySessions, icon: <Clock size={24} />, color: '#60a5fa' },
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
      const date = new Date(s.session_date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      return day === dayName && s.slot_number === slotId;
    });
  };

  return (
    <div className="ins_dash__wrap">
      <div className="ins_dash__container">
        <header className="ins_dash__header_row">
          <div className="ins_dash__titleSection">
            <h1 className="ins_dash__title">Instructor Dashboard</h1>
            <p className="ins_dash__subtitle">Performance monitoring and live schedule management.</p>
          </div>
          <NotificationTray instructorId={userId} />
        </header>

        {/* Global Row: Metrics (Left) & Status (Right) */}
        <div className="ins_dash__topRow">
          <div className="ins_dash__metricsGroup">
            {stats.map((stat, idx) => (
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
                  className={`ins_dash__statusBtn ${availabilityStatus === opt.label ? 'active' : ''}`}
                  onClick={() => handleStatusChange(opt.label)}
                >
                  <Circle size={10} fill={availabilityStatus === opt.label ? opt.color : 'transparent'} color={opt.color} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Professional Weekly Schedule */}
        <div className="ins_dash__schedulePanel glass-card">
          <div className="ins_dash__panelHeader">
            <div className="ins_dash__panelTitle">
              <Calendar size={22} style={{ color: '#E11B22' }} />
              <h2>Weekly Training Overview</h2>
            </div>
            <div className="ins_dash__legend">
              <span className="legend-item"><span className="dot booked"></span> Reserved</span>
              <span className="legend-item"><span className="dot available"></span> Open</span>
            </div>
          </div>

          {/* Table Container with Horizontal Scroll Support */}
          <div className="ins_dash__scheduleWrapper overflow-auto">
            <table className="ins_dash__scheduleTableMain">
              <thead>
                <tr>
                  <th className="slot-col">Time Session</th>
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
                              <span className="student-name">{session.first_name}</span>
                              <span className="session-tag">Confirmed</span>
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
        </div>

        {/* 📋 TRIAL CANDIDATES PANEL */}
        <div className="ins_dash__trialPanel glass-card">
           <div className="ins_dash__panelHeader">
              <div className="ins_dash__panelTitle">
                 <Users size={22} style={{ color: '#E11B22' }} />
                 <h2>Upcoming Trial Candidates ({trialStudents.length})</h2>
              </div>
           </div>
           
           <div className="ins_dash__trialList">
              {trialStudents.length > 0 ? trialStudents.map(student => (
                <div key={student.student_id} className="trial-card glass-card">
                   <div className="trial-avatar">{student.first_name[0]}</div>
                   <div className="trial-info">
                      <span className="trial-name">{student.first_name} {student.last_name}</span>
                      <span className="trial-date">Trial Date: {new Date(student.trial_date).toLocaleDateString()}</span>
                   </div>
                   <div className="trial-status-badge">READY</div>
                </div>
              )) : (
                <div className="empty-trials">
                   <p>No students currently scheduled for trials.</p>
                </div>
              )}
           </div>
        </div>

        <footer className="ins_dash__footer">
          <p>© 2026 Thisara Driving School Management System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
