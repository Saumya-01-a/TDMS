-- Update users table with status and email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;

-- For instructors, we want them to start as pending and unverified
-- Note: Existing users might need manual update if they are instructors
UPDATE users SET status = 'pending', email_verified = false WHERE role = 'Instructor';

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'Highway Code', -- New column: 'Highway Code', 'Vehicle Maintenance', 'Traffic Signs', 'Mock Exams'
  file_url TEXT NOT NULL,
  instructor_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE CASCADE
);

-- Ensure instructors table has verification_document column (from previous task)
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS verification_document TEXT;

-- For students, add instructor_id to link them to an instructor (for specific counts)
ALTER TABLE students ADD COLUMN IF NOT EXISTS instructor_id VARCHAR(50) REFERENCES instructors(instructor_id);

-- Create sessions table for the weekly schedule
CREATE TABLE IF NOT EXISTS sessions (
  session_id SERIAL PRIMARY KEY,
  instructor_id VARCHAR(50) NOT NULL REFERENCES instructors(instructor_id),
  student_id VARCHAR(50) REFERENCES students(student_id), -- Nullable if slot is Available
  session_date DATE NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
  status VARCHAR(20) DEFAULT 'Booked', -- 'Booked' if student_id is set
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (instructor_id, session_date, slot_number) -- Prevent double booking Same Instructor/Date/Time
);

-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  instructor_id VARCHAR(50) NOT NULL REFERENCES instructors(instructor_id),
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2),
  description TEXT
);

-- Seed initial packages
INSERT INTO packages (name, price, description) 
VALUES 
('Basic Package', 15000.00, '8 Theory lessons + 10 Practical sessions'),
('Standard Package', 25000.00, '12 Theory lessons + 20 Practical sessions'),
('Premium Package', 40000.00, 'Unlimited Theory + 35 Practical sessions + Trial guidance')
ON CONFLICT DO NOTHING;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id),
  instructor_id VARCHAR(50) REFERENCES instructors(instructor_id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update students table for management system
ALTER TABLE students ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Learning'; -- 'Learning', 'Trial Pending', 'Completed', 'Inactive'
ALTER TABLE students ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES packages(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP;

-- Create the attendance table for granular tracking
CREATE TABLE IF NOT EXISTS public.attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  instructor_id VARCHAR(50) NOT NULL REFERENCES public.instructors(instructor_id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Late', 'Absent')),
  session_number INTEGER CHECK (session_number BETWEEN 1 AND 4),
  time_slot VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, attendance_date, session_number)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_instructor ON public.attendance(instructor_id);
 
-- New lessons table for schedule management
CREATE TABLE IF NOT EXISTS public.lessons (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  instructor_id VARCHAR(50) NOT NULL REFERENCES public.instructors(instructor_id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(vehicle_id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 4),
  status VARCHAR(20) DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Rescheduled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (instructor_id, lesson_date, session_number), -- Instructor can't have two lessons same time
  UNIQUE (vehicle_id, lesson_date, session_number)     -- Vehicle can't be in two lessons same time
);

-- Real-time Vehicle Tracking Tables
CREATE TABLE IF NOT EXISTS vehicle_locations (
  vehicle_id INTEGER PRIMARY KEY REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  instructor_id VARCHAR(50) REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(5, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_history (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(5, 2) DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_location_history_vehicle ON location_history(vehicle_id, recorded_at);
