CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g., 'Internal Exam 1' or 'Assignment 1'
    max_marks INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(batch_id) REFERENCES batches(id),
    FOREIGN KEY(course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS exam_marks (
    exam_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    marks_obtained REAL NOT NULL,
    remarks TEXT,
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
);

-- Seed Data for Testing Exam Marking
INSERT INTO exams (id, batch_id, course_id, name, max_marks, date) VALUES 
('exam_1', 'batch_bsc_cs_2024', 'course_ds', 'Internal Assessment 1', 50, '2024-08-15');
