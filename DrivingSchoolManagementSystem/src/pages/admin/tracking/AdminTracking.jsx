import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Polyline,
  CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Activity, 
  Clock, 
  History,
  Navigation,
  Car,
  Search,
  Maximize2,
  Calendar,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  ShieldCheck
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

// Custom Car Icon for Premium Feel
const carIcon = new L.DivIcon({
  className: 'custom-car-marker',
  html: `<div class="car-icon-wrapper" style="transform: rotate(0deg); transition: transform 0.5s ease-out, top 5s linear, left 5s linear;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
         </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export default function AdminTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [followVehicle, setFollowVehicle] = useState(false);
  const [currentMapPos, setCurrentMapPos] = useState([6.9271, 79.8612]); // Colombo

  // Live Polling
  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const res = await fetch('http://localhost:3000/gps/live');
      const data = await res.json();
      if (data.ok) {
        setVehicles(data.vehicles);
        if (followVehicle && selectedVehicle) {
          const active = data.vehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id);
          if (active) setCurrentMapPos([active.lat, active.lng]);
        }
      }
    } catch (err) {
      console.error("Live fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (vehicleId) => {
    setLoading(true);
    setActiveSession(null);
    setAnalytics(null);
    try {
      const res = await fetch(`http://localhost:3000/gps/history/${vehicleId}`);
      const data = await res.json();
      if (data.ok) {
        setHistorySessions(data.sessions);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = (session) => {
    setActiveSession(session);
    calculateAnalytics(session);
    // Center map on the start of the session
    if (session.points.length > 0) {
      setCurrentMapPos(session.points[0]);
    }
  };

  const calculateAnalytics = (session) => {
    if (!session || session.points.length < 2) return;
    
    // Duration
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const durationMin = Math.round((end - start) / 60000);

    // Distance (Haversine)
    let totalDist = 0;
    const R = 6371; // km
    for (let i = 1; i < session.points.length; i++) {
      const [lat1, lon1] = session.points[i-1];
      const [lat2, lon2] = session.points[i];
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDist += R * c;
    }

    // Avg Speed
    const avgSpeed = session.logs.reduce((acc, l) => acc + (l.speed || 0), 0) / session.logs.length;

    setAnalytics({
      duration: durationMin,
      distance: totalDist.toFixed(2),
      avgSpeed: Math.round(avgSpeed)
    });
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="adm_tracking__page">
      {/* 🧭 NAVIGATION SIDEBAR */}
      <aside className="adm_tracking__sidebar glass-card">
        <div className="sidebar-header">
           <Zap size={24} className="icon-pulse-red" />
           <h2>Live Fleet Status</h2>
        </div>
        
        <div className="search-wrap">
           <Search size={18} />
           <input 
             type="text" 
             placeholder="Search fleet identity..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="vehicle-list">
           {filteredVehicles.map(v => (
             <div 
               key={v.vehicle_id} 
               className={`v-item ${selectedVehicle?.vehicle_id === v.vehicle_id ? 'active' : ''}`}
               onClick={() => { setSelectedVehicle(v); fetchHistory(v.vehicle_id); }}
             >
                <div className="v-status">
                   <div className={`status-pulse ${v.is_active ? 'online' : 'offline'}`}></div>
                </div>
                <div className="v-info">
                   <div className="v-reg">{v.registration_number}</div>
                   <div className="v-instructor">{v.instructor_name || "Unassigned"}</div>
                </div>
                <ChevronRight size={16} />
             </div>
           ))}
           {filteredVehicles.length === 0 && <p className="empty-msg">No active tracking signals...</p>}
        </div>

        {selectedVehicle && (
           <div className="history-section">
              <div className="history-label"><History size={16}/> Session History</div>
              <div className="session-list">
                 {historySessions.map((s, idx) => (
                   <div 
                     key={s.session_id} 
                     className={`session-item ${activeSession?.session_id === s.session_id ? 'selected' : ''}`}
                     onClick={() => selectSession(s)}
                   >
                      <div className="s-time">{format(new Date(s.start_time), 'HH:mm')} - {format(new Date(s.end_time), 'HH:mm')}</div>
                      <div className="s-date">{format(new Date(s.start_time), 'dd MMM')}</div>
                   </div>
                 ))}
                 {historySessions.length === 0 && !loading && <div className="no-hist">No historical routes for this vehicle.</div>}
              </div>
           </div>
        )}
      </aside>

      {/* 🗺️ MAP PANEL */}
      <main className="adm_tracking__main">
        <div className="map-view-card glass-card">
          <div className="map-controls-top">
             <div className="map-status-pill">
                <ShieldCheck size={16} />
                <span>GPS OVERSIGHT ACTIVE</span>
             </div>
             <button 
               className={`follow-toggle ${followVehicle ? 'active' : ''}`}
               onClick={() => setFollowVehicle(!followVehicle)}
             >
                <Maximize2 size={16} /> {followVehicle ? 'UNFOLLOW' : 'FOLLOW VEHICLE'}
             </button>
          </div>

          <MapContainer 
            center={currentMapPos} 
            zoom={15} 
            className="leaflet-adm-tracking"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <ChangeView center={currentMapPos} zoom={followVehicle ? 17 : 15} />

            {/* Live Vehicle Markers */}
            {vehicles.map(v => (
              <Marker 
                key={v.vehicle_id} 
                position={[v.lat, v.lng]} 
                icon={carIcon}
              >
                <Popup className="adm-popup">
                   <div className="popup-content">
                      <div className="p-reg">{v.registration_number}</div>
                      <div className="p-instructor">{v.instructor_name}</div>
                      <div className="p-metrics">
                         <span><Zap size={12}/> {v.speed} km/h</span>
                         <span><Clock size={12}/> {format(new Date(v.recorded_at), 'hh:mm a')}</span>
                      </div>
                   </div>
                </Popup>
              </Marker>
            ))}

            {/* History Polyline */}
            {activeSession && (
               <Polyline 
                 positions={activeSession.points} 
                 color="#B91C1C" 
                 weight={5} 
                 opacity={0.8}
                 lineCap="round"
                 lineJoin="round"
               />
            )}
          </MapContainer>

          {/* 📊 ANALYTICS OVERLAY */}
          {analytics && (
             <div className="analytics-overlay glass-card">
                <div className="analytics-header">
                   <TrendingUp size={18} />
                   <h3>Trip Performance</h3>
                </div>
                <div className="analytics-grid">
                   <div className="a-item">
                      <label>Duration</label>
                      <div className="a-val">{analytics.duration} <span>mins</span></div>
                   </div>
                   <div className="a-item">
                      <label>Distance</label>
                      <div className="a-val">{analytics.distance} <span>km</span></div>
                   </div>
                   <div className="a-item">
                      <label>Avg Speed</label>
                      <div className="a-val">{analytics.avgSpeed} <span>km/h</span></div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Map Helper
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}
