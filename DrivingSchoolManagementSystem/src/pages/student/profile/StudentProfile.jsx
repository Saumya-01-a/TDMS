import React, { useState } from 'react';
import './studentProfile.css';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const profileData = {
    name: 'Kamal Perera',
    studentId: 'SL-22587',
    memberSince: 'January 15, 2024',
    personalInfo: {
      fullName: 'Kamal Perera',
      email: 'kamal.perera@example.com',
      phone: '+94 (070) 123-4567',
      dateOfBirth: '1998-05-20',
      nic: '985432156V',
      licenseType: 'Car'
    },
    address: {
      street: '456 Palm Tree Lane, Colombo District',
      city: 'Colombo',
      postalCode: '00600'
    },
    emergencyContact: {
      name: 'Sunil Perera',
      phone: '+94 (070) 987-6543'
    },
    instructor: {
      name: 'Sanath Jayasuriya',
      instructorId: 'INS-2015-0234',
      rating: 4.8,
      specialization: 'Car, Van',
      experience: '8 years',
      phone: '+94 (070) 555-1234',
      email: 'sanath.jayasuriya@school.com',
      license: 'IRL-2015-0234'
    }
  };

  return (
    <div className="stu-profileContainer">
      {/* Header Card */}
      <div className="stu-profileHeaderCard">
        <div className="stu-profileHeaderContent">
          <div className="stu-profilePhotoSection">
            <div className="stu-profilePhotoWrapper">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" 
                alt={profileData.name}
                className="stu-profilePhoto"
              />
              <div className="stu-profilePhotoCamera">
                <span>📷</span>
              </div>
            </div>
          </div>
          
          <div className="stu-profileInfoSection">
            <h1 className="stu-profileName">{profileData.name}</h1>
            <p className="stu-profileStudentId">Student ID: <span>{profileData.studentId}</span></p>
            <p className="stu-profileMemberSince">Member since {profileData.memberSince}</p>
          </div>
        </div>

        <button className="stu-btnEditProfile" onClick={() => setIsEditing(!isEditing)}>
          <span>✏️</span> Edit Profile
        </button>
      </div>

      {/* Personal Information Section */}
      <div className="stu-profileSection">
        <h2 className="stu-sectionTitle">Personal Information</h2>
        
        <div className="stu-formGrid2col">
          <div className="stu-formGroup">
            <label>Full Name</label>
            <input 
              type="text" 
              value={profileData.personalInfo.fullName}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>
              <span className="stu-inputIcon">✉️</span>
              Email Address
            </label>
            <input 
              type="email" 
              value={profileData.personalInfo.email}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>
              <span className="stu-inputIcon">📱</span>
              Phone Number
            </label>
            <input 
              type="tel" 
              value={profileData.personalInfo.phone}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>
              <span className="stu-inputIcon">📅</span>
              Date of Birth
            </label>
            <input 
              type="date" 
              value={profileData.personalInfo.dateOfBirth}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>NIC Number</label>
            <input 
              type="text" 
              value={profileData.personalInfo.nic}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>License Type</label>
            <input 
              type="text" 
              value={profileData.personalInfo.licenseType}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="stu-profileSection">
        <h2 className="stu-sectionTitle">Address Information</h2>
        
        <div className="stu-formGroupFull">
          <label>
            <span className="stu-inputIcon">📍</span>
            Street Address
          </label>
          <input 
            type="text" 
            value={profileData.address.street}
            disabled={!isEditing}
            readOnly={!isEditing}
          />
        </div>

        <div className="stu-formGrid2col">
          <div className="stu-formGroup">
            <label>City</label>
            <input 
              type="text" 
              value={profileData.address.city}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>Postal Code</label>
            <input 
              type="text" 
              value={profileData.address.postalCode}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="stu-profileSection">
        <h2 className="stu-sectionTitle">Emergency Contact</h2>
        
        <div className="stu-formGrid2col">
          <div className="stu-formGroup">
            <label>Contact Name</label>
            <input 
              type="text" 
              value={profileData.emergencyContact.name}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>

          <div className="stu-formGroup">
            <label>
              <span className="stu-inputIcon">📱</span>
              Contact Phone
            </label>
            <input 
              type="tel" 
              value={profileData.emergencyContact.phone}
              disabled={!isEditing}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* My Instructor Section */}
      <div className="stu-instructorCard">
        <div className="stu-instructorContent">
          <div className="stu-instructorPhotoSection">
            <div className="stu-instructorPhotoWrapper">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" 
                alt={profileData.instructor.name}
                className="stu-instructorPhoto"
              />
            </div>
          </div>

          <div className="stu-instructorDetails">
            <h3 className="stu-instructorName">{profileData.instructor.name}</h3>
            <p className="stu-instructorId">Instructor ID: <span>{profileData.instructor.instructorId}</span></p>
            
            <div className="stu-instructorRating">
              <span className="stu-ratingStars">⭐</span>
              <span className="stu-ratingValue">{profileData.instructor.rating}/5</span>
            </div>

            <div className="stu-instructorInfoGrid">
              <div className="stu-infoItem">
                <span className="stu-infoLabel">Specialization</span>
                <span className="stu-infoValue">{profileData.instructor.specialization}</span>
              </div>
              <div className="stu-infoItem">
                <span className="stu-infoLabel">Experience</span>
                <span className="stu-infoValue">{profileData.instructor.experience}</span>
              </div>
              <div className="stu-infoItem">
                <span className="stu-infoLabel">Phone</span>
                <span className="stu-infoValue">{profileData.instructor.phone}</span>
              </div>
              <div className="stu-infoItem">
                <span className="stu-infoLabel">Email</span>
                <span className="stu-infoValue">{profileData.instructor.email}</span>
              </div>
              <div className="stu-infoItem">
                <span className="stu-infoLabel">License</span>
                <span className="stu-infoValue">{profileData.instructor.license}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
