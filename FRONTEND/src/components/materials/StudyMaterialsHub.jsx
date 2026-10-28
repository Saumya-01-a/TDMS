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
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null, title: '' });
  
  // Form State
  const [formData, setFormData] = useState({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);

  const categories = [
    { id: 'Road Signs', icon: <TrafficCone size={22} /> },
    { id: 'Traffic Rules', icon: <ClipboardCheck size={22} /> },
    { id: 'Vehicle Operation', icon: <Settings size={22} /> },
    { id: 'Past Papers', icon: <BookOpen size={22} /> },
  ];

  const API_BASE = 'http://127.0.0.1:3000';

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/materials`);
      const data = await res.json();
      if (data.ok) setMaterials(data.materials);
    } catch (err) {
      console.error("🏁 DATA SYNC FAILURE:", err);
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
    data.append('instructorId', 'ADM-SYSTEM'); // Global Admin ID

    try {
      const res = await fetch(`${API_BASE}/admin/materials/upload`, {
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
      alert("Terminal Link Failed. Check backend status.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteConfirmation;
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/admin/materials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMaterials(prev => prev.filter(m => m.material_id !== id));
        setDeleteConfirmation({ show: false, id: null, title: '' });
      } else {
        alert("Server failed to remove record: " + data.message);
      }
    } catch (err) {
      console.error("Purge Error:", err);
      alert("Connectivity error. Record may still exist.");
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.category === activeCategory && 
    (m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="materials-hub__main" id="id_materials_hub_main">
      <div className="materials-hub__container">
        {/* Header Section */}
        <div className="hub-header">
          <div className="hub-title-group">
            <h1 className="hub-title">Reference materials</h1>
            <p className="hub-subtitle">High-fidelity driving education resources and legal documentation</p>
          </div>
          
          <div className="hub-actions">
            <div className="hub-search glass-panel">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Lookup resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button className="hub-add-btn" onClick={() => setShowUploadModal(true)}>
                <Plus size={20} />
                <span>Publish New</span>
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
              {activeCategory === cat.id && <div className="active-indicator" />}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="hub-content">
          {loading ? (
            <div className="hub-loader">
              <Loader2 className="spin" size={48} />
              <p>Synchronizing Repository...</p>
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="hub-grid">
              {filteredMaterials.map(item => (
                <div key={item.material_id} className="hub-card glass-panel">
                  <div className="card-top">
                    <div className="card-icon-box">
                      <FileText size={28} />
                    </div>
                    {isAdmin && (
                      <button className="card-btn-delete" onClick={() => setDeleteConfirmation({ show: true, id: item.material_id, title: item.title })}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description || 'No additional metadata available.'}</p>
                    <div className="card-meta">
                      <span className="card-date">
                        {item.upload_date && !isNaN(new Date(item.upload_date).getTime()) ? 
                          new Date(item.upload_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 
                          'Date Registered'}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="card-btn-download">
                      <FileDown size={20} />
                      <span>Access Material</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hub-empty glass-panel">
              <AlertCircle size={64} color="#E11B22" />
              <h3>No match found in {activeCategory}</h3>
              <p>Try refining your search parameters or check other categories.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="hub-modal-overlay">
          <div className="hub-modal glass-panel">
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Submit to {activeCategory}</h3>
                <p>Ensure documents are in PDF or Image format (Max 25MB)</p>
              </div>
              <button className="btn-close" onClick={() => setShowUploadModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpload} className="modal-form">
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Official Road Sign Curriculum 2026"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Description (Metadata)</label>
                <textarea 
                  rows="4" 
                  placeholder="Briefly describe the contents of this resource..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Resource File</label>
                <div className="file-drop-zone">
                  <input 
                    type="file" 
                    required 
                    id="id_material_file"
                    className="hidden-file-input"
                    onChange={e => setFormData({...formData, file: e.target.files[0]})} 
                  />
                  <label htmlFor="id_material_file" className="file-label">
                    <Plus size={32} />
                    <span>{formData.file ? formData.file.name : 'Select or Drop Document'}</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>Discard</button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? <Loader2 className="spin" size={20} /> : <Plus size={20} />}
                  <span>{uploading ? 'Finalizing...' : 'Live Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="hub-modal-overlay">
          <div className="confirm-modal glass-panel">
            <div className="confirm-icon-box">
              <AlertCircle size={48} color="#ff4d4d" />
            </div>
            <div className="confirm-text">
              <h3>Purge Resource?</h3>
              <p>You are about to permanently delete <strong>{deleteConfirmation.title}</strong>. This action is irreversible and will remove the file from central storage.</p>
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirmation({ show: false, id: null, title: '' })}>Keep Material</button>
              <button className="btn-delete-confirm" onClick={handleDelete}>Confirm Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
