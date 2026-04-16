CREATE DATABASE IF NOT EXISTS complaint_system;
USE complaint_system;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
  nick_name VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  language VARCHAR(100) DEFAULT NULL,
  timezone VARCHAR(100) DEFAULT NULL,
  linkedin_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Pending',
  image VARCHAR(255) DEFAULT NULL,
  attachment VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaint_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


INSERT INTO users (name, email, password, role)
VALUES
  ('Admin User', 'admin@resolveit.com', '$2b$10$3m9L8HoW4Y.nhW4cGX8x9O8VQd9DAnM8wQhKxYuo8nQmQXPOuhj9a', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Default admin password hash corresponds to: Admin@123


