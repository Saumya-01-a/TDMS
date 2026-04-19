import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Car, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Pencil,
  X,
  Check,
  Loader2,
  Lock,
  Building
} from 'lucide-react';
import './instructorProfile.css';
import '../../../styles/glassmorphism.css';
import logo from '../../../assets/logo.png';

const API_BASE = "http://localhost:3000/instructor";

export default function InstructorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const userString = sessionStorage.getItem("user") || localStorage.getItem("user") || "{}";
  const user = JSON.parse(userString);
  const userId = user.userId || user.user_id;
  const token = sessionStorage.getItem("token") || localStorage.getItem("token") || "";

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log(`Fetching profile for userId: ${userId} from ${API_BASE}`);
      const res = await fetch(`${API_BASE}/profile-full/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error(`Fetch failed with status: ${res.status}`);
        return;
      }

      const data = await res.json();
      console.log("Fetch result:", data);
      
      if (data.ok) {
        setProfile(data.profile);
        setEditData({
          email: data.profile.email || '',
          phone: data.profile.tel_no || '',
          addressLine1: data.profile.address_line_1 || '',
          addressLine2: data.profile.address_line_2 || '',
          city: data.profile.city || ''
        });
      } else {
        console.warn("API responded with error:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data if cancelling
      setEditData({
        email: profile.email || '',
        phone: profile.tel_no || '',
        addressLine1: profile.address_line_1 || '',
        addressLine2: profile.address_line_2 || '',
        city: profile.city || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/profile-update/${userId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(prev => ({ 
          ...prev, 
          email: editData.email,
          tel_no: editData.phone,
          address_line_1: editData.addressLine1,
          address_line_2: editData.addressLine2,
          city: editData.city
        }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await fetch(`${API_BASE}/profile-image/${userId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(prev => ({ ...prev, profile_image_url: data.imageUrl }));
        const updatedUser = { ...user, profile_image: data.imageUrl };
        if (sessionStorage.getItem("user")) {
          sessionStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="ins-profile__loading">
        <Loader2 className="animate-spin" size={48} color="#E11B22" />
        <p className="text-gradient">Verifying Instructor Identity...</p>
      </div>
    );
  }

  if (!profile) return <div className="ins-profile__error">Profile not found. Please relogin.</div>;

  return (
    <div className="ins-profile__wrapper">
      <div className="ins-profile__header-logo">
        <img src={logo} alt="Thisara Driving School" className="logo-main" />
      </div>

      <div className="ins-profile__container">
        <header className="ins-profile__header">
          <h1 className="text-gradient">Professional Identity</h1>
          <p className="ins-profile__subtitle">Instructor Management Portal</p>
        </header>

        {/* IDENTITY BANNER */}
        <div className="ins-profile__identity glass-panel">
          <div className="ins-profile__avatar-sec">
            <div className="ins-profile__avatar-ring">
              <div className="ins-profile__avatar-main">
                {profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
              </div>
              <button 
                className="ins-profile__avatar-edit" 
                onClick={handleImageClick}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="ins-profile__info-sec">
            <h2 className="ins-profile__display-name">{profile.first_name} {profile.last_name}</h2>
            <div className="ins-profile__badges">
              <span className="badge-id"><Lock size={12} /> {profile.instructor_id}</span>
              <span className="badge-role"><Award size={12} /> {profile.specialization || 'Certified Instructor'}</span>
            </div>
            <p className="ins-profile__status-tag">Status: <span className="text-cyan">Active Professional</span></p>
          </div>

          <div className="ins-profile__action-sec">
            {!isEditing ? (
              <button className="btn-edit-main glass-card" onClick={handleEditToggle}>
                <Pencil size={16} /> Edit Profile
              </button>
            ) : (
              <div className="save-cancel-bundle">
                <button className="btn-save-main" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Changes
                </button>
                <button className="btn-cancel-main" onClick={handleEditToggle}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MAIN DATA GRID */}
        <div className="ins-profile__data-grid">
          
          {/* READ ONLY SECTION */}
          <section className="ins-profile__section glass-panel">
            <div className="section-head">
              <ShieldCheck size={20} className="text-cyan" />
              <h3>Verified Credentials</h3>
              <span className="readonly-tag">Read Only</span>
            </div>
            
            <div className="fields-grid">
              <div className="data-field">
                <label><User size={14} /> Full Name</label>
                <div className="static-value">{profile.first_name} {profile.last_name}</div>
              </div>
              <div className="data-field">
                <label><CreditCard size={14} /> NIC Number</label>
                <div className="static-value">{profile.nic}</div>
              </div>
              <div className="data-field">
                <label><Building size={14} /> MTD Reg Number</label>
                <div className="static-value">{profile.instructor_reg_no}</div>
              </div>
              <div className="data-field">
                <label><ShieldCheck size={14} /> License Number</label>
                <div className="static-value">{profile.licence_no || 'Pending Verification'}</div>
              </div>
              <div className="data-field">
                <label><Award size={14} /> Specialization</label>
                <div className="static-value">{profile.specialization || 'General Driving'}</div>
              </div>
            </div>
            <p className="field-hint">Note: These fields are managed by school administration and cannot be changed.</p>
          </section>

          {/* EDITABLE SECTION */}
          <section className="ins-profile__section glass-panel">
            <div className="section-head">
              <Pencil size={20} className="text-gold" />
              <h3>Contact Details</h3>
              {isEditing && <span className="editing-tag">Active Editing</span>}
            </div>

            <div className="fields-grid">
              <div className="data-field">
                <label><Mail size={14} /> Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className={`glass-input ${isEditing ? 'editable' : ''}`}
                  value={isEditing ? editData.email : (profile.email || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="data-field">
                <label><Phone size={14} /> Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  className={`glass-input ${isEditing ? 'editable' : ''}`}
                  value={isEditing ? editData.phone : (profile.tel_no || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="data-field full-width">
                <label><MapPin size={14} /> Address Line 1</label>
                <input 
                  type="text" 
                  name="addressLine1"
                  className={`glass-input ${isEditing ? 'editable' : ''}`}
                  value={isEditing ? editData.addressLine1 : (profile.address_line_1 || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="data-field">
                <label><MapPin size={14} /> Address Line 2</label>
                <input 
                  type="text" 
                  name="addressLine2"
                  className={`glass-input ${isEditing ? 'editable' : ''}`}
                  value={isEditing ? editData.addressLine2 : (profile.address_line_2 || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="data-field">
                <label><Building size={14} /> City</label>
                <input 
                  type="text" 
                  name="city"
                  className={`glass-input ${isEditing ? 'editable' : ''}`}
                  value={isEditing ? editData.city : (profile.city || '')}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
