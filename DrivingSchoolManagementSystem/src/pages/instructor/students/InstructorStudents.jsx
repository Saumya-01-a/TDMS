import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Download, 
  Trash2, 
  CheckCircle, 
  TrendingUp, 
  Award,
  Filter,
  FileText
} from 'lucide-react';
import './instructorStudents.css';

export default function InstructorStudents() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, completed: 0 });
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  // Auth Context (Mocking typical project auth structure)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const instructorId = localStorage.getItem('instructorId') || 'INST-DEFAULT';
  const isAdmin = user.role === 'Admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, statRes, pkgRes] = await Promise.all([
        fetch(`http://localhost:3000/instructor/students/${instructorId}`),
        fetch(`http://localhost:3000/instructor/student-stats/${instructorId}`),
        fetch(`http://localhost:3000/instructor/packages`)
      ]);

      const stuData = await stuRes.json();
      const statData = await statRes.json();
      const pkgData = await pkgRes.json();

      if (stuData.ok) setStudents(stuData.students);
      if (statData.ok) setStats(statData.stats);
      if (pkgData.ok) setPackages(pkgData.packages);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hybrid Data Logic: First 5 rows mock with Sri Lankan names, rest real
  const displayData = useMemo(() => {
    const mockRows = [
      {
        student_id: 'SL-2026-001',
        first_name: 'Amara',
        last_name: 'Gunawardena',
        package_name: 'Premium Package',
        progress: 100,
        status: 'Completed',
        registered_date: '2026-01-15',
        tel_no: '077-123-4567'
      },
      {
        student_id: 'SL-2026-002',
        first_name: 'Bandara',
        last_name: 'Ratnayake',
        package_name: 'Standard Package',
        progress: 65,
        status: 'Learning',
        registered_date: '2026-02-10',
        tel_no: '071-987-6543'
      },
      {
        student_id: 'SL-2026-003',
        first_name: 'Chathura',
        last_name: 'Silva',
        package_name: 'Basic Package',
        progress: 30,
        status: 'Learning',
        registered_date: '2026-03-05',
        tel_no: '072-555-4444'
      },
      {
        student_id: 'SL-2026-004',
        first_name: 'Dilrukshi',
        last_name: 'Fernando',
        package_name: 'Standard Package',
        progress: 0,
        status: 'Inactive',
        registered_date: '2026-02-28',
        tel_no: '075-111-2222'
      },
      {
        student_id: 'SL-2026-005',
        first_name: 'Eranga',
        last_name: 'Perera',
        package_name: 'Premium Package',
        progress: 85,
        status: 'Trial Pending',
        registered_date: '2026-01-20',
        tel_no: '076-888-9999'
      }
    ];
    return [...mockRows, ...students];
  }, [students]);

  // Instant Frontend Filtering
  const filteredStudents = displayData.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || s.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || s.package_name === packageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.filter(s => s.status === 'Inactive').map(s => s.student_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleUpdateProgress = async (id, currentProgress) => {
    if (!isAdmin) return;
    const newProgress = prompt("Enter new progress (0-100):", currentProgress);
    if (newProgress === null || isNaN(newProgress)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/update-progress/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: parseInt(newProgress) })
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleCompleteLicense = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to mark this student as Completed? This will trigger a notification and review prompt.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/complete-license/${id}`, { method: 'PATCH' });
      if (res.ok) {
        alert("License Completed! Student has been notified.");
        fetchData();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleBulkCleanup = async () => {
    if (!isAdmin || selectedIds.length === 0) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/admin/bulk-cleanup`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        alert("Cleanup complete.");
        setSelectedIds([]);
        setShowCleanupModal(false);
        fetchData();
      }
    } catch (err) {
      alert("Cleanup failed");
    }
  };

  const handleExport = () => {
    window.open('http://localhost:3000/api/admin/export-students', '_blank');
  };

  if (loading) return <div className="ins_stu__container">Loading student records...</div>;

  return (
    <div className="ins_stu__container">
      {/* METRICS ROW */}
      <div className="ins_stu__metrics_row">
        <div className="ins_stu__metric_card glass-card">
          <div className="ins_stu__metric_header">
            <Users size={20} className="text-gold" />
            <span className="ins_stu__metric_label">Total Students</span>
          </div>
          <div className="ins_stu__metric_value">{(stats?.total || 0) + 5}</div>
        </div>
        <div className="ins_stu__metric_card glass-card">
          <div className="ins_stu__metric_header">
            <TrendingUp size={20} style={{color: '#E11B22'}} />
            <span className="ins_stu__metric_label">Active Learning</span>
          </div>
          <div className="ins_stu__metric_value" style={{color: '#E11B22'}}>{(stats?.active || 0) + 2}</div>
        </div>
        <div className="ins_stu__metric_card glass-card">
          <div className="ins_stu__metric_header">
            <Award size={20} style={{color: '#fcc419'}} />
            <span className="ins_stu__metric_label">Completed</span>
          </div>
          <div className="ins_stu__metric_value" style={{color: '#fcc419'}}>{(stats?.completed || 0) + 1}</div>
        </div>
        <div className="ins_stu__metric_card glass-card">
          <div className="ins_stu__metric_header">
            <UserPlus size={20} style={{color: '#8892b0'}} />
            <span className="ins_stu__metric_label">Inactive</span>
          </div>
          <div className="ins_stu__metric_value" style={{color: '#8892b0'}}>{stats?.inactive || 1}</div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="ins_stu__controls_wrapper glass-card">
        <div className="ins_stu__search_group">
          <div className="ins_stu__search_box">
            <Search size={18} className="ins_stu__search_icon" />
            <input 
              className="ins_stu__input glass-input" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ins_stu__filter_box">
            <Filter size={18} className="ins_stu__filter_icon" />
            <select className="ins_stu__input glass-input ins_stu__select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Learning">Learning</option>
              <option value="Trial Pending">Trial Pending</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="ins_stu__filter_box">
            <FileText size={18} className="ins_stu__filter_icon" />
            <select className="ins_stu__input glass-input ins_stu__select" value={packageFilter} onChange={e => setPackageFilter(e.target.value)}>
              <option value="all">All Packages</option>
              {packages.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="ins_stu__actions_group">
          {isAdmin && (
            <>
              <button className="ins_stu__btn ins_stu__btn_secondary glass-input" onClick={handleExport}>
                <Download size={18} /> Export
              </button>
              <button 
                className="ins_stu__btn ins_stu__btn_danger glass-input" 
                disabled={selectedIds.length === 0}
                onClick={() => setShowCleanupModal(true)}
              >
                <Trash2 size={18} /> Cleanup {selectedIds.length > 0 && `(${selectedIds.length})`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="ins_stu__table_container glass-table-container">
        <table className="ins_stu__table glass-table">
          <thead>
            <tr>
              {isAdmin && (
                <th>
                  <input type="checkbox" onChange={handleSelectAll} />
                </th>
              )}
              <th>Student Name & ID</th>
              <th>Package</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Join Date</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr 
                key={student.student_id} 
                className={`${student.status === 'Completed' ? 'ins_stu__row_completed' : ''} ${selectedIds.includes(student.student_id) ? 'ins_stu__row_selected' : ''}`}
              >
                {isAdmin && (
                  <td>
                    <input 
                      type="checkbox" 
                      className="ins_stu__checkbox"
                      disabled={student.status !== 'Inactive'}
                      checked={selectedIds.includes(student.student_id)}
                      onChange={() => handleToggleSelect(student.student_id)}
                    />
                  </td>
                )}
                <td>
                  <div className="ins_stu__student_info">
                    <div className="ins_stu__avatar">{student.first_name[0]}</div>
                    <div>
                      <div style={{fontWeight: 'bold'}}>{student.first_name} {student.last_name}</div>
                      <div className="ins_stu__textSecondary" style={{fontSize: '0.8rem'}}>{student.student_id}</div>
                    </div>
                  </div>
                </td>
                <td>{student.package_name || 'N/A'}</td>
                <td>
                  <div className="ins_stu__progress_wrapper">
                    <div className="ins_stu__progress_bar">
                      <div 
                        className="ins_stu__progress_fill" 
                        style={{
                          width: `${student.progress}%`,
                          background: student.progress === 100 ? '#E11B22' : '#fcc419'
                        }}
                      ></div>
                    </div>
                    <div style={{fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      {student.progress}% {student.progress === 100 && <CheckCircle size={12} className="text-gold" />}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`ins_stu__badge ins_stu__badge_${student.status.toLowerCase().replace(' ', '_')}`}>
                    {student.status}
                  </span>
                </td>
                <td>{new Date(student.registered_date).toLocaleDateString()}</td>
                {isAdmin && (
                  <td>
                    <div className="ins_stu__actions_group">
                      <button 
                        className="ins_stu__actionBtn" 
                        title="Update Progress"
                        onClick={() => handleUpdateProgress(student.student_id, student.progress)}
                      >
                        <TrendingUp size={18} />
                      </button>
                      {student.status !== 'Completed' && (
                        <button 
                          className="ins_stu__actionBtn" 
                          title="Set Completed"
                          onClick={() => handleCompleteLicense(student.student_id)}
                        >
                          <Award size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CLEANUP MODAL */}
      {showCleanupModal && (
        <div className="ins_stu__modal_overlay">
          <div className="ins_stu__modal">
            <h2 style={{marginTop: 0}}>⚠️ Security Confirmation</h2>
            <p>You are about to permanently delete <strong>{selectedIds.length}</strong> selected inactive students.</p>
            <p style={{color: 'var(--ins_stu__danger)', fontSize: '0.9rem'}}>This action cannot be undone and will clear all associated database records and Supabase files.</p>
            <div className="ins_stu__actions_group" style={{marginTop: '2rem', justifyContent: 'flex-end'}}>
              <button className="ins_stu__btn ins_stu__btn_secondary" onClick={() => setShowCleanupModal(false)}>Cancel</button>
              <button className="ins_stu__btn ins_stu__btn_danger" style={{background: 'var(--ins_stu__danger)', color: '#fff'}} onClick={handleBulkCleanup}>Confirm Permanent Deletion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
