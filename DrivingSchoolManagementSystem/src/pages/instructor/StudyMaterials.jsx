import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Wrench, 
  ShieldAlert, 
  FileText, 
  Search, 
  Download, 
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import './studyMaterials.css';

const CATEGORIES = [
  { id: 'Highway Code', label: 'Highway Code (Maarga Neethi)', icon: BookOpen, description: 'Traffic laws, road rules, and lane discipline.' },
  { id: 'Vehicle Maintenance', label: 'Vehicle Maintenance', icon: Wrench, description: 'Basic engine checks, tire safety, and dashboard indicators.' },
  { id: 'Traffic Signs', label: 'Traffic Signs', icon: ShieldAlert, description: 'Mandatory, warning, and informative signs used in Sri Lanka.' },
  { id: 'Mock Exams', label: 'Mock Exams', icon: FileText, description: 'Sample theory papers and trial-related guides.' }
];

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Using the new shared API route
      const response = await fetch('http://localhost:3000/api/materials');
      const data = await response.json();
      if (data.ok) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Instant Frontend Filtering Logic
  const filteredMaterials = materials.filter(m => {
    const searchLow = searchTerm.toLowerCase();
    return (
      m.title.toLowerCase().includes(searchLow) || 
      m.category.toLowerCase().includes(searchLow)
    );
  });

  const getMaterialsByCategory = (categoryName) => {
    return filteredMaterials.filter(m => m.category === categoryName);
  };

  const cleanFileName = (url) => {
    if (!url) return 'document.pdf';
    const parts = url.split('/');
    return parts[parts.length - 1].replace(/^\d+-/, ''); // Remove timestamp prefix from supabase
  };

  if (loading) return <div className="sm__container"><p className="sm__empty_state">Loading resources...</p></div>;

  return (
    <div className="sm__container">
      {/* HEADER & SEARCH */}
      <div className="sm__header_row">
        <div className="sm__title_group">
          <div className="header-with-icon">
            <Layers size={28} className="text-brand-red" />
            <h1>Educational Resources</h1>
          </div>
          <p className="ins_sch__subtitle">Access professional Sri Lankan driving school resources & learning guides</p>
        </div>

        <div className="sm__search_wrapper glass-card">
          <Search size={18} className="sm__search_icon" />
          <input 
            type="text" 
            className="sm__search_input glass-input"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORIES SECTIONS */}
      {CATEGORIES.map(cat => {
        const catMaterials = getMaterialsByCategory(cat.id);
        
        // Only show category if it has matching materials or no search is active
        if (searchTerm && catMaterials.length === 0) return null;

        return (
          <section key={cat.id} className="sm__category_section">
            <div className="sm__category_header">
              <div className="sm__category_icon_circle">
                <cat.icon size={24} className="text-brand-red" />
              </div>
              <div className="sm__category_info">
                <h2>{cat.label}</h2>
                <p className="sm__description">{cat.description}</p>
              </div>
            </div>

            <div className="sm__grid">
              {catMaterials.length > 0 ? (
                catMaterials.map(m => (
                  <div key={m.id} className="sm__card glass-card">
                    <div className="sm__card_top">
                      <div className="sm__resource_type">
                        <FileText size={14} />
                        <span>PDF RESOURCE</span>
                      </div>
                      <h3 className="sm__card_title">{m.title}</h3>
                    </div>
                    
                    <div className="sm__card_footer">
                      <div className="sm__card_date">
                        <Calendar size={14} />
                        <span>{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <a 
                        href={m.file_url} 
                        download={cleanFileName(m.file_url)}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="sm__download_btn"
                      >
                        <Download size={16} /> DOWNLOAD
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm__grid" style={{ gridColumn: '1 / -1' }}>
                  <div className="sm__empty_state">
                    No materials currently available in this category.
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* NO RESULTS FOUND AT ALL */}
      {searchTerm && filteredMaterials.length === 0 && (
        <div className="sm__empty_state glass-card">
          <div className="sm__empty_icon_row">
            <ShieldAlert size={48} className="text-muted" strokeWidth={1} />
          </div>
          <h3>No matches found for "{searchTerm}"</h3>
          <p>Please try a different keyword or check other categories.</p>
        </div>
      )}
    </div>
  );
}
