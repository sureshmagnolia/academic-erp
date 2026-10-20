-- Documents Table for Google Drive Mapping
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g., 'TC', 'ADMISSION_FORM', 'NAAC_EVIDENCE', 'ID_PROOF'
    google_drive_file_id TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
