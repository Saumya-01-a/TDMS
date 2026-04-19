import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  GraduationCap, 
  Car, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Filter
} from 'lucide-react';
import './instructorSchedule.css';

export default function InstructorSchedule() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Authentication Context (Retrieve the logged-in instructor)
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const instructorId = user.userId || 'INST-DEFAULT'; // Fallback for DEMO

  const sessionTimes = {
    1: '08:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '01:00 PM - 03:00 PM',
    4: '03:00 PM - 05:00 PM'
  };

  useEffect(() => {
    if (instructorId) {
      fetchInstructorLessons();
    }
  }, [instructorId]);

  const fetchInstructorLessons = async () => {
    try {
      const res = await fetch(`http://localhost:3000/instructor/lessons/${instructorId}`);
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

  // Filtering Logic
  const filteredLessons = lessons.filter(lesson => 
    `${lesson.student_fname} ${lesson.student_lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.vehicle_reg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="ins_sch__container">Loading Schedule...</div>;

  return (
    <div className="ins_sch__container">
      <div className="ins_sch__header">
        <div className="ins_sch__title_section">
          <div className="header-with-icon">
            <Calendar size={28} className="text-brand-red" />
            <h1>Teaching Schedule</h1>
          </div>
          <p className="ins_sch__subtitle">Manage your upcoming student lessons and fleet assignments</p>
        </div>
      </div>

      <div className="ins_sch__actions_bar glass-card">
        <div className="ins_sch__search_wrapper">
          <Search size={18} className="ins_sch__search_icon" />
          <input 
            type="text" 
            className="ins_sch__search_input glass-input" 
            placeholder="Search student or vehicle registration..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="ins_sch__table_wrapper glass-table-container">
        <table className="ins_sch__table glass-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session Slot</th>
              <th>Student Name</th>
              <th>Vehicle Number</th>
              <th>Assignment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.id}>
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
                    <GraduationCap size={18} className="text-muted" />
                    <span>{lesson.student_fname} {lesson.student_lname}</span>
                  </div>
                </td>
                <td>
                  <div className="ins_sch__vehicle_cell">
                    <Car size={18} className="text-muted" />
                    <span className="ins_sch__vehicle_reg">{lesson.vehicle_reg}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge-${lesson.status.toLowerCase() === 'completed' ? 'success' : 'warning'}`}>
                    {lesson.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLessons.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="ins_sch__empty">
                    <AlertCircle size={40} className="text-muted" />
                    <p>No lessons matching your search criteria found.</p>
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
