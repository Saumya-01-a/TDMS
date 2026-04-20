import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/navbar';
import Footer from './components/layout/Footer';
import Home from './pages/home/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNotifications from './pages/admin/notifications/AdminNotifications';
import AdminStudyMaterials from './pages/admin/materials/AdminStudyMaterials';
import AdminStudents from './pages/admin/students/AdminStudents';
import AdminInstructors from './pages/admin/instructors/AdminInstructors';
import AdminProfile from './pages/admin/profile/AdminProfile';
import AdminSchedule from './pages/admin/schedule/AdminSchedule';
import AdminFleet from './pages/admin/fleet/AdminFleet';
import AdminAttendance from './pages/admin/attendance/AdminAttendance';
import AdminTracking from './pages/admin/tracking/AdminTracking';
import AdminTrialExams from './pages/admin/exams/AdminTrialExams';
import AdminPackages from './pages/admin/packages/AdminPackages';
import AdminPayments from './pages/admin/payments/AdminPayments';

// Student Imports
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/dashboard/StudentDashboard';
import StudentNotifications from './pages/student/notifications/StudentNotifications';
import StudentStudyMaterials from './pages/student/materials/StudentStudyMaterials';
import StudentProfile from './pages/student/profile/StudentProfile';
import StudentPackages from './pages/student/packages/StudentPackages';
import StudentSchedule from './pages/student/schedule/StudentSchedule';
import StudentPayment from './pages/student/payment/StudentPayment';
import StudentProgress from './pages/student/progress/StudentProgress';
import StudentAttendance from './pages/student/attendance/StudentAttendance';
import StudentRoutes from './pages/student/routes/StudentRoutes';

// Instructor Imports
import InstructorLayout from './layouts/InstructorLayout';
import InstructorDashboard from './pages/instructor/dashboard/InstructorDashboard';
import InstructorNotifications from './pages/instructor/notifications/InstructorNotifications';
import InstructorStudyMaterials from './pages/instructor/materials/InstructorStudyMaterials';
import InstructorStudents from './pages/instructor/students/InstructorStudents';
import InstructorSchedule from './pages/instructor/schedule/InstructorSchedule';
import InstructorVehicles from './pages/instructor/vehicles/InstructorVehicles';
import InstructorAttendance from './pages/instructor/attendance/InstructorAttendance';
import InstructorGpsTracking from './pages/instructor/gps/InstructorGpsTracking';
import InstructorProfile from './pages/instructor/profile/InstructorProfile';
import StudyMaterials from './pages/instructor/StudyMaterials';

import { StudentProvider } from './context/StudentContext';

function App() {
  return (
    <StudentProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="materials" element={<AdminStudyMaterials />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="vehicles" element={<AdminFleet />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="appointments" element={<AdminSchedule />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="tracking" element={<AdminTracking />} />
            <Route path="exams" element={<AdminTrialExams />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Instructor Routes */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
            <Route path="notifications" element={<InstructorNotifications />} />
            <Route path="materials" element={<InstructorStudyMaterials />} />
            <Route path="students" element={<InstructorStudents />} />
            <Route path="schedule" element={<InstructorSchedule />} />
            <Route path="vehicles" element={<InstructorVehicles />} />
            <Route path="attendance" element={<InstructorAttendance />} />
            <Route path="gps" element={<InstructorGpsTracking />} />
            <Route path="profile" element={<InstructorProfile />} />
            <Route path="materials" element={<StudyMaterials />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="materials" element={<StudentStudyMaterials />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="packages" element={<StudentPackages />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="payment" element={<StudentPayment />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="routes" element={<StudentRoutes />} />
          </Route>
        </Routes>
      </Router>
    </StudentProvider>
  );
}

export default App;
