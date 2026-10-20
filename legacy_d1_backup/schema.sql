-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
-- Handles all login logic (Email or Mobile), Roles, and Approval Status
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STAFF', 'STUDENT')),
    department_id TEXT, -- Nullable for Super Admins/Principals
    approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by TEXT, -- The ID of the Faculty/Admin who approved this user
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(department_id) REFERENCES departments(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
);

-- Students Profile (Extension of Users table)
CREATE TABLE IF NOT EXISTS students (
    admission_no TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    batch_id TEXT,
    dob DATE,
    category TEXT, -- e.g., 'General', 'SC/ST' for NAAC reports
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Insert some default Departments
INSERT INTO departments (id, name) VALUES 
('dept_comp_sci', 'Computer Science'),
('dept_physics', 'Physics'),
('dept_commerce', 'Commerce');

-- Insert a default Super Admin to bootstrap the system
INSERT INTO users (id, name, email, mobile_number, password_hash, role, approval_status) 
VALUES ('admin_1', 'Super Admin', 'admin@college.edu', '0000000000', 'hashed_password_here', 'ADMIN', 'APPROVED');
