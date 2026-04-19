-- Create the attendance table for granular tracking
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  instructor_id VARCHAR(50) NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Late', 'Absent')),
  session_number INTEGER CHECK (session_number BETWEEN 1 AND 4),
  time_slot VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, attendance_date, session_number) -- Ensure no double mark for SAME session
);

-- Index for faster monthly lookups
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_instructor ON attendance(instructor_id);
