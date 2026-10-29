import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
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
  Loader2,
  UploadCloud,
  FileCheck,
  Calendar,
  HardDrive
} from 'lucide-react';
import './StudyMaterialsHub.css';

const CATEGORIES = [
  { id: 'Road Signs', slug: 'road_signs', icon: <TrafficCone size={22} /> },
  { id: 'Traffic Rules', slug: 'traffic_rules', icon: <ClipboardCheck size={22} /> },
  { id: 'Vehicle Operation', slug: 'vehicle_operation', icon: <Settings size={22} /> },
  { id: 'Past Papers', slug: 'past_papers', icon: <BookOpen size={22} /> },
];

export default function StudyMaterialsHub({ isAdmin = false }) {
  const [activeCategory, setActiveCategory] = useState('Road Signs');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null, title: '' });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_signs',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = 'http://localhost:3000';

  // Find active category slug
  const getActiveSlug = (catId) => {
    const found = CATEGORIES.find(c => c.id === catId);
    return found ? found.slug : 'road_signs';
  };

  const fetchMaterials = useCallback(async (cat = activeCategory, search = searchQuery) => {
    setLoading(true);
    try {
      const slug = getActiveSlug(cat);
      const params = new URLSearchParams();
      if (slug) params.append('category', slug);
      if (search && search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE}/api/study-materials?${params.toString()}`);
      const data = await res.json();
      
      if (data.ok) {
        setMaterials(data.data || data.materials || []);
      } else {
        // Fallback to /api/materials
        const fallbackRes = await fetch(`${API_BASE}/api/materials?${params.toString()}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.ok) {
          setMaterials(fallbackData.data || fallbackData.materials || []);
        }
      }
    } catch (err) {
      console.error("🏁 DATA SYNC FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchMaterials(activeCategory, searchQuery);
  }, [activeCategory, searchQuery, fetchMaterials]);

  // Open modal with current active category pre-selected
  const handleOpenUploadModal = () => {
    setFormData({
      title: '',
      description: '',
      category: getActiveSlug(activeCategory),
      file: null
    });
    setErrorMessage('');
    setShowUploadModal(true);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage("Please enter a document title.");
      return;
    }
    if (!formData.file) {
      setErrorMessage("Please select or drop a document file (PDF or Image).");
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setUploadProgress('Preparing document...');

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('category', formData.category);
    data.append('file', formData.file);

    try {
      setUploadProgress('Uploading to storage & updating database...');
      const res = await fetch(`${API_BASE}/api/study-materials`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      
      if (result.ok) {
        setShowUploadModal(false);
        // Switch tab to the category of the newly uploaded document
        const targetCategory = CATEGORIES.find(c => c.slug === formData.category);
        if (targetCategory && targetCategory.id !== activeCategory) {
          setActiveCategory(targetCategory.id);
        } else {
          fetchMaterials(activeCategory, searchQuery);
        }
        setFormData({ title: '', description: '', category: 'road_signs', file: null });
      } else {
        setErrorMessage(result.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage("Network error: Backend server unavailable. Please ensure server is running.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteConfirmation;
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/api/study-materials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMaterials(prev => prev.filter(m => (m.id !== id && m.material_id !== id)));
        setDeleteConfirmation({ show: false, id: null, title: '' });
      } else {
        alert("Server failed to remove record: " + data.message);
      }
    } catch (err) {
      console.error("Purge Error:", err);
      alert("Connectivity error. Document record may still exist.");
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return 'DATE REGISTERED: N/A';
    const parsed = new Date(dateVal);
    if (isNaN(parsed.getTime())) return 'DATE REGISTERED: N/A';
    return `DATE REGISTERED: ${parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
  };

  return (
    <div className="materials-hub__main" id="id_materials_hub_main">
      <div className="materials-hub__container">
        {/* Header Section */}
        <div className="hub-header">
          <div className="hub-title-group">
            <h1 className="hub-title">Reference materials</h1>
            <p className="hub-subtitle">High-fidelity driving education resources, curriculum, and legal documentation</p>
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
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {isAdmin && (
              <button className="hub-add-btn" onClick={handleOpenUploadModal}>
                <Plus size={20} />
                <span>Publish New</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="hub-nav">
          {CATEGORIES.map(cat => (
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
          ) : materials.length > 0 ? (
            <div className="hub-grid">
              {materials.map(item => (
                <div key={item.id || item.material_id} className="hub-card glass-panel">
                  <div className="card-top">
                    <div className="card-icon-box">
                      <FileText size={28} />
                    </div>
                    {isAdmin && (
                      <button 
                        className="card-btn-delete" 
                        title="Delete Material"
                        onClick={() => setDeleteConfirmation({ 
                          show: true, 
                          id: item.id || item.material_id, 
                          title: item.title 
                        })}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="card-info">
                    <div className="card-badge-row">
                      <span className="card-badge category-badge">
                        {item.category || activeCategory}
                      </span>
                      {item.fileSize && item.fileSize !== 'Unknown' && (
                        <span className="card-badge size-badge">
                          <HardDrive size={11} style={{ marginRight: '4px' }} />
                          {item.fileSize}
                        </span>
                      )}
                    </div>

                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description || 'No additional metadata available.'}</p>
                    
                    <div className="card-meta">
                      <span className="card-date">
                        <Calendar size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        {formatDisplayDate(item.createdAt || item.created_at || item.upload_date)}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <a 
                      href={item.fileUrl || item.file_url || item.file_path} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="card-btn-download"
                    >
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
                <h3>Publish Reference Material</h3>
                <p>Upload driving education resources and official curriculum documents (PDF, DOC, Images)</p>
              </div>
              <button className="btn-close" onClick={() => setShowUploadModal(false)}><X size={24} /></button>
            </div>
            
            {errorMessage && (
              <div className="modal-error-banner" style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '1rem',
                color: '#f87171',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="modal-form">
              <div className="form-group">
                <label>Document Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Official Road Sign Curriculum 2026"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Document Category *</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="hub-select-dropdown"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.id}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description (Metadata)</label>
                <textarea 
                  rows="3" 
                  placeholder="Briefly describe the contents of this learning resource..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Resource File (PDF / Images / Docs up to 25MB) *</label>
                <div 
                  className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${formData.file ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="id_material_file"
                    className="hidden-file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={handleFileChange} 
                  />
                  <label htmlFor="id_material_file" className="file-label">
                    {formData.file ? (
                      <>
                        <FileCheck size={36} color="#22c55e" />
                        <span style={{ fontWeight: 700, color: '#f3f4f6' }}>{formData.file.name}</span>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB) — Click or drop to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={36} color="#E11B22" />
                        <span style={{ fontWeight: 600 }}>Click to browse or drag & drop document here</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Supports PDF, Images, DOC (Max 25MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>Discard</button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? <Loader2 className="spin" size={20} /> : <Plus size={20} />}
                  <span>{uploading ? (uploadProgress || 'Finalizing...') : 'Live Publish'}</span>
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
              <p>You are about to permanently delete <strong>{deleteConfirmation.title}</strong>. This action is irreversible and will remove the file from central storage and database.</p>
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
