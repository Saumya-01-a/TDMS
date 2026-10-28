import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import './studyMaterials.css';

export default function StudyMaterialsPage() {
  const [activeTab, setActiveTab] = useState('road-signs');
  const [searchTerm, setSearchTerm] = useState('');

  const materials = {
    'road-signs': [
      { id: 1, title: 'Mandatory Signs', description: 'Learn about all mandatory traffic signs and their meanings.' },
      { id: 2, title: 'Warning Signs', description: 'Understand warning signs and how to respond to them.' },
      { id: 3, title: 'Information Signs', description: 'Guide and directional signs explained.' },
    ],
    'traffic-rules': [
      { id: 4, title: 'Speed Limits', description: 'Speed limit rules and regulations by road type.' },
      { id: 5, title: 'Right of Way', description: 'Understanding right of way in different situations.' },
      { id: 6, title: 'Parking Rules', description: 'Proper parking techniques and regulations.' },
    ],
    'vehicle-operation': [
      { id: 7, title: 'Vehicle Controls', description: 'Understanding all vehicle controls and their functions.' },
      { id: 8, title: 'Gear Shifting', description: 'Proper gear shifting techniques.' },
      { id: 9, title: 'Braking Systems', description: 'Different braking systems and emergency procedures.' },
    ],
    'past-papers': [
      { id: 10, title: 'Theory Test 2025', description: 'Mock theory examination with 50 questions.' },
      { id: 11, title: 'Practice Test 1', description: 'First practice test with detailed explanations.' },
      { id: 12, title: 'Practice Test 2', description: 'Second practice test covering all topics.' },
    ],
  };

  const tabs = [
    { id: 'road-signs', label: 'Road Signs' },
    { id: 'traffic-rules', label: 'Traffic Rules' },
    { id: 'vehicle-operation', label: 'Vehicle Operation' },
    { id: 'past-papers', label: 'Past Papers' },
  ];

  const currentMaterials = materials[activeTab] || [];
  const filteredMaterials = currentMaterials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="study-materials-wrapper">
      <h1 className="page-title">Study Materials</h1>

      {/* Header Card */}
      <div className="materials-header">
        <div className="header-content">
          <h2 className="header-title">Learning Resources</h2>
          <p className="header-subtitle">Access all study materials for your learning</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#E11B22' }} />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ paddingLeft: 40 }}
          />
        </div>
        <button className="filter-btn">Filter Resources</button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="materials-grid">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => (
            <div key={material.id} className="material-card">
              <div className="material-image-placeholder">
                <span className="image-icon"><FileText size={48} className="text-brand-red" /></span>
              </div>
              <div className="material-content">
                <h3 className="material-title">{material.title}</h3>
                <p className="material-description">{material.description}</p>
                <button className="view-btn">View Material</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-materials">No materials found</div>
        )}
      </div>
    </div>
  );
}
