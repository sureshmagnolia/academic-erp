import { neon } from '@neondatabase/serverless';
import { MASTER_ROLES, DEPARTMENTS_CATALOG, FORM_REFERENCE_DATA, SEAT_RESERVATION_CATEGORIES } from './constants.js';

export { MASTER_ROLES, DEPARTMENTS_CATALOG, FORM_REFERENCE_DATA, SEAT_RESERVATION_CATEGORIES };

// In-Memory fallback store for environments without live Postgres credentials
const memoryStore = {
  departments: [
    { id: 'dept_botany', name: 'Department of Botany', code: 'BOT', type: 'PROGRAM_OFFERING', description: 'Degree-offering life sciences department conducting undergraduate and postgraduate botanical programs.', hod_email: 'hod.botany@college.edu', is_active: true },
    { id: 'dept_comp_sci', name: 'Computer Science & Engineering', code: 'CSE', type: 'PROGRAM_OFFERING', description: 'Degree-offering computational sciences department running B.Sc and M.Sc programs.', hod_email: 'hod.cse@college.edu', is_active: true },
    { id: 'dept_commerce', name: 'Commerce & Management Studies', code: 'COM', type: 'PROGRAM_OFFERING', description: 'Degree-granting commerce department running B.Com and M.Com.', hod_email: 'hod.commerce@college.edu', is_active: true },
    { id: 'dept_arabic', name: 'Department of Arabic', code: 'ARB', type: 'SUPPORTING', description: 'Supporting/Auxiliary language department offering Common Arabic and Open Electives to other degree programmes.', hod_email: 'hod.arabic@college.edu', is_active: true },
    { id: 'dept_english', name: 'Department of English', code: 'ENG', type: 'SUPPORTING', description: 'Supporting humanities department providing English communication and literature across all degree programs.', hod_email: 'hod.english@college.edu', is_active: true },
    { id: 'dept_maths', name: 'Department of Mathematics', code: 'MATH', type: 'SUPPORTING', description: 'Supporting allied science department providing complementary Mathematics and Statistics for Physics, Chemistry, and CS programs.', hod_email: 'hod.math@college.edu', is_active: true },
    { id: 'dept_phy_ed', name: 'Department of Physical Education', code: 'PHY_ED', type: 'SUPPORTING', description: 'Supporting department managing campus athletics, sports quota evaluation, and fitness courses.', hod_email: 'sports@college.edu', is_active: true },
  ],
  
  courses: [
    { id: 'crs_bot_1b01', program_id: 'prog_bsc_bot', department_id: 'dept_botany', code: 'BOT1B01', name: 'Angiosperm Anatomy & Microtechnique', semester: 1, course_type: 'CORE', credits: 3, hours_per_week: 4, description: 'Internal structure of vegetative and reproductive organs; microtechnique and staining.', faculty_email: 'hod.botany@college.edu', is_active: true },
    { id: 'crs_bot_2b02', program_id: 'prog_bsc_bot', department_id: 'dept_botany', code: 'BOT2B02', name: 'Phycology, Bryology & Pteridology', semester: 2, course_type: 'CORE', credits: 3, hours_per_week: 4, description: 'Evolutionary radiation of cryptogams, thallus organization, and lifecycle patterns.', faculty_email: 'hod.botany@college.edu', is_active: true },
    { id: 'crs_arb_1a07', program_id: null, department_id: 'dept_arabic', code: 'ARB1A07', name: 'Communicative Arabic & Functional Grammar', semester: 1, course_type: 'COMMON', credits: 4, hours_per_week: 4, description: 'Common language course for science and commerce degree students.', faculty_email: 'hod.arabic@college.edu', is_active: true },
    { id: 'crs_arb_2a08', program_id: null, department_id: 'dept_arabic', code: 'ARB2A08', name: 'Reading Arabic Literature & Essays', semester: 2, course_type: 'COMMON', credits: 4, hours_per_week: 4, description: 'Selected prose, poetry, and modern communication in Arabic.', faculty_email: 'hod.arabic@college.edu', is_active: true },
    { id: 'crs_cs_1b01', program_id: 'prog_bsc_cs', department_id: 'dept_comp_sci', code: 'CS1B01', name: 'Problem Solving & C Programming', semester: 1, course_type: 'CORE', credits: 3, hours_per_week: 4, description: 'Procedural problem solving, control structures, pointers, and file operations.', faculty_email: 'hod.cse@college.edu', is_active: true },
  ],
  academic_programs: [
    {
      id: 'prog_bsc_bot',
      department_id: 'dept_botany',
      name: 'B.Sc Botany (Plant Science & Biotech) • FYUGP',
      code: 'BSC_BOT',
      level: 'UG',
      duration_years: 4,
      total_semesters: 8,
      exit_option: 'Exit at 3rd Year (Sem 6) with Major Degree',
      intake_capacity: 48,
      seat_matrix: { OPEN: 24, ETB: 4, MU: 4, LC: 1, EWS: 5, OBH: 1, SC: 4, ST: 1, TLM: 1, SP: 1, SSQ: 1, PWD: 1, UTL: 0, OBX: 0, JR: 0 },
      is_active: true
    },
    {
      id: 'prog_msc_bot',
      department_id: 'dept_botany',
      name: 'M.Sc Botany',
      code: 'MSC_BOT',
      level: 'PG',
      duration_years: 2,
      total_semesters: 4,
      intake_capacity: 18,
      seat_matrix: { OPEN: 9, ETB: 1, MU: 2, LC: 1, EWS: 2, OBH: 0, SC: 2, ST: 0, TLM: 0, SP: 1, SSQ: 0, PWD: 0, UTL: 0, OBX: 0, JR: 0 },
      is_active: true
    },
    {
      id: 'prog_bsc_cs',
      department_id: 'dept_comp_sci',
      name: 'B.Sc Computer Science • FYUGP',
      code: 'BSC_CS',
      level: 'UG',
      duration_years: 4,
      total_semesters: 8,
      exit_option: 'Exit at 3rd Year (Sem 6) with Major Degree',
      intake_capacity: 60,
      seat_matrix: { OPEN: 30, ETB: 5, MU: 5, LC: 2, EWS: 6, OBH: 2, SC: 5, ST: 1, TLM: 1, SP: 1, SSQ: 1, PWD: 1, UTL: 0, OBX: 0, JR: 0 },
      is_active: true
    },
    {
      id: 'prog_msc_cs',
      department_id: 'dept_comp_sci',
      name: 'M.Sc Computer Science',
      code: 'MSC_CS',
      level: 'PG',
      duration_years: 2,
      total_semesters: 4,
      intake_capacity: 24,
      seat_matrix: { OPEN: 12, ETB: 2, MU: 2, LC: 1, EWS: 2, OBH: 1, SC: 2, ST: 1, TLM: 0, SP: 1, SSQ: 0, PWD: 0, UTL: 0, OBX: 0, JR: 0 },
      is_active: true
    },
    {
      id: 'prog_bcom',
      department_id: 'dept_commerce',
      name: 'Bachelor of Commerce (B.Com) • FYUGP',
      code: 'BCOM',
      level: 'UG',
      duration_years: 4,
      total_semesters: 8,
      exit_option: 'Exit at 3rd Year (Sem 6) with Major Degree',
      intake_capacity: 80,
      seat_matrix: { OPEN: 40, ETB: 7, MU: 6, LC: 3, EWS: 8, OBH: 2, SC: 7, ST: 2, TLM: 1, SP: 2, SSQ: 1, PWD: 1, UTL: 0, OBX: 0, JR: 0 },
      is_active: true
    },
  ],
  users: [

    {
      id: 101,
      email: 'hod.botany@college.edu',
      name: 'Dr. Sarah Varma (HoD Botany)',
      phone: '9847012345',
      primary_type: 'HOD',
      department: 'dept_botany',
      designation: 'Associate Professor & Head of Botany',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 102,
      email: 'hod.arabic@college.edu',
      name: 'Dr. Abdul Rahman (HoD Arabic)',
      phone: '9847012346',
      primary_type: 'HOD',
      department: 'dept_arabic',
      designation: 'Head of Supporting Arabic Dept',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 103,
      email: 'faculty.botany@college.edu',
      name: 'Prof. Rajesh K',
      phone: '9847012347',
      primary_type: 'FACULTY',
      department: 'dept_botany',
      designation: 'Assistant Professor in Plant Sciences',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 104,
      email: 'student.botany@college.edu',
      name: 'Ananya Nair',
      phone: '9744098765',
      primary_type: 'STUDENT',
      department: 'dept_botany',
      designation: 'B.Sc Botany FYUGP (4-Year with 3-Year Exit Option)',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 105,
      email: 'staff.accounts@college.edu',
      name: 'M. Vinod Kumar',
      phone: '9847012348',
      primary_type: 'NON_TEACHING_STAFF',
      department: 'dept_comp_sci',
      designation: 'Senior Office Superintendent (Accounts)',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 1,
      email: 'sureshmagnolia@gmail.com',
      name: 'System Administrator',
      phone: '9876500001',
      primary_type: 'ADMIN',
      department: 'dept_comp_sci',
      designation: 'Principal & Chief Administrator',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      email: 'student.demo@gmail.com',
      name: 'Alex Johnson',
      phone: '9876543210',
      primary_type: 'STUDENT',
      department: 'dept_comp_sci',
      designation: 'B.Sc Computer Science (2024-2027)',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      email: 'hod.cse@college.edu',
      name: 'Dr. Ramesh Kumar',
      phone: '9876511111',
      primary_type: 'FACULTY',
      department: 'dept_comp_sci',
      designation: 'Professor & Head of Department',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      email: 'scholar.vikram@college.edu',
      name: 'Vikram Aditya',
      phone: '9876522222',
      primary_type: 'STUDENT',
      department: 'dept_comp_sci',
      designation: 'Full-Time Research Scholar',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  ],
  user_roles: [
    { id: 1, user_email: 'sureshmagnolia@gmail.com', role_code: 'ADMIN', department: 'Administration', is_active: true },
    { id: 2, user_email: 'sureshmagnolia@gmail.com', role_code: 'PRINCIPAL', department: null, is_active: true },
    { id: 3, user_email: 'student.demo@gmail.com', role_code: 'STUDENT', department: 'dept_comp_sci', is_active: true },
    { id: 4, user_email: 'hod.cse@college.edu', role_code: 'FACULTY', department: 'dept_comp_sci', is_active: true },
    { id: 5, user_email: 'hod.cse@college.edu', role_code: 'HOD', department: 'dept_comp_sci', is_active: true },
    { id: 6, user_email: 'hod.cse@college.edu', role_code: 'RESEARCH_SUPERVISOR', department: 'dept_comp_sci', is_active: true },
    { id: 7, user_email: 'scholar.vikram@college.edu', role_code: 'RESEARCH_SCHOLAR', department: 'dept_comp_sci', is_active: true },
    { id: 8, user_email: 'hod.botany@college.edu', role_code: 'HOD', department: 'dept_botany', is_active: true },
    { id: 9, user_email: 'hod.botany@college.edu', role_code: 'FACULTY', department: 'dept_botany', is_active: true },
    { id: 10, user_email: 'hod.arabic@college.edu', role_code: 'HOD', department: 'dept_arabic', is_active: true },
    { id: 11, user_email: 'hod.arabic@college.edu', role_code: 'FACULTY', department: 'dept_arabic', is_active: true },
    { id: 12, user_email: 'faculty.botany@college.edu', role_code: 'FACULTY', department: 'dept_botany', is_active: true },
    { id: 13, user_email: 'student.botany@college.edu', role_code: 'STUDENT', department: 'dept_botany', is_active: true },
    { id: 14, user_email: 'staff.accounts@college.edu', role_code: 'NON_TEACHING_STAFF', department: 'dept_comp_sci', is_active: true },
  ],
  enrollment_tokens: [
    {
      id: 1,
      token: 'cs-freshers-2024',
      title: 'B.Sc Computer Science 2024 Freshers Onboarding',
      target_role: 'STUDENT',
      department_id: 'dept_comp_sci',
      batch_id: 'batch_bsc_cs_2024',
      max_uses: 60,
      used_count: 14,
      is_active: true,
      expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      created_by: 'sureshmagnolia@gmail.com',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      token: 'faculty-recruitment-2024',
      title: 'Faculty Appointments & Service Record Onboarding',
      target_role: 'FACULTY',
      department_id: 'dept_comp_sci',
      batch_id: 'batch_2024',
      max_uses: 10,
      used_count: 2,
      is_active: true,
      expires_at: new Date(Date.now() + 86400000 * 14).toISOString(),
      created_by: 'sureshmagnolia@gmail.com',
      created_at: new Date().toISOString(),
    },
  ],
  join_requests: [
    {
      id: 1,
      token_id: 1,
      applicant_email: 'candidate.rahul@gmail.com',
      applicant_name: 'Rahul Sharma',
      applicant_avatar: null,
      mobile_number: '9845012345',
      requested_role: 'STUDENT',
      department_id: 'dept_comp_sci',
      batch_id: 'batch_bsc_cs_2024',
      admission_or_emp_no: 'ADM-2024-CS-088',
      status: 'PENDING',
      superior_role: 'FACULTY',
      reviewed_by: null,
      superior_notes: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 2,
      token_id: 1,
      applicant_email: 'candidate.ananya@gmail.com',
      applicant_name: 'Ananya Nair',
      applicant_avatar: null,
      mobile_number: '9744098765',
      requested_role: 'STUDENT',
      department_id: 'dept_comp_sci',
      batch_id: 'batch_bsc_cs_2024',
      admission_or_emp_no: 'ADM-2024-CS-089',
      status: 'PENDING',
      superior_role: 'FACULTY',
      reviewed_by: null,
      superior_notes: null,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
  user_profiles: [
    {
      id: 1,
      user_email: 'student.demo@gmail.com',
      role_code: 'STUDENT',
      full_name: 'Alex Johnson',
      dob: '2004-06-14',
      gender: 'Male',
      blood_group: 'B+',
      marital_status: 'Single',
      religion: 'Christian',
      community_category: 'General',
      caste_name: 'Anglo-Indian',
      reservations: ['SPORTS_QUOTA'],
      primary_email: 'student.demo@gmail.com',
      alternate_email: 'alex.personal@gmail.com',
      mobile_number: '9876543210',
      emergency_contact_name: 'David Johnson (Father)',
      emergency_contact_phone: '9876500009',
      permanent_address: '42 Palm Grove Avenue, MG Road',
      permanent_state: 'Kerala',
      permanent_district: 'Ernakulam',
      permanent_pincode: '682016',
      admission_or_emp_no: 'ADM-2024-CS-001',
      aadhaar_last4: '4589',
      qualifying_exam: 'Higher Secondary / Plus Two (State Board)',
      qualifying_percentage: 94.2,
      qualifying_year: 2024,
      campus_preference: 'DAY_SCHOLAR',
      bus_required: false,
      bus_stop: null,
      linkedin_url: 'https://linkedin.com/in/alex-johnson-cs',
      github_url: 'https://github.com/alex-johnson-code',
      scholar_url: '',
      document_proof_url: 'https://drive.google.com/drive/folders/demo-alex-proofs',
      profile_status: 'APPROVED',
      submitted_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      approved_at: new Date(Date.now() - 86400000 * 29).toISOString(),
      approved_by: 'sureshmagnolia@gmail.com',
      reviewer_notes: 'All certificates and qualifying marks verified against physical originals.',
    },
  ],
  data_change_requests: [
    {
      id: 1,
      user_email: 'student.demo@gmail.com',
      user_name: 'Alex Johnson',
      user_role: 'STUDENT',
      department_id: 'dept_comp_sci',
      field_name: 'mobile_number',
      field_label: 'Primary Contact Mobile',
      current_value: '9876543210',
      proposed_value: '9895012345',
      justification: 'Lost previous SIM card; new official mobile number issued with same Aadhaar verification.',
      document_proof_url: 'https://drive.google.com/file/d/sim-loss-fir-affidavit',
      status: 'PENDING',
      assigned_superior_role: 'FACULTY',
      reviewed_by: null,
      reviewer_comments: null,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  research_scholars: [
    {
      id: 1,
      scholar_email: 'scholar.vikram@college.edu',
      supervisor_email: 'hod.cse@college.edu',
      research_title: 'Scalable Distributed Consensus in Heterogeneous Cloud Environments',
      registration_no: 'PHD-CS-2025-004',
      scholar_type: 'FULL_TIME',
      funding_source: 'Institute Fellowship',
      admission_date: '2025-08-01',
      status: 'COURSEWORK',
    },
  ],
  academic_records: [
    { id: 1, student_email: 'student.demo@gmail.com', subject_code: 'CS601', subject_name: 'Database Management Systems', internal_marks: 28, external_marks: 64, total_marks: 92, grade: 'A+', attendance_pct: 94.5 },
    { id: 2, student_email: 'student.demo@gmail.com', subject_code: 'CS602', subject_name: 'Cloud Computing & Distributed Systems', internal_marks: 26, external_marks: 58, total_marks: 84, grade: 'A', attendance_pct: 89.0 },
    { id: 3, student_email: 'student.demo@gmail.com', subject_code: 'CS603', subject_name: 'Machine Learning Fundamentals', internal_marks: 29, external_marks: 62, total_marks: 91, grade: 'A+', attendance_pct: 91.2 },
    { id: 4, student_email: 'student.demo@gmail.com', subject_code: 'CS604', subject_name: 'Cybersecurity & Ethical Hacking', internal_marks: 25, external_marks: 55, total_marks: 80, grade: 'B+', attendance_pct: 86.0 },
  ],
  announcements: [
    { id: 1, title: 'Upcoming Mid-Semester Examination Schedule', content: 'Mid-term assessments for all departments commence on 15th of next month. Review your syllabus and timetables.', category: 'Exam', author_email: 'admin@college.edu', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, title: 'Annual TechFest & Project Showcase Registration', content: 'Project submission portal is now open. Submit your final year project abstracts through the department coordinator.', category: 'Event', author_email: 'admin@college.edu', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
};

function getPostgresUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

export function isPostgresConfigured() {
  return Boolean(getPostgresUrl());
}

export function getSql() {
  const connectionString = getPostgresUrl();
  if (connectionString) {
    return neon(connectionString);
  }
  return null;
}

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  const sql = getSql();
  if (!sql) {
    isInitialized = true;
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        primary_type VARCHAR(50) DEFAULT 'STUDENT',
        department VARCHAR(100),
        designation VARCHAR(100),
        roll_no VARCHAR(100),
        semester VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT
      );
    `;

    for (const r of MASTER_ROLES) {
      await sql`
        INSERT INTO roles (code, name, category, description)
        VALUES (${r.code}, ${r.name}, ${r.category}, ${r.description})
        ON CONFLICT (code) DO NOTHING;
      `;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        role_code VARCHAR(50) NOT NULL,
        department VARCHAR(100),
        scope_entity_type VARCHAR(50),
        scope_entity_id VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS enrollment_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        target_role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
        department_id VARCHAR(100) NOT NULL,
        batch_id VARCHAR(100),
        max_uses INT DEFAULT 100,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS join_requests (
        id SERIAL PRIMARY KEY,
        token_id INT,
        applicant_email VARCHAR(255) NOT NULL,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_avatar TEXT,
        mobile_number VARCHAR(50),
        requested_role VARCHAR(50) NOT NULL,
        department_id VARCHAR(100) NOT NULL,
        batch_id VARCHAR(100),
        admission_or_emp_no VARCHAR(100),
        status VARCHAR(50) DEFAULT 'PENDING',
        superior_role VARCHAR(50),
        reviewed_by VARCHAR(255),
        superior_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        role_code VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        dob DATE,
        gender VARCHAR(20),
        blood_group VARCHAR(10),
        marital_status VARCHAR(20),
        religion VARCHAR(50),
        community_category VARCHAR(50),
        caste_name VARCHAR(100),
        reservations JSONB DEFAULT '[]',
        primary_email VARCHAR(255) NOT NULL,
        alternate_email VARCHAR(255),
        mobile_number VARCHAR(50),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(50),
        permanent_address TEXT,
        permanent_state VARCHAR(100),
        permanent_district VARCHAR(100),
        permanent_pincode VARCHAR(20),
        admission_or_emp_no VARCHAR(100),
        aadhaar_last4 VARCHAR(10),
        qualifying_exam VARCHAR(100),
        qualifying_percentage NUMERIC(5, 2),
        qualifying_year INT,
        campus_preference VARCHAR(50),
        bus_required BOOLEAN DEFAULT FALSE,
        bus_stop VARCHAR(100),
        linkedin_url TEXT,
        github_url TEXT,
        scholar_url TEXT,
        document_proof_url TEXT,
        profile_status VARCHAR(50) DEFAULT 'NOT_STARTED',
        submitted_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(255),
        reviewer_notes TEXT,
        cap_id VARCHAR(50),
        department_id VARCHAR(100),
        program_id VARCHAR(100),
        program_level VARCHAR(20),
        second_language VARCHAR(50),
        admission_quota VARCHAR(100),
        is_open_category BOOLEAN DEFAULT FALSE,
        index_mark NUMERIC(8, 2),
        parent_name VARCHAR(255),
        parent_mobile VARCHAR(50),
        actual_category VARCHAR(100),
        family_status VARCHAR(50),
        annual_income NUMERIC(12, 2),
        previous_institution VARCHAR(255),
        tc_no VARCHAR(100),
        tc_date DATE,
        conduct_status VARCHAR(100),
        pwd_category VARCHAR(255),
        co_curricular_category VARCHAR(100),
        ncc_certificate_level VARCHAR(50),
        is_ex_servicemen_ward BOOLEAN DEFAULT FALSE,
        has_arts_festival_grade BOOLEAN DEFAULT FALSE,
        sports_quota_level VARCHAR(100),
        documents JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const extraCols = [
      'cap_id VARCHAR(50)',
      'department_id VARCHAR(100)',
      'program_id VARCHAR(100)',
      'program_level VARCHAR(20)',
      'second_language VARCHAR(50)',
      'admission_quota VARCHAR(100)',
      'is_open_category BOOLEAN DEFAULT FALSE',
      'index_mark NUMERIC(8, 2)',
      'parent_name VARCHAR(255)',
      'parent_mobile VARCHAR(50)',
      'actual_category VARCHAR(100)',
      'family_status VARCHAR(50)',
      'annual_income NUMERIC(12, 2)',
      'previous_institution VARCHAR(255)',
      'tc_no VARCHAR(100)',
      'tc_date DATE',
      'conduct_status VARCHAR(100)',
      'pwd_category VARCHAR(255)',
      'co_curricular_category VARCHAR(100)',
      'ncc_certificate_level VARCHAR(50)',
      'is_ex_servicemen_ward BOOLEAN DEFAULT FALSE',
      'has_arts_festival_grade BOOLEAN DEFAULT FALSE',
      'sports_quota_level VARCHAR(100)',
      "documents JSONB DEFAULT '{}'::jsonb"
    ];

    for (const col of extraCols) {
      try {
        await sql(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ${col};`);
      } catch (err) {
        // Safe fallback if column exists
      }
    }

    await sql`
      CREATE TABLE IF NOT EXISTS data_change_requests (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        user_role VARCHAR(50) NOT NULL,
        department_id VARCHAR(100),
        field_name VARCHAR(100) NOT NULL,
        field_label VARCHAR(100) NOT NULL,
        current_value TEXT,
        proposed_value TEXT NOT NULL,
        justification TEXT NOT NULL,
        document_proof_url TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        assigned_superior_role VARCHAR(50),
        reviewed_by VARCHAR(255),
        reviewer_comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS research_scholar_profiles (
        id SERIAL PRIMARY KEY,
        scholar_email VARCHAR(255) UNIQUE NOT NULL,
        supervisor_email VARCHAR(255) NOT NULL,
        co_supervisor_email VARCHAR(255),
        research_title TEXT,
        registration_no VARCHAR(100),
        scholar_type VARCHAR(50) DEFAULT 'FULL_TIME',
        funding_source VARCHAR(100),
        admission_date DATE,
        status VARCHAR(50) DEFAULT 'COURSEWORK',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS academic_records (
        id SERIAL PRIMARY KEY,
        student_email VARCHAR(255) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        internal_marks INT DEFAULT 0,
        external_marks INT DEFAULT 0,
        total_marks INT DEFAULT 0,
        grade VARCHAR(10) DEFAULT 'P',
        attendance_pct NUMERIC(5, 2) DEFAULT 100.0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        author_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      INSERT INTO users (email, name, primary_type, department, designation, status)
      VALUES ('sureshmagnolia@gmail.com', 'Suresh (System Admin)', 'ADMIN', 'Administration', 'Chief Administrator & Principal', 'ACTIVE')
      ON CONFLICT (email) DO NOTHING;
    `;

    // 1. Database cleanup to remove all duplicate user_roles
    try {
      await sql`
        DELETE FROM user_roles
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM user_roles
          GROUP BY LOWER(user_email), role_code, COALESCE(department, ''), COALESCE(scope_entity_id, '')
        );
      `;
    } catch (cleanErr) {
      console.warn('user_roles cleanup notice:', cleanErr.message);
    }

    // 2. Enforce composite unique index so duplicates cannot occur
    try {
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_user_roles_composite
        ON user_roles (LOWER(user_email), role_code, COALESCE(department, ''), COALESCE(scope_entity_id, ''));
      `;
    } catch (idxErr) {
      console.warn('uq_user_roles_composite notice:', idxErr.message);
    }

    // 3. Strictly idempotent admin role seed
    await sql`
      INSERT INTO user_roles (user_email, role_code, department, is_active)
      SELECT 'sureshmagnolia@gmail.com', 'ADMIN', 'Administration', TRUE
      WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE LOWER(user_email) = 'sureshmagnolia@gmail.com' 
        AND role_code = 'ADMIN'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS program_seat_matrix (
        id SERIAL PRIMARY KEY,
        program_id VARCHAR(100) NOT NULL,
        category_code VARCHAR(20) NOT NULL,
        seats INT NOT NULL DEFAULT 0,
        updated_by VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(program_id, category_code)
      );
    `;

    try {
      await sql`ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS seat_matrix JSONB DEFAULT '{}'::jsonb;`;
    } catch (colErr) {
      // Safe fallback if column exists
    }

    isInitialized = true;
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

export async function getUserWithRoles(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      const users = await sql`
        SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
      `;
      const user = users[0];
      if (!user) return null;

      const roles = await sql`
        SELECT r.code, r.name, r.category, ur.department, ur.scope_entity_type, ur.scope_entity_id, ur.is_active
        FROM user_roles ur
        JOIN roles r ON ur.role_code = r.code
        WHERE LOWER(ur.user_email) = ${cleanEmail} AND ur.is_active = TRUE
      `;

      return {
        ...user,
        roles: roles || [],
      };
    } catch (err) {
      console.error('DB query error getUserWithRoles:', err);
    }
  }

  const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) return null;

  const roles = memoryStore.user_roles
    .filter((ur) => ur.user_email.toLowerCase() === cleanEmail && ur.is_active)
    .map((ur) => {
      const meta = MASTER_ROLES.find((m) => m.code === ur.role_code) || {};
      return {
        code: ur.role_code,
        name: meta.name || ur.role_code,
        category: meta.category || 'GENERAL',
        department: ur.department,
        scope_entity_type: ur.scope_entity_type,
        scope_entity_id: ur.scope_entity_id,
        is_active: ur.is_active,
      };
    });

  return { ...user, roles };
}

export async function listAllUsers() {
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      const users = await sql`
        SELECT u.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'code', ur.role_code,
                'department', ur.department,
                'scope_entity_type', ur.scope_entity_type,
                'scope_entity_id', ur.scope_entity_id,
                'is_active', ur.is_active
              )
            ) FILTER (WHERE ur.role_code IS NOT NULL), '[]'
          ) as roles
        FROM users u
        LEFT JOIN user_roles ur ON LOWER(u.email) = LOWER(ur.user_email) AND ur.is_active = TRUE
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `;
      return users;
    } catch (err) {
      console.error('DB query error listAllUsers:', err);
    }
  }

  return memoryStore.users.map((u) => {
    const roles = memoryStore.user_roles
      .filter((ur) => ur.user_email.toLowerCase() === u.email.toLowerCase() && ur.is_active)
      .map((ur) => ({
        code: ur.role_code,
        department: ur.department,
        scope_entity_type: ur.scope_entity_type,
        scope_entity_id: ur.scope_entity_id,
        is_active: ur.is_active,
      }));
    return { ...u, roles };
  });
}

export async function createOrUpdateUser({
  email,
  name,
  phone,
  primary_type,
  department,
  designation,
  roll_no,
  semester,
  status = 'ACTIVE',
}) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    const rows = await sql`
      INSERT INTO users (email, name, phone, primary_type, department, designation, roll_no, semester, status)
      VALUES (${cleanEmail}, ${name}, ${phone || ''}, ${primary_type || 'STUDENT'}, ${department || ''}, ${designation || ''}, ${roll_no || ''}, ${semester || ''}, ${status})
      ON CONFLICT (email) DO UPDATE 
      SET name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          primary_type = EXCLUDED.primary_type,
          department = EXCLUDED.department,
          designation = EXCLUDED.designation,
          roll_no = EXCLUDED.roll_no,
          semester = EXCLUDED.semester,
          status = EXCLUDED.status
      RETURNING *;
    `;
    return rows[0];
  }

  const existingIdx = memoryStore.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  const userObj = {
    id: existingIdx >= 0 ? memoryStore.users[existingIdx].id : Date.now(),
    email: cleanEmail,
    name,
    phone: phone || '',
    primary_type: primary_type || 'STUDENT',
    department: department || '',
    designation: designation || '',
    roll_no: roll_no || '',
    semester: semester || '',
    status,
    created_at: new Date().toISOString(),
    last_login_at: null,
  };

  if (existingIdx >= 0) {
    memoryStore.users[existingIdx] = userObj;
  } else {
    memoryStore.users.unshift(userObj);
  }
  return userObj;
}

export async function assignRoleToUser({
  email,
  role_code,
  department,
  scope_entity_type,
  scope_entity_id,
}) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    await sql`
      INSERT INTO user_roles (user_email, role_code, department, scope_entity_type, scope_entity_id, is_active)
      VALUES (${cleanEmail}, ${role_code}, ${department || null}, ${scope_entity_type || null}, ${scope_entity_id || null}, TRUE)
    `;
    return true;
  }

  memoryStore.user_roles.push({
    id: Date.now(),
    user_email: cleanEmail,
    role_code,
    department: department || null,
    scope_entity_type: scope_entity_type || null,
    scope_entity_id: scope_entity_id || null,
    is_active: true,
  });
  return true;
}

export async function removeRoleFromUser(email, role_code, scope_entity_id) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    if (scope_entity_id) {
      await sql`
        DELETE FROM user_roles 
        WHERE LOWER(user_email) = ${cleanEmail} AND role_code = ${role_code} AND scope_entity_id = ${scope_entity_id}
      `;
    } else {
      await sql`
        DELETE FROM user_roles 
        WHERE LOWER(user_email) = ${cleanEmail} AND role_code = ${role_code}
      `;
    }
    return true;
  }

  memoryStore.user_roles = memoryStore.user_roles.filter((ur) => {
    if (ur.user_email.toLowerCase() !== cleanEmail) return true;
    if (ur.role_code !== role_code) return true;
    if (scope_entity_id && ur.scope_entity_id !== scope_entity_id) return true;
    return false;
  });
  return true;
}

// -------------------------------------------------------------
// ENROLLMENT TOKENS
// -------------------------------------------------------------

export async function createEnrollmentToken({
  title,
  target_role = 'STUDENT',
  department_id,
  batch_id,
  max_uses = 100,
  expires_hours = 72,
  created_by,
}) {
  const token = 'enr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + expires_hours * 3600000).toISOString();
  await initDb();
  const sql = getSql();

  if (sql) {
    const rows = await sql`
      INSERT INTO enrollment_tokens (token, title, target_role, department_id, batch_id, max_uses, expires_at, created_by)
      VALUES (${token}, ${title}, ${target_role}, ${department_id}, ${batch_id || null}, ${max_uses}, ${expiresAt}, ${created_by})
      RETURNING *;
    `;
    return rows[0];
  }

  const tokenObj = {
    id: Date.now(),
    token,
    title,
    target_role,
    department_id,
    batch_id: batch_id || null,
    max_uses,
    used_count: 0,
    is_active: true,
    expires_at: expiresAt,
    created_by,
    created_at: new Date().toISOString(),
  };
  memoryStore.enrollment_tokens.unshift(tokenObj);
  return tokenObj;
}

export async function listEnrollmentTokens() {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM enrollment_tokens ORDER BY created_at DESC`;
      return rows;
    } catch (err) {
      console.error('Error fetching enrollment tokens:', err);
    }
  }
  return memoryStore.enrollment_tokens;
}

export async function getEnrollmentToken(tokenString) {
  if (!tokenString) return null;
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM enrollment_tokens WHERE token = ${tokenString} LIMIT 1`;
      return rows[0] || null;
    } catch (err) {
      console.error('Error getting token:', err);
    }
  }
  return memoryStore.enrollment_tokens.find((t) => t.token === tokenString) || null;
}

export async function toggleEnrollmentToken(tokenId, isActive) {
  await initDb();
  const sql = getSql();
  if (sql) {
    await sql`UPDATE enrollment_tokens SET is_active = ${isActive} WHERE id = ${tokenId}`;
    return true;
  }
  const token = memoryStore.enrollment_tokens.find((t) => t.id === Number(tokenId));
  if (token) token.is_active = isActive;
  return true;
}

// -------------------------------------------------------------
// JOIN REQUESTS
// -------------------------------------------------------------

export async function createJoinRequest({
  token_id,
  applicant_email,
  applicant_name,
  applicant_avatar,
  mobile_number,
  requested_role,
  department_id,
  batch_id,
  admission_or_emp_no,
}) {
  const cleanEmail = applicant_email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  let superiorRole = 'FACULTY';
  if (requested_role === 'FACULTY') superiorRole = 'HOD';
  if (requested_role === 'NON_TEACHING_STAFF') superiorRole = 'PRINCIPAL';
  if (requested_role === 'RESEARCH_SCHOLAR') superiorRole = 'RESEARCH_SUPERVISOR';

  if (sql) {
    const rows = await sql`
      INSERT INTO join_requests (
        token_id, applicant_email, applicant_name, applicant_avatar, 
        mobile_number, requested_role, department_id, batch_id, 
        admission_or_emp_no, superior_role, status
      )
      VALUES (
        ${token_id || null}, ${cleanEmail}, ${applicant_name}, ${applicant_avatar || null},
        ${mobile_number || ''}, ${requested_role}, ${department_id}, ${batch_id || null},
        ${admission_or_emp_no || ''}, ${superiorRole}, 'PENDING'
      )
      RETURNING *;
    `;

    if (token_id) {
      await sql`UPDATE enrollment_tokens SET used_count = used_count + 1 WHERE id = ${token_id}`;
    }

    return rows[0];
  }

  const reqObj = {
    id: Date.now(),
    token_id: token_id || null,
    applicant_email: cleanEmail,
    applicant_name,
    applicant_avatar: applicant_avatar || null,
    mobile_number: mobile_number || '',
    requested_role,
    department_id,
    batch_id: batch_id || null,
    admission_or_emp_no: admission_or_emp_no || '',
    status: 'PENDING',
    superior_role: superiorRole,
    reviewed_by: null,
    superior_notes: null,
    created_at: new Date().toISOString(),
  };

  memoryStore.join_requests.unshift(reqObj);
  return reqObj;
}

export async function listJoinRequests({ status = 'PENDING', department_id } = {}) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      if (department_id) {
        return await sql`
          SELECT * FROM join_requests 
          WHERE status = ${status} AND department_id = ${department_id}
          ORDER BY created_at DESC
        `;
      }
      return await sql`
        SELECT * FROM join_requests 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } catch (err) {
      console.error('Error listing join requests:', err);
    }
  }

  return memoryStore.join_requests.filter((r) => {
    if (status && r.status !== status) return false;
    if (department_id && r.department_id !== department_id) return false;
    return true;
  });
}

export async function reviewJoinRequest({ request_id, action, reviewed_by, superior_notes }) {
  await initDb();
  const sql = getSql();

  const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REVISE' ? 'CORRECTION_REQUESTED' : 'REJECTED';
  const now = new Date().toISOString();

  let req = null;
  if (sql) {
    const rows = await sql`
      UPDATE join_requests 
      SET status = ${newStatus}, reviewed_by = ${reviewed_by}, superior_notes = ${superior_notes || ''}, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ${request_id}
      RETURNING *;
    `;
    req = rows[0];
  } else {
    req = memoryStore.join_requests.find((r) => r.id === Number(request_id));
    if (req) {
      req.status = newStatus;
      req.reviewed_by = reviewed_by;
      req.superior_notes = superior_notes || '';
      req.reviewed_at = now;
    }
  }

  if (req && action === 'APPROVE') {
    await createOrUpdateUser({
      email: req.applicant_email,
      name: req.applicant_name,
      phone: req.mobile_number,
      primary_type: req.requested_role,
      department: req.department_id,
      roll_no: req.admission_or_emp_no,
      status: 'ACTIVE',
    });

    await assignRoleToUser({
      email: req.applicant_email,
      role_code: req.requested_role,
      department: req.department_id,
    });

    await saveUserProfile(req.applicant_email, {
      role_code: req.requested_role,
      full_name: req.applicant_name,
      mobile_number: req.mobile_number,
      admission_or_emp_no: req.admission_or_emp_no,
      profile_status: 'ONBOARDING_PENDING',
    }, false);
  }

  return req;
}

// -------------------------------------------------------------
// USER PROFILES ("ASK ONCE")
// -------------------------------------------------------------

export async function getUserProfile(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`SELECT * FROM user_profiles WHERE LOWER(user_email) = ${cleanEmail} LIMIT 1`;
      return rows[0] || null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }

  return memoryStore.user_profiles.find((p) => p.user_email.toLowerCase() === cleanEmail) || null;
}

export async function saveUserProfile(email, data, isSubmitting = false) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  const newStatus = isSubmitting ? 'SUBMITTED' : (data.profile_status || 'DRAFT');

  if (sql) {
    const rows = await sql`
      INSERT INTO user_profiles (
        user_email, role_code, full_name, dob, gender, blood_group, marital_status,
        religion, community_category, caste_name, reservations, primary_email,
        alternate_email, mobile_number, emergency_contact_name, emergency_contact_phone,
        permanent_address, permanent_state, permanent_district, permanent_pincode,
        admission_or_emp_no, aadhaar_last4, qualifying_exam, qualifying_percentage,
        qualifying_year, campus_preference, bus_required, bus_stop, linkedin_url,
        github_url, scholar_url, document_proof_url, profile_status,
        cap_id, department_id, program_id, program_level, second_language,
        admission_quota, is_open_category, index_mark, parent_name, parent_mobile,
        actual_category, family_status, annual_income, previous_institution,
        tc_no, tc_date, conduct_status, pwd_category, co_curricular_category,
        ncc_certificate_level, is_ex_servicemen_ward, has_arts_festival_grade,
        sports_quota_level, documents
      ) VALUES (
        ${cleanEmail}, ${data.role_code || 'STUDENT'}, ${data.full_name || ''}, ${data.dob || null}, ${data.gender || null}, ${data.blood_group || null}, ${data.marital_status || 'Single'},
        ${data.religion || null}, ${data.community_category || null}, ${data.caste_name || null}, ${JSON.stringify(data.reservations || [])}::jsonb, ${cleanEmail},
        ${data.alternate_email || null}, ${data.mobile_number || null}, ${data.emergency_contact_name || data.parent_name || null}, ${data.emergency_contact_phone || data.parent_mobile || null},
        ${data.permanent_address || null}, ${data.permanent_state || null}, ${data.permanent_district || null}, ${data.permanent_pincode || null},
        ${data.admission_or_emp_no || data.cap_id || null}, ${data.aadhaar_last4 || null}, ${data.qualifying_exam || null}, ${data.qualifying_percentage || null},
        ${data.qualifying_year || null}, ${data.campus_preference || 'DAY_SCHOLAR'}, ${Boolean(data.bus_required)}, ${data.bus_stop || null}, ${data.linkedin_url || null},
        ${data.github_url || null}, ${data.scholar_url || null}, ${data.document_proof_url || null}, ${newStatus},
        ${data.cap_id || null}, ${data.department_id || null}, ${data.program_id || null}, ${data.program_level || null}, ${data.second_language || null},
        ${data.admission_quota || null}, ${Boolean(data.is_open_category)}, ${data.index_mark || null}, ${data.parent_name || null}, ${data.parent_mobile || null},
        ${data.actual_category || null}, ${data.family_status || null}, ${data.annual_income || null}, ${data.previous_institution || null},
        ${data.tc_no || null}, ${data.tc_date || null}, ${data.conduct_status || null}, ${data.pwd_category || null}, ${data.co_curricular_category || null},
        ${data.ncc_certificate_level || null}, ${Boolean(data.is_ex_servicemen_ward)}, ${Boolean(data.has_arts_festival_grade)},
        ${data.sports_quota_level || null}, ${JSON.stringify(data.documents || {})}::jsonb
      )
      ON CONFLICT (user_email) DO UPDATE
      SET full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
          dob = COALESCE(EXCLUDED.dob, user_profiles.dob),
          gender = COALESCE(EXCLUDED.gender, user_profiles.gender),
          blood_group = COALESCE(EXCLUDED.blood_group, user_profiles.blood_group),
          marital_status = COALESCE(EXCLUDED.marital_status, user_profiles.marital_status),
          religion = COALESCE(EXCLUDED.religion, user_profiles.religion),
          community_category = COALESCE(EXCLUDED.community_category, user_profiles.community_category),
          caste_name = COALESCE(EXCLUDED.caste_name, user_profiles.caste_name),
          reservations = COALESCE(EXCLUDED.reservations, user_profiles.reservations),
          alternate_email = COALESCE(EXCLUDED.alternate_email, user_profiles.alternate_email),
          mobile_number = COALESCE(EXCLUDED.mobile_number, user_profiles.mobile_number),
          emergency_contact_name = COALESCE(EXCLUDED.emergency_contact_name, user_profiles.emergency_contact_name),
          emergency_contact_phone = COALESCE(EXCLUDED.emergency_contact_phone, user_profiles.emergency_contact_phone),
          permanent_address = COALESCE(EXCLUDED.permanent_address, user_profiles.permanent_address),
          permanent_state = COALESCE(EXCLUDED.permanent_state, user_profiles.permanent_state),
          permanent_district = COALESCE(EXCLUDED.permanent_district, user_profiles.permanent_district),
          permanent_pincode = COALESCE(EXCLUDED.permanent_pincode, user_profiles.permanent_pincode),
          admission_or_emp_no = COALESCE(EXCLUDED.admission_or_emp_no, user_profiles.admission_or_emp_no),
          aadhaar_last4 = COALESCE(EXCLUDED.aadhaar_last4, user_profiles.aadhaar_last4),
          qualifying_exam = COALESCE(EXCLUDED.qualifying_exam, user_profiles.qualifying_exam),
          qualifying_percentage = COALESCE(EXCLUDED.qualifying_percentage, user_profiles.qualifying_percentage),
          qualifying_year = COALESCE(EXCLUDED.qualifying_year, user_profiles.qualifying_year),
          campus_preference = COALESCE(EXCLUDED.campus_preference, user_profiles.campus_preference),
          bus_required = COALESCE(EXCLUDED.bus_required, user_profiles.bus_required),
          bus_stop = COALESCE(EXCLUDED.bus_stop, user_profiles.bus_stop),
          linkedin_url = COALESCE(EXCLUDED.linkedin_url, user_profiles.linkedin_url),
          github_url = COALESCE(EXCLUDED.github_url, user_profiles.github_url),
          scholar_url = COALESCE(EXCLUDED.scholar_url, user_profiles.scholar_url),
          document_proof_url = COALESCE(EXCLUDED.document_proof_url, user_profiles.document_proof_url),
          cap_id = COALESCE(EXCLUDED.cap_id, user_profiles.cap_id),
          department_id = COALESCE(EXCLUDED.department_id, user_profiles.department_id),
          program_id = COALESCE(EXCLUDED.program_id, user_profiles.program_id),
          program_level = COALESCE(EXCLUDED.program_level, user_profiles.program_level),
          second_language = COALESCE(EXCLUDED.second_language, user_profiles.second_language),
          admission_quota = COALESCE(EXCLUDED.admission_quota, user_profiles.admission_quota),
          is_open_category = COALESCE(EXCLUDED.is_open_category, user_profiles.is_open_category),
          index_mark = COALESCE(EXCLUDED.index_mark, user_profiles.index_mark),
          parent_name = COALESCE(EXCLUDED.parent_name, user_profiles.parent_name),
          parent_mobile = COALESCE(EXCLUDED.parent_mobile, user_profiles.parent_mobile),
          actual_category = COALESCE(EXCLUDED.actual_category, user_profiles.actual_category),
          family_status = COALESCE(EXCLUDED.family_status, user_profiles.family_status),
          annual_income = COALESCE(EXCLUDED.annual_income, user_profiles.annual_income),
          previous_institution = COALESCE(EXCLUDED.previous_institution, user_profiles.previous_institution),
          tc_no = COALESCE(EXCLUDED.tc_no, user_profiles.tc_no),
          tc_date = COALESCE(EXCLUDED.tc_date, user_profiles.tc_date),
          conduct_status = COALESCE(EXCLUDED.conduct_status, user_profiles.conduct_status),
          pwd_category = COALESCE(EXCLUDED.pwd_category, user_profiles.pwd_category),
          co_curricular_category = COALESCE(EXCLUDED.co_curricular_category, user_profiles.co_curricular_category),
          ncc_certificate_level = COALESCE(EXCLUDED.ncc_certificate_level, user_profiles.ncc_certificate_level),
          is_ex_servicemen_ward = COALESCE(EXCLUDED.is_ex_servicemen_ward, user_profiles.is_ex_servicemen_ward),
          has_arts_festival_grade = COALESCE(EXCLUDED.has_arts_festival_grade, user_profiles.has_arts_festival_grade),
          sports_quota_level = COALESCE(EXCLUDED.sports_quota_level, user_profiles.sports_quota_level),
          documents = COALESCE(EXCLUDED.documents, user_profiles.documents),
          profile_status = ${newStatus},
          submitted_at = CASE WHEN ${isSubmitting} THEN CURRENT_TIMESTAMP ELSE user_profiles.submitted_at END,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return rows[0];
  }

  const existingIdx = memoryStore.user_profiles.findIndex((p) => p.user_email.toLowerCase() === cleanEmail);
  const profileObj = {
    ...(existingIdx >= 0 ? memoryStore.user_profiles[existingIdx] : {}),
    ...data,
    user_email: cleanEmail,
    profile_status: newStatus,
    submitted_at: isSubmitting ? new Date().toISOString() : (memoryStore.user_profiles[existingIdx]?.submitted_at || null),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    memoryStore.user_profiles[existingIdx] = profileObj;
  } else {
    memoryStore.user_profiles.unshift(profileObj);
  }
  return profileObj;
}

export async function reviewUserProfile({ email, action, reviewed_by, reviewer_notes }) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'CORRECTION_REQUIRED';
  const now = new Date().toISOString();

  if (sql) {
    const rows = await sql`
      UPDATE user_profiles
      SET profile_status = ${newStatus},
          approved_by = ${reviewed_by},
          approved_at = ${action === 'APPROVE' ? sql`CURRENT_TIMESTAMP` : null},
          reviewer_notes = ${reviewer_notes || ''},
          updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(user_email) = ${cleanEmail}
      RETURNING *;
    `;
    return rows[0];
  }

  const prof = memoryStore.user_profiles.find((p) => p.user_email.toLowerCase() === cleanEmail);
  if (prof) {
    prof.profile_status = newStatus;
    prof.approved_by = reviewed_by;
    prof.approved_at = action === 'APPROVE' ? now : null;
    prof.reviewer_notes = reviewer_notes || '';
    prof.updated_at = now;
  }
  return prof;
}

// -------------------------------------------------------------
// DATA CHANGE REQUESTS (MAKER-CHECKER SUPERIOR APPROVAL)
// -------------------------------------------------------------

export async function createDataChangeRequest({
  user_email,
  user_name,
  user_role,
  department_id,
  field_name,
  field_label,
  current_value,
  proposed_value,
  justification,
  document_proof_url,
}) {
  const cleanEmail = user_email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  let superiorRole = 'FACULTY';
  if (user_role === 'FACULTY') superiorRole = 'HOD';
  if (user_role === 'NON_TEACHING_STAFF') superiorRole = 'PRINCIPAL';
  if (user_role === 'RESEARCH_SCHOLAR') superiorRole = 'RESEARCH_SUPERVISOR';

  if (sql) {
    const rows = await sql`
      INSERT INTO data_change_requests (
        user_email, user_name, user_role, department_id, field_name, field_label,
        current_value, proposed_value, justification, document_proof_url,
        assigned_superior_role, status
      )
      VALUES (
        ${cleanEmail}, ${user_name || ''}, ${user_role}, ${department_id || null},
        ${field_name}, ${field_label}, ${current_value || ''}, ${proposed_value},
        ${justification}, ${document_proof_url || null}, ${superiorRole}, 'PENDING'
      )
      RETURNING *;
    `;
    return rows[0];
  }

  const reqObj = {
    id: Date.now(),
    user_email: cleanEmail,
    user_name: user_name || 'User',
    user_role,
    department_id: department_id || null,
    field_name,
    field_label,
    current_value: current_value || '',
    proposed_value,
    justification,
    document_proof_url: document_proof_url || null,
    status: 'PENDING',
    assigned_superior_role: superiorRole,
    reviewed_by: null,
    reviewer_comments: null,
    created_at: new Date().toISOString(),
  };
  memoryStore.data_change_requests.unshift(reqObj);
  return reqObj;
}

export async function listDataChangeRequests({ status = 'PENDING', department_id, user_email } = {}) {
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      if (user_email) {
        return await sql`
          SELECT * FROM data_change_requests 
          WHERE LOWER(user_email) = ${user_email.trim().toLowerCase()}
          ORDER BY created_at DESC
        `;
      }
      return await sql`
        SELECT * FROM data_change_requests 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } catch (err) {
      console.error('Error listing change requests:', err);
    }
  }

  return memoryStore.data_change_requests.filter((r) => {
    if (user_email && r.user_email.toLowerCase() !== user_email.trim().toLowerCase()) return false;
    if (status && r.status !== status) return false;
    if (department_id && r.department_id !== department_id) return false;
    return true;
  });
}

export async function reviewDataChangeRequest({ request_id, action, reviewed_by, reviewer_comments }) {
  await initDb();
  const sql = getSql();

  const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'REVISE' ? 'REVISION_REQUESTED' : 'REJECTED';
  const now = new Date().toISOString();

  let req = null;
  if (sql) {
    const rows = await sql`
      UPDATE data_change_requests
      SET status = ${newStatus}, reviewed_by = ${reviewed_by}, reviewer_comments = ${reviewer_comments || ''}, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ${request_id}
      RETURNING *;
    `;
    req = rows[0];
  } else {
    req = memoryStore.data_change_requests.find((r) => r.id === Number(request_id));
    if (req) {
      req.status = newStatus;
      req.reviewed_by = reviewed_by;
      req.reviewer_comments = reviewer_comments || '';
      req.reviewed_at = now;
    }
  }

  if (req && action === 'APPROVE') {
    if (!sql) {
      const prof = memoryStore.user_profiles.find((p) => p.user_email.toLowerCase() === req.user_email.toLowerCase());
      if (prof) {
        prof[req.field_name] = req.proposed_value;
        prof.updated_at = now;
      }
    }
  }

  return req;
}

// -------------------------------------------------------------
// RESEARCH SCHOLAR & SUPERVISOR LINKAGE
// -------------------------------------------------------------

export async function saveResearchScholarProfile({
  scholar_email,
  supervisor_email,
  co_supervisor_email,
  research_title,
  registration_no,
  scholar_type = 'FULL_TIME',
  funding_source,
  admission_date,
  status = 'COURSEWORK',
}) {
  const cleanScholar = scholar_email.trim().toLowerCase();
  const cleanSupervisor = supervisor_email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    const rows = await sql`
      INSERT INTO research_scholar_profiles (
        scholar_email, supervisor_email, co_supervisor_email, research_title, 
        registration_no, scholar_type, funding_source, admission_date, status
      )
      VALUES (
        ${cleanScholar}, ${cleanSupervisor}, ${co_supervisor_email || null}, 
        ${research_title || ''}, ${registration_no || ''}, ${scholar_type}, 
        ${funding_source || ''}, ${admission_date || null}, ${status}
      )
      ON CONFLICT (scholar_email) DO UPDATE
      SET supervisor_email = EXCLUDED.supervisor_email,
          co_supervisor_email = EXCLUDED.co_supervisor_email,
          research_title = EXCLUDED.research_title,
          registration_no = EXCLUDED.registration_no,
          scholar_type = EXCLUDED.scholar_type,
          funding_source = EXCLUDED.funding_source,
          status = EXCLUDED.status
      RETURNING *;
    `;

    await assignRoleToUser({ email: cleanSupervisor, role_code: 'RESEARCH_SUPERVISOR' });
    await assignRoleToUser({ email: cleanScholar, role_code: 'RESEARCH_SCHOLAR' });

    return rows[0];
  }

  const existingIdx = memoryStore.research_scholars.findIndex(
    (s) => s.scholar_email.toLowerCase() === cleanScholar
  );
  const scholarObj = {
    id: existingIdx >= 0 ? memoryStore.research_scholars[existingIdx].id : Date.now(),
    scholar_email: cleanScholar,
    supervisor_email: cleanSupervisor,
    co_supervisor_email: co_supervisor_email || null,
    research_title: research_title || '',
    registration_no: registration_no || '',
    scholar_type,
    funding_source: funding_source || '',
    admission_date: admission_date || new Date().toISOString().split('T')[0],
    status,
  };

  if (existingIdx >= 0) {
    memoryStore.research_scholars[existingIdx] = scholarObj;
  } else {
    memoryStore.research_scholars.unshift(scholarObj);
  }

  return scholarObj;
}

export async function getScholarsForSupervisor(supervisorEmail) {
  const cleanEmail = supervisorEmail.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT rsp.*, u.name as scholar_name, u.phone as scholar_phone, u.department
        FROM research_scholar_profiles rsp
        JOIN users u ON LOWER(rsp.scholar_email) = LOWER(u.email)
        WHERE LOWER(rsp.supervisor_email) = ${cleanEmail} OR LOWER(rsp.co_supervisor_email) = ${cleanEmail}
        ORDER BY rsp.created_at DESC
      `;
      return rows;
    } catch (err) {
      console.error('Error fetching scholars for supervisor:', err);
    }
  }

  return memoryStore.research_scholars
    .filter((s) => s.supervisor_email.toLowerCase() === cleanEmail || s.co_supervisor_email?.toLowerCase() === cleanEmail)
    .map((s) => {
      const u = memoryStore.users.find((user) => user.email.toLowerCase() === s.scholar_email.toLowerCase()) || {};
      return {
        ...s,
        scholar_name: u.name || 'Scholar',
        scholar_phone: u.phone || '',
        department: u.department || 'Research',
      };
    });
}

// -------------------------------------------------------------
// ANNOUNCEMENTS & ACADEMIC DATA
// -------------------------------------------------------------

export async function getAnnouncements() {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10`;
      return rows;
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }
  return memoryStore.announcements;
}

export const createAnnouncement = addAnnouncement;
export async function addAnnouncement({ title, content, category, author_email }) {
  await initDb();
  const sql = getSql();
  if (sql) {
    const rows = await sql`
      INSERT INTO announcements (title, content, category, author_email)
      VALUES (${title}, ${content}, ${category || 'General'}, ${author_email})
      RETURNING *;
    `;
    return rows[0];
  }
  const ann = {
    id: Date.now(),
    title,
    content,
    category: category || 'General',
    author_email,
    created_at: new Date().toISOString(),
  };
  memoryStore.announcements.unshift(ann);
  return ann;
}

// -------------------------------------------------------------
// LEGACY BACKWARDS-COMPATIBILITY SHIMS
// -------------------------------------------------------------

export async function getStudentByEmail(email) {
  return await getUserWithRoles(email);
}

export async function listAllStudents() {
  return await listAllUsers();
}

export async function addStudent(studentData) {
  const user = await createOrUpdateUser({
    ...studentData,
    primary_type: 'STUDENT',
  });
  await assignRoleToUser({
    email: studentData.email,
    role_code: 'STUDENT',
    department: studentData.department,
  });
  return user;
}

export async function removeStudent(email) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    await sql`DELETE FROM users WHERE LOWER(email) = ${cleanEmail}`;
    await sql`DELETE FROM user_roles WHERE LOWER(user_email) = ${cleanEmail}`;
    return true;
  }

  memoryStore.users = memoryStore.users.filter((u) => u.email.toLowerCase() !== cleanEmail);
  memoryStore.user_roles = memoryStore.user_roles.filter((ur) => ur.user_email.toLowerCase() !== cleanEmail);
  return true;
}

export async function updateStudentStatus(email, status) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    const rows = await sql`
      UPDATE users SET status = ${status} WHERE LOWER(email) = ${cleanEmail} RETURNING *;
    `;
    return rows[0];
  }

  const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) user.status = status;
  return user;
}

export async function recordStudentLogin(email) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      await sql`UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE LOWER(email) = ${cleanEmail};`;
    } catch (err) {
      console.error('Error recording login:', err);
    }
  }
}

export async function getStudentAcademicRecords(email) {
  const cleanEmail = email.trim().toLowerCase();
  await initDb();
  const sql = getSql();

  if (sql) {
    try {
      const rows = await sql`
        SELECT * FROM academic_records WHERE LOWER(student_email) = ${cleanEmail}
      `;
      return rows;
    } catch (err) {
      console.error('Error fetching academic records:', err);
    }
  }

  return memoryStore.academic_records.filter(
    (r) => r.student_email.toLowerCase() === cleanEmail
  );
}

export async function listAllDepartments() {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      const depts = await sql`
        SELECT d.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', p.id,
                'name', p.name,
                'code', p.code,
                'level', p.level,
                'duration_years', p.duration_years,
                'total_semesters', p.total_semesters,
                'intake_capacity', p.intake_capacity,
                'seat_matrix', COALESCE(p.seat_matrix, '{}'::jsonb),
                'is_active', p.is_active
              )
            ) FILTER (WHERE p.id IS NOT NULL), '[]'
          ) as programs
        FROM departments d
        LEFT JOIN academic_programs p ON d.id = p.department_id AND p.is_active = TRUE
        GROUP BY d.id
        ORDER BY d.type ASC, d.name ASC
      `;
      return depts;
    } catch (err) {
      console.error('listAllDepartments sql error:', err);
    }
  }

  return memoryStore.departments.map((d) => {
    const programs = memoryStore.academic_programs.filter((p) => p.department_id === d.id && p.is_active);
    return { ...d, programs };
  });
}

export async function createDepartment({ name, code, type, description, hod_email }) {
  await initDb();
  const sql = getSql();
  const id = `dept_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (sql) {
    try {
      const rows = await sql`
        INSERT INTO departments (id, name, code, type, description, hod_email, is_active)
        VALUES (${id}, ${name}, ${code.toUpperCase()}, ${type || 'PROGRAM_OFFERING'}, ${description || ''}, ${hod_email || null}, TRUE)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          description = EXCLUDED.description,
          hod_email = EXCLUDED.hod_email
        RETURNING *;
      `;
      return rows[0];
    } catch (err) {
      console.error('createDepartment sql error:', err);
      throw err;
    }
  }

  const existingIdx = memoryStore.departments.findIndex((d) => d.id === id);
  const newDept = { id, name, code: code.toUpperCase(), type: type || 'PROGRAM_OFFERING', description: description || '', hod_email: hod_email || null, is_active: true };
  if (existingIdx >= 0) {
    memoryStore.departments[existingIdx] = newDept;
  } else {
    memoryStore.departments.push(newDept);
  }
  return newDept;
}

export async function createAcademicProgram({ department_id, name, code, level, duration_years, total_semesters, intake_capacity }) {
  await initDb();
  const sql = getSql();
  const id = `prog_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (sql) {
    try {
      const rows = await sql`
        INSERT INTO academic_programs (id, department_id, name, code, level, duration_years, total_semesters, intake_capacity, is_active)
        VALUES (${id}, ${department_id}, ${name}, ${code.toUpperCase()}, ${level || 'UG'}, ${duration_years || 3}, ${total_semesters || 6}, ${intake_capacity || 60}, TRUE)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          level = EXCLUDED.level,
          duration_years = EXCLUDED.duration_years,
          total_semesters = EXCLUDED.total_semesters,
          intake_capacity = EXCLUDED.intake_capacity
        RETURNING *;
      `;
      return rows[0];
    } catch (err) {
      console.error('createAcademicProgram sql error:', err);
      throw err;
    }
  }

  const existingIdx = memoryStore.academic_programs.findIndex((p) => p.id === id);
  const newProg = { id, department_id, name, code: code.toUpperCase(), level: level || 'UG', duration_years: duration_years || 3, total_semesters: total_semesters || 6, intake_capacity: intake_capacity || 60, is_active: true };
  if (existingIdx >= 0) {
    memoryStore.academic_programs[existingIdx] = newProg;
  } else {
    memoryStore.academic_programs.push(newProg);
  }
  return newProg;
}


// -------------------------------------------------------------
// DEPARTMENT & PROGRAM DELETION
// -------------------------------------------------------------

export async function deleteDepartment(id) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      await sql`DELETE FROM courses WHERE department_id = ${id}`;
      await sql`DELETE FROM academic_programs WHERE department_id = ${id}`;
      await sql`DELETE FROM departments WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('deleteDepartment sql error:', err);
      throw err;
    }
  }

  memoryStore.departments = memoryStore.departments.filter(d => d.id !== id);
  memoryStore.academic_programs = memoryStore.academic_programs.filter(p => p.department_id !== id);
  memoryStore.courses = (memoryStore.courses || []).filter(c => c.department_id !== id);
  return true;
}

export async function deleteAcademicProgram(id) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      await sql`DELETE FROM courses WHERE program_id = ${id}`;
      await sql`DELETE FROM academic_programs WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('deleteAcademicProgram sql error:', err);
      throw err;
    }
  }

  memoryStore.academic_programs = memoryStore.academic_programs.filter(p => p.id !== id);
  memoryStore.courses = (memoryStore.courses || []).filter(c => c.program_id !== id);
  return true;
}

export async function listAllAcademicPrograms(department_id = null) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      if (department_id) {
        return await sql`SELECT * FROM academic_programs WHERE department_id = ${department_id} AND is_active = TRUE ORDER BY name ASC`;
      }
      return await sql`SELECT * FROM academic_programs WHERE is_active = TRUE ORDER BY name ASC`;
    } catch (err) {
      console.error('listAllAcademicPrograms sql error:', err);
    }
  }

  if (department_id) {
    return memoryStore.academic_programs.filter(p => p.department_id === department_id && p.is_active);
  }
  return memoryStore.academic_programs.filter(p => p.is_active);
}

// -------------------------------------------------------------
// COURSE MANAGEMENT (FACULTY & HOD)
// -------------------------------------------------------------

export async function listAllCourses({ department_id = null, program_id = null } = {}) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      let query;
      if (program_id && department_id) {
        query = await sql`
          SELECT c.*, d.name as department_name, p.name as program_name
          FROM courses c
          LEFT JOIN departments d ON c.department_id = d.id
          LEFT JOIN academic_programs p ON c.program_id = p.id
          WHERE (c.program_id = ${program_id} OR c.department_id = ${department_id}) AND c.is_active = TRUE
          ORDER BY c.semester ASC, c.code ASC
        `;
      } else if (program_id) {
        query = await sql`
          SELECT c.*, d.name as department_name, p.name as program_name
          FROM courses c
          LEFT JOIN departments d ON c.department_id = d.id
          LEFT JOIN academic_programs p ON c.program_id = p.id
          WHERE c.program_id = ${program_id} AND c.is_active = TRUE
          ORDER BY c.semester ASC, c.code ASC
        `;
      } else if (department_id) {
        query = await sql`
          SELECT c.*, d.name as department_name, p.name as program_name
          FROM courses c
          LEFT JOIN departments d ON c.department_id = d.id
          LEFT JOIN academic_programs p ON c.program_id = p.id
          WHERE c.department_id = ${department_id} AND c.is_active = TRUE
          ORDER BY c.semester ASC, c.code ASC
        `;
      } else {
        query = await sql`
          SELECT c.*, d.name as department_name, p.name as program_name
          FROM courses c
          LEFT JOIN departments d ON c.department_id = d.id
          LEFT JOIN academic_programs p ON c.program_id = p.id
          WHERE c.is_active = TRUE
          ORDER BY d.name ASC, c.semester ASC, c.code ASC
        `;
      }
      return query;
    } catch (err) {
      console.error('listAllCourses sql error:', err);
    }
  }

  const allCourses = memoryStore.courses || [];
  return allCourses.filter(c => {
    if (!c.is_active) return false;
    if (program_id && c.program_id !== program_id) return false;
    if (department_id && c.department_id !== department_id) return false;
    return true;
  }).map(c => {
    const dept = (memoryStore.departments || []).find(d => d.id === c.department_id);
    const prog = (memoryStore.academic_programs || []).find(p => p.id === c.program_id);
    return {
      ...c,
      department_name: dept ? dept.name : 'Unknown Department',
      program_name: prog ? prog.name : (c.program_id ? 'Special Program' : 'Common / All Degree Programs')
    };
  });
}

export async function createCourse({
  program_id = null,
  department_id,
  code,
  name,
  semester = 1,
  course_type = 'CORE',
  credits = 3,
  hours_per_week = 4,
  description = '',
  faculty_email = null
}) {
  await initDb();
  const sql = getSql();
  const id = `crs_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

  if (sql) {
    try {
      const rows = await sql`
        INSERT INTO courses (
          id, program_id, department_id, code, name, semester, course_type,
          credits, hours_per_week, description, faculty_email, is_active
        ) VALUES (
          ${id}, ${program_id || null}, ${department_id}, ${code.toUpperCase()},
          ${name}, ${parseInt(semester, 10) || 1}, ${course_type},
          ${parseInt(credits, 10) || 3}, ${parseInt(hours_per_week, 10) || 4},
          ${description || ''}, ${faculty_email || null}, TRUE
        )
        RETURNING *;
      `;
      return rows[0];
    } catch (err) {
      console.error('createCourse sql error:', err);
      throw err;
    }
  }

  const newCourse = {
    id,
    program_id: program_id || null,
    department_id,
    code: code.toUpperCase(),
    name,
    semester: parseInt(semester, 10) || 1,
    course_type,
    credits: parseInt(credits, 10) || 3,
    hours_per_week: parseInt(hours_per_week, 10) || 4,
    description: description || '',
    faculty_email: faculty_email || null,
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (!memoryStore.courses) memoryStore.courses = [];
  memoryStore.courses.push(newCourse);
  return newCourse;
}

export async function deleteCourse(id) {
  await initDb();
  const sql = getSql();
  if (sql) {
    try {
      await sql`DELETE FROM courses WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('deleteCourse sql error:', err);
      throw err;
    }
  }

  if (memoryStore.courses) {
    memoryStore.courses = memoryStore.courses.filter(c => c.id !== id);
  }
  return true;
}

// -------------------------------------------------------------
// SEAT MATRIX & RESERVATION QUOTA MANAGEMENT
// -------------------------------------------------------------

export async function getProgramSeatMatrix(programId) {
  await initDb();
  const sql = getSql();
  let program = null;

  if (sql) {
    try {
      const progRows = await sql`SELECT * FROM academic_programs WHERE id = ${programId}`;
      if (progRows && progRows.length > 0) {
        program = progRows[0];
      }
    } catch (err) {
      console.error('getProgramSeatMatrix sql error:', err);
    }
  }

  if (!program) {
    program = (memoryStore.academic_programs || []).find((p) => p.id === programId);
  }

  if (!program) {
    throw new Error(`Academic degree program '${programId}' not found`);
  }

  // Load seat matrix
  let matrix = program.seat_matrix || {};
  if (sql) {
    try {
      const rows = await sql`SELECT category_code, seats FROM program_seat_matrix WHERE program_id = ${programId}`;
      if (rows && rows.length > 0) {
        const dbMatrix = {};
        rows.forEach(r => { dbMatrix[r.category_code] = r.seats; });
        matrix = { ...matrix, ...dbMatrix };
      }
    } catch (err) {
      console.error('Error fetching program_seat_matrix rows:', err);
    }
  }

  // Ensure all 15 categories exist in response
  const completeMatrix = {};
  SEAT_RESERVATION_CATEGORIES.forEach(cat => {
    completeMatrix[cat.code] = typeof matrix[cat.code] === 'number' ? matrix[cat.code] : (parseInt(matrix[cat.code], 10) || 0);
  });

  const totalAllotted = Object.values(completeMatrix).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
  const intakeCapacity = parseInt(program.intake_capacity, 10) || 0;

  return {
    program,
    seat_matrix: completeMatrix,
    totalAllotted,
    intake_capacity: intakeCapacity,
    balance: intakeCapacity - totalAllotted,
    categories: SEAT_RESERVATION_CATEGORIES
  };
}

export async function updateProgramSeatMatrix(programId, splitup = {}, updatedBy = 'system') {
  await initDb();
  const sql = getSql();

  // Validate all values are non-negative numbers
  const sanitized = {};
  for (const cat of SEAT_RESERVATION_CATEGORIES) {
    const rawVal = splitup[cat.code];
    const val = parseInt(rawVal, 10);
    sanitized[cat.code] = isNaN(val) || val < 0 ? 0 : val;
  }

  const totalAllotted = Object.values(sanitized).reduce((sum, v) => sum + v, 0);

  if (sql) {
    try {
      await sql`
        UPDATE academic_programs 
        SET seat_matrix = ${JSON.stringify(sanitized)}::jsonb
        WHERE id = ${programId}
      `;

      for (const [catCode, seats] of Object.entries(sanitized)) {
        await sql`
          INSERT INTO program_seat_matrix (program_id, category_code, seats, updated_by, updated_at)
          VALUES (${programId}, ${catCode}, ${seats}, ${updatedBy}, CURRENT_TIMESTAMP)
          ON CONFLICT (program_id, category_code) DO UPDATE SET
            seats = EXCLUDED.seats,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    } catch (err) {
      console.error('updateProgramSeatMatrix sql error:', err);
    }
  }

  // Update memoryStore
  const progIdx = (memoryStore.academic_programs || []).findIndex(p => p.id === programId);
  if (progIdx >= 0) {
    memoryStore.academic_programs[progIdx].seat_matrix = sanitized;
  }

  return await getProgramSeatMatrix(programId);
}
