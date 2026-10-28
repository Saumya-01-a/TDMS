import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  X, 
  Loader2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import './AdminPackages.css';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/admin/packages');
      const data = await res.json();
      if (data.ok) setPackages(data.packages);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowAddModal(false);
        setFormData({ name: '', price: '', description: '', status: 'Active' });
        fetchPackages();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to add package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPackage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/packages/${selectedPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowEditModal(false);
        fetchPackages();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to update package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async () => {
    try {
      const res = await fetch(`http://localhost:3000/admin/packages/${selectedPackage.id}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      if (data.ok) {
        setShowDeleteModal(false);
        fetchPackages();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to delete package");
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="adm-loader"><Loader2 className="spin" size={40} /></div>;

  return (
    <div className="adm-packages-container">
      {/* Header Banner */}
      <div className="adm-header-banner glass-card">
        <div className="adm-banner-left">
          <h1>Package Management</h1>
          <p>Create, update, and manage driving lesson subscriptions</p>
        </div>
        <div className="adm-action-btns">
          <button className="btn-primary" onClick={() => {
            setFormData({ name: '', price: '', description: '', status: 'Active' });
            setShowAddModal(true);
          }}>
            <Plus size={18} />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="adm-controls">
        <div className="adm-search-box glass-card">
          <Search size={18} color="#8892b0" />
          <input 
            type="text" 
            placeholder="Search packages by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="adm-table-wrapper glass-card">
        <table className="pkg-table">
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Description</th>
              <th>Price (LKR)</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.length > 0 ? filteredPackages.map(pkg => (
              <tr key={pkg.id}>
                <td>
                  <div className="pkg-name-wrapper">
                    <div className="pkg-icon"><Package size={16} /></div>
                    <span className="pkg-name">{pkg.name}</span>
                  </div>
                </td>
                <td className="pkg-desc">{pkg.description || "No description provided"}</td>
                <td className="pkg-price">
                  <span className="price-tag">{parseFloat(pkg.price).toLocaleString()} LKR</span>
                </td>
                <td>
                  <span className={`status-badge ${pkg.status?.toLowerCase()}`}>
                    {pkg.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns justify-end">
                    <button className="action-icon-btn edit" onClick={() => {
                      setSelectedPackage(pkg);
                      setFormData({
                        name: pkg.name,
                        price: pkg.price,
                        description: pkg.description || '',
                        status: pkg.status
                      });
                      setShowEditModal(true);
                    }}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => {
                      setSelectedPackage(pkg);
                      setShowDeleteModal(true);
                    }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <Info size={40} />
                  <p>No packages found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>{showAddModal ? "Create New Package" : "Edit Package Details"}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }}><X size={20} /></button>
            </div>
            <form onSubmit={showAddModal ? handleAddPackage : handleEditPackage}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Package Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Premium Car Package"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Price (LKR)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="25000"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group span-2">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="List the features included in this package..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" size={18} /> : (showAddModal ? <Plus size={18} /> : <Edit3 size={18} />)}
                  <span>{showAddModal ? "Create Package" : "Update Package"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card delete-modal">
            <div className="warning-icon"><AlertTriangle size={32} /></div>
            <h3>Remove Package?</h3>
            <p>
              Are you sure you want to delete the <strong>{selectedPackage.name}</strong>? 
              This will remove it from the public pricing page. 
              <br/><em>Note: Packages with enrolled students cannot be deleted.</em>
            </p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Keep Package</button>
              <button className="btn-primary btn-danger" onClick={handleDeletePackage}>Delete Permanent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
