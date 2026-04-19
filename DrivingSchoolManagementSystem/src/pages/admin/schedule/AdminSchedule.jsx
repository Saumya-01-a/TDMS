import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './adminSchedule.css';

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    students: [],
    instructors: [],
    vehicles: []
  });

  const [newLesson, setNewLesson] = useState({
    student_id: '',
    instructor_id: '',
    vehicle_id: '',
    lesson_date: '',
    session_number: '1'
  });

  const sessionTimes = {
    1: '08:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '01:00 PM - 03:00 PM',
    4: '03:00 PM - 05:00 PM'
  };

  useEffect(() => {
    fetchSchedules();
    fetchFormData();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/schedule');
      const data = await res.json();
      if (data.ok) setSchedules(data.schedules);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/schedule/form-data');
      const data = await res.json();
      if (data.ok) {
        setFormData({
          students: data.students,
          instructors: data.instructors,
          vehicles: data.vehicles
        });
      }
    } catch (err) {
      console.error("Error fetching form data:", err);
    }
  };

  useEffect(() => {
    // 🔌 Initialize Socket and Listen for Instructor Status Updates
    const socket = io('http://localhost:3000');
    
    socket.on('instructor_status_updated', (data) => {
      setFormData(prev => ({
        ...prev,
        instructors: prev.instructors.map(ins => 
          ins.instructor_id === data.instructorId 
            ? { ...ins, availability_status: data.status } 
            : ins
        )
      }));

      setSchedules(prev => prev.map(sch => 
        sch.instructor_id === data.instructorId 
          ? { ...sch, instructor_status: data.status } 
          : sch
      ));
    });

    return () => socket.disconnect();
  }, []);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      });
      const data = await res.json();
      if (data.ok) {
        setShowModal(false);
        fetchSchedules();
        setNewLesson({ student_id: '', instructor_id: '', vehicle_id: '', lesson_date: '', session_number: '1' });
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error creating lesson:", err);
      alert("Failed to schedule lesson.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scheduled lesson?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/schedule/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) fetchSchedules();
    } catch (err) {
      console.error("Error deleting lesson:", err);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatusMap = { 'Scheduled': 'Completed', 'Completed': 'Rescheduled', 'Rescheduled': 'Scheduled' };
    const nextStatus = nextStatusMap[currentStatus];
    try {
      const res = await fetch(`http://localhost:3000/api/admin/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.ok) fetchSchedules();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredSchedules = schedules.filter(sch => 
    `${sch.student_fname} ${sch.student_lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sch.vehicle_reg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="adm_sch__container">Loading Schedule...</div>;

  return (
    <div className="adm_sch__container">
      <div className="adm_sch__header">
        <div className="adm_sch__title_section">
          <h1>Lesson Schedule</h1>
          <p className="adm_sch__subtitle">Manage driving lessons and resource allocations</p>
        </div>
        <button className="adm_sch__add_btn" onClick={() => setShowModal(true)}>
          <span>+</span> New Appointment
        </button>
      </div>

      <div className="adm_sch__actions_bar">
        <div className="adm_sch__search_wrapper">
          <span className="adm_sch__search_icon">🔍</span>
          <input 
            type="text" 
            className="adm_sch__search_input" 
            placeholder="Search student or vehicle..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="adm_sch__table_wrapper">
        <table className="adm_sch__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Student Name</th>
              <th>Instructor</th>
              <th>Vehicle Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((sch) => (
              <tr key={sch.id}>
                <td>{new Date(sch.lesson_date).toLocaleDateString('en-GB')}</td>
                <td>
                  <span className="adm_sch__session_pill">Session {sch.session_number}</span>
                  <span className="adm_sch__session_time">{sessionTimes[sch.session_number]}</span>
                </td>
                <td>{sch.student_fname} {sch.student_lname}</td>
                <td>
                  <div className="adm_sch__instructor_info">
                    <span className={`status-indicator ${sch.instructor_status?.toLowerCase().replace(/\s/g, '') || 'available'}`}></span>
                    {sch.instructor_fname} {sch.instructor_lname}
                  </div>
                </td>
                <td>{sch.vehicle_reg}</td>
                <td>
                  <span 
                    className={`adm_sch__badge ${sch.status.toLowerCase()}`}
                    onClick={() => handleUpdateStatus(sch.id, sch.status)}
                    style={{ cursor: 'pointer' }}
                    title="Click to cycle status"
                  >
                    {sch.status}
                  </span>
                </td>
                <td>
                  <div className="adm_sch__row_actions">
                    <button className="adm_sch__action_icon edit" title="Edit" onClick={() => alert("Edit Modal coming soon - Use cycle status for now")}>✏️</button>
                    <button className="adm_sch__action_icon delete" title="Delete" onClick={() => handleDelete(sch.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="adm_sch__empty">
                    <span className="adm_sch__empty_icon">📅</span>
                    No lesson schedules found matches your search.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="adm_sch__modal_overlay">
          <div className="adm_sch__modal_content">
            <div className="adm_sch__modal_header">
              <h2>New Appointment Assignment</h2>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="adm_sch__form_group">
                <label>Select Student</label>
                <select 
                  className="adm_sch__input" 
                  required 
                  value={newLesson.student_id}
                  onChange={(e) => setNewLesson({...newLesson, student_id: e.target.value})}
                >
                  <option value="">-- Choose Student --</option>
                  {formData.students.map(s => <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name} ({s.student_id})</option>)}
                </select>
              </div>

              <div className="adm_sch__form_group">
                <label>Select Instructor</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={newLesson.instructor_id}
                  onChange={(e) => setNewLesson({...newLesson, instructor_id: e.target.value})}
                >
                  <option value="">-- Choose Instructor --</option>
                  {formData.instructors.map(i => (
                    <option key={i.instructor_id} value={i.instructor_id}>
                      {i.first_name} {i.last_name} ({i.availability_status || 'Available'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="adm_sch__form_group">
                <label>Select Vehicle (Available Only)</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={newLesson.vehicle_id}
                  onChange={(e) => setNewLesson({...newLesson, vehicle_id: e.target.value})}
                >
                  <option value="">-- Choose Vehicle --</option>
                  {formData.vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.reg_no} ({v.type})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="adm_sch__input" 
                    required 
                    value={newLesson.lesson_date}
                    onChange={(e) => setNewLesson({...newLesson, lesson_date: e.target.value})}
                  />
                </div>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Session Slot</label>
                  <select 
                    className="adm_sch__input" 
                    required
                    value={newLesson.session_number}
                    onChange={(e) => setNewLesson({...newLesson, session_number: e.target.value})}
                  >
                    <option value="1">Session 1 (08-10 AM)</option>
                    <option value="2">Session 2 (10-12 AM)</option>
                    <option value="3">Session 3 (01-03 PM)</option>
                    <option value="4">Session 4 (03-05 PM)</option>
                  </select>
                </div>
              </div>

              <div className="adm_sch__modal_actions">
                <button type="button" className="adm_sch__modal_btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm_sch__modal_btn submit">Schedule Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
