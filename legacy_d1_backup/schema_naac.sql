CREATE TABLE IF NOT EXISTS naac_categories (
    id TEXT PRIMARY KEY,
    criteria_number TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS naac_submissions (
    id TEXT PRIMARY KEY,
    faculty_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    evidence_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(faculty_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES naac_categories(id)
);

-- Seed Data for NAAC Categories
INSERT INTO naac_categories (id, criteria_number, name) VALUES 
('naac_3_3_2', '3.3.2', 'Research Publications in Journals'),
('naac_6_3_4', '6.3.4', 'Faculty Development Programs (FDP) Attended'),
('naac_3_4_3', '3.4.3', 'Extension and Outreach Programs');
