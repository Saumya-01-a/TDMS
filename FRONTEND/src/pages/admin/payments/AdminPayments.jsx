import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  RefreshCw, 
  Plus, 
  CreditCard, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { io } from 'socket.io-client';
import './adminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalPotential: 0, totalCollected: 0, totalBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    amount: '',
    payment_method: 'Cash'
  });

  useEffect(() => {
    fetchPayments();
    fetchAllStudents();

    const socket = io('http://localhost:3000');
    socket.on('financial_update', () => {
      console.log("💰 Financial update received via socket");
      fetchPayments();
    });
    return () => socket.disconnect();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/all-students');
      const data = await res.json();
      if (data.ok) setAllStudents(data.students);
    } catch (err) {
      console.error("Fetch Students Error:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/admin/payments');
      const data = await res.json();
      if (data.ok) {
        setPayments(data.payments);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment)
      });
      const data = await res.json();
      if (data.ok) {
        setShowAddModal(false);
        setNewPayment({ student_id: '', amount: '', payment_method: 'Cash' });
        fetchPayments();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="adm-loader"><Loader2 className="spin" size={40} /></div>;

  return (
    <div className="adm-payments-container">
      {/* Header Banner */}
      <div className="adm-header-banner glass-card">
        <div className="adm-banner-left">
          <h1>Financial Oversight</h1>
          <p>Revenue distribution and student payment tracking hub</p>
        </div>
        <div className="adm-action-btns">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-stats-row">
        <div className="adm-stat-card glass-card">
          <div className="stat-icon income"><DollarSign size={24} /></div>
          <div className="stat-info">
             <h2>Rs. {summary.totalCollected.toLocaleString()}</h2>
             <p>Total Collected</p>
          </div>
          <div className="stat-trend positive"><ArrowUpRight size={14} /> 12%</div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon dues"><Wallet size={24} /></div>
          <div className="stat-info">
             <h2>Rs. {summary.totalBalance.toLocaleString()}</h2>
             <p>Outstanding Balance</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon performance"><TrendingUp size={24} /></div>
          <div className="stat-info">
             <h2>Rs. {summary.totalPotential.toLocaleString()}</h2>
             <p>Total Potential</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="adm-controls">
        <div className="adm-search-filter">
          <div className="adm-search-box glass-card">
             <Search size={18} color="#8892b0" />
             <input 
               type="text" 
               placeholder="Search by student name or ID..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="btn-secondary" onClick={fetchPayments}>
             <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="adm-table-wrapper glass-card">
         <table className="pay-table">
            <thead>
               <tr>
                  <th>Student Identity</th>
                  <th>Subscription Package</th>
                  <th>Total Cost</th>
                  <th>Paid Amount</th>
                  <th>Balance Dues</th>
                  <th>Status</th>
               </tr>
            </thead>
            <tbody>
               {filteredPayments.map(p => {
                 const isFullyPaid = parseFloat(p.balance) <= 0;
                 return (
                   <tr key={p.student_id}>
                      <td>
                         <div className="p-std-info">
                            <div className="p-avatar">{p.student_name[0]}</div>
                            <div>
                               <span className="p-name">{p.student_name}</span>
                               <span className="p-id">ID: {p.student_id}</span>
                            </div>
                         </div>
                      </td>
                      <td><span className="p-pkg">{p.package_name}</span></td>
                      <td className="p-price">Rs. {parseFloat(p.package_price).toLocaleString()}</td>
                      <td className="p-paid">Rs. {parseFloat(p.amount_paid).toLocaleString()}</td>
                      <td className="p-balance">
                         <span className={isFullyPaid ? 'text-paid' : 'text-due'}>
                            Rs. {parseFloat(p.balance).toLocaleString()}
                         </span>
                      </td>
                      <td>
                         <span className={`p-status ${isFullyPaid ? 'paid' : 'pending'}`}>
                            {isFullyPaid ? 'Fully Paid' : 'Partially Paid'}
                         </span>
                      </td>
                   </tr>
                 );
               })}
               {filteredPayments.length === 0 && (
                 <tr>
                    <td colSpan="6" className="empty-state">
                       <AlertCircle size={40} />
                       <p>No financial records found.</p>
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
           <div className="modal-card glass-card">
              <div className="modal-header">
                 <div className="m-title">
                    <CreditCard size={20} className="text-brand-red" />
                    <h3>Record New Payment</h3>
                 </div>
                 <button onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleRecordPayment}>
                 <div className="form-grid">
                     <div className="form-group span-2">
                        <label>Select Enrolled Student</label>
                        <select 
                          className="adm-filter-select"
                          style={{ width: '100%', height: '42px', background: 'rgba(2, 12, 27, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#fff', padding: '0 10px' }}
                          value={newPayment.student_id}
                          onChange={e => setNewPayment({...newPayment, student_id: e.target.value})}
                          required
                        >
                          <option value="">-- Choose Student --</option>
                          {allStudents.map(s => (
                            <option key={s.student_id} value={s.student_id}>
                              {s.first_name} {s.last_name} ({s.student_id})
                            </option>
                          ))}
                        </select>
                     </div>
                    <div className="form-group">
                       <label>Amount (LKR)</label>
                       <input 
                         type="number" 
                         required 
                         placeholder="5000"
                         value={newPayment.amount}
                         onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                       />
                    </div>
                    <div className="form-group">
                       <label>Payment Method</label>
                       <select 
                         className="adm-filter-select"
                         style={{ width: '100%', height: '42px', background: 'rgba(2, 12, 27, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#fff', padding: '0 10px' }}
                         value={newPayment.payment_method}
                         onChange={e => setNewPayment({...newPayment, payment_method: e.target.value})}
                       >
                         <option value="Cash">Cash</option>
                         <option value="Bank Transfer">Bank Transfer</option>
                         <option value="Online">Online Payment</option>
                       </select>
                    </div>
                 </div>
                 <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                       {submitting ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                       <span>Record Entry</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
