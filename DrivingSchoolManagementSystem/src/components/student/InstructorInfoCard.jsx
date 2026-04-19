import React, { useState, useEffect } from 'react';
import { User, Phone, Award, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import './instructorInfoCard.css';
import '../../styles/glassmorphism.css';

const API_BASE = "http://localhost:3000/instructor";

export default function InstructorInfoCard() {
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userString = sessionStorage.getItem("user") || localStorage.getItem("user") || "{}";
  const user = JSON.parse(userString);
  const userId = user.userId || user.user_id;
  const token = sessionStorage.getItem("token") || localStorage.getItem("token") || "";

  useEffect(() => {
    if (userId) {
      fetchInstructor();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/student-assigned-instructor/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.ok) {
        setInstructor(data.instructor);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch instructor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ins-card glass-panel ins-card__loading">
        <div className="shimmer"></div>
        <p>Syncing Instructor Data...</p>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="ins-card glass-panel ins-card__empty">
        <User size={40} className="text-secondary opacity-20" />
        <p>No Assigned Instructor</p>
        <span className="ins-card__sub-err">Please contact administration</span>
      </div>
    );
  }

  return (
    <div className="ins-card glass-panel">
      <div className="ins-card__branding">
        <ShieldCheck size={14} className="text-cyan" />
        <span>Verified Thisara Instructor</span>
      </div>

      <div className="ins-card__header">
        <div className="ins-card__avatar-ring">
          <div className="ins-card__avatar-main">
            {instructor.profile_image_url ? (
              <img src={instructor.profile_image_url} alt="Instructor" />
            ) : (
              <div className="avatar-placeholder">{instructor.first_name?.[0]}{instructor.last_name?.[0]}</div>
            )}
          </div>
        </div>
        <div className="ins-card__title-sec">
          <h4 className="ins-card__name">{instructor.first_name} {instructor.last_name}</h4>
          <span className="ins-card__spec badge-role">
            <Award size={10} /> {instructor.specialization || "Senior Instructor"}
          </span>
        </div>
      </div>

      <div className="ins-card__body">
        <div className="ins-card__info-row">
          <Phone size={14} className="text-gold" />
          <div className="ins-card__info-val">
            <label>Direct Contact</label>
            <span>{instructor.tel_no || 'N/A'}</span>
          </div>
        </div>
        
        <div className="ins-card__info-row">
          <ShieldCheck size={14} className="text-cyan" />
          <div className="ins-card__info-val">
            <label>Expertise</label>
            <span>{instructor.specialization === 'Both' ? 'Master Instructor' : 'Certified Professional'}</span>
          </div>
        </div>
      </div>

      <button className="ins-card__action glass-card">
        <MessageSquare size={16} />
        Message Instructor
      </button>

      <div className="ins-card__footer">
        Your assigned professional mentor
      </div>
    </div>
  );
}
