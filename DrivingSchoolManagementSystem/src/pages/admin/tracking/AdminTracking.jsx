import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Polyline,
  FeatureGroup
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Search,
  Maximize2,
  Zap,
  ChevronRight,
  TrendingUp,
  History,
  ShieldCheck,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import './adminTracking.css';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Creates custom car icon with color coding
const createVehicleIcon = (isSelected, isActive) => new L.DivIcon({
  className: '',
  html: `<div class="car-icon-wrapper ${isSelected ? 'selected' : ''}" style="position:relative">
    <div style="
      width: 40px; height: 40px;
      border-radius: 50%;
      background: ${isSelected ? 'rgba(225,27,34,0.2)' : (isActive ? 'rgba(16,185,129,0.15)' : 'rgba(100,100,100,0.15)')};
      border: 2.5px solid ${isSelected ? '#E11B22' : (isActive ? '#10b981' : '#4b5563')};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 ${isSelected ? '18px rgba(225,27,34,0.6)' : (isActive ? '12px rgba(16,185,129,0.4)' : 'none')};
      transition: all 0.3s;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${isSelected ? '#E11B22' : (isActive ? '#10b981' : '#6b7280')}" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    </div>
    ${isActive ? `<div style="width:8px;height:8px;background:#10b981;border-radius:50%;position:absolute;top:-2px;right:-2px;box-shadow:0 0 6px #10b981;animation:pulse 1.5s infinite"></div>` : ''}
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22]
});

// Fit all vehicle markers into the map view
function FitBoundsAll({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
      } catch {}
    }
  }, [positions.length]);
  return null;
}

// Animate map to a single vehicle position
function FlyToVehicle({ position, active }) {
  const map = useMap();
  useEffect(() => {
    if (active && position) {
      map.flyTo(position, 16, { animate: true, duration: 1.2 });
    }
  }, [position?.[0], position?.[1], active]);
  return null;
}

export default function AdminTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [followMode, setFollowMode] = useState(false);

  // Live Polling — every 5 seconds
  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/gps/live');
      const data = await res.json();
      if (data.ok) setVehicles(data.vehicles || []);
    } catch (err) {
      console.error('Live fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (vehicleId) => {
    setActiveSession(null);
    setAnalytics(null);
    setHistorySessions([]);
    try {
      const res = await fetch(`http://127.0.0.1:3000/gps/history/${vehicleId}`);
      const data = await res.json();
      if (data.ok) setHistorySessions(data.sessions || []);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  const selectVehicle = (v) => {
    setSelectedVehicle(v);
    setActiveSession(null);
    setAnalytics(null);
    fetchHistory(v.vehicle_id);
  };

  const deselectVehicle = () => {
    setSelectedVehicle(null);
    setActiveSession(null);
    setAnalytics(null);
    setHistorySessions([]);
    setFollowMode(false);
  };

  const selectSession = (session) => {
    setActiveSession(session);
    if (session.points?.length > 0) calculateAnalytics(session);
  };

  const calculateAnalytics = (session) => {
    if (!session || (session.points?.length || 0) < 2) return;
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const durationMin = Math.round((end - start) / 60000);
    let totalDist = 0;
    const R = 6371;
    for (let i = 1; i < session.points.length; i++) {
      const [lat1, lon1] = session.points[i - 1];
      const [lat2, lon2] = session.points[i];
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
      totalDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    const avgSpeed = session.logs.reduce((acc, l) => acc + (l.speed || 0), 0) / (session.logs.length || 1);
    setAnalytics({ duration: durationMin, distance: totalDist.toFixed(2), avgSpeed: Math.round(avgSpeed) });
  };

  const safeFormatTime = (dateStr, fmt) => {
    try {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return format(d, fmt);
    } catch { return 'N/A'; }
  };

  const filteredVehicles = (vehicles || []).filter(v => {
    if (!v) return false;
    const s = (searchTerm || '').toLowerCase();
    return (v.registration_number || '').toLowerCase().includes(s) ||
           (v.instructor_name || '').toLowerCase().includes(s);
  });

  // All vehicle map positions (for Fit All Bounds)
  const allPositions = vehicles.filter(v => v.lat && v.lng).map(v => [parseFloat(v.lat), parseFloat(v.lng)]);
  
  // The currently selected vehicle's live position
  const selectedPos = selectedVehicle
    ? vehicles.find(v => String(v.vehicle_id) === String(selectedVehicle.vehicle_id))
    : null;
  const selectedLatLng = selectedPos?.lat ? [parseFloat(selectedPos.lat), parseFloat(selectedPos.lng)] : null;

  return (
    <div className="adm_tracking__page">
      {/* 🧭 SIDEBAR */}
      <aside className="adm_tracking__sidebar glass-card">
        <div className="sidebar-header">
          <Zap size={24} className="icon-pulse-red" />
          <h2>Live Fleet Status</h2>
          <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>
            {vehicles.filter(v => v.is_active).length} ONLINE
          </div>
        </div>

        <div className="search-wrap">
          <Search size={18} color="#8892b0" />
          <input
            type="text"
            placeholder="Search vehicle / instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selected Vehicle Detail Card */}
        {selectedVehicle && (
          <div className="selected-vehicle-card">
            <div className="svc-header">
              <div>
                <div className="svc-reg">{selectedVehicle.registration_number}</div>
                <div className="svc-inst">{selectedVehicle.instructor_name || 'Unassigned'}</div>
              </div>
              <button className="svc-close" onClick={deselectVehicle}><X size={16} /></button>
            </div>
            <div className="svc-stats">
              <div className="svc-stat">
                <div className={`svc-dot ${selectedVehicle.is_active ? 'online' : 'offline'}`} />
                <span>{selectedVehicle.is_active ? 'ACTIVE' : 'OFFLINE'}</span>
              </div>
              <div className="svc-stat"><Zap size={12} /> {selectedVehicle.speed || 0} km/h</div>
            </div>
            <button
              className={`follow-btn-sidebar ${followMode ? 'active' : ''}`}
              onClick={() => setFollowMode(f => !f)}
            >
              <Maximize2 size={14} /> {followMode ? 'UNFOLLOW' : 'FOLLOW VEHICLE'}
            </button>
          </div>
        )}

        <div className="vehicle-list">
          {filteredVehicles.map(v => (
            <div
              key={v.vehicle_id}
              className={`v-item ${String(selectedVehicle?.vehicle_id) === String(v.vehicle_id) ? 'active' : ''}`}
              onClick={() => selectVehicle(v)}
            >
              <div className="v-status">
                <div className={`status-pulse ${v.is_active ? 'online' : 'offline'}`} />
              </div>
              <div className="v-info">
                <div className="v-reg">{v.registration_number}</div>
                <div className="v-instructor">{v.instructor_name || 'Unassigned'}</div>
              </div>
              <ChevronRight size={16} color="#8892b0" />
            </div>
          ))}
          {filteredVehicles.length === 0 && !loading && (
            <p className="empty-msg">No active tracking signals...</p>
          )}
          {loading && <p className="empty-msg" style={{ color: '#E11B22' }}>Loading fleet data...</p>}
        </div>

        {/* Session History */}
        {selectedVehicle && (
          <div className="history-section">
            <div className="history-label"><History size={14} /> Session History</div>
            <div className="session-list">
              {historySessions.map(s => (
                <div
                  key={s.session_id}
                  className={`session-item ${activeSession?.session_id === s.session_id ? 'selected' : ''}`}
                  onClick={() => selectSession(s)}
                >
                  <div className="s-time">{safeFormatTime(s.start_time, 'HH:mm')} – {safeFormatTime(s.end_time, 'HH:mm')}</div>
                  <div className="s-date">{safeFormatTime(s.start_time, 'dd MMM yyyy')}</div>
                </div>
              ))}
              {historySessions.length === 0 && (
                <div className="no-hist">No trip history for this vehicle.</div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* 🗺️ MAP */}
      <main className="adm_tracking__main">
        <div className="map-view-card glass-card">
          {/* Map Header Legend */}
          <div className="map-controls-top">
            <div className="map-status-pill">
              <ShieldCheck size={15} />
              <span>GPS FLEET OVERSIGHT</span>
            </div>
            {selectedVehicle ? (
              <div className="map-vehicle-focus-pill">
                Focused: <strong>{selectedVehicle.registration_number}</strong>
                <button onClick={deselectVehicle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892b0', marginLeft: '0.5rem' }}><X size={14} /></button>
              </div>
            ) : (
              <div className="map-all-pill">
                <span>📡 Showing all {vehicles.length} vehicles</span>
              </div>
            )}
          </div>

          <MapContainer
            center={[6.9271, 79.8612]}
            zoom={13}
            className="leaflet-adm-tracking"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* When no vehicle selected: fit all into view */}
            {!selectedVehicle && allPositions.length > 0 && (
              <FitBoundsAll positions={allPositions} />
            )}

            {/* When vehicle selected: fly to it */}
            {selectedVehicle && selectedLatLng && (
              <FlyToVehicle position={selectedLatLng} active={true} />
            )}

            {/* Show ALL vehicle markers */}
            {vehicles.map(v => {
              if (!v.lat || !v.lng) return null;
              const isSelected = String(selectedVehicle?.vehicle_id) === String(v.vehicle_id);
              return (
                <Marker
                  key={v.vehicle_id}
                  position={[parseFloat(v.lat), parseFloat(v.lng)]}
                  icon={createVehicleIcon(isSelected, v.is_active)}
                  eventHandlers={{ click: () => selectVehicle(v) }}
                >
                  <Popup className="adm-popup">
                    <div className="popup-content">
                      <div className="p-reg">{v.registration_number}</div>
                      <div className="p-instructor">{v.instructor_name || 'Unassigned'}</div>
                      <div className="p-metrics">
                        <span><Zap size={12} /> {v.speed || 0} km/h</span>
                        <span><Clock size={12} /> {safeFormatTime(v.recorded_at, 'hh:mm a')}</span>
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          background: v.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(75,85,99,0.2)',
                          color: v.is_active ? '#10b981' : '#6b7280'
                        }}>
                          {v.is_active ? '● ACTIVE' : '○ OFFLINE'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route polyline for selected session */}
            {activeSession?.points?.length > 0 && (
              <Polyline
                positions={activeSession.points}
                color="#E11B22"
                weight={5}
                opacity={0.8}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapContainer>

          {/* 📊 Analytics Overlay */}
          {analytics && (
            <div className="analytics-overlay glass-card">
              <div className="analytics-header">
                <TrendingUp size={18} color="#E11B22" />
                <h3>Trip Performance</h3>
                <button onClick={() => setAnalytics(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div className="analytics-grid">
                <div className="a-item"><label>Duration</label><div className="a-val">{analytics.duration} <span>mins</span></div></div>
                <div className="a-item"><label>Distance</label><div className="a-val">{analytics.distance} <span>km</span></div></div>
                <div className="a-item"><label>Avg Speed</label><div className="a-val">{analytics.avgSpeed} <span>km/h</span></div></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
