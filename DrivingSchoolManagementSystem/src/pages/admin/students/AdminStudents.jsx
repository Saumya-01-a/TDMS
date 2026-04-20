import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  GraduationCap, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useStudentContext } from '../../../context/StudentContext';
import './adminStudents.css';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAttentionAdd, setShowAttentionAdd] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', nic: '', address: '', packageId: '', status: 'Learning', progress: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('student_update', () => {
      console.log('🔄 Student List sync triggered by student_update');
      fetchInitialData();
    });
    return () => socket.disconnect();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [stdRes, insRes, pkgRes] = await Promise.all([
        fetch('http://localhost:3000/admin/all-students'),
        fetch('http://localhost:3000/admin/all-instructors'),
        fetch('http://localhost:3000/api/packages')
      ]);
      const [stdData, insData, pkgData] = await Promise.all([stdRes.json(), insRes.json(), pkgRes.json()]);
      
      if (stdData.ok) setStudents(stdData.students);
      if (insData.ok) setInstructors(insData.instructors);
      if (pkgData.ok) setPackages(pkgData.packages);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddStudent = async (e) => {
    e.preventDefault();
    setShowAttentionAdd(true);
  };

  const handleAddStudent = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/admin/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.ok) {
        setShowAttentionAdd(false);
        setShowAddModal(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', nic: '', address: '', packageId: '', status: 'Learning', progress: 0 });
        
        // Refresh the list from the database immediately after successful registration
        fetchInitialData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to add student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/edit-student/${selectedStudent.student_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowEditModal(false);
        fetchInitialData();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const res = await fetch(`http://localhost:3000/admin/delete-student/${selectedStudent.student_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setShowDeleteModal(false);
        fetchInitialData();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  const handleAssignInstructor = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/assign-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.student_id, instructorId: selectedInstructorId })
      });
      const data = await res.json();
      if (data.ok) {
        setShowAssignModal(false);
        fetchInitialData();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to assign instructor");
    }
  };

  const handleExport = () => {
    window.location.href = "http://localhost:3000/admin/export-students";
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: students.length,
    learning: students.filter(s => s.status === 'Learning').length,
    completed: students.filter(s => s.status === 'Completed').length
  };

  if (loading) return <div className="adm-loader"><Loader2 className="spin" size={40} /></div>;

  return (
    <div className="adm-students-container">
      {/* Banner / Header */}
      <div className="adm-header-banner glass-card">
        <div className="adm-banner-left">
          <h1>Student Directory</h1>
          <p>Comprehensive management of driving candidates and progress</p>
        </div>
        <div className="adm-action-btns">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Manual Registration</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-stats-row">
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h2>{stats.total}</h2>
            <p>Total Registered</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><GraduationCap size={24} /></div>
          <div className="stat-info">
            <h2>{stats.learning}</h2>
            <p>Currently Learning</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><UserCheck size={24} /></div>
          <div className="stat-info">
            <h2>{stats.completed}</h2>
            <p>Course Completed</p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="adm-controls">
        <div className="adm-search-filter">
          <div className="adm-search-box">
            <Search size={18} color="#8892b0" />
            <input 
              type="text" 
              placeholder="Search by Name or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="adm-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Learning">Learning</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="btn-secondary" style={{ padding: '0.6rem' }} onClick={fetchInitialData}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="adm-table-wrapper shadow-xl">
        <table className="std-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Contacts</th>
              <th>Course / Package</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.student_id}>
                <td>
                  <div className="std-info">
                    <div className="std-avatar">{student.first_name[0]}</div>
                    <div>
                      <span className="std-name">{student.first_name} {student.last_name}</span>
                      <span className="std-nic">NIC: {student.nic}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#ccd6f6' }}>{student.email}</span>
                    <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>{student.tel_no}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{student.package_name || 'Not Selected'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="unassigned-text" style={{ color: student.instructor_name ? '#ccd6f6' : '#555e7d' }}>
                      {student.instructor_name || 'Unassigned'}
                    </span>
                    <button className="action-icon-btn instructor" onClick={() => {
                      setSelectedStudent(student);
                      setSelectedInstructorId(student.instructor_id || "");
                      setShowAssignModal(true);
                    }}>
                      <UserPlus size={16} />
                    </button>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${student.status?.toLowerCase() || 'learning'}`}>
                    {student.status || 'Learning'}
                  </span>
                </td>
                <td>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${student.progress}%` }}></div>
                  </div>
                  <span className="progress-val">{student.progress}%</span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-icon-btn edit" onClick={() => {
                      setSelectedStudent(student);
                      setFormData({
                        firstName: student.first_name, lastName: student.last_name, 
                        email: student.email, phone: student.tel_no, nic: student.nic, 
                        address: student.address || '', status: student.status, progress: student.progress,
                        packageId: student.package_id || ''
                      });
                      setShowEditModal(true);
                    }}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => {
                      setSelectedStudent(student);
                      setShowDeleteModal(true);
                    }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>Manual Student Registration</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={confirmAddStudent}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>NIC Number</label>
                  <input type="text" required value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Home Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Initial Training Package</label>
                  <select 
                    value={formData.packageId} 
                    onChange={e => setFormData({...formData, packageId: e.target.value})}
                  >
                    <option value="">-- Select Package (Optional) --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name} - LKR {pkg.price}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />}
                  <span>Register Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ATTENTION MODAL --- */}
      {showAttentionAdd && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="attention-icon" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: 'rgba(185, 28, 28, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}>
              <AlertCircle size={32} />
            </div>
            <h3>Finalize Registration?</h3>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Please review <b>{formData.firstName}'s</b> details. Are you sure you want to add this student to the student directory?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAttentionAdd(false)}>Review Again</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddStudent} disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>Edit Student Profile</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditStudent}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Learning">Learning</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Training Package</label>
                  <select 
                    value={formData.packageId} 
                    onChange={e => setFormData({...formData, packageId: e.target.value})}
                  >
                    <option value="">-- No Package --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Home Address</label>
                  <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Discard</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', margin: '0 auto 1.5rem', background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Terminate Student Account?</h3>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
              This will permanently delete <b>{selectedStudent.first_name}'s</b> profile, attendance logs, and session history. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Keep Account</button>
              <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={handleDeleteStudent}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGN INSTRUCTOR MODAL --- */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Link Instructor</h3>
              <button onClick={() => setShowAssignModal(false)}><X size={20} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Select Instructor for {selectedStudent.first_name}</label>
              <select 
                value={selectedInstructorId} 
                onChange={e => setSelectedInstructorId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- No Selection --</option>
                {instructors.map(ins => (
                  <option key={ins.instructor_id} value={ins.instructor_id}>
                    {ins.first_name} {ins.last_name} ({ins.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssignInstructor}>Link Account</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
