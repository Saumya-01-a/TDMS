import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  TrafficCone, 
  Settings, 
  ClipboardCheck,
  AlertCircle,
  X,
  FileDown,
  Loader2
} from 'lucide-react';
import './StudyMaterialsHub.css';

export default function StudyMaterialsHub({ isAdmin = false }) {
  const [activeCategory, setActiveCategory] = useState('Road Signs');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);

  const categories = [
    { id: 'Road Signs', icon: <TrafficCone size={20} /> },
    { id: 'Traffic Rules', icon: <ClipboardCheck size={20} /> },
    { id: 'Vehicle Operation', icon: <Settings size={20} /> },
    { id: 'Past Papers', icon: <BookOpen size={20} /> },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/materials');
      const data = await res.json();
      if (data.ok) setMaterials(data.materials);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) return alert("Title and File are required");

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', activeCategory);
    data.append('file', formData.file);
    data.append('instructorId', 'ADM001'); // Fixed Admin ID for materials

    try {
      const res = await fetch('http://localhost:3000/admin/materials/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.ok) {
        setShowUploadModal(false);
        setFormData({ title: '', description: '', file: null });
        fetchMaterials();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Upload Error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await fetch(`http://localhost:3000/admin/materials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) fetchMaterials();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.category === activeCategory && 
    (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="materials-hub">
      {/* Header Section */}
      <div className="hub-header">
        <div className="hub-title-group">
          <h1>Study Materials</h1>
          <p>Access and manage driving education resources</p>
        </div>
        
        <div className="hub-actions">
          <div className="hub-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="hub-add-btn" onClick={() => setShowUploadModal(true)}>
              <Plus size={20} />
              <span>Upload New</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="hub-nav">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`hub-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon}
            <span>{cat.id}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="hub-content">
        {loading ? (
          <div className="hub-loader">
            <Loader2 className="spin" size={40} />
            <p>Loading materials...</p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="hub-grid">
            {filteredMaterials.map(item => (
              <div key={item.material_id} className="hub-card glass-card">
                <div className="card-icon-box">
                  <FileText size={24} color="#B91C1C" />
                </div>
                <div className="card-info">
                  <h3>{item.title}</h3>
                  <p>{item.description || 'No description provided.'}</p>
                  <span className="card-date">
                    {new Date(item.upload_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="card-actions">
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="card-btn download">
                    <FileDown size={18} />
                    <span>Download</span>
                  </a>
                  {isAdmin && (
                    <button className="card-btn delete" onClick={() => handleDelete(item.material_id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hub-empty">
            <AlertCircle size={48} />
            <h3>No materials found</h3>
            <p>Try switching categories or searching for something else.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="hub-modal-overlay">
          <div className="hub-modal glass-card">
            <div className="modal-header">
              <h3>Upload to {activeCategory}</h3>
              <button onClick={() => setShowUploadModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 2024 Road Sign Guide"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="Provide a brief summary..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>File (PDF/Image)</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      required 
                      onChange={e => setFormData({...formData, file: e.target.files[0]})} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                  <span>{uploading ? 'Uploading...' : 'Publish Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
