import React, { useMemo, useState, useEffect, useRef } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Polyline 
} from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { 
  MapPin, 
  Navigation, 
  History, 
  ChevronDown, 
  Radio,
  Car
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import "./studentRoutes.css";

const SOCKET_URL = 'http://localhost:3000';

// Custom Car Icon for Leaflet
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', // Modern Car icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function StudentRoutes() {
  const [session, setSession] = useState("today");
  const [liveLocation, setLiveLocation] = useState(null); // { lat, lng, regNumber, speed, vehicleId, instructorName }
  const [plannedRoute, setPlannedRoute] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    
    socketRef.current.on('connect', () => {
      console.log('📡 Student GPS: Listening...');
      socketRef.current.emit('join_tracking');
    });

    socketRef.current.on('location_update', (data) => {
      setLiveLocation(data);
      // If we don't have a planned route yet for this vehicle, fetch it
      if (data.vehicleId && plannedRoute.length === 0) {
        fetchPlannedRoute(data.vehicleId);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [plannedRoute.length]);

  const fetchPlannedRoute = async (vehicleId) => {
    try {
      const res = await fetch(`http://localhost:3000/gps/active-route/${vehicleId}`);
      const data = await res.json();
      if (data.ok && data.route) {
        setPlannedRoute(JSON.parse(data.route.route_points));
      }
    } catch (err) {
      console.error("Failed to fetch planned route:", err);
    }
  };

  const sessions = useMemo(
    () => [
      { value: "today", label: "Today's Session (19/10/2023)" },
      { value: "18", label: "Session (18/10/2023)" },
      { value: "17", label: "Session (17/10/2023)" },
      { value: "16", label: "Session (16/10/2023)" },
    ],
    []
  );

  const history = useMemo(
    () => [
      {
        date: "19/10/2023",
        type: "Van Session",
        instructor: "Sanath Jayasuriya",
        distance: "12.4 km",
        duration: "1h 15m",
      },
      {
        date: "18/10/2023",
        type: "Bike Session",
        instructor: "Kumar Sangakkara",
        distance: "8.7 km",
        duration: "1h 05m",
      },
      {
        date: "17/10/2023",
        type: "Van Session",
        instructor: "Sanath Jayasuriya",
        distance: "10.2 km",
        duration: "1h 10m",
      },
    ],
    []
  );

  return (
    <div className="stu-mainContent">
      <div className="section-header">
        <Navigation size={24} className="text-gold" />
        <h1 className="stu-routesTitle">Live Tracking & Routes</h1>
      </div>

      {/* Map Panel */}
      <section className="stu-routesPanel glass-card">
        <div className="stu-routesPanelHead">
          <div className="stu-routesPanelLeft">
            <div className="live-indicator">
              <Radio size={16} className="animate-pulse" />
              <span>LIVE</span>
            </div>
            <div>
              <div className="stu-routesPanelName">Live Vehicle Position</div>
              <div className="stu-routesPanelSub">
                {liveLocation ? (
                  <>
                    <span className="text-gold">{liveLocation.regNumber}</span> • {liveLocation.instructorName} • <strong>{liveLocation.speed} km/h</strong>
                  </>
                ) : 'Waiting for instructor to start trip...'}
              </div>
            </div>
          </div>

          <div className="stu-routesPanelActions">
            <div className="stu-routesSelectWrap glass-input">
              <select
                className="stu-routesSelect"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="stu-routesChevron" />
            </div>
          </div>
        </div>

        <div className="stu-routesMapWrap">
          <MapContainer 
            center={[6.9271, 79.8612]} 
            zoom={13} 
            style={{ height: '500px', width: '100%', borderRadius: '16px' }}
          >
            {liveLocation && <ChangeView center={[liveLocation.lat, liveLocation.lng]} />}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {liveLocation && (
              <Marker position={[liveLocation.lat, liveLocation.lng]} icon={carIcon}>
                <Popup permanent>
                  <div className="stu-marker-popup">
                    <div className="stu-v-reg">{liveLocation.regNumber}</div>
                    <div className="stu-v-ins">{liveLocation.instructorName}</div>
                    <div className="stu-v-speed">{liveLocation.speed} km/h</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Daily Route Polyline */}
            <Polyline positions={plannedRoute} color="#E11B22" weight={6} opacity={0.5} dashArray="10, 10" />
            
          </MapContainer>
        </div>
      </section>

      {/* History Panel */}
      <section className="stu-routesHistory glass-card">
        <div className="stu-routesHistoryHead">
          <div className="header-with-icon">
            <History size={20} className="text-gold" />
            <h2>Route History</h2>
          </div>
        </div>

        <div className="stu-routesTableWrap glass-table-container">
          <table className="stu-routesTable glass-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SESSION TYPE</th>
                <th>INSTRUCTOR</th>
                <th>DISTANCE</th>
                <th>DURATION</th>
                <th className="stu-thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.date + r.type}>
                  <td>{r.date}</td>
                  <td>{r.type}</td>
                  <td>{r.instructor}</td>
                  <td>{r.distance}</td>
                  <td>{r.duration}</td>
                  <td className="stu-tdRight">
                    <button className="stu-routesLinkBtn glass-input">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}
