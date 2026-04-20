import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Calendar, Search, Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import './adminSchedule.css';

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
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
      setLoading(true);
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch('http://127.0.0.1:3000/admin/schedule');
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
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch('http://127.0.0.1:3000/admin/schedule/form-data');
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
    // 🔌 Standardized Socket Connection
    const socket = io('http://127.0.0.1:3000');
    
    socket.on('instructor_status_updated', (data) => {
      setFormData(prev => ({
        ...prev,
        instructors: prev.instructors.map(ins => 
          (ins.instructor_id === data.instructorId || ins.user_id === data.instructorId)
            ? { ...ins, availability_status: data.status } 
            : ins
        )
      }));

      setSchedules(prev => prev.map(sch => 
        (sch.instructor_id === data.instructorId || sch.instructor_user_id === data.instructorId)
          ? { ...sch, instructor_status: data.status } 
          : sch
      ));
    });

    return () => socket.disconnect();
  }, []);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:3000/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      });
      const data = await res.json();
      if (data.ok) {
        setShowModal(false);
        fetchSchedules();
        setNewLesson({ student_id: '', instructor_id: '', vehicle_id: '', lesson_date: '', session_number: '1' });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error creating lesson:", err);
      alert("System Error: Unable to record appointment assignment.");
    }
  };

  const handleOpenEdit = (sch) => {
    const formattedDate = new Date(sch.lesson_date).toISOString().split('T')[0];
    setEditingLesson({
      ...sch,
      lesson_date: formattedDate
    });
    setShowEditModal(true);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:3000/admin/schedule/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLesson)
      });
      const data = await res.json();
      if (data.ok) {
        setShowEditModal(false);
        fetchSchedules();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error updating lesson:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL: Are you sure you want to delete this scheduled lesson assignment?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:3000/admin/schedule/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) fetchSchedules();
    } catch (err) {
      console.error("Error deleting lesson:", err);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatusMap = { 'Scheduled': 'Completed', 'Completed': 'Rescheduled', 'Rescheduled': 'Scheduled' };
    const nextStatus = nextStatusMap[currentStatus] || 'Scheduled';
    try {
      const res = await fetch(`http://127.0.0.1:3000/admin/schedule/${id}`, {
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

  const filteredSchedules = (schedules || []).filter(sch => 
    `${sch.student_fname} ${sch.student_lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sch.vehicle_reg && sch.vehicle_reg.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && schedules.length === 0) return <div className="adm_sch__container">Synchronizing Appointment Data...</div>;

  return (
    <div className="adm_sch__container" id="id_admin_appointments">
      <div className="adm_sch__header">
        <div className="adm_sch__title_section">
          <h1>Universal Appointment Hub</h1>
          <p className="adm_sch__subtitle">Real-time scheduling and resource synchronization</p>
        </div>
        <button className="adm_sch__add_btn" id="btn_new_appointment" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Appointment
        </button>
      </div>

      <div className="adm_sch__actions_bar">
        <div className="adm_sch__search_wrapper">
          <Search size={18} className="adm_sch__search_icon" />
          <input 
            id="input_search_schedules"
            type="text" 
            className="adm_sch__search_input" 
            placeholder="Filter by student name or vehicle registration..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="adm_sch__table_wrapper overflow-auto">
        <table className="adm_sch__table">
          <thead>
            <tr>
              <th>Lesson Date</th>
              <th>Session Slot</th>
              <th>Primary Student</th>
              <th>Assigned Instructor</th>
              <th>Vehicle Assignment</th>
              <th>Lifecycle Status</th>
              <th>Action Hub</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((sch) => (
              <tr key={sch.id} id={`row_lesson_${sch.id}`}>
                <td style={{ fontWeight: 600 }}>
                  {new Date(sch.lesson_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td>
                  <span className="adm_sch__session_pill">Session {sch.session_number}</span>
                  <div className="adm_sch__session_time">{sessionTimes[sch.session_number]}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{sch.student_fname} {sch.student_lname}</td>
                <td>
                  <div className="adm_sch__instructor_info">
                    <span className={`status-indicator ${(sch.instructor_status || 'available').toLowerCase().replace(/\s/g, '')}`}></span>
                    {sch.instructor_fname} {sch.instructor_lname}
                  </div>
                </td>
                <td style={{ letterSpacing: '0.05em' }}>{sch.vehicle_reg || 'NOT ASGN'}</td>
                <td>
                  <span 
                    className={`adm_sch__badge ${(sch.status || 'scheduled').toLowerCase()}`}
                    onClick={() => handleUpdateStatus(sch.id, sch.status)}
                    style={{ cursor: 'pointer' }}
                    title="Click to cycle lifecycle status"
                  >
                    {sch.status || 'Scheduled'}
                  </span>
                </td>
                <td>
                  <div className="adm_sch__row_actions">
                    <button className="adm_sch__action_icon edit" id={`btn_edit_${sch.id}`} title="Modify Appointment" onClick={() => handleOpenEdit(sch)}><Edit2 size={16} /></button>
                    <button className="adm_sch__action_icon delete" id={`btn_delete_${sch.id}`} title="Delete Assignment" onClick={() => handleDelete(sch.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="adm_sch__empty">
                    <AlertCircle size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No active scheduled lessons found in the database.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="adm_sch__modal_overlay">
          <div className="adm_sch__modal_content glass-panel">
            <div className="adm_sch__modal_header">
              <h2>New Appointment Matrix</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="adm_sch__form_group">
                <label>Select Verified Student</label>
                <select 
                  className="adm_sch__input" 
                  required 
                  value={newLesson.student_id}
                  onChange={(e) => setNewLesson({...newLesson, student_id: e.target.value})}
                >
                  <option value="">-- Click to choose student --</option>
                  {formData.students.map(s => <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name} ({s.student_id})</option>)}
                </select>
              </div>

              <div className="adm_sch__form_group">
                <label>Assign Certified Instructor</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={newLesson.instructor_id}
                  onChange={(e) => setNewLesson({...newLesson, instructor_id: e.target.value})}
                >
                  <option value="">-- Click to choose instructor --</option>
                  {formData.instructors.map(i => (
                    <option key={i.instructor_id} value={i.instructor_id}>
                      {i.first_name} {i.last_name} ({i.availability_status || 'Available'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="adm_sch__form_group">
                <label>Select Fleet Vehicle</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={newLesson.vehicle_id}
                  onChange={(e) => setNewLesson({...newLesson, vehicle_id: e.target.value})}
                >
                  <option value="">-- Choose active vehicle --</option>
                  {formData.vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.reg_no} ({v.type})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Operational Date</label>
                  <input 
                    type="date" 
                    className="adm_sch__input" 
                    required 
                    value={newLesson.lesson_date}
                    onChange={(e) => setNewLesson({...newLesson, lesson_date: e.target.value})}
                  />
                </div>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Strategic Time Slot</label>
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
                <button type="button" className="adm_sch__modal_btn cancel" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="adm_sch__modal_btn submit">Commit Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingLesson && (
        <div className="adm_sch__modal_overlay">
          <div className="adm_sch__modal_content glass-panel">
            <div className="adm_sch__modal_header">
              <h2>Modify Operational Assignment</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateLesson}>
              <div className="adm_sch__form_group">
                <label>Override Instructor</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={editingLesson.instructor_id}
                  onChange={(e) => setEditingLesson({...editingLesson, instructor_id: e.target.value})}
                >
                  {formData.instructors.map(i => (
                    <option key={i.instructor_id} value={i.instructor_id}>
                      {i.first_name} {i.last_name} ({i.availability_status || 'Available'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="adm_sch__form_group">
                <label>Override Vehicle</label>
                <select 
                  className="adm_sch__input" 
                  required
                  value={editingLesson.vehicle_id}
                  onChange={(e) => setEditingLesson({...editingLesson, vehicle_id: e.target.value})}
                >
                  {formData.vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.reg_no} ({v.type})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Adjust Date</label>
                  <input 
                    type="date" 
                    className="adm_sch__input" 
                    required 
                    value={editingLesson.lesson_date}
                    onChange={(e) => setEditingLesson({...editingLesson, lesson_date: e.target.value})}
                  />
                </div>
                <div className="adm_sch__form_group" style={{ flex: 1 }}>
                  <label>Adjust Strategic Slot</label>
                  <select 
                    className="adm_sch__input" 
                    required
                    value={editingLesson.session_number}
                    onChange={(e) => setEditingLesson({...editingLesson, session_number: e.target.value})}
                  >
                    <option value="1">Session 1 (08-10 AM)</option>
                    <option value="2">Session 2 (10-12 AM)</option>
                    <option value="3">Session 3 (01-03 PM)</option>
                    <option value="4">Session 4 (03-05 PM)</option>
                  </select>
                </div>
              </div>

              <div className="adm_sch__modal_actions">
                <button type="button" className="adm_sch__modal_btn cancel" onClick={() => setShowEditModal(false)}>Close</button>
                <button type="submit" className="adm_sch__modal_btn submit">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
