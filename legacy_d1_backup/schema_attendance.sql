CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    FOREIGN KEY(department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL,
    name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    FOREIGN KEY(department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS student_batches (
    student_id TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    PRIMARY KEY (student_id, batch_id),
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(batch_id) REFERENCES batches(id)
);

CREATE TABLE IF NOT EXISTS timetable (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 1=Mon, 2=Tue, etc.
    hour_slot INTEGER NOT NULL, -- 1 to 6
    FOREIGN KEY(batch_id) REFERENCES batches(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(faculty_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    timetable_id TEXT NOT NULL,
    date DATE NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'DUTY_LEAVE')),
    marked_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(timetable_id) REFERENCES timetable(id),
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(marked_by) REFERENCES users(id)
);

-- Seed Data for Testing
INSERT INTO courses (id, department_id, name, code) VALUES 
('course_dbms', 'dept_comp_sci', 'Database Management Systems', 'CS301'),
('course_ds', 'dept_comp_sci', 'Data Structures', 'CS302');

INSERT INTO batches (id, department_id, name, academic_year) VALUES 
('batch_bsc_cs_2024', 'dept_comp_sci', 'BSc CS 2024-2027', '2024-2025');

-- Create a mock student and faculty if they don't exist
INSERT OR IGNORE INTO users (id, name, email, mobile_number, password_hash, role, approval_status, department_id) VALUES 
('student_1', 'John Doe', 'john@student.edu', '1111111111', 'hash', 'STUDENT', 'APPROVED', 'dept_comp_sci'),
('faculty_1', 'Prof. Smith', 'smith@faculty.edu', '2222222222', 'hash', 'FACULTY', 'APPROVED', 'dept_comp_sci');

INSERT INTO student_batches (student_id, batch_id) VALUES ('student_1', 'batch_bsc_cs_2024');

-- Faculty 1 teaches DBMS to the 2024 Batch on Monday (1), Hour 1
INSERT INTO timetable (id, batch_id, course_id, faculty_id, day_of_week, hour_slot) VALUES 
('tt_1', 'batch_bsc_cs_2024', 'course_dbms', 'faculty_1', 1, 1);
