import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  Eye,
  CheckCircle,
  Clock,
  Briefcase,
  DollarSign,
  History,
  AlertCircle
} from 'lucide-react';
import './adminInstructors.css';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttentionAdd, setShowAttentionAdd] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', nic: '', address: '', licenseNo: '', special: '', regNo: '', status: 'approved'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/admin/all-instructors');
      const data = await res.json();
      if (data.ok) setInstructors(data.instructors);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddInstructor = async (e) => {
    e.preventDefault();
    setShowAttentionAdd(true);
  };

  const handleAddInstructor = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/admin/add-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowAttentionAdd(false);
        setShowAddModal(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', nic: '', address: '', licenseNo: '', special: '', regNo: '', status: 'approved' });
        fetchInstructors();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to add instructor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInstructor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/edit-instructor/${selectedInstructor.instructor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowEditModal(false);
        fetchInstructors();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to update instructor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstructor = async () => {
    try {
      const res = await fetch(`http://localhost:3000/admin/delete-instructor/${selectedInstructor.instructor_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setShowDeleteModal(false);
        fetchInstructors();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to delete instructor");
    }
  };

  const openPayoutModal = async (ins) => {
    setSelectedInstructor(ins);
    setShowPayoutModal(true);
    setPayoutDetails(null);
    try {
      const res = await fetch(`http://localhost:3000/admin/instructor-payout/${ins.instructor_id}`);
      const data = await res.json();
      if (data.ok) setPayoutDetails(data.details);
    } catch (err) {
      console.error("Payout Detail Error:", err);
    }
  };

  const filteredInstructors = instructors.filter(ins => {
    const matchesSearch = `${ins.first_name} ${ins.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ins.instructor_reg_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || ins.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.approval_status === 'approved').length,
    pending: instructors.filter(i => i.approval_status === 'pending').length
  };

  if (loading) return <div className="adm-loader"><Loader2 className="spin" size={40} /></div>;

  return (
    <div className="adm-ins-container">
      {/* Banner / Header */}
      <div className="adm-header-banner glass-card">
        <div className="adm-banner-left">
          <h1>Staff Repository</h1>
          <p>Verified Professionals & Driving Educators</p>
        </div>
        <div className="adm-action-btns">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Enroll Instructor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-stats-row">
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h2>{stats.total}</h2>
            <p>Total Staff</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h2>{stats.active}</h2>
            <p>Active Instructors</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <h2>{stats.pending}</h2>
            <p>Pending Approvals</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="adm-controls">
        <div className="adm-search-filter">
          <div className="adm-search-box">
            <Search size={18} color="#8892b0" />
            <input 
              type="text" 
              placeholder="Search by Name or Reg #..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-secondary" style={{ padding: '0.6rem' }} onClick={fetchInstructors}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="adm-table-wrapper shadow-xl">
        <table className="std-table">
          <thead>
            <tr>
              <th>Professional</th>
              <th>Reg / License</th>
              <th>Specialization</th>
              <th>Contact Info</th>
              <th>Credentials</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructors.map(ins => (
              <tr key={ins.instructor_id}>
                <td>
                  <div className="std-info">
                    <div className="std-avatar">
                      {ins.profile_image_url ? <img src={ins.profile_image_url} alt="P" /> : ins.first_name[0]}
                    </div>
                    <div>
                      <span className="std-name">{ins.first_name} {ins.last_name}</span>
                      <span className="std-id">SEC-ID: {ins.instructor_id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{ins.instructor_reg_no}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8892b0' }}>{ins.licence_no}</span>
                  </div>
                </td>
                <td>
                  <span className="value-spec">{ins.specialization || 'General'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.9rem' }}>{ins.email}</span>
                    <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>{ins.tel_no}</span>
                  </div>
                </td>
                <td>
                  {ins.verification_document ? (
                    <a href={ins.verification_document} target="_blank" rel="noreferrer" className="action-icon-btn payout" title="View Docs">
                      <Eye size={18} />
                    </a>
                  ) : <span style={{ color: '#555e7d', fontSize: '0.8rem' }}>None</span>}
                </td>
                <td>
                  <span className={`status-badge ${ins.approval_status}`}>
                    {ins.approval_status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-icon-btn instructor" title="Manage Finance" onClick={() => openPayoutModal(ins)}>
                      <DollarSign size={18} />
                    </button>
                    <button className="action-icon-btn edit" onClick={() => {
                      setSelectedInstructor(ins);
                      setFormData({
                        firstName: ins.first_name, lastName: ins.last_name, 
                        email: ins.email, phone: ins.tel_no, nic: ins.nic, 
                        address: ins.address_line_1 || '', licenseNo: ins.licence_no || '',
                        special: ins.specialization || '', regNo: ins.instructor_reg_no || '',
                        status: ins.approval_status
                      });
                      setShowEditModal(true);
                    }}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => {
                      setSelectedInstructor(ins);
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

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>Professional Staff Enrollment</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={confirmAddInstructor}>
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
                  <label>MTD Reg Number</label>
                  <input type="text" required value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>NIC Number</label>
                  <input type="text" required value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" placeholder="e.g. Heavy Vehicles" value={formData.special} onChange={e => setFormData({...formData, special: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <UserPlus size={18} />
                  <span>Review & Enroll</span>
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
            <div className="attention-icon"><AlertCircle size={32} /></div>
            <h3>Verify Instructor Details</h3>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
              You are about to register <b>{formData.firstName} {formData.lastName}</b> as a certified instructor. Please ensure their MTD Reg Number and NIC match their physical credentials.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAttentionAdd(false)}>Review Again</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddInstructor} disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE ATTENTION MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="attention-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><AlertTriangle size={32} /></div>
            <h3>Attention!</h3>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Are you sure you want to permanently remove <b>{selectedInstructor.first_name}</b> from the system? This action will purge their schedule, historical logs, and user account. <b>This cannot be undone.</b>
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Keep Staff</button>
              <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={handleDeleteInstructor}>Confirm Removal</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>Modify Professional Profile</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditInstructor}>
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input type="text" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>NIC Number</label>
                  <input type="text" value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>MTD Reg Number</label>
                  <input type="text" value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" value={formData.special} onChange={e => setFormData({...formData, special: e.target.value})} />
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

      {/* Payout Modal (Existing Logic Refined) */}
      {showPayoutModal && selectedInstructor && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3><DollarSign size={20} /> Financials: {selectedInstructor.first_name}</h3>
              <button onClick={() => setShowPayoutModal(false)}><X size={20} /></button>
            </div>
            {!payoutDetails ? <Loader2 className="spin" size={24} /> : (
              <div className="payout-body">
                <div className="adm-stats-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
                   <div className="adm-stat-card glass-card">
                      <div className="stat-info">
                        <h2>{payoutDetails.totalLessons}</h2>
                        <p>Total Lessons</p>
                      </div>
                   </div>
                   <div className="adm-stat-card glass-card">
                      <div className="stat-info">
                        <h2>Rs. {payoutDetails.totalAmountDue}</h2>
                        <p>Total Due</p>
                      </div>
                   </div>
                </div>
                <div className="payout-history">
                   <h4 style={{ marginBottom: '1rem', color: '#B91C1C' }}>Recent Payouts</h4>
                   {payoutDetails.payoutHistory.length > 0 ? payoutDetails.payoutHistory.map(h => (
                     <div key={h.payout_id} className="history-item glass-card" style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                       <span>Rs. {h.amount}</span> - <span>{new Date(h.payout_date).toLocaleDateString()}</span>
                     </div>
                   )) : <p>No history</p>}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPayoutModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
