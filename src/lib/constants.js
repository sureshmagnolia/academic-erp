import { neon } from '@neondatabase/serverless';

export const MASTER_ROLES = [
  { code: 'PRINCIPAL', name: 'Principal / Director', category: 'EXECUTIVE', description: 'Institutional executive oversight, high-level approvals, and campus-wide governance.' },
  { code: 'HOD', name: 'Head of Department (HoD / Faculty Head)', category: 'ACADEMIC_ADMIN', description: 'Departmental leadership, faculty subject allocations, syllabus review, and internal marks sign-off.' },
  { code: 'FACULTY', name: 'Faculty (Teaching Staff)', category: 'ACADEMIC', description: 'Curriculum delivery, student attendance marking, internal evaluations, and mentoring.' },
  { code: 'RESEARCH_SUPERVISOR', name: 'PhD / Research Supervisor', category: 'RESEARCH', description: 'Supervises doctoral and master research scholars, doctoral committee meetings, and thesis reviews.' },
  { code: 'RESEARCH_SCHOLAR', name: 'Research Scholar (PhD / M.Phil)', category: 'STUDENT_RESEARCH', description: 'Postgraduate research scholar with elevated research privileges, lab access, and stipend tracking.' },
  { code: 'STUDENT', name: 'Student (UG / PG)', category: 'LEARNER', description: 'Regular enrolled student viewing marks, attendance, circulars, and course feedback.' },
  { code: 'NON_TEACHING_STAFF', name: 'Non-Teaching / Support Staff', category: 'STAFF', description: 'Laboratory technical assistants, administrative office personnel, accounts, and library services.' },
  { code: 'WARDEN', name: 'Hostel Warden', category: 'CAMPUS_LIFE', description: 'Hostel room allocations, leave/night out-pass approvals, discipline, and mess administration.' },
  { code: 'CHIEF_SUPERINTENDENT', name: 'Chief Superintendent (Exams)', category: 'EXAMINATION', description: 'End-semester and university exam operations, invigilation duty roster, and hall administration.' },
  { code: 'CLUB_COORDINATOR', name: 'Club / Activity Coordinator', category: 'CAMPUS_LIFE', description: 'Student clubs, technical chapters, cultural societies, and extra-curricular budget tracking.' },
  { code: 'ADMISSION_NODAL_OFFICER', name: 'Admission Nodal Officer (Central Desk)', category: 'ADMISSION', description: 'Centralized quota verification, index marks audit, and institutional admission desk sign-off.' },
  { code: 'PTA_OFFICIAL', name: 'PTA Official / Accounts Cashier', category: 'FINANCE', description: 'Verification of Parent-Teacher Association (PTA) fund remittance and fee payment receipts.' },
  { code: 'ALUMNI', name: 'Alumni / Transferred Student', category: 'ALUMNI', description: 'Former student with issued Transfer Certificate (TC), limited access to transcripts, and alumni profile updates.' },
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
  actualCategories: [
    'General',
    'EWS (Economically Weaker Section)',
    'EZHAVA / THIYYA / BILLAVA (ETB)',
    'MUSLIM',
    'OTHER BACKWARD HINDU (OBH)',
    'LATIN CATHOLIC & ANGLO INDIAN (LC/AI)',
    'OTHER BACKWARD CHRISTIAN (OBX)',
    'KUDUMBI',
    'SCHEDULED CASTE (SC)',
    'SCHEDULED TRIBE (ST)',
  ],
  admissionQuotas: [
    'General Merit / Open Quota',
    'EWS Quota',
    'SC Quota',
    'ST Quota',
    'ETB Quota',
    'Muslim Quota',
    'OBH Quota',
    'Latin Catholic Quota',
    'Community Quota',
    'Sports Quota',
    'Cultural / Arts Festival Quota',
    'Differently Abled (PwD) Quota',
    'Management Quota',
  ],
  secondLanguages: [
    'Arabic',
    'Malayalam',
    'Hindi',
    'Sanskrit',
    'Tamil',
    'French',
  ],
  familyStatuses: [
    'APL (Above Poverty Line)',
    'BPL (Below Poverty Line)',
  ],
  pwdCategories: [
    'Not applicable',
    'Locomotor Disability (including Cerebral Palsy, Leprosy Cured, Dwarfism, Acid Attack Victims, Muscular Dystrophy)',
    'Blindness and Low Vision',
    'Deaf and Hard of Hearing',
    'Speech and Language Disability',
    'Autism, Intellectual Disability, Specific Learning Disability and Mental Illness',
    'Multiple Disabilities',
  ],
  coCurricularOptions: [
    'Not applicable',
    'NCC (National Cadet Corps)',
    'NSS (National Service Scheme)',
    'Student Police Cadet (SPC)',
  ],
  nccCertificates: [
    'None',
    'A Certificate',
    'B Certificate',
    'C Certificate',
  ],
  genders: ['Male', 'Female', 'Transgender'],
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

// -------------------------------------------------------------
// PRE-ADMISSION SEAT MATRIX / RESERVATION QUOTA SPECIFICATION
// -------------------------------------------------------------
export const SEAT_RESERVATION_CATEGORIES = [
  {
    code: 'OPEN',
    name: 'Open Merit (All Applicants)',
    desc: 'Open to all candidates irrespective of caste, religion, or social quota on pure merit ranking.',
    isOpen: true,
    badgeClass: 'badge-open',
    defaultPct: 50,
  },
  {
    code: 'ETB',
    name: 'Ezhava / Thiyya / Billava (ETB)',
    desc: 'Socially and Educationally Backward Classes (SEBC) - Ezhava/Thiyya/Billava community.',
    isOpen: false,
    badgeClass: 'badge-sebc',
    defaultPct: 8,
  },
  {
    code: 'MU',
    name: 'Muslim (MU)',
    desc: 'Socially and Educationally Backward Classes (SEBC) - Muslim community quota.',
    isOpen: false,
    badgeClass: 'badge-sebc',
    defaultPct: 8,
  },
  {
    code: 'LC',
    name: 'Latin Catholic & Anglo Indian (LC)',
    desc: 'SEBC - Latin Catholics other than Anglo Indians and Anglo Indian community quota.',
    isOpen: false,
    badgeClass: 'badge-sebc',
    defaultPct: 3,
  },
  {
    code: 'EWS',
    name: 'Economically Weaker Section (EWS)',
    desc: 'Statutory 10% affirmative reservation for economically weaker sections in forward/general categories.',
    isOpen: false,
    badgeClass: 'badge-ews',
    defaultPct: 10,
  },
  {
    code: 'OBH',
    name: 'Other Backward Hindu (OBH)',
    desc: 'Socially and Educationally Backward Classes (SEBC) - Other Backward Hindu communities.',
    isOpen: false,
    badgeClass: 'badge-sebc',
    defaultPct: 3,
  },
  {
    code: 'SC',
    name: 'Scheduled Caste (SC)',
    desc: 'Statutory constitutional Scheduled Caste reservation (8% - 15% as per university mandate).',
    isOpen: false,
    badgeClass: 'badge-sc',
    defaultPct: 8,
  },
  {
    code: 'ST',
    name: 'Scheduled Tribe (ST)',
    desc: 'Statutory constitutional Scheduled Tribe reservation (2% as per university mandate).',
    isOpen: false,
    badgeClass: 'badge-st',
    defaultPct: 2,
  },
  {
    code: 'TLM',
    name: 'Tamil Linguistic Minority (TLM)',
    desc: 'Linguistic minority reservation for native Tamil speaking candidates in designated districts.',
    isOpen: false,
    badgeClass: 'badge-minority',
    defaultPct: 1,
  },
  {
    code: 'SP',
    name: 'Sports Quota (SP)',
    desc: 'Quota for candidates with outstanding achievements in recognized district, state, or national sports.',
    isOpen: false,
    badgeClass: 'badge-special',
    defaultPct: 2,
  },
  {
    code: 'SSQ',
    name: 'Cultural & Special Service Quota (SSQ)',
    desc: 'Cultural, state school youth festival A-grade winners, and student police/special service quota.',
    isOpen: false,
    badgeClass: 'badge-special',
    defaultPct: 1,
  },
  {
    code: 'PWD',
    name: 'Persons with Disability (PWD)',
    desc: 'Mandatory horizontal/affirmative quota for candidates with benchmark disabilities (5%).',
    isOpen: false,
    badgeClass: 'badge-pwd',
    defaultPct: 2,
  },
  {
    code: 'UTL',
    name: 'Union Territory Lakshadweep (UTL)',
    desc: 'Statutory reserved quota for student nominees from Union Territory of Lakshadweep administration.',
    isOpen: false,
    badgeClass: 'badge-ut',
    defaultPct: 1,
  },
  {
    code: 'OBX',
    name: 'Other Backward Christian (OBX)',
    desc: 'Socially and Educationally Backward Classes (SEBC) - Other Backward Christian communities.',
    isOpen: false,
    badgeClass: 'badge-sebc',
    defaultPct: 1,
  },
  {
    code: 'JR',
    name: 'Jew / Special Regional Quota (JR)',
    desc: 'Statutory or special institutional reservation for Jewish community or special regional criteria.',
    isOpen: false,
    badgeClass: 'badge-special',
    defaultPct: 0,
  },
];

// -------------------------------------------------------------
// STUDENT MULTI-STEP ADMISSION VERIFICATION PIPELINE
// -------------------------------------------------------------
export const ADMISSION_VERIFICATION_STAGES = [
  {
    step: 1,
    stage: 'DEPT_LEVEL',
    code: 'DEPT_VERIFIED',
    title: 'Department Level Verification',
    roleRequired: ['HOD', 'FACULTY', 'ADMIN'],
    officerTitle: 'Department Faculty Advisor / Class Tutor / HoD',
    desc: 'Verification of qualifying mark sheets, subject eligibility, qualifying exam percentage, and community/caste proof.',
  },
  {
    step: 2,
    stage: 'NODAL_DESK',
    code: 'NODAL_VERIFIED',
    title: 'Admission Nodal Desk Verification',
    roleRequired: ['ADMISSION_NODAL_OFFICER', 'ADMIN', 'PRINCIPAL'],
    officerTitle: 'Admission Nodal Officer (Central Desk)',
    desc: 'Verification of University CAP Allotment Memo, normalized merit index score, affirmative reservation quotas, and fee waivers.',
  },
  {
    step: 3,
    stage: 'PTA_DESK',
    code: 'PTA_VERIFIED',
    title: 'PTA Fees Remittance Verification',
    roleRequired: ['PTA_OFFICIAL', 'ADMIN', 'PRINCIPAL'],
    officerTitle: 'PTA Official / Accounts Cashier',
    desc: 'Verification of Parent-Teacher Association (PTA) fund remittance, caution deposit, and issuance of PTA payment receipt.',
  },
  {
    step: 4,
    stage: 'PRINCIPAL_DESK',
    code: 'ADMITTED_ACTIVE',
    title: 'Principal Office Approval & Admission Number',
    roleRequired: ['PRINCIPAL', 'ADMIN'],
    officerTitle: 'Office of the Principal',
    desc: 'Final executive authorization. Generates and awards the official permanent Admission Number, granting full active student rights.',
  },
];

// -------------------------------------------------------------
// 204 REAL-WORLD COMMUNITIES / CASTES MASTER DICTIONARY
// (Extracted & Normalized from Necttos Institutional Repository)
// -------------------------------------------------------------
export const COMMUNITIES_CATALOG = {
  GENERAL: [
    'Brahmin', 'Gupta', 'Guptan', 'Gupthan', 'Jacobite', 'Mannadiar', 'Mannadiyar',
    'Marar', 'Marthoma', 'Menon', 'Moothan', 'Nair', 'Nambiar', 'Orthodox',
    'Palliya', 'Pathukudy', 'Pattukudi', 'Pillai', 'Pisharody', 'Poduval',
    'Roman Catholic', 'Saiva Pillai', 'Samantha', 'Syrian Catholic',
    'Syro Malabar Catholic', 'Chaldean Syrian Christian', 'CSI Christian',
    'Tharakan', 'Varma', 'Warrier', 'Other Forward Community'
  ],
  ETB: [
    'Ezhava', 'Thiyya', 'Billava', 'Thiyyar'
  ],
  MU: [
    'Mappila', 'Muslim', 'Mopila', 'Rawther', 'Ravuthar', 'Rowthar'
  ],
  LC: [
    'Latin Catholic', 'Anglo Indian'
  ],
  OBH: [
    'Asari', 'Boyan', 'Chetty', 'Devanga', 'Ezhuthachan', 'Kaikolan', 'Kammala',
    'Karuvan', 'Kerala Mudali', 'Kerala Mudalis', 'Kollan', 'Kongu Vellala Gounder',
    'Maniyani', 'Marathi', 'Maravan', 'Maravar', 'Maruthuvar', 'Moosari', 'Muthuraja',
    'Nadar (Hindu)', 'Nagarthar', 'Naicker', 'Naidu', 'Padayachi Gounder',
    'Padayachi Gownder', 'Padyachi (villayankuppam)', 'Payayachi', 'Perumkollan',
    'Piramalakallar', 'Sadhu Chetty', 'Saiva Vella', 'Saiva Vellala', 'Saliya',
    'Telugu Chetty', 'Thandan', 'Thattan', 'Vadugar', 'Vaduka', 'Vadukan',
    'Vaniya', 'Veenasaiva', 'Veerasaiva', 'Vellala', 'Veluthedan',
    'Vilakkathala Nair', 'Vilakkthala Nair', 'Viswakarma', 'Other Backward Hindu'
  ],
  OBX: [
    'SIUC', 'Nadar (Christian)', 'Other Backward Christian'
  ],
  OEC: [
    'Arayan', 'Chemmar', 'Dheevara', 'Kudumbi', 'Kulalan', 'Kumbaran', 'Kumbharan',
    'Kusavan', 'Virasaiva', 'Wayanadan Chetty', 'Other Eligible Community'
  ],
  SC: [
    'Arunthathiyar', 'Chakkamar', 'Chakkiliyan', 'Chakliya', 'Chemman', 'Cheramar',
    'Cheruman', 'Gosangi', 'Kakkalan', 'Kalladi', 'Kanakkan', 'Kavara', 'Kurava',
    'Mannan', 'Nayadi', 'Padanna', 'Padannan', 'Pallan', 'Palleyan', 'Panan',
    'Paravan', 'Paraya', 'Parayan', 'Perumannan', 'Pulaya', 'Pulayan', 'Pulayar',
    'Pulluvan', 'Sambava', 'Sonkar', 'Valluvan', 'Vannan', 'Velan', 'Vettuvan',
    'Other Scheduled Caste'
  ],
  ST: [
    'Cholanaickan', 'Eravallan', 'Irula', 'Kadar', 'Kattunayakan', 'Kurichya',
    'Kurumba', 'Kuruman', 'Malakkuravan', 'Malayan', 'Malayarayan', 'Malasar',
    'Marati', 'Mavilan', 'Mudugar', 'Paniya', 'Ulladan', 'Uraly',
    'Vetta Kuruman', 'Other Scheduled Tribe'
  ],
};

// =========================================================================
// SYSTEM PRIVILEGES & PERMISSION MATRIX
// =========================================================================

export const SYSTEM_PRIVILEGES = [
  // Category: ADMISSIONS & INTAKE
  {
    code: 'VERIFY_DEPT_ADMISSIONS',
    name: 'Verify Department Admissions',
    category: 'ADMISSIONS',
    description: 'Stage 1 Department Faculty / Tutor verification of qualifying marks & certificates.',
  },
  {
    code: 'VERIFY_NODAL_ADMISSIONS',
    name: 'Verify Central Nodal Desk',
    category: 'ADMISSIONS',
    description: 'Stage 2 Central Admission Nodal Officer verification of quotas & index marks.',
  },
  {
    code: 'VERIFY_PTA_FEES',
    name: 'Verify PTA Fees Remittance',
    category: 'ADMISSIONS',
    description: 'Stage 3 PTA official verification of fee collection and receipt numbers.',
  },
  {
    code: 'APPROVE_PRINCIPAL_ADMISSIONS',
    name: 'Final Admission Clearance',
    category: 'ADMISSIONS',
    description: 'Stage 4 Principal office final sign-off and permanent Admission Number issuance.',
  },
  {
    code: 'ISSUE_TC',
    name: 'Issue Transfer Certificate (TC)',
    category: 'ADMISSIONS',
    description: 'Principal office authority to issue statutory TC and relieve students to Alumni status.',
  },
  {
    code: 'MANAGE_SEAT_MATRIX',
    name: 'Configure Seat Split-Up Matrix',
    category: 'ADMISSIONS',
    description: 'Define and update program reservation quotas across all 15 statutory categories.',
  },
  {
    code: 'GENERATE_ENROLLMENT_TOKENS',
    name: 'Generate Dynamic QR & Links',
    category: 'ONBOARDING',
    description: 'Activate time-limited, scan-capped self-enrollment tokens and QR codes.',
  },
  {
    code: 'REVIEW_JOIN_REQUESTS',
    name: 'Review Candidate Join Requests',
    category: 'ONBOARDING',
    description: 'Verify self-enrollment candidate submissions against official admission lists.',
  },

  // Category: ACADEMIC GOVERNANCE
  {
    code: 'MANAGE_DEPARTMENTS',
    name: 'Manage Departments Catalog',
    category: 'ACADEMIC',
    description: 'Add, update, or decommission academic and supporting departments.',
  },
  {
    code: 'MANAGE_PROGRAMS',
    name: 'Manage Academic Programs (FYUGP/PG)',
    category: 'ACADEMIC',
    description: 'Create and configure degree programs, duration, semesters, and intake capacity.',
  },
  {
    code: 'MANAGE_COURSES',
    name: 'Manage Courses & Faculty Allocation',
    category: 'ACADEMIC',
    description: 'Add courses, assign course tutors/faculty, and configure course syllabi.',
  },
  {
    code: 'APPROVE_CHANGE_REQUESTS',
    name: 'Approve Data Change Requests',
    category: 'GOVERNANCE',
    description: 'Maker-Checker approval authority for student/faculty live profile change requests.',
  },

  // Category: SYSTEM ADMINISTRATION & SECURITY
  {
    code: 'MANAGE_ROLES_PRIVILEGES',
    name: 'Manage Roles & Privileges',
    category: 'SYSTEM',
    description: 'Assign or strip institutional roles and granular privileges across all users.',
  },
  {
    code: 'GOD_MODE_SIMULATE',
    name: 'God Mode Role Simulation',
    category: 'SYSTEM',
    description: 'Simulate any institutional role to audit its interface and workflows.',
  },
  {
    code: 'VIEW_ALL_STUDENTS',
    name: 'Access Complete Student Registry',
    category: 'GOVERNANCE',
    description: 'Search, audit, and inspect student master profile dossiers campus-wide.',
  },
  {
    code: 'PUBLISH_CIRCULARS',
    name: 'Publish Campus Circulars',
    category: 'COMMUNICATION',
    description: 'Broadcast institutional circulars, notices, and academic announcements.',
  },
  {
    code: 'SUPERVISE_RESEARCH',
    name: 'Supervise Research Scholars',
    category: 'RESEARCH',
    description: 'Supervise doctoral research candidates, conduct DC meetings, and review milestones.',
  },
];

export const ROLE_DEFAULT_PRIVILEGES = {
  ADMIN: [
    'VERIFY_DEPT_ADMISSIONS',
    'VERIFY_NODAL_ADMISSIONS',
    'VERIFY_PTA_FEES',
    'APPROVE_PRINCIPAL_ADMISSIONS',
    'ISSUE_TC',
    'MANAGE_SEAT_MATRIX',
    'GENERATE_ENROLLMENT_TOKENS',
    'REVIEW_JOIN_REQUESTS',
    'MANAGE_DEPARTMENTS',
    'MANAGE_PROGRAMS',
    'MANAGE_COURSES',
    'APPROVE_CHANGE_REQUESTS',
    'MANAGE_ROLES_PRIVILEGES',
    'GOD_MODE_SIMULATE',
    'VIEW_ALL_STUDENTS',
    'PUBLISH_CIRCULARS',
    'SUPERVISE_RESEARCH',
  ],
  PRINCIPAL: [
    'VERIFY_DEPT_ADMISSIONS',
    'VERIFY_NODAL_ADMISSIONS',
    'VERIFY_PTA_FEES',
    'APPROVE_PRINCIPAL_ADMISSIONS',
    'ISSUE_TC',
    'MANAGE_SEAT_MATRIX',
    'GENERATE_ENROLLMENT_TOKENS',
    'REVIEW_JOIN_REQUESTS',
    'MANAGE_DEPARTMENTS',
    'MANAGE_PROGRAMS',
    'MANAGE_COURSES',
    'APPROVE_CHANGE_REQUESTS',
    'VIEW_ALL_STUDENTS',
    'PUBLISH_CIRCULARS',
  ],
  HOD: [
    'VERIFY_DEPT_ADMISSIONS',
    'MANAGE_SEAT_MATRIX',
    'GENERATE_ENROLLMENT_TOKENS',
    'REVIEW_JOIN_REQUESTS',
    'MANAGE_COURSES',
    'APPROVE_CHANGE_REQUESTS',
    'VIEW_ALL_STUDENTS',
  ],
  FACULTY: [
    'VERIFY_DEPT_ADMISSIONS',
    'MANAGE_COURSES',
    'APPROVE_CHANGE_REQUESTS',
  ],
  ADMISSION_NODAL_OFFICER: [
    'VERIFY_NODAL_ADMISSIONS',
    'REVIEW_JOIN_REQUESTS',
    'VIEW_ALL_STUDENTS',
  ],
  PTA_OFFICIAL: [
    'VERIFY_PTA_FEES',
  ],
  RESEARCH_SUPERVISOR: [
    'SUPERVISE_RESEARCH',
  ],
  RESEARCH_SCHOLAR: [],
  STUDENT: [],
  NON_TEACHING_STAFF: [],
  WARDEN: ['REVIEW_JOIN_REQUESTS'],
  CHIEF_SUPERINTENDENT: ['PUBLISH_CIRCULARS'],
  CLUB_COORDINATOR: ['PUBLISH_CIRCULARS'],
  ALUMNI: [],
};

export function computeEffectivePrivileges(roles = [], granted = [], revoked = []) {
  const privSet = new Set();

  for (const r of roles) {
    const code = typeof r === 'string' ? r : r?.code;
    const defaults = ROLE_DEFAULT_PRIVILEGES[code] || [];
    for (const d of defaults) privSet.add(d);
  }

  // Add custom granted
  if (Array.isArray(granted)) {
    for (const g of granted) privSet.add(g);
  }

  // Remove custom revoked
  if (Array.isArray(revoked)) {
    for (const rev of revoked) privSet.delete(rev);
  }

  return Array.from(privSet);
}



