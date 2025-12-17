-- DATABASE INITIALIZATION
CREATE DATABASE IF NOT EXISTS collabflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE collabflow;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- OAUTH IDENTITIES (Google/Apple login link)
CREATE TABLE IF NOT EXISTS oauth_identities (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(150) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uniq_provider_user (provider, provider_user_id),
  KEY idx_user_id (user_id),

  CONSTRAINT fk_oauth_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- TEAM MEMBERSHIPS
CREATE TABLE IF NOT EXISTS team_memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('Project Manager', 'Team Member') DEFAULT 'Team Member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (team_id, user_id)
) ENGINE=InnoDB;

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planning', 'In Progress', 'Completed') DEFAULT 'Planning',
  team_id INT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- PROJECT MEMBERSHIPS
CREATE TABLE IF NOT EXISTS project_memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'editor', 'viewer') DEFAULT 'viewer',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (project_id, user_id)
) ENGINE=InnoDB;

-- STATUSES (Kanban board states)
CREATE TABLE IF NOT EXISTS statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  order_index INT NOT NULL
) ENGINE=InnoDB;

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
  status_id INT NOT NULL,
  project_id INT NOT NULL,
  due_date DATE,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (status_id) REFERENCES statuses(id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- TASK ASSIGNEES
CREATE TABLE IF NOT EXISTS task_assignees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  primary_assignee BOOLEAN DEFAULT FALSE,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (task_id, user_id)
) ENGINE=InnoDB;

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  task_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  duration INT, -- Duration in minutes
  location VARCHAR(255),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- APPOINTMENT PARTICIPANTS
CREATE TABLE IF NOT EXISTS appointment_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  user_id INT NOT NULL,
  attendance_status ENUM('invited', 'accepted', 'declined') DEFAULT 'invited',
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (appointment_id, user_id)
) ENGINE=InnoDB;




-- SEED DATA

-- USERS
INSERT INTO users (name, email, password_hash, created_at) VALUES
('Jakub Novák', 'jakub.novak@example.cz', 'hash1', '2025-01-01 08:00:00'),
('Jan Dvořák', 'jan.dvorak@example.cz', 'hash2', '2025-01-02 09:00:00'),
('Petr Svoboda', 'petr.svoboda@example.cz', 'hash3', '2025-01-03 10:00:00');

-- TEAMS
INSERT INTO teams (name, description, created_by, created_at) VALUES
('Vývojový tým', 'Tým vyvíjející hlavní funkcionalitu', 1, '2025-01-10 09:00:00'),
('Marketingový tým', 'Tým pro marketing a komunikaci', 2, '2025-01-11 10:00:00');

-- TEAM MEMBERSHIPS
INSERT INTO team_memberships (team_id, user_id, role, joined_at) VALUES
(1, 1, 'Project Manager', '2025-01-10 10:00:00'),
(1, 2, 'Team Member', '2025-01-11 09:00:00'),
(2, 2, 'Project Manager', '2025-01-11 10:30:00');

-- PROJECTS
INSERT INTO projects (name, description, start_date, end_date, status, team_id, created_by, created_at) VALUES
('Aplikace CollabFlow', 'Vývoj aplikace pro týmovou spolupráci', '2025-01-15', '2025-04-30', 'In Progress', 1, 1, '2025-01-15 08:00:00'),
('Marketingová kampaň', 'Kampaň pro druhý kvartál', '2025-02-01', '2025-06-01', 'Planning', 2, 2, '2025-02-01 08:00:00');

-- PROJECT MEMBERSHIPS
INSERT INTO project_memberships (project_id, user_id, role, joined_at) VALUES
(1, 1, 'owner', '2025-01-15 09:00:00'),
(1, 2, 'editor', '2025-01-16 09:00:00'),
(2, 2, 'owner', '2025-02-01 09:00:00');

-- STATUSES
INSERT INTO statuses (name, order_index) VALUES
('To Do', 1),
('In Progress', 2),
('Review', 3),
('Done', 4);

-- TASKS
INSERT INTO tasks (title, description, priority, status_id, project_id, due_date, created_by, created_at, updated_at) VALUES
('Návrh databázového schématu', 'Definovat tabulky a vztahy v databázi', 'High', 2, 1, '2025-02-01', 1, '2025-01-16 10:00:00', '2025-01-16 10:00:00'),
('Vývoj API', 'Implementovat REST API', 'Medium', 1, 1, '2025-03-01', 2, '2025-01-20 09:00:00', '2025-01-20 09:00:00');

-- TASK ASSIGNEES
INSERT INTO task_assignees (task_id, user_id, primary_assignee, assigned_at) VALUES
(1, 1, TRUE, '2025-01-16 11:00:00'),
(2, 2, TRUE, '2025-01-20 10:00:00');

-- APPOINTMENTS
INSERT INTO appointments (project_id, task_id, title, description, start_time, duration, location, created_by, created_at) VALUES
(1, 1, 'Plánování sprintu', 'Plánovací schůzka pro další sprint', '2025-01-17 09:00:00', 60, 'Zasedačka 1', 1, '2025-01-15 12:00:00');

-- APPOINTMENT PARTICIPANTS
INSERT INTO appointment_participants (appointment_id, user_id, attendance_status, invited_at, responded_at) VALUES
(1, 1, 'accepted', '2025-01-15 13:00:00', '2025-01-15 14:00:00'),
(1, 2, 'invited', '2025-01-15 13:00:00', NULL);
