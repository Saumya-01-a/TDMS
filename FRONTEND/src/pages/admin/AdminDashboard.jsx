import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Car, 
  Clock, 
  Eye, 
  Activity, 
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Wallet,
  BarChart3,
  Calendar as CalendarIcon,
  Download,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Papa from 'papaparse';
import { io } from 'socket.io-client';
import { useToast } from '../../context/ToastContext';
import './adminDashboard.css';

// Central overview for administrators to track registrations, instructor status, and financial health

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    pendingApprovals: 0,
    activeVehicles: 0,
    totalStudentDues: 0,
    totalInstructorPayable: 0,
    upcomingTrials: 0
  });
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states for sensitive administrative actions
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', data: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Real-time synchronization for global financial and student updates
    const socket = io('http://localhost:3000');
    socket.on("financial_update", () => {
      console.log("📈 Real-time Financial Update Received");
      fetchDashboardData();
    });

    socket.on("student_update", () => {
      console.log("👥 Real-time Student Update Received");
      fetchDashboardData();
    });

    return () => socket.disconnect();
  }, []);

  // Orchestrates parallel fetching of all dashboard metrics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, activityRes, financialRes, trialRes] = await Promise.all([
        fetch('http://localhost:3000/admin/dashboard-stats').catch(() => ({ json: () => ({ ok: false }) })),
        fetch('http://localhost:3000/admin/pending-instructors').catch(() => ({ json: () => ({ ok: false }) })),
        fetch('http://localhost:3000/admin/recent-activity').catch(() => ({ json: () => ({ ok: false }) })),
        fetch('http://localhost:3000/admin/financial-overview').catch(() => ({ json: () => ({ ok: false }) })),
        fetch('http://localhost:3000/trials/stats').catch(() => ({ json: () => ({ ok: false }) }))
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const activityData = await activityRes.json();
      const finData = await financialRes.json();
      const trialData = await trialRes.json();

      if (statsData.ok && statsData.stats) {
        setStats({ 
          totalStudents: Number(statsData.stats.totalStudents) || 0,
          activeInstructors: Number(statsData.stats.activeInstructors) || 0,
          pendingApprovals: Number(statsData.stats.pendingApprovals) || 0,
          activeVehicles: Number(statsData.stats.activeVehicles) || 0,
          totalStudentDues: parseFloat(statsData.stats.totalStudentDues) || 0,
          totalInstructorPayable: parseFloat(statsData.stats.totalInstructorPayable) || 0,
          upcomingTrials: Number(trialData.upcomingCount) || 0 
        });
      }
      if (pendingData.ok && Array.isArray(pendingData.instructors)) {
        setPendingInstructors(pendingData.instructors);
      }
      if (activityData.ok && Array.isArray(activityData.activities)) {
        setActivities(activityData.activities);
      }
      if (finData.ok && Array.isArray(finData.data)) {
        setFinancialData(finData.data);
      }

    } catch (err) {
      console.error("Dashboard synchronization failure:", err);
      showToast("Notice: Some live dashboard metrics could not sync.", "info");
    } finally {
      setLoading(false);
    }
  };

  // Triggers action confirmation for instructor status updates
  const handleActionClick = (instructor, type) => {
    setConfirmModal({ show: true, type, data: instructor });
  };

  // Executes the instructor status update on the server
  const processApproval = async () => {
    if (!confirmModal.data) return;
    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:3000/admin/approve-instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instructorId: confirmModal.data.instructor_id, 
          status: confirmModal.type === 'approve' ? 'approved' : 'rejected' 
        })
      });
      const data = await res.json();
      if (data.ok) {
        setConfirmModal({ show: false, type: '', data: null });
        showToast(`Instructor ${confirmModal.type === 'approve' ? 'approved' : 'rejected'} successfully!`, "success");
        fetchDashboardData();
      } else {
        showToast(data.message || "Database synchronization failed.", "error");
      }
    } catch (err) {
      showToast("Network failure: Administrative server unreachable.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getMonthName = (m) => {
    return new Date(2026, m - 1).toLocaleString('default', { month: 'short' });
  };

  // Generates and downloads a CSV financial report based on current data
  const downloadFinancialReport = () => {
    try {
      let dataToExport = financialData;
      if (!dataToExport || !dataToExport.length) {
        dataToExport = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          collections: 0,
          payouts: 0,
          net: 0
        }));
      }

      const currentYear = new Date().getFullYear();
      const csvData = dataToExport.map(m => ({
        Month: getMonthName(m.month),
        Year: currentYear,
        'Collections (LKR)': parseFloat(m.collections || 0).toFixed(2),
        'Payouts (LKR)': parseFloat(m.payouts || 0).toFixed(2),
        'Net Gain (LKR)': parseFloat(m.net || 0).toFixed(2)
      }));

      // Calculate totals row
      const totalCollections = csvData.reduce((acc, row) => acc + parseFloat(row['Collections (LKR)']), 0);
      const totalPayouts = csvData.reduce((acc, row) => acc + parseFloat(row['Payouts (LKR)']), 0);
      const totalNet = totalCollections - totalPayouts;

      csvData.push({
        Month: 'FULL YEAR TOTAL',
        Year: currentYear,
        'Collections (LKR)': totalCollections.toFixed(2),
        'Payouts (LKR)': totalPayouts.toFixed(2),
        'Net Gain (LKR)': totalNet.toFixed(2)
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Thisara_Financial_Report_${currentYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Financial Summary CSV exported successfully!", "success");
    } catch (err) {
      console.error("Export failure:", err);
      showToast("Export failed: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="admDash__wrapper">
        <div className="admDash__container">
          <div className="admDash__loading-skeleton">
            <div className="skeleton-header">
              <Loader2 className="spin" size={32} color="#E11B22" />
              <span>Synchronizing Command Center with Central Database...</span>
            </div>
            <div className="skeleton-grid">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="skeleton-card glass-panel" />
              ))}
            </div>
            <div className="skeleton-chart glass-panel" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admDash__wrapper" id="id_admin_control_center">
      <div className="admDash__container">
        {/* Branding Header */}
        <header className="admDash__header">
          <div className="admDash__header-info">
            <h1>Command Center</h1>
            <p>Intelligence & Operational Visibility</p>
          </div>
        </header>

        {/* Stats Row */}
        <div className="admDash__stats">
          <div className="admDash__stat-card glass-panel" id="stat_total_students">
            <div className="stat-icon students"><Users size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Verified Students</span>
              <span className="stat-value">{stats.totalStudents || 0}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel">
            <div className="stat-icon instructors"><UserPlus size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Active Instructors</span>
              <span className="stat-value">{stats.activeInstructors || 0}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel highlight">
            <div className="stat-icon pending"><Clock size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Pending Approvals</span>
              <span className="stat-value">{stats.pendingApprovals || 0}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel">
            <div className="stat-icon vehicles"><Car size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Vehicles</span>
              <span className="stat-value">{stats.activeVehicles || 0}</span>
            </div>
          </div>
          <Link to="/admin/exams" className="admDash__stat-card glass-panel highlight-red clickable-card">
            <div className="stat-icon trials"><CalendarIcon size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Upcoming Trials</span>
              <span className="stat-value">{stats.upcomingTrials || 0}</span>
            </div>
          </Link>

          {/* Financial Alerts */}
          <div className="admDash__stat-card glass-panel warning">
            <div className="stat-icon dues"><DollarSign size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Dues</span>
              <span className="stat-value text-gold">Rs. {parseFloat(stats.totalStudentDues || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel error">
            <div className="stat-icon payable"><Wallet size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Payable</span>
              <span className="stat-value text-brand-red">Rs. {parseFloat(stats.totalInstructorPayable || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Financial Overview (Integrated Chart) */}
        <section className="admDash__section glass-panel full-width">
          <div className="section-header flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-brand-red" />
              <h2>Financial Growth Trajectory ({new Date().getFullYear()})</h2>
            </div>
            <button 
              onClick={downloadFinancialReport}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all group cursor-pointer"
            >
              <Download size={16} className="text-brand-red group-hover:scale-110 transition-transform" />
              <span>Download Reports</span>
            </button>
          </div>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={financialData.map(m => ({
                  ...m,
                  name: getMonthName(m.month),
                  collections: parseFloat(m.collections || 0),
                  payouts: parseFloat(m.payouts || 0),
                  net: parseFloat(m.net || 0)
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  tickFormatter={(val) => `Rs.${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="collections" 
                  stroke="#ff4d4d" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCollections)" 
                  name="Collected"
                />
                <Area 
                  type="monotone" 
                  dataKey="payouts" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPayouts)" 
                  name="Payouts"
                />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#22c55e" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  fill="transparent" 
                  name="Net Gain"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="admDash__main-grid">
          {/* Left Column: Instructor Approvals */}
          <div className="admDash__left">
            <section className="admDash__section glass-panel">
              <div className="section-header">
                <ShieldCheck size={20} className="text-info" />
                <h2>Instructor Approval Queue</h2>
              </div>
              
              <div className="admDash__table-wrap">
                <table className="admDash__table">
                  <thead>
                    <tr>
                      <th>Instructor</th>
                      <th>Credentials</th>
                      <th>Docs</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingInstructors.length > 0 ? pendingInstructors.map(ins => (
                      <tr key={ins.instructor_id}>
                        <td>
                          <div className="ins-cell">
                            <span className="ins-name">{ins.first_name} {ins.last_name}</span>
                            <span className="ins-id">{ins.instructor_reg_no}</span>
                          </div>
                        </td>
                        <td>
                          <div className="ins-meta">
                            <span>{ins.email}</span>
                          </div>
                        </td>
                        <td>
                          {ins.verification_document ? (
                            <a href={ins.verification_document} target="_blank" rel="noopener noreferrer" className="btn-view-doc">
                              <Eye size={14} /> View
                            </a>
                          ) : (
                            <span className="no-docs">None</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button className="btn-approve" onClick={() => handleActionClick(ins, 'approve')}>Approve</button>
                            <button className="btn-reject" onClick={() => handleActionClick(ins, 'reject')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="empty-row">No pending applications at this time.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Links */}
            <section className="admDash__section glass-panel">
              <div className="section-header">
                <Activity size={20} className="text-brand-red" />
                <h2>Quick Shortcuts</h2>
              </div>
              <div className="admDash__shortcuts">
                <Link to="/admin/students" className="shortcut-btn glass-card">
                  <Users size={20} /> <span>Students</span>
                </Link>
                <Link to="/admin/instructors" className="shortcut-btn glass-card">
                  <UserPlus size={20} /> <span>Instructors</span>
                </Link>
                <Link to="/admin/appointments" className="shortcut-btn glass-card">
                  <Clock size={20} /> <span>Schedule</span>
                </Link>
                <Link to="/admin/vehicles" className="shortcut-btn glass-card">
                  <Car size={20} /> <span>Vehicles</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="admDash__right">
            <section className="admDash__section glass-panel activity-feed">
              <div className="section-header">
                <Activity size={20} className="text-brand-red" />
                <h2>Audit Log</h2>
              </div>
              <div className="admDash__activity-list">
                {activities.length > 0 ? activities.map(act => (
                  <div key={act.id} className="activity-item">
                    <div className={`activity-dot ${act.type}`}></div>
                    <div className="activity-content">
                      <p>{act.message}</p>
                      <span className="activity-time">{new Date(act.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="empty-row" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    No recent audit activity recorded.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="admDash__modal-overlay">
          <div className="admDash__modal glass-panel">
            <div className="modal-icon">
              <AlertCircle size={48} className={confirmModal.type === 'approve' ? 'text-green' : 'text-brand-red'} />
            </div>
            <h3>Confirm {confirmModal.type === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <p>
              Are you sure you want to {confirmModal.type} <strong>{confirmModal.data.first_name} {confirmModal.data.last_name}</strong>? 
              This action will update their professional status in the system.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setConfirmModal({ show: false, type: '', data: null })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className={`btn-confirm ${confirmModal.type}`} 
                onClick={processApproval}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Confirm ${confirmModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
