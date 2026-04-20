import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../../components/student/StudentSidebar';
import './studentProfile.css';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: ''
  });

  const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(stored);
  const userId = user.user_id || user.userId;

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:3000/student/profile/${userId}`);
      const data = await res.json();
      if (data.ok) {
        setProfile(data.profile);
        setFormData({
          email: data.profile.email,
          phone: data.profile.tel_no,
          addressLine1: data.profile.address_line_1,
          addressLine2: data.profile.address_line_2,
          city: data.profile.city
        });
      }
    } catch (err) {
      console.error("Profile sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/student/profile/update/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        setIsEditing(false);
        fetchProfile();
        alert("Master profile synchronized successfully.");
      }
    } catch (err) {
      alert("Database link failed. Check connectivity.");
    }
  };

  if (loading) return <div className="stu-profile__loading">Synchronizing Master Profile...</div>;
  if (!profile) return <div className="stu-profile__error">Profile Record Unavailable.</div>;

  return (
    <div className="stu-profile__main" id="id_stu_profile_main">
      <StudentSidebar active="My Profile" />

      <div className="stu-profile__container">
        {/* Header Card */}
        <div className="stu-profileHeaderCard glass-panel">
          <div className="stu-profileHeaderContent">
            <div className="stu-profilePhotoSection">
              <div className="stu-profilePhotoWrapper">
                <div className="stu-profilePhotoPlaceholder">
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
                {isEditing && (
                  <div className="stu-profilePhotoCamera">
                    <span>📷</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="stu-profileInfoSection">
              <h1 className="stu-profileName">{profile.first_name} {profile.last_name}</h1>
              <p className="stu-profileStudentId">Trainee Index: <span>{profile.student_id}</span></p>
              <p className="stu-profileMemberSince">Registered {new Date(profile.registered_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="stu-profileHeaderActions">
            {isEditing ? (
              <>
                <button className="stu-btnSaveProfile" onClick={handleSave}>Sync Changes</button>
                <button className="stu-btnCancelProfile" onClick={() => setIsEditing(false)}>Discard</button>
              </>
            ) : (
              <button className="stu-btnEditProfile" onClick={() => setIsEditing(true)}>
                <span>✏️</span> Update Details
              </button>
            )}
          </div>
        </div>

        <div className="stu-profileGrid">
          <div className="stu-profileLeft">
            {/* Personal Information Section */}
            <div className="stu-profileSection glass-panel">
              <h2 className="stu-sectionTitle">Identity & Contact</h2>
              
              <div className="stu-formGrid2col">
                <div className="stu-formGroup">
                  <label>Legal Name</label>
                  <input 
                    type="text" 
                    value={`${profile.first_name} ${profile.last_name}`}
                    disabled
                  />
                </div>

                <div className="stu-formGroup">
                  <label>NIC Identity</label>
                  <input 
                    type="text" 
                    value={profile.nic || 'N/A'}
                    disabled
                  />
                </div>

                <div className="stu-formGroup">
                  <label>
                    <span className="stu-inputIcon">✉️</span>
                    Primary Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="stu-formGroup">
                  <label>
                    <span className="stu-inputIcon">📱</span>
                    Contact Mode
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="stu-profileSection glass-panel">
              <h2 className="stu-sectionTitle">Residential Metadata</h2>
              
              <div className="stu-formGroup">
                <label>
                  <span className="stu-inputIcon">📍</span>
                  Street Address
                </label>
                <input 
                  type="text" 
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="stu-formGrid2col mt-4">
                <div className="stu-formGroup">
                  <label>Locality</label>
                  <input 
                    type="text" 
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="stu-formGroup">
                  <label>Postal City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stu-profileRight">
            {/* Training Metadata */}
            <div className="stu-profileSection glass-panel highlight-section">
              <h2 className="stu-sectionTitle">Academic Status</h2>
              <div className="stu-statusRow">
                <div className="stu-statusItem">
                  <span className="stu-statusLabel">Enrollment</span>
                  <span className={`stu-statusValue status-${profile.status.toLowerCase()}`}>{profile.status}</span>
                </div>
                <div className="stu-statusItem">
                  <span className="stu-statusLabel">Curriculum</span>
                  <span className="stu-statusValue">{profile.package_name || 'Individual'}</span>
                </div>
              </div>
            </div>

            {/* My Instructor Section */}
            {profile.instructor_id && (
              <div className="stu-instructorCard glass-panel">
                <h2 className="stu-sectionTitle">Assigned Mentor</h2>
                <div className="stu-instructorContent">
                  <div className="stu-instructorDetails">
                    <h3 className="stu-instructorName">{profile.ins_fname} {profile.ins_lname}</h3>
                    <p className="stu-instructorId">License Identity: <span>{profile.instructor_id}</span></p>
                    
                    <div className="stu-instructorInfoGrid mt-4">
                      <div className="stu-infoItem">
                        <span className="stu-infoLabel">Role</span>
                        <span className="stu-infoValue">Senior Instructor</span>
                      </div>
                      <div className="stu-infoItem">
                        <span className="stu-infoLabel">Status</span>
                        <span className="stu-infoValue text-success">Professional Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
