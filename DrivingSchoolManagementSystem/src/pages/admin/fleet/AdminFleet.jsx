import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  MapPin, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  AlertTriangle, 
  Loader2, 
  CheckCircle, 
  Wrench, 
  Navigation,
  Info,
  AlertCircle
} from 'lucide-react';
import './adminFleet.css';

export default function AdminFleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAttentionAdd, setShowAttentionAdd] = useState(false);
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [latestLocation, setLatestLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    model: '', registration_number: '', type: 'Car', transmission: 'Manual', status: 'Available', year: new Date().getFullYear()
  });
  const [submitting, setSubmitting] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/admin/all-vehicles');
      const data = await res.json();
      if (data.ok) setVehicles(data.vehicles);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddVehicle = (e) => {
    e.preventDefault();
    setShowAttentionAdd(true);
  };

  const handleAddVehicle = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/admin/add-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowAttentionAdd(false);
        setShowAddModal(false);
        setFormData({ model: '', registration_number: '', type: 'Car', transmission: 'Manual', status: 'Available', year: new Date().getFullYear() });
        fetchVehicles();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/edit-vehicle/${selectedVehicle.vehicle_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setShowEditModal(false);
        fetchVehicles();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to update vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      const res = await fetch(`http://localhost:3000/admin/delete-vehicle/${selectedVehicle.vehicle_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setShowDeleteModal(false);
        fetchVehicles();
      } else alert(data.message);
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  const openLocationModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowLocationModal(true);
    setLatestLocation(null);
    setMapLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/vehicle-location/${vehicle.vehicle_id}`);
      const data = await res.json();
      if (data.ok) {
        setLatestLocation(data.location);
        initLeafletMap(data.location.lat, data.location.lng, vehicle.model);
      }
    } catch (err) {
      console.error("Location Fetch Error:", err);
    } finally {
      setMapLoading(false);
    }
  };

  const initLeafletMap = (lat, lng, name) => {
    setTimeout(() => {
      const container = document.getElementById('leaflet-map-fleet');
      if (container && window.L) {
        if (mapRef.current) mapRef.current.remove();
        mapRef.current = window.L.map('leaflet-map-fleet').setView([lat, lng], 15);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
        window.L.marker([lat, lng]).addTo(mapRef.current).bindPopup(name).openPopup();
      }
    }, 100);
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = (v.model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (v.registration_number?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Available').length,
    service: vehicles.filter(v => v.status === 'In Service' || v.status === 'Broken').length
  };

  if (loading) return <div className="adm-loader"><Loader2 className="spin" size={40} /></div>;

  return (
    <div className="adm-fleet-container">
      {/* Banner / Header */}
      <div className="adm-header-banner glass-card">
        <div className="adm-banner-left">
          <h1>Fleet Administration</h1>
          <p>Real-time vehicle health and GPS deployment hub</p>
        </div>
        <div className="adm-action-btns">
          <button className="btn-primary" onClick={() => {
            setFormData({ model: '', registration_number: '', type: 'Car', transmission: 'Manual', status: 'Available', year: new Date().getFullYear() });
            setShowAddModal(true);
          }}>
            <Plus size={18} />
            <span>Commission Vehicle</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-stats-row">
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Car size={24} /></div>
          <div className="stat-info">
            <h2>{stats.total}</h2>
            <p>Total Fleet</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Navigation size={24} /></div>
          <div className="stat-info">
            <h2>{stats.active}</h2>
            <p>Active on Road</p>
          </div>
        </div>
        <div className="adm-stat-card glass-card">
          <div className="stat-icon"><Wrench size={24} /></div>
          <div className="stat-info">
            <h2>{stats.service}</h2>
            <p>Maintenance Required</p>
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
              placeholder="Search by Model or Plate..."
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
            <option value="Available">Available</option>
            <option value="In Service">In Service</option>
            <option value="Broken">Broken</option>
          </select>
          <button className="btn-secondary" style={{ padding: '0.6rem' }} onClick={fetchVehicles}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="adm-table-wrapper shadow-xl">
        <table className="std-table">
          <thead>
            <tr>
              <th>Vehicle / Model</th>
              <th>Plate Number</th>
              <th>Type / Trans</th>
              <th>Status</th>
              <th>Current/Last Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => (
              <tr key={v.vehicle_id}>
                <td>
                  <div className="std-info">
                    <div className="std-avatar"><Car size={20} /></div>
                    <div>
                      <span className="std-name">{v.model}</span>
                      <span className="std-id">SYS-ID: {v.vehicle_id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, letterSpacing: '1px' }}>{v.registration_number?.toUpperCase()}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem' }}>{v.type} ({v.transmission})</span>
                </td>
                <td>
                  <span className={`status-badge ${v.status?.toLowerCase().replace(' ', '-')}`}>
                    {v.status || 'Available'}
                  </span>
                </td>
                <td>
                  <span style={{ color: v.instructor_name ? '#ccd6f6' : '#555e7d' }}>
                    {v.instructor_name || 'Unassigned / Depot'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-icon-btn location" title="Live Tracking" onClick={() => openLocationModal(v)}>
                      <MapPin size={18} />
                    </button>
                    <button className="action-icon-btn edit" onClick={() => {
                      setSelectedVehicle(v);
                      setFormData({ 
                        model: v.model, 
                        registration_number: v.registration_number, 
                        type: v.type, 
                        transmission: v.transmission, 
                        status: v.status, 
                        year: v.year 
                      });
                      setShowEditModal(true);
                    }}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => {
                      setSelectedVehicle(v);
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
              <h3>Commission New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={confirmAddVehicle}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Vehicle Model</label>
                  <input type="text" required placeholder="e.g. Toyota Corolla 2023" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input type="text" required placeholder="e.g. WP CAA-1234" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Vehicle Class</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                    <option value="Lorry">Lorry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                    <option value="Manual">Manual</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Plus size={18} />
                  <span>Review & Commission</span>
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
            <h3>Verify Fleet Addition</h3>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '2rem' }}>
              You are about to commission <b>{formData.model}</b> ({formData.registration_number}) into the active fleet. Please ensure the insurance and registration details are verified.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAttentionAdd(false)}>Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddVehicle} disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : 'Confirm Commission'}
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
              Decommissioning <b>{selectedVehicle.model}</b> will archive its scheduling history and purge current GPS tracking logs. <b>This action affects the scheduling system permanently.</b>
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Keep Vehicle</button>
              <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={handleDeleteVehicle}>Confirm Decommission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <h3>Maintenance Hub: {selectedVehicle.model}</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditVehicle}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                   <label>Vehicle Model</label>
                   <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input type="text" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Current Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Available">Available</option>
                    <option value="In Service">In Service</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Discard</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <span>Apply Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LOCATION MODAL --- */}
      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={20} className="text-brand-red" />
                <h3>Live Deployment: {selectedVehicle.model}</h3>
              </div>
              <button onClick={() => setShowLocationModal(false)}><X size={20} /></button>
            </div>
            <div className="payout-body">
              <div className="adm-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem' }}>
                <div className="adm-stat-card glass-card" style={{ padding: '0.75rem' }}>
                   <div className="stat-info">
                     <h2>{latestLocation ? `${latestLocation.speed} km/h` : 'N/A'}</h2>
                     <p>Current Speed</p>
                   </div>
                </div>
                <div className="adm-stat-card glass-card" style={{ padding: '0.75rem' }}>
                   <div className="stat-info">
                     <p style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>{latestLocation ? new Date(latestLocation.created_at).toLocaleString() : 'No Signal'}</p>
                     <p>Last Signal</p>
                   </div>
                </div>
                <div className="adm-stat-card glass-card" style={{ padding: '0.75rem' }}>
                   <div className="stat-info">
                     <p style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>{selectedVehicle.instructor_name || 'Depot Assignment'}</p>
                     <p>Operator</p>
                   </div>
                </div>
              </div>
              
              <div className="fleet-map-container">
                {mapLoading ? <Loader2 className="spin" size={32} /> : (
                  latestLocation ? (
                    <div id="leaflet-map-fleet"></div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                      <p>Hardware Signal Missing</p>
                      <span style={{ fontSize: '0.8rem', color: '#555e7d' }}>No historical logs found for this vehicle.</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowLocationModal(false)}>Close Feed</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
