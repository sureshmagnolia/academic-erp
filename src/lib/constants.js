import { neon } from '@neondatabase/serverless';

export const MASTER_ROLES = [
  { code: 'PRINCIPAL', name: 'Principal / Director', category: 'EXECUTIVE', description: 'Institutional executive oversight, high-level approvals, and campus-wide governance.' },
  { code: 'DEAN', name: 'Dean (Academic / Research / Student Affairs)', category: 'EXECUTIVE', description: 'Oversight across college-wide academic curricula, research grants, and student affairs.' },
  { code: 'HOD', name: 'Head of Department (HoD)', category: 'ACADEMIC_ADMIN', description: 'Departmental leadership, faculty subject allocations, syllabus review, and internal marks sign-off.' },
  { code: 'FACULTY', name: 'Faculty (Teaching Staff)', category: 'ACADEMIC', description: 'Curriculum delivery, student attendance marking, internal evaluations, and mentoring.' },
  { code: 'RESEARCH_SUPERVISOR', name: 'PhD / Research Supervisor', category: 'RESEARCH', description: 'Supervises doctoral and master research scholars, doctoral committee meetings, and thesis reviews.' },
  { code: 'RESEARCH_SCHOLAR', name: 'Research Scholar (PhD / M.Phil)', category: 'STUDENT_RESEARCH', description: 'Postgraduate research scholar with elevated research privileges, lab access, and stipend tracking.' },
  { code: 'STUDENT', name: 'Student (UG / PG)', category: 'LEARNER', description: 'Regular enrolled student viewing marks, attendance, circulars, and course feedback.' },
  { code: 'NON_TEACHING_STAFF', name: 'Non-Teaching / Support Staff', category: 'STAFF', description: 'Laboratory technical assistants, administrative office personnel, accounts, and library services.' },
  { code: 'WARDEN', name: 'Hostel Warden', category: 'CAMPUS_LIFE', description: 'Hostel room allocations, leave/night out-pass approvals, discipline, and mess administration.' },
  { code: 'CHIEF_SUPERINTENDENT', name: 'Chief Superintendent (Exams)', category: 'EXAMINATION', description: 'End-semester and university exam operations, invigilation duty roster, and hall administration.' },
  { code: 'CLUB_COORDINATOR', name: 'Club / Activity Coordinator', category: 'CAMPUS_LIFE', description: 'Student clubs, technical chapters, cultural societies, and extra-curricular budget tracking.' },
  { code: 'ADMIN', name: 'System Administrator', category: 'SYSTEM', description: 'Complete system control, role assignments, database maintenance, and security auditing.' },
];

export const DEPARTMENTS_CATALOG = [
  { id: 'dept_comp_sci', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'dept_ece', name: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 'dept_mech', name: 'Mechanical Engineering', code: 'MECH' },
  { id: 'dept_civil', name: 'Civil Engineering', code: 'CIVIL' },
  { id: 'dept_physics', name: 'Department of Physics', code: 'PHY' },
  { id: 'dept_chemistry', name: 'Department of Chemistry', code: 'CHEM' },
  { id: 'dept_maths', name: 'Department of Mathematics', code: 'MATH' },
  { id: 'dept_commerce', name: 'Commerce & Management Studies', code: 'COM' },
];

export const FORM_REFERENCE_DATA = {
  bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
  genders: ['Male', 'Female', 'Other'],
  religions: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
  maritalStatuses: ['Single', 'Married', 'Other'],
  qualifyingExams: [
    'Higher Secondary / Plus Two (State Board)',
    'CBSE (Class XII)',
    'ICSE / ISC (Class XII)',
    'Polytechnic 3-Year Diploma',
    'Undergraduate Degree (B.Sc / B.Tech / B.A / B.Com)',
    'Postgraduate Degree (M.Sc / M.Tech / M.A / M.Com)',
  ],
  states: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Jammu & Kashmir', 'Ladakh'
  ],
  specialReservations: [
    { code: 'SPORTS_QUOTA', label: 'Sports Quota (District / State / National Level)' },
    { code: 'NCC', label: 'NCC (National Cadet Corps A/B/C Certificate)' },
    { code: 'NSS', label: 'NSS (National Service Scheme Volunteer)' },
    { code: 'PWD', label: 'Person with Benchmark Disability (PwD)' },
    { code: 'EX_SERVICEMEN', label: 'Ward of Defense / Ex-Servicemen' },
    { code: 'EBC', label: 'Economically Backward Class (EBC)' },
  ],
  campusPreferences: [
    { code: 'DAY_SCHOLAR', label: 'Day Scholar (Self Commute)' },
    { code: 'COLLEGE_BUS', label: 'College Bus Transport Facility' },
    { code: 'CAMPUS_HOSTEL', label: 'Campus Residential Hostel' },
  ],
};
