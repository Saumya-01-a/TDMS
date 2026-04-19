import React, { useState, useEffect, useMemo } from 'react';
import { 
  CarFront, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Zap, 
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';
import './instructorVehicles.css';

const SOCKET_URL = 'http://localhost:3000';

const VEHICLE_IMAGES = {
  'Car': '/assets/fleet/vios.png',
  'Van': '/assets/fleet/hiace.png',
  'Bike': '/assets/fleet/apache.png',
  'Three-wheel': '/assets/fleet/bajaj.png'
};

export default function InstructorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState(null);

  // Initialize Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.on('connect', () => {
      console.log('📡 Fleet Synchronization: Online');
    });

    socket.on('vehicle_status_updated', ({ vehicleId, status }) => {
      setVehicles(prev => prev.map(v => 
        v.vehicle_id === parseInt(vehicleId) ? { ...v, status } : v
      ));
    });

    return () => socket.disconnect();
  }, []);

  // Fetch initial fleet data
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/vehicles');
        if (!response.ok) throw new Error('Database connection failed');
        const data = await response.json();
        
        // Sri Lankan Localization for vehicle registration numbers
        const localizedVehicles = data.map((v, idx) => {
          const numbers = ['WP CAS-9021', 'WP KR-4432', 'WP GH-1109', 'WP LI-5567', 'WP PQ-8872'];
          return {
            ...v,
            registration_number: numbers[idx % numbers.length] || v.registration_number
          };
        });
        
        setVehicles(localizedVehicles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  // Real-time Metrics Calculation
  const metrics = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'Available').length,
      inUse: vehicles.filter(v => v.status === 'In Use').length,
    };
  }, [vehicles]);

  // Filtering Logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesSearch = v.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [vehicles, statusFilter, searchTerm]);

  // Sectioned Grids
  const autoVehicles = filteredVehicles.filter(v => v.transmission === 'Auto');
  const manualVehicles = filteredVehicles.filter(v => v.transmission === 'Manual');

  if (loading) return (
    <div className="ins_veh__container flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500 animate-pulse font-bold tracking-widest text-sm uppercase">Synchronizing Fleet...</div>
    </div>
  );

  return (
    <div className="ins_veh__container">
      {/* 📊 REAL-TIME METRICS */}
      <div className="ins_veh__metrics_row">
        <div className="ins_veh__metric_card glass-card">
          <div className="ins_veh__metric_header">
            <CarFront size={20} className="text-brand-red" />
            <span className="ins_veh__metric_label">Total Fleet</span>
          </div>
          <div className="ins_veh__metric_value">{metrics.total}</div>
        </div>
        <div className="ins_veh__metric_card glass-card" style={{ borderLeft: '4px solid #E11B22' }}>
          <div className="ins_veh__metric_header">
            <CheckCircle2 size={20} style={{ color: '#E11B22' }} />
            <span className="ins_veh__metric_label">Available</span>
          </div>
          <div className="ins_veh__metric_value" style={{ color: '#E11B22' }}>{metrics.available}</div>
        </div>
        <div className="ins_veh__metric_card glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="ins_veh__metric_header">
            <Activity size={20} style={{ color: '#ef4444' }} />
            <span className="ins_veh__metric_label">In Use</span>
          </div>
          <div className="ins_veh__metric_value" style={{ color: '#ef4444' }}>{metrics.inUse}</div>
        </div>
      </div>

      {/* 🔍 SEARCH AND FILTERS */}
      {/* 🔍 SEARCH AND FILTERS */}
      <div className="ins_veh__controls glass-card">
        <div className="ins_veh__search_wrapper">
          <Search size={18} className="ins_veh__search_icon" />
          <input
            type="text"
            className="ins_veh__search_input glass-input"
            placeholder="Search registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ins_veh__filters">
          <button 
            className={`ins_veh__filter_btn ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All Fleet
          </button>
          <button 
            className={`ins_veh__filter_btn ${statusFilter === 'In Use' ? 'active' : ''}`}
            onClick={() => setStatusFilter('In Use')}
          >
            In Use
          </button>
        </div>
      </div>

      {/* 🚗 AUTO VEHICLES SECTION */}
      <section className="ins_veh__section">
        <h2 className="ins_veh__section_title">Auto Vehicles</h2>
        <div className="ins_veh__grid">
          {autoVehicles.length > 0 ? (
            autoVehicles.map(v => <RefinedVehicleCard key={v.vehicle_id} vehicle={v} />)
          ) : (
            <div className="ins_veh__empty_state">No Auto vehicles found</div>
          )}
        </div>
      </section>

      {/* 🛠️ MANUAL VEHICLES SECTION */}
      <section className="ins_veh__section">
        <h2 className="ins_veh__section_title">Manual Vehicles</h2>
        <div className="ins_veh__grid">
          {manualVehicles.length > 0 ? (
            manualVehicles.map(v => <RefinedVehicleCard key={v.vehicle_id} vehicle={v} />)
          ) : (
            <div className="ins_veh__empty_state">No Manual vehicles found</div>
          )}
        </div>
      </section>
    </div>
  );
}

// Refined Common Card Sub-component with Real Images
function RefinedVehicleCard({ vehicle }) {
  return (
    <div className="ins_veh__card glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
      
      {/* Target Removal: Image Removed. Status badge repositioned. */}
      <div 
        className={`ins_veh__status_badge_overlay ${vehicle.status === 'Available' ? 'available' : 'in-use'}`}
        style={{ position: 'absolute', top: '1rem', right: '1rem', margin: 0 }}
      >
        {vehicle.status === 'Available' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
        {vehicle.status}
      </div>

      <div className="ins_veh__card_content" style={{ padding: '2rem 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="ins_veh__type_group" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div className="ins_veh__type_header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: 0, width: '100%' }}>
            <h3 className="ins_veh__type" style={{ fontSize: '1.5rem', margin: 0 }}>{vehicle.type}</h3>
            <div className="ins_veh__transmission" style={{ margin: 0, justifyContent: 'center' }}>
              <Zap size={14} className="text-brand-red" />
              {vehicle.transmission}
            </div>
          </div>
          <div className="ins_veh__reg_container" style={{ justifyContent: 'center', width: 'auto' }}>
            <ShieldCheck size={16} className="text-brand-red" />
            <p className="ins_veh__reg_number">{vehicle.registration_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
