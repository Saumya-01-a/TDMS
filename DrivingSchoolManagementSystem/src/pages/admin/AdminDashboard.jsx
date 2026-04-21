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
  ChevronRight,
  Calendar as CalendarIcon,
  Download
} from 'lucide-react';
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
import { useStudentContext } from '../../context/StudentContext';
import GlobalLogo from '../../components/common/GlobalLogo';
import './adminDashboard.css';

// Central overview for administrators to track registrations, instructor status, and financial health

export default function AdminDashboard() {
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
    const socket = io('http://127.0.0.1:3000');
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
        fetch('http://127.0.0.1:3000/admin/dashboard-stats'),
        fetch('http://127.0.0.1:3000/admin/pending-instructors'),
        fetch('http://127.0.0.1:3000/admin/recent-activity'),
        fetch('http://127.0.0.1:3000/admin/financial-overview'),
        fetch('http://127.0.0.1:3000/trials/stats')
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const activityData = await activityRes.json();
      const finData = await financialRes.json();
      const trialData = await trialRes.json();

      if (statsData.ok) {
        setStats({ 
          ...statsData.stats, 
          upcomingTrials: trialData.upcomingCount || 0 
        });
      }
      if (pendingData.ok) setPendingInstructors(pendingData.instructors);
      if (activityData.ok) setActivities(activityData.activities);
      if (finData.ok) setFinancialData(finData.data);

    } catch (err) {
      console.error("Dashboard synchronization failure:", err);
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
      const res = await fetch('http://127.0.0.1:3000/admin/approve-instructor', {
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
        fetchDashboardData();
      } else {
        alert(data.message || "Database synchronization failed.");
      }
    } catch (err) {
      alert("Network failure. Ensure the administrative server is running.");
    } finally {
      setActionLoading(false);
    }
  };

  const getMonthName = (m) => {
    return new Date(2024, m - 1).toLocaleString('default', { month: 'short' });
  };

  // Generates and downloads a CSV financial report based on current data
  const downloadFinancialReport = () => {
    if (!financialData.length) return alert("System Notice: No financial data available for export.");
    
    const csvData = financialData.map(m => ({
      Month: getMonthName(m.month),
      Year: new Date().getFullYear(),
      'Collections (LKR)': parseInt(m.collections),
      'Payouts (LKR)': parseInt(m.payouts),
      'Net Gain (LKR)': parseInt(m.net)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Thisara_Financial_Report_${new Date().getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="admDash__loading">Synchronizing with Primary Database...</div>;

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
              <span className="stat-value">{stats.totalStudents}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel">
            <div className="stat-icon instructors"><UserPlus size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Active Instructors</span>
              <span className="stat-value">{stats.activeInstructors}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel highlight">
            <div className="stat-icon pending"><Clock size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pendingApprovals}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel">
            <div className="stat-icon vehicles"><Car size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Vehicles</span>
              <span className="stat-value">{stats.activeVehicles}</span>
            </div>
          </div>
          <a href="/admin/trial-exams" className="admDash__stat-card glass-panel highlight-red clickable-card">
            <div className="stat-icon trials"><CalendarIcon size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Upcoming Trials</span>
              <span className="stat-value">{stats.upcomingTrials}</span>
            </div>
          </a>

          {/* New Financial Alerts */}
          <div className="admDash__stat-card glass-panel warning">
            <div className="stat-icon dues"><DollarSign size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Dues</span>
              <span className="stat-value text-gold">Rs. {parseFloat(stats.totalStudentDues).toLocaleString()}</span>
            </div>
          </div>
          <div className="admDash__stat-card glass-panel error">
            <div className="stat-icon payable"><Wallet size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Payable</span>
              <span className="stat-value text-brand-red">Rs. {parseFloat(stats.totalInstructorPayable).toLocaleString()}</span>
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
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all group"
            >
              <Download size={16} className="text-brand-red group-hover:scale-110 transition-transform" />
              Download Reports
            </button>
          </div>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={financialData.map(m => ({
                  ...m,
                  name: getMonthName(m.month),
                  collections: parseInt(m.collections),
                  payouts: parseInt(m.payouts),
                  net: parseInt(m.net)
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
                  tickFormatter={(val) => `Rs.${val > 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
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
                <a href="/admin/students" className="shortcut-btn glass-card">
                  <Users size={20} /> <span>Students</span>
                </a>
                <a href="/admin/instructors" className="shortcut-btn glass-card">
                  <UserPlus size={20} /> <span>Instructors</span>
                </a>
                <a href="/admin/schedule" className="shortcut-btn glass-card">
                  <Clock size={20} /> <span>Schedule</span>
                </a>
                <a href="/admin/vehicles" className="shortcut-btn glass-card">
                  <Car size={20} /> <span>Vehicles</span>
                </a>
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
                {activities.map(act => (
                  <div key={act.id} className="activity-item">
                    <div className={`activity-dot ${act.type}`}></div>
                    <div className="activity-content">
                      <p>{act.message}</p>
                      <span className="activity-time">{new Date(act.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
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
