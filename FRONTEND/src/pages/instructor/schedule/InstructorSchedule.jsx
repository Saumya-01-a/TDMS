import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  GraduationCap, 
  Car, 
  Clock, 
  AlertCircle, 
  Filter
} from 'lucide-react';
import './instructorSchedule.css';

export default function InstructorSchedule() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Identity Resolution (Standardized)
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const uid = user.user_id || user.userId || user.instructor_id;

  const sessionTimes = {
    1: '08:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '01:00 PM - 03:00 PM',
    4: '03:00 PM - 05:00 PM'
  };

  useEffect(() => {
    if (uid) {
      fetchInstructorLessons();
    }
  }, [uid]);

  const fetchInstructorLessons = async () => {
    try {
      setLoading(true);
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch(`http://127.0.0.1:3000/instructor/lessons/${uid}`);
      const data = await res.json();
      if (data.ok) {
        setLessons(data.lessons);
      }
    } catch (err) {
      console.error("Error fetching instructor lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (lessonId, newStatus) => {
    if (!confirm(`Are you sure you want to mark this lesson as ${newStatus}?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:3000/instructor/lesson/status/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          instructorId: uid
        })
      });
      const data = await res.json();
      if (data.ok) {
        // Optimistic update or refetch
        fetchInstructorLessons();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Filtering Logic
  const filteredLessons = (lessons || []).filter(lesson => 
    `${lesson.student_fname} ${lesson.student_lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (String(lesson.vehicle_reg || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && lessons.length === 0) return <div className="ins_sch__container">Synchronizing Teaching Schedule...</div>;

  return (
    <div className="ins_sch__container" id="id_instructor_schedule_page">
      <div className="ins_sch__header">
        <div className="ins_sch__title_section">
          <div className="header-with-icon">
            <Calendar size={28} color="#E11B22" />
            <h1>Current Teaching Roster</h1>
          </div>
          <p className="ins_sch__subtitle">Real-time lesson tracking and student assignments</p>
        </div>
        <button className="ins_sch__sync_btn" onClick={() => fetchInstructorLessons()}>
          Sync Schedule
        </button>
      </div>

      <div className="ins_sch__actions_bar glass-card">
        <div className="ins_sch__search_wrapper">
          <Search size={18} className="ins_sch__search_icon" />
          <input 
            id="input_filter_lessons"
            type="text" 
            className="ins_sch__search_input glass-input" 
            placeholder="Search by student name or active vehicle registration..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="ins_sch__table_wrapper glass-table-container overflow-auto">
        <table className="ins_sch__table glass-table">
          <thead>
            <tr>
              <th>Operational Date</th>
              <th>Time Slot</th>
              <th>Primary Student</th>
              <th>Assigned Vehicle</th>
              <th>Mission Status</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.id} id={`row_lesson_${lesson.id}`}>
                <td>
                  <span style={{ fontWeight: '600' }}>
                    {new Date(lesson.lesson_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </td>
                <td>
                  <span className="ins_sch__session_pill">Session {lesson.session_number}</span>
                  <span className="ins_sch__session_time">{sessionTimes[lesson.session_number]}</span>
                </td>
                <td>
                  <div className="ins_sch__student_cell">
                    <GraduationCap size={18} style={{ opacity: 0.6, marginRight: '8px' }} />
                    <span style={{ fontWeight: 600 }}>{lesson.student_fname} {lesson.student_lname}</span>
                  </div>
                </td>
                <td>
                  <div className="ins_sch__vehicle_cell">
                    <Car size={18} style={{ opacity: 0.6, marginRight: '8px' }} />
                    <span className="ins_sch__vehicle_reg" style={{ letterSpacing: '0.05em' }}>{lesson.vehicle_reg}</span>
                  </div>
                </td>
                <td>
                  <span className={`ins_sch__status_badge status-${(lesson.status || 'Scheduled').toLowerCase().replace(' ', '_')}`}>
                    {lesson.status || 'Scheduled'}
                  </span>
                </td>
                <td>
                  <div className="ins_sch__actions_cell">
                    {lesson.status !== 'Completed' && (
                      <button 
                        className="ins_sch__action_btn check"
                        title="Mark Completed" 
                        onClick={() => handleUpdateStatus(lesson.id, 'Completed')}
                      >
                        ✓
                      </button>
                    )}
                    {lesson.status === 'Scheduled' && (
                      <button 
                        className="ins_sch__action_btn cancel"
                        title="Cancel Session" 
                        onClick={() => handleUpdateStatus(lesson.id, 'Cancelled')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredLessons.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className="ins_sch__empty">
                    <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No active assignments found matching your lookup.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
