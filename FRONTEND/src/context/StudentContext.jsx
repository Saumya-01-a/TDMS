import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const StudentContext = createContext();

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/all-students');
      const data = await res.json();
      if (data.ok) {
        setStudents(data.students);
        setStudentCount(data.students.length);
      }
    } catch (err) {
      console.error('Error fetching global student state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    // Setup Socket.io Listener for Real-time Synchronization
    const socket = io('http://localhost:3000');
    
    socket.on('student_update', () => {
      console.log('🔄 Student data update received via socket');
      fetchStudents();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <StudentContext.Provider value={{ students, studentCount, loading, refetchStudents: fetchStudents }}>
      {children}
    </StudentContext.Provider>
  );
};
