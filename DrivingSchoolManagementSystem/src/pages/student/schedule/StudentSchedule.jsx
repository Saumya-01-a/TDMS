import React, { useState, useEffect } from "react";
import StudentSidebar from "../../../components/student/StudentSidebar";
import "./studentSchedule.css";

export default function StudentSchedule() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryStatus, setInquiryStatus] = useState(null);

  // Identity Resolution
  const userString = sessionStorage.getItem("user") || localStorage.getItem("user") || "{}";
  const user = JSON.parse(userString);
  const uid = user.user_id || user.userId;

  useEffect(() => {
    if (uid) {
      fetchFullSchedule();
    }
  }, [uid]);

  const fetchFullSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:3000/student/full-schedule/${uid}`);
      const data = await res.json();
      if (data.ok) {
        setLessons(data.lessons);
      }
    } catch (err) {
      console.error("Failed to load full student schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async (type, lessonId = null) => {
    try {
      setInquiryStatus('sending');
      const subject = type === 'reschedule' ? 'Schedule Change Request' : 'New Slot Inquiry';
      const message = type === 'reschedule' 
        ? `Student ${user.first_name} requested a change for lesson ID: ${lessonId}.`
        : `Student ${user.first_name} is inquiring about new training slots.`;

      const res = await fetch('http://127.0.0.1:3000/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: 'SYSTEM_ADMIN', // Notify admin
          sender_id: user.user_id || user.userId,
          message,
          subject,
          priority: 'medium',
          category: 'service_request'
        })
      });

      const data = await res.json();
      if (data.ok) {
        setInquiryStatus('success');
        setTimeout(() => setInquiryStatus(null), 4000);
      } else {
        setInquiryStatus('error');
      }
    } catch (err) {
      setInquiryStatus('error');
    }
  };

  const sessionTimes = {
    1: '08:00 AM - 10:00 AM',
    2: '10:00 AM - 12:00 PM',
    3: '01:00 PM - 03:00 PM',
    4: '03:00 PM - 05:00 PM'
  };

  return (
    <div className="stuSch__pageWrapper">
      <StudentSidebar />
      
      <main className="stuSch__main">
        <div className="stuSch__container">
          <header className="stuSch__header">
            <div className="stuSch__headerText">
              <h1 className="stuSch__title">Training Schedule</h1>
              <p className="stuSch__subtitle">Manage your driving lessons and fleet resource allocations</p>
            </div>
            <button 
              className="stuSch__inquireBtn" 
              onClick={() => handleInquiry('new_slot')}
            >
              + Inquire New Slot
            </button>
          </header>

          {inquiryStatus === 'success' && (
            <div className="stuSch__alert stuSch__alert--success">Your inquiry has been sent to the administration!</div>
          )}
          {inquiryStatus === 'error' && (
            <div className="stuSch__alert stuSch__alert--error">Failed to send inquiry. Please try again later.</div>
          )}

          {loading ? (
            <div className="stuSch__loading">Synchronizing with central command...</div>
          ) : (
            <div className="stuSch__grid">
              {lessons.length === 0 ? (
                <div className="stuSch__empty">No scheduled sessions found in the system.</div>
              ) : (
                lessons.map((lesson) => (
                  <div key={lesson.id} className="stuSch__card glass-panel">
                    <div className="stuSch__cardTop">
                      <div className="stuSch__dateBlock">
                        <span className="stuSch__icon">📅</span>
                        <span>{new Date(lesson.lesson_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className={`stuSch__statusPill ${lesson.status.toLowerCase()}`}>
                        {lesson.status}
                      </div>
                    </div>

                    <div className="stuSch__cardBody">
                      <div className="stuSch__infoRow">
                        <span className="stuSch__icon">🕐</span>
                        <span>{sessionTimes[lesson.session_number] || 'Custom Session'}</span>
                      </div>
                      <div className="stuSch__infoRow">
                        <span className="stuSch__icon">👨‍🏫</span>
                        <span>Instructor: {lesson.instructor_fname} {lesson.instructor_lname}</span>
                      </div>
                      <div className="stuSch__infoRow">
                        <span className="stuSch__icon">🚗</span>
                        <span>Fleet: {lesson.vehicle_reg} ({lesson.vehicle_type})</span>
                      </div>
                    </div>

                    <div className="stuSch__cardFooter">
                      {lesson.status.toLowerCase() === 'scheduled' && (
                        <button 
                          className="stuSch__changeLink"
                          onClick={() => handleInquiry('reschedule', lesson.id)}
                        >
                          Request Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
