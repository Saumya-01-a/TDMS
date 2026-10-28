import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Car, 
  MapPin, 
  Search, 
  RefreshCw, 
  X, 
  AlertCircle, 
  Loader2, 
  Navigation,
  Info,
  Activity,
  CheckCircle2,
  Wrench,
  Zap
} from 'lucide-react';
import './instructorVehicles.css';

export default function InstructorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Location Modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [latestLocation, setLatestLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      // Standardized to 127.0.0.1:3000
      const res = await fetch('http://127.0.0.1:3000/instructor/all-vehicles');
      const data = await res.json();
      if (data.ok) setVehicles(data.vehicles);
    } catch (err) {
      console.error("Fetch Fleet Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openLocationModal = async (vehicle) => {
    if (vehicle.status !== 'Available' && vehicle.status !== 'In Use') return;
    setSelectedVehicle(vehicle);
    setShowLocationModal(true);
    setLatestLocation(null);
    setMapLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/instructor/vehicle-location/${vehicle.vehicle_id}`);
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
      const container = document.getElementById('leaflet-map-ins-fleet');
      if (container && window.L) {
        if (mapRef.current) mapRef.current.remove();
        mapRef.current = window.L.map('leaflet-map-ins-fleet').setView([lat, lng], 15);
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

  const stats = useMemo(() => ({
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Available').length,
    inUse: vehicles.filter(v => v.status === 'In Use').length,
    service: vehicles.filter(v => v.status === 'Broken' || v.status === 'In Service').length
  }), [vehicles]);

  if (loading && vehicles.length === 0) return <div className="ins_veh__container flex items-center justify-center min-h-[400px]"><Loader2 className="spin text-brand-red" size={40} /></div>;

  return (
    <div className="ins_veh__container">
      {/* 📊 REAL-TIME METRICS */}
      <div className="ins_veh__metrics_row">
        <div className="ins_veh__metric_card glass-card">
          <div className="ins_veh__metric_header">
            <Car size={20} className="text-brand-red" />
            <span className="ins_veh__metric_label">Total Fleet</span>
          </div>
          <div className="ins_veh__metric_value">{stats.total}</div>
        </div>
        <div className="ins_veh__metric_card glass-card">
          <div className="ins_veh__metric_header">
            <CheckCircle2 size={20} style={{ color: '#E11B22' }} />
            <span className="ins_veh__metric_label">Available</span>
          </div>
          <div className="ins_veh__metric_value" style={{ color: '#E11B22' }}>{stats.active}</div>
        </div>
        <div className="ins_veh__metric_card glass-card">
          <div className="ins_veh__metric_header">
            <Activity size={20} style={{ color: '#fcc419' }} />
            <span className="ins_veh__metric_label">In Use</span>
          </div>
          <div className="ins_veh__metric_value" style={{ color: '#fcc419' }}>{stats.inUse}</div>
        </div>
        <div className="ins_veh__metric_card glass-card">
          <div className="ins_veh__metric_header">
            <Wrench size={20} style={{ color: '#8892b0' }} />
            <span className="ins_veh__metric_label">In Service</span>
          </div>
          <div className="ins_veh__metric_value" style={{ color: '#8892b0' }}>{stats.service}</div>
        </div>
      </div>

      {/* 🔍 SEARCH AND FILTERS */}
      <div className="ins_veh__controls glass-card">
        <div className="ins_veh__search_wrapper">
          <Search size={18} className="ins_veh__search_icon" />
          <input
            type="text"
            className="ins_veh__search_input glass-input"
            placeholder="Search Model or Plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ins_veh__filter_group">
          <select 
            className="ins_veh__filter_select glass-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="In Service">In Service</option>
            <option value="Broken">Broken</option>
          </select>
          <button className="ins_veh__sync_btn" onClick={fetchFleet}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* 🚗 TABLE MODE ROSTER */}
      <div className="ins_veh__table_wrapper glass-table-container">
        <table className="ins_veh__table glass-table">
          <thead>
            <tr>
              <th>Vehicle / Model</th>
              <th>Plate Number</th>
              <th>Type / Trans</th>
              <th>Safety Status</th>
              <th>Assigned Instructor</th>
              <th>Live Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
              <tr key={v.vehicle_id}>
                <td>
                  <div className="ins_veh__vehicle_info">
                    <div className="ins_veh__avatar"><Car size={20} /></div>
                    <div>
                      <div style={{fontWeight: 'bold'}}>{v.model}</div>
                      <div className="ins_veh__textSecondary" style={{fontSize: '0.8rem'}}>REF: {v.vehicle_id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ins_veh__plate">{v.registration_number?.toUpperCase()}</span>
                </td>
                <td>
                  <div className="ins_veh__transmission_cell">
                    <Zap size={14} className="text-brand-red" />
                    <span>{v.type} ({v.transmission})</span>
                  </div>
                </td>
                <td>
                  <span className={`ins_veh__badge ins_veh__badge_${v.status?.toLowerCase().replace(' ', '_')}`}>
                    {v.status || 'Available'}
                  </span>
                </td>
                <td>
                  <div className="ins_veh__instructor_cell">
                    <span style={{ color: v.instructor_name ? '#fff' : '#8892b0' }}>
                      {v.instructor_name || 'Fleet Reserve'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="ins_veh__actions">
                    <button 
                      className={`ins_veh__action_btn location ${(v.status !== 'Available' && v.status !== 'In Use') ? 'disabled' : ''}`} 
                      title="Live Tracking" 
                      onClick={() => openLocationModal(v)}
                      disabled={v.status !== 'Available' && v.status !== 'In Use'}
                    >
                      <MapPin size={18} />
                    </button>
                    <button className="ins_veh__action_btn info" title="Vehicle Details">
                      <Info size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>
                  No vehicles matching your lookup criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- LOCATION MODAL --- */}
      {showLocationModal && (
        <div className="ins_veh__modal_overlay">
          <div className="ins_veh__modal glass-card">
            <div className="ins_veh__modal_header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={20} color="#E11B22" />
                <h3>Live Deployment: {selectedVehicle?.model}</h3>
              </div>
              <button className="ins_veh__modal_close" onClick={() => setShowLocationModal(false)}><X size={20} /></button>
            </div>
            
            <div className="ins_veh__modal_body">
               {mapLoading && <div className="ins_veh__map_overlay"><Loader2 className="spin" /></div>}
               {!mapLoading && !latestLocation && (
                 <div className="ins_veh__map_empty">
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No real-time coordinates received recently.</p>
                 </div>
               )}
               <div id="leaflet-map-ins-fleet" style={{ width: '100%', height: '400px', borderRadius: '8px' }}></div>
            </div>
            <div className="ins_veh__modal_footer">
              <button className="ins_veh__btn_secondary" onClick={() => setShowLocationModal(false)}>Close Feed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
