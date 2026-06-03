-- Hostel Complaint Management System - MySQL tables
-- (Database creation/selection is handled by init.js so this also works on
--  managed cloud MySQL where the database already exists.)

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('student','admin','staff') NOT NULL DEFAULT 'student',
  room_number   VARCHAR(20) DEFAULT NULL,
  phone         VARCHAR(20) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaints (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  complaint_code    VARCHAR(20) NOT NULL UNIQUE,
  student_id        INT NOT NULL,
  category          ENUM('electricity','water','internet','maintenance','food') NOT NULL,
  title             VARCHAR(150) NOT NULL,
  description       TEXT NOT NULL,
  status            ENUM('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  assigned_staff_id INT DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_complaint_staff
    FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_student (student_id),
  INDEX idx_staff (assigned_staff_id)
) ENGINE=InnoDB;
