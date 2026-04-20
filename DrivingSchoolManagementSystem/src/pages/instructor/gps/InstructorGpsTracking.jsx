import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Polyline,
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { 
  Navigation, 
  Play, 
  Square, 
  MapPin, 
  Activity, 
  Clock, 
  History,
  CarFront,
  Map as MapIcon,
  Save,
  Trash2,
  Maximize2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './instructorGpsTracking.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SOCKET_URL = 'http://127.0.0.1:3000';

export default function InstructorGpsTracking() {
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState([6.9271, 79.8612]); // Colombo default
  const [trail, setTrail] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);

  // Auth Context - Robust Identity Resolution
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const instructorId = user.instructor_id || user.user_id || user.userId || 'INST-DEFAULT';
  const instructorName = `${user.first_name || user.firstName || 'Instructor'} ${user.last_name || user.lastName || ''}`;

  // Route Planning State
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState([]);
  const [eta, setEta] = useState('--:--');
  const [showClearModal, setShowClearModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Fetch vehicles for selection
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/api/vehicles');
        const data = await res.json();
        const vehicleList = Array.isArray(data) ? data : (data.vehicles || []);
        setVehicles(vehicleList);
        if (vehicleList.length > 0) setSelectedVehicle(vehicleList[0]);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      }
    };
    fetchVehicles();

    // Socket Setup
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    socketRef.current.on('connect', () => console.log('📡 GPS Socket Connected'));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Fetch History whenever selectedVehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      fetchHistory(selectedVehicle.vehicle_id);
    }
  }, [selectedVehicle]);

  const fetchHistory = async (vId) => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/gps/history/${vId}`);
      const data = await res.json();
      if (data.ok) setTripHistory(data.sessions || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const startTrip = () => {
    if (!selectedVehicle) return alert("Please select a vehicle first.");

    setIsTripActive(true);
    setStartTime(new Date());
    setTrail([]);

    // Start Timer
    timerRef.current = setInterval(() => {
      const now = new Date();
      const st = startTime ? new Date(startTime) : now;
      const diff = now - st;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsedTime(`${h}:${m}:${s}`);
    }, 1000);

    // Start Geolocation
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed: geoSpeed } = position.coords;
          const pos = [latitude, longitude];
          setCurrentPosition(pos);
          setTrail(prev => [...prev, pos]);
          setSpeed(geoSpeed ? Math.round(geoSpeed * 3.6) : 0); // speed in km/h

          // Calculate ETA if route exists
          if (plannedRoute.length > 0) {
            calculateETA(latitude, longitude, geoSpeed);
          }

          // Broadcast to server via socket
          socketRef.current.emit('update_location', {
            vehicleId: selectedVehicle.vehicle_id,
            regNumber: selectedVehicle.registration_number,
            instructorId,
            instructorName,
            lat: latitude,
            lng: longitude,
            speed: geoSpeed ? Math.round(geoSpeed * 3.6) : 0
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const calculateETA = (lat, lng, speedmps) => {
    if (plannedRoute.length === 0 || speedmps <= 0.5) {
      setEta('--:--');
      return;
    }
    
    // Simple Haversine to the LAST point (destination)
    const dest = plannedRoute[plannedRoute.length - 1];
    const R = 6371e3; // metres
    const φ1 = lat * Math.PI/180;
    const φ2 = dest[0] * Math.PI/180;
    const Δφ = (dest[0]-lat) * Math.PI/180;
    const Δλ = (dest[1]-lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in metres

    const timeSeconds = distance / speedmps;
    if (timeSeconds > 3600 * 5) { // more than 5 hours
      setEta('Long Way');
    } else {
      const hours = Math.floor(timeSeconds / 3600);
      const mins = Math.floor((timeSeconds % 3600) / 60);
      setEta(`${hours > 0 ? hours + 'h ' : ''}${mins}m`);
    }
  };

  const savePlanningRoute = async () => {
    if (plannedRoute.length < 2) return alert("Please select at least 2 points on the map.");
    try {
      const res = await fetch('http://127.0.0.1:3000/gps/save-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId,
          vehicleId: selectedVehicle.vehicle_id,
          routeName: `Route_${new Date().toLocaleDateString()}`,
          routePoints: plannedRoute
        })
      });
      const data = await res.json();
      if (data.ok) {
        setIsPlanning(false);
        alert("Daily Route saved and broadcasted to students!");
      }
    } catch (err) {
      console.error("Save route error:", err);
    }
  };

  const clearHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/gps/clear-history/${instructorId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        setShowClearModal(false);
        setTripHistory([]);
        alert("Historical logs cleared successfully.");
      }
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  const stopTrip = () => {
    setIsTripActive(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setSpeed(0);
    fetchHistory(selectedVehicle.vehicle_id);
    alert("Trip finished! Route data synchronized.");
  };

  return (
    <div className="ins_gps__container">
      <div className="ins_gps__header">
        <div className="ins_gps__title_row">
          <Navigation size={28} className="text-gold" />
          <h1>Fleet Control Center</h1>
        </div>
        <div className="ins_gps__controls glass_card">
          <div className="ins_gps__select_box">
             <label>Select Vehicle</label>
             <select 
               className="glass-input"
               disabled={isTripActive}
               value={selectedVehicle?.vehicle_id || ''}
               onChange={(e) => setSelectedVehicle(vehicles.find(v => v.vehicle_id === parseInt(e.target.value)))}
             >
               {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_number} ({v.type})</option>)}
             </select>
          </div>
          <button 
            className={`ins_gps__trip_btn ${isTripActive ? 'stop' : 'start'}`}
            onClick={isTripActive ? stopTrip : startTrip}
          >
            {isTripActive ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {isTripActive ? 'STOP TRIP' : 'START TRIP'}
          </button>

          <div className="ins_gps__plan_tools">
            <button 
              className={`plan-toggle ${isPlanning ? 'active' : ''}`}
              onClick={() => setIsPlanning(!isPlanning)}
              disabled={isTripActive}
            >
              <MapIcon size={18} /> {isPlanning ? 'PLANNING MODE' : 'PLAN ROUTE'}
            </button>
            {isPlanning && plannedRoute.length > 0 && (
              <div className="plan-actions">
                 <button onClick={() => setPlannedRoute([])}>RESET</button>
                 <button className="save-btn" onClick={savePlanningRoute}><Save size={14}/> SAVE</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ins_gps__main_grid">
        {/* Real Map Panel */}
        <div className={`ins_gps__map_panel glass-card ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="map-toolbar">
            <button onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 size={18} />
            </button>
          </div>
          <MapContainer 
            center={currentPosition} 
            zoom={15} 
            style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          >
            <ChangeView center={currentPosition} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* Planning Interaction */}
            {isPlanning && <ClickToPlan plannedRoute={plannedRoute} setPlannedRoute={setPlannedRoute} />}

            {/* Current Vehicle Marker */}
            <Marker position={currentPosition}>
              <Popup permanent>
                <div className="v-marker-label">
                  <div className="v-id">{selectedVehicle?.registration_number}</div>
                  <div className="v-ins">{instructorName}</div>
                  <div className="v-speed">{speed} km/h</div>
                </div>
              </Popup>
            </Marker>

            {/* Daily Route (Planned) */}
            <Polyline positions={plannedRoute} color="#E11B22" weight={6} opacity={0.5} dashArray="10, 10" />

            {/* Live Trail */}
            <Polyline positions={trail} color="#fcc419" weight={4} opacity={0.7} />
          </MapContainer>
        </div>

        {/* Live Metrics Panel */}
        <div className="ins_gps__metrics_panel">
          <div className="ins_gps__metric_card glass-card">
             <div className="ins_gps__metric_label"><Navigation size={16} /> ETA (Final)</div>
             <div className="ins_gps__metric_value" style={{ color: '#E11B22' }}>{eta}</div>
          </div>
          <div className="ins_gps__metric_card glass-card">
             <div className="ins_gps__metric_label"><Activity size={16} /> Current Speed</div>
             <div className="ins_gps__metric_value">{speed} <span>km/h</span></div>
          </div>
          <div className="ins_gps__metric_card glass-card">
             <div className="ins_gps__metric_label"><Clock size={16} /> Elapsed Time</div>
             <div className="ins_gps__metric_value">{elapsedTime}</div>
          </div>
        </div>
      </div>

      <div className="ins_gps__history glass-card">
        <div className="ins_gps__history_header">
          <div className="h-left">
            <History size={20} className="text-gold" />
            <h2>Recent Trip History</h2>
          </div>
          <button className="clear-hist-btn" onClick={() => setShowClearModal(true)}>
            <Trash2 size={16} /> Clear Recent Routes
          </button>
        </div>
        <div className="glass-table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Data Points</th>
                <th>End Status</th>
              </tr>
            </thead>
            <tbody>
              {tripHistory.map((trip, idx) => {
                const duration = new Date(trip.end_time) - new Date(trip.start_time);
                const hrs = Math.floor(duration / 3600000);
                const mns = Math.floor((duration % 3600000) / 60000);
                return (
                  <tr key={idx}>
                    <td>{trip.session_id.substring(0, 15)}...</td>
                    <td>{new Date(trip.start_time).toLocaleString()}</td>
                    <td>{hrs > 0 ? `${hrs}h ` : ''}{mns}m</td>
                    <td>{trip.points.length} coords</td>
                    <td><span className="badge-success">Success</span></td>
                  </tr>
                );
              })}
              {tripHistory.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No recent trip history found for this vehicle.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Storage Optimization Modal */}
      {showClearModal && (
        <div className="marking-modal-overlay">
          <div className="marking-modal glass-card">
            <div className="modal-header">
              <Trash2 size={24} style={{ color: '#ef4444' }} />
              <h3>Storage Optimization</h3>
            </div>
            <p style={{ margin: '1rem 0', opacity: 0.8 }}>
              Are you sure you want to delete past route data? This will free up database storage.
            </p>
            <div className="modal-actions">
              <button className="modal-btn btn-secondary" onClick={() => setShowClearModal(false)}>CANCEL</button>
              <button className="modal-btn btn-danger" onClick={clearHistory}>FREE STORAGE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Planning Logic
function ClickToPlan({ plannedRoute, setPlannedRoute }) {
  useMapEvents({
    click(e) {
      setPlannedRoute(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
    }
  });
  return null;
}

// Map Helper Component
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}
