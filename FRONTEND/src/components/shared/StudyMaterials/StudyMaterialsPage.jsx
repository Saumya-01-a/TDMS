import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Loader2 } from 'lucide-react';
import './studyMaterials.css';

export default function StudyMaterialsPage() {
  const [activeTab, setActiveTab] = useState('road_signs');
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'road_signs', label: 'Road Signs' },
    { id: 'traffic_rules', label: 'Traffic Rules' },
    { id: 'vehicle_operation', label: 'Vehicle Operation' },
    { id: 'past_papers', label: 'Past Papers' },
  ];

  useEffect(() => {
    const fetchDynamicMaterials = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/study-materials?category=${activeTab}`);
        const json = await res.json();
        if (json.ok) {
          setMaterials(json.data || json.materials || []);
        }
      } catch (err) {
        console.error('Failed to load study materials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicMaterials();
  }, [activeTab]);

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="study-materials-wrapper">
      <h1 className="page-title">Study Materials</h1>

      {/* Header Card */}
      <div className="materials-header">
        <div className="header-content">
          <h2 className="header-title">Learning Resources</h2>
          <p className="header-subtitle">Access all official study materials, curriculum guides, and test papers</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#E11B22' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="materials-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#8892b0' }}>
            <Loader2 className="spin" size={36} style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.8rem' }}>Loading study materials...</p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => (
            <div key={material.id || material.material_id} className="material-card">
              <div className="material-icon">
                <FileText size={24} color="#E11B22" />
              </div>
              <div className="material-info">
                <h3 className="material-title">{material.title}</h3>
                <p className="material-description">{material.description || 'Comprehensive curriculum resource.'}</p>
                {material.fileSize && material.fileSize !== 'Unknown' && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {material.fileSize}
                  </span>
                )}
              </div>
              <a 
                href={material.fileUrl || material.file_url || material.file_path} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-download"
              >
                <Download size={18} />
              </a>
            </div>
          ))
        ) : (
          <div className="no-materials" style={{ gridColumn: '1 / -1' }}>No materials found for this category</div>
        )}
      </div>
    </div>
  );
}
