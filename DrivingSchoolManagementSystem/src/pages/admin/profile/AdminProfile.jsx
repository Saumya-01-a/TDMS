import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Save, 
  Loader2,
  Camera,
  Hash,
  Activity,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import './adminProfile.css';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    userId: '',
    createdDate: '',
    status: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
      const storedUser = JSON.parse(stored);
      
      const uid = storedUser.user_id || storedUser.userId;
      if (!uid) {
        console.warn("No administrative ID found in session.");
        setLoading(false);
        return;
      }

      // 🌍 FETCH REAL-TIME DATA FROM BACKEND (Centralized Auth)
      const res = await fetch(`http://127.0.0.1:3000/auth/profile/${uid}`);
      const data = await res.json();

      if (data.ok && data.user) {
        const u = data.user;
        setProfile({
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          email: u.email || '',
          phone: u.tel_no || '',
          address1: u.address_line_1 || '',
          address2: u.address_line_2 || '',
          city: u.city || '',
          user_id: u.user_id,
          createdDate: u.created_date || new Date().toISOString(),
          status: u.status || 'Active',
          role: u.role || 'Super Admin'
        });
      } else {
        // Fallback to stored data if backend fetch fails
        setProfile({
          firstName: storedUser.firstName || storedUser.first_name || 'Admin',
          lastName: storedUser.lastName || storedUser.last_name || 'User',
          email: storedUser.email || '',
          phone: storedUser.tel_no || '',
          address1: storedUser.address_line_1 || '',
          address2: storedUser.address_line_2 || '',
          city: storedUser.city || '',
          user_id: uid,
          createdDate: storedUser.created_date || new Date().toISOString(),
          status: storedUser.status || 'Active',
          role: storedUser.role || 'Super Admin'
        });
      }
    } catch (err) {
      console.error("Profile synchronization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.user_id) return alert("System Error: Admin ID missing.");
    setSaving(true);

    try {
      const res = await fetch(`http://127.0.0.1:3000/admin/profile/${profile.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          address1: profile.address1,
          address2: profile.address2,
          city: profile.city
        })
      });

      const data = await res.json();
      if (data.ok) {
        // Update Session/Local Storage with consistent keys
        const current = JSON.parse(localStorage.getItem('user') || '{}');
        const updated = { 
          ...current, 
          firstName: profile.firstName, 
          lastName: profile.lastName, 
          email: profile.email, 
          tel_no: profile.phone,
          address_line_1: profile.address1,
          address_line_2: profile.address2,
          city: profile.city,
          user_id: profile.user_id
        };
        localStorage.setItem('user', JSON.stringify(updated));
        alert("Success! Your administrative credentials have been updated.");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      alert("Network failure. Please ensure the backend is reachable.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="spin" size={48} color="#B91C1C" />
        <p>Synchronizing Administrative Data...</p>
      </div>
    );
  }

  return (
    <div className="adm_profile__page" id="id_adm_profile_page">
      <div className="adm_profile__wrapper">
        
        {/* 👤 LEFT COLUMN: IDENTITY CARD */}
        <div className="adm_profile__sidebar">
          <div className="identity-card glass-card">
            <div className="avatar-wrapper">
              <div className="avatar-placeholder">
                <User size={60} color="#fff" />
              </div>
              <button className="edit-avatar-btn" id="btn_edit_avatar" onClick={() => alert("Avatar upload feature coming soon.")}><Camera size={16} /></button>
            </div>
            
            <div className="identity-text">
              <h2>{profile.firstName} {profile.lastName}</h2>
              <div className="role-badge">
                <ShieldCheck size={14} />
                <span>{profile.role.toUpperCase()}</span>
              </div>
            </div>

            <div className="identity-stats">
              <div className="stat-item">
                <label>Account Status</label>
                <div className="stat-value online">{profile.status}</div>
              </div>
              <div className="stat-item">
                <label>Admin ID</label>
                <div className="stat-value">#{profile.user_id.toString().slice(-6)}</div>
              </div>
            </div>

            <div className="sidebar-quick-links">
               <button className="link-item active" id="btn_nav_personal"><User size={16}/> Personal Detail <ChevronRight size={14} /></button>
               <button className="link-item" id="btn_nav_logs" disabled><Activity size={16}/> System Logs <ChevronRight size={14} /></button>
               <button className="link-item logout" id="btn_logout_profile" onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href='/'; }}><LogOut size={16}/> Sign Out</button>
            </div>
          </div>

          <div className="system-info-card glass-card">
             <h3><Calendar size={18} /> Administrative Tenure</h3>
             <p>Member since {format(new Date(profile.createdDate), 'MMMM yyyy')}</p>
             <div className="tenure-progress">
                <div className="progress-fill" style={{width: '85%'}}></div>
             </div>
             <small>System Integrity Score: 98%</small>
          </div>
        </div>

        {/* 📝 RIGHT COLUMN: SETTINGS FORM */}
        <div className="adm_profile__main">
          <header className="profile-header">
            <h1>Administrative Identity Settings</h1>
            <p>Manage your professional profile and system credentials for the Driving School Management System.</p>
          </header>

          <form className="profile-form glass-card" onSubmit={handleSave}>
            <div className="form-section">
              <div className="section-title"><User size={18} /> Basic Identity</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={profile.firstName} 
                    onChange={e => setProfile({...profile, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={profile.lastName} 
                    onChange={e => setProfile({...profile, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title"><Mail size={18} /> Communication</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Official Email</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title"><MapPin size={18} /> Location Details</div>
              <div className="form-group full-width">
                <label>Address Line 1</label>
                <input 
                  type="text" 
                  value={profile.address1} 
                  onChange={e => setProfile({...profile, address1: e.target.value})}
                  placeholder="Street name, Building number"
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Address Line 2</label>
                  <input 
                    type="text" 
                    value={profile.address2} 
                    onChange={e => setProfile({...profile, address2: e.target.value})}
                    placeholder="Area / Neighborhood"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={profile.city} 
                    onChange={e => setProfile({...profile, city: e.target.value})}
                    placeholder="Colombo"
                  />
                </div>
              </div>
            </div>

            <div className="form-footer">
               <div className="security-notice">
                  <ShieldCheck size={16} />
                  <span>Updates to these details are logged for auditing purposes.</span>
               </div>
                <div className="btn-group">
                 <button type="button" className="btn-secondary" id="btn_discard_profile" onClick={fetchProfileData}>Discard Changes</button>
                 <button type="submit" className="btn-primary" id="btn_save_profile" disabled={saving}>
                   {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                   <span>{saving ? 'Synchronizing...' : 'Save Changes'}</span>
                 </button>
               </div>
            </div>
          </form>

          <div className="security-shortcut glass-card">
             <div className="shortcut-icon"><ShieldCheck size={24} color="#B91C1C" /></div>
             <div className="shortcut-text">
                <h4>System Security Policy</h4>
                <p>Your account is protected by multi-factor authentication. To change your password or security keys, please contact the System Superintendent.</p>
             </div>
             <button className="shortcut-btn" id="btn_access_vault" disabled>Access Vault</button>
          </div>
        </div>

      </div>
    </div>
  );
}
