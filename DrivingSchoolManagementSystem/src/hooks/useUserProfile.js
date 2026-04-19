import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook to fetch and manage the current user's profile data from Supabase.
 * Bypasses backend and fetches directly from the 'users' table.
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
        // 1. Get basic info from localStorage first (for immediate display)
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const userId = storedUser.userId;

        if (!userId) {
          setUserData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Set initial state from storage to prevent blank screen
        const initialRole = storedUser.role || '';
        setUserData({
          name: storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}` : '',
          role: initialRole,
          designation: getDesignation(initialRole),
          avatar: storedUser.firstName ? storedUser.firstName[0] : '',
          loading: true,
        });

        // 2. Fetch fresh data from Supabase 'users' table
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data) {
          const fullName = `${data.first_name} ${data.last_name || ''}`.trim();
          setUserData({
            name: fullName,
            role: data.role,
            designation: getDesignation(data.role),
            avatar: data.first_name ? data.first_name[0] : '',
            loading: false,
          });
        }
      } catch (err) {
        console.error("Error fetching dynamic user profile:", err.message);
        // On error, we keep the localStorage data but stop loading
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
