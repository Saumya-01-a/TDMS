import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and manage the current user's profile data.
 * Standardized to fetch from the Node backend for data integrity.
 */
export const useUserProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    designation: '',
    avatar: '',
    loading: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Immediate initialization from Local Storage
        const stored = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
        const storedUser = JSON.parse(stored);
        
        // Handle both userId and user_id naming variations
        const uid = storedUser.user_id || storedUser.userId;

        if (!uid) {
          setUserData(prev => ({ ...prev, loading: false, name: 'Guest User' }));
          return;
        }

        // Set baseline name while fetching
        const baselineName = storedUser.firstName 
          ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim()
          : (storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : '');

        setUserData({
          name: baselineName || 'Admin User',
          role: storedUser.role || '',
          designation: getDesignation(storedUser.role),
          avatar: baselineName ? baselineName[0] : 'A',
          loading: true,
        });

        // 2. Fetch Dynamic Data from Backend (Truth Source)
        const res = await fetch(`http://127.0.0.1:3000/auth/profile/${uid}`);
        const data = await res.json();

        if (data.ok && data.user) {
          const u = data.user;
          const fullName = `${u.first_name} ${u.last_name || ''}`.trim();
          setUserData({
            name: fullName,
            role: u.role,
            designation: getDesignation(u.role),
            avatar: u.first_name ? u.first_name[0] : 'A',
            loading: false,
          });
        } else {
          setUserData(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Identity synchronization failure:", err.message);
        setUserData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserData();
  }, []);

  return userData;
};

/**
 * Maps system roles to user-friendly designations.
 */
function getDesignation(role) {
  const mapping = {
    'Admin': 'Administrator',
    'Instructor': 'Driving Instructor',
    'Student': 'Driving Candidate'
  };
  return mapping[role] || role;
}
