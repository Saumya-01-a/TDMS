import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../../components/student/StudentSidebar';
import InstructorInfoCard from '../../../components/student/InstructorInfoCard';
import { useNavigate } from 'react-router-dom';
import GlobalLogo from '../../../components/common/GlobalLogo';
import './studentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = sessionStorage.getItem("user") || localStorage.getItem("user") || "{}";
  const user = JSON.parse(userString);
  const userId = user.userId || user.user_id;
  const token = sessionStorage.getItem("token") || localStorage.getItem("token") || "";

  const [payments, setPayments] = useState([]);
  const [exams, setExams] = useState([]);
  const [trialAssignment, setTrialAssignment] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch(`http://127.0.0.1:3000/student/dashboard/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setStudent(data.student);
        setLessons(data.lessons);
        setPayments(data.payments || []);
        if (data.trial) setTrialAssignment(data.trial);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'paid':
      case 'completed': return 'stdDash__status-paid';
      case 'pending': return 'stdDash__status-pending';
      case 'due': return 'stdDash__status-due';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'paid':
      case 'completed': return '✓ Paid';
      case 'pending': return '⏳ Pending';
      case 'due': return '⚠ Due';
      default: return status;
    }
  };

  if (loading) return <div className="stdDash__dashboardWrap"><StudentSidebar /><main className="stdDash__main">Loading dashboard data...</main></div>;

  return (
    <div className="stdDash__dashboardWrap">
      <StudentSidebar />

      {/* Main Content */}
      <main className="stdDash__main">
        <div className="stdDash__bgGlow"></div>

        <div className="stdDash__container">
          {/* Header with Branding - Centered */}
          <div className="stdDash__topHeader">
            <div className="stdDash__headerSide">
              <GlobalLogo layout="horizontal" />
            </div>
            <h1 className="stdDash__dashboardTitle">Student Dashboard</h1>
            <div className="stdDash__headerSide"></div>
          </div>

          {/* Welcome Banner - Centered content */}
          <div className="stdDash__banner">
            <div className="stdDash__bannerContent" style={{ textAlign: 'center', margin: '0 auto' }}>
              <h1>Welcome back, {student?.first_name || 'Student'}</h1>
              <p>Your current status: <span className="text-brand-red font-bold">{student?.status || 'Learning'}</span></p>
              <div className="stdDash__banner-progress-container">
                <span className="stdDash__banner-progress-label">Overall Progress: {student?.progress || 0}%</span>
                <div className="stdDash__banner-progress-bar">
                   <div className="stdDash__banner-progress-fill" style={{ width: `${student?.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="stdDash__bannerIcon">🎯</div>
          </div>

          {/* Main Content Grid */}
          <div className="stdDash__grid">
            {/* Left: Payment Overview */}
            <div className="stdDash__panelLarge">
              <div className="stdDash__panelHeader">
                <h2>Payment Overview</h2>
                <div className="stdDash__paymentCount">{payments.length} Total Payments</div>
              </div>

              {/* Payment Legend */}
              <div className="stdDash__legend">
                <div className="stdDash__legendItem">
                  <span className="stdDash__legendDot stdDash__pending"></span>
                  <span>Pending</span>
                </div>
                <div className="stdDash__legendItem">
                  <span className="stdDash__legendDot stdDash__paid"></span>
                  <span>Paid</span>
                </div>
                <div className="stdDash__legendItem">
                  <span className="stdDash__legendDot stdDash__due"></span>
                  <span>Due</span>
                </div>
              </div>

              {/* Recent Payments */}
              <div className="stdDash__sectionTitle">Recent Payments</div>
              <div className="stdDash__paymentsList">
                {payments.length > 0 ? payments.map((payment, idx) => (
                  <div key={idx} className="stdDash__paymentItem">
                    <div className="stdDash__paymentInfo">
                      <div className="stdDash__paymentAmount">LKR {parseFloat(payment.amount).toLocaleString()}</div>
                      <div className="stdDash__paymentDate">{new Date(payment.payment_date).toLocaleDateString()} · {payment.payment_method}</div>
                    </div>
                    <div className={`stdDash__statusBadge ${getStatusBadgeClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </div>
                  </div>
                )) : (
                  <p className="empty-msg">No payment records found.</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="stdDash__panelColumn">
              {/* Assigned Instructor Card */}
              <div className="stdDash__panelHeader" style={{ marginBottom: '1rem' }}>
                <h2>Your Instructor</h2>
              </div>
              <InstructorInfoCard />

              {/* Upcoming Lessons */}
              <div className="stdDash__panelSmall">
                <div className="stdDash__panelHeader">
                  <h2>Upcoming Lessons</h2>
                </div>

                <div className="stdDash__lessonsList">
                  {lessons.length > 0 ? lessons.map((lesson) => (
                    <div key={lesson.id} className="stdDash__lessonItem">
                      <div className="stdDash__lessonInfo">
                        <div className="stdDash__lessonTitle">Session #{lesson.session_number}</div>
                        <div className="stdDash__lessonDetails">
                          📅 {new Date(lesson.lesson_date).toLocaleDateString()} · 🕐 {lesson.session_number === 1 ? '08:00 AM' : '10:00 AM'}
                        </div>
                        <div className="stdDash__lessonInstructor">Instructor: {lesson.instructor_fname} {lesson.instructor_lname}</div>
                      </div>
                      <div className="stdDash__lessonStatus-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div className={`stdDash__lessonStatus ${lesson.status.toLowerCase()}`}>
                          {lesson.status}
                        </div>
                        {lesson.status === 'Scheduled' && (
                          <button 
                            className="stdDash__btnReschedule"
                            onClick={() => navigate('/student/schedule')}
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="empty-msg">No upcoming lessons scheduled.</p>
                  )}
                </div>
              </div>

              {/* Trial Exams Overview */}
              <div className="stdDash__panelSmall">
                <div className="stdDash__panelHeader">
                  <h2>Official Trial Schedule</h2>
                </div>

                <div className="stdDash__examsList">
                  {trialAssignment ? (
                    <div className="stdDash__examItem featured-trial">
                      <div className="stdDash__examNumber">★</div>
                      <div className="stdDash__examInfo">
                        <div className="stdDash__examTitle">Final Practical Trial</div>
                        <div className="stdDash__examDate">📅 {new Date(trialAssignment.trial_date).toLocaleDateString()}</div>
                      </div>
                      <div className="stdDash__examActions">
                        <div className="stdDash__statusBadge stdDash__status-pending">
                           ⏳ Confirmed
                        </div>
                        <button 
                          className="stdDash__btnDetails"
                          onClick={() => navigate('/student/routes')}
                        >
                          View Map
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="stdDash__empty-state">
                       <p>No official trial date assigned yet.</p>
                       <span>Continue your lessons to qualify!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
