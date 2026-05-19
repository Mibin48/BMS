// ── Admin Portal Mock Data ──────────────────────────────────

export const mockSystemStats = {
    total_donors: 12480,
    total_hospitals: 340,
    total_blood_banks: 87,
    total_units: 42000,
    total_requests: 8420,
    fulfilled_requests: 8102,
    total_donations: 9840,
    total_payments: '₹84,20,000',
    active_users: 1240,
    kerala_districts: 14,
};

export const mockAllDonors = [
    { donor_id: 'DNR-001', name: 'Arjun Nair', age: 28, gender: 'Male', blood_group: 'O+', phone: '+91 98765 43210', city: 'Ernakulam', last_donation_date: '2024-11-15', total_donations: 7, status: 'Eligible' },
    { donor_id: 'DNR-002', name: 'Priya Menon', age: 24, gender: 'Female', blood_group: 'A+', phone: '+91 98765 43211', city: 'Thrissur', last_donation_date: '2024-10-10', total_donations: 3, status: 'Eligible' },
    { donor_id: 'DNR-003', name: 'Rahul Krishnan', age: 35, gender: 'Male', blood_group: 'B-', phone: '+91 98765 43212', city: 'Kozhikode', last_donation_date: '2024-12-05', total_donations: 5, status: 'Cooling' },
    { donor_id: 'DNR-004', name: 'Anjali Das', age: 30, gender: 'Female', blood_group: 'AB+', phone: '+91 98765 43213', city: 'Wayanad', last_donation_date: '2024-09-20', total_donations: 2, status: 'Eligible' },
    { donor_id: 'DNR-005', name: 'Vineeth Kumar', age: 42, gender: 'Male', blood_group: 'O-', phone: '+91 98765 43214', city: 'Thiruvananthapuram', last_donation_date: '2024-08-15', total_donations: 10, status: 'Deferred' },
];

export const mockAllHospitals = [
    { hospital_id: 'HSP-001', hospital_name: 'KIMS Hospital', city: 'Thiruvananthapuram', contact_number: '+91 471 234 5678', beds: 340, active_patients: 5, total_requests: 42, status: 'Active' },
    { hospital_id: 'HSP-002', hospital_name: 'Amrita Hospital', city: 'Ernakulam', contact_number: '+91 484 234 5678', beds: 500, active_patients: 12, total_requests: 68, status: 'Active' },
    { hospital_id: 'HSP-003', hospital_name: 'Medical College', city: 'Kozhikode', contact_number: '+91 495 234 5678', beds: 800, active_patients: 24, total_requests: 95, status: 'Active' },
    { hospital_id: 'HSP-004', hospital_name: 'Baby Memorial', city: 'Kozhikode', contact_number: '+91 495 345 6789', beds: 200, active_patients: 8, total_requests: 28, status: 'Active' },
    { hospital_id: 'HSP-005', hospital_name: 'Lakeshore Hospital', city: 'Ernakulam', contact_number: '+91 484 345 6789', beds: 250, active_patients: 6, total_requests: 31, status: 'Pending' },
];

export const mockAllBloodBanks = [
    { bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', city: 'Thiruvananthapuram', contact_number: '+91 471 234 5678', naco_number: 'NACO-KL-2024-0042', total_units: 553, storage_capacity: 2000, total_donations: 840, status: 'Active' },
    { bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', city: 'Ernakulam', contact_number: '+91 484 234 5678', naco_number: 'NACO-KL-2024-0043', total_units: 398, storage_capacity: 1500, total_donations: 620, status: 'Active' },
    { bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', city: 'Kozhikode', contact_number: '+91 495 234 5678', naco_number: 'NACO-KL-2024-0044', total_units: 287, storage_capacity: 1200, total_donations: 480, status: 'Active' },
    { bank_id: 'BNK-004', bank_name: 'Lakeshore Blood Bank', city: 'Ernakulam', contact_number: '+91 484 345 6789', naco_number: 'NACO-KL-2024-0045', total_units: 124, storage_capacity: 800, total_donations: 210, status: 'Pending' },
];

export const mockAllRequests = [
    { request_id: 'REQ-2025-001', hospital_id: 'HSP-001', hospital_name: 'KIMS Hospital', patient_id: 'PAT-001', patient_name: 'Suresh Kumar', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', blood_group: 'B-', units_required: 2, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency' },
    { request_id: 'REQ-2025-002', hospital_id: 'HSP-002', hospital_name: 'Amrita Hospital', patient_id: 'PAT-002', patient_name: 'Meera Nair', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', blood_group: 'O+', units_required: 3, request_date: '2025-01-14', status: 'Fulfilled', priority: 'Urgent' },
    { request_id: 'REQ-2025-003', hospital_id: 'HSP-003', hospital_name: 'Medical College', patient_id: 'PAT-003', patient_name: 'Rajan Pillai', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', blood_group: 'A+', units_required: 1, request_date: '2025-01-13', status: 'Fulfilled', priority: 'Routine' },
    { request_id: 'REQ-2025-004', hospital_id: 'HSP-001', hospital_name: 'KIMS Hospital', patient_id: 'PAT-004', patient_name: 'Lakshmi Devi', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', blood_group: 'AB+', units_required: 4, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency' },
];

export const mockAllDonations = [
    { donation_id: 'DON-2024-001', donor_id: 'DNR-001', donor_name: 'Arjun Nair', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', check_id: 'HC-001', donation_date: '2024-11-15', quantity_ml: 450, blood_group: 'O+' },
    { donation_id: 'DON-2024-002', donor_id: 'DNR-002', donor_name: 'Priya Menon', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', check_id: 'HC-002', donation_date: '2024-10-10', quantity_ml: 450, blood_group: 'A+' },
    { donation_id: 'DON-2024-003', donor_id: 'DNR-003', donor_name: 'Rahul Krishnan', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', check_id: 'HC-003', donation_date: '2024-12-05', quantity_ml: 450, blood_group: 'B-' },
];

export const mockAllHealthChecks = [
    { check_id: 'HC-001', donor_id: 'DNR-001', donor_name: 'Arjun Nair', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', check_date: '2024-11-15', weight: 72, hemoglobin: 14.5, blood_pressure: '120/80', eligibility_status: 'Eligible' },
    { check_id: 'HC-002', donor_id: 'DNR-002', donor_name: 'Priya Menon', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', check_date: '2024-10-10', weight: 58, hemoglobin: 13.2, blood_pressure: '115/75', eligibility_status: 'Eligible' },
    { check_id: 'HC-003', donor_id: 'DNR-003', donor_name: 'Rahul Krishnan', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', check_date: '2024-12-05', weight: 80, hemoglobin: 15.1, blood_pressure: '125/85', eligibility_status: 'Eligible' },
];

export const mockAllIssues = [
    { issue_id: 'ISS-2025-001', request_id: 'REQ-2025-002', hospital_name: 'Amrita Hospital', bank_name: 'Amrita Blood Bank', blood_group: 'O+', issue_date: '2025-01-14', units_issued: 3 },
    { issue_id: 'ISS-2025-002', request_id: 'REQ-2025-003', hospital_name: 'Medical College', bank_name: 'Medical College Blood Bank', blood_group: 'A+', issue_date: '2025-01-13', units_issued: 1 },
];

export const mockAllPayments = [
    { payment_id: 'PAY-2025-001', hospital_id: 'HSP-002', hospital_name: 'Amrita Hospital', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', request_id: 'REQ-2025-002', amount: 1500, payment_date: '2025-01-14', payment_status: 'Paid' },
    { payment_id: 'PAY-2025-002', hospital_id: 'HSP-003', hospital_name: 'Medical College', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', request_id: 'REQ-2025-003', amount: 500, payment_date: '2025-01-13', payment_status: 'Paid' },
    { payment_id: 'PAY-2025-003', hospital_id: 'HSP-001', hospital_name: 'KIMS Hospital', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', request_id: 'REQ-2025-001', amount: 1000, payment_date: '2025-01-15', payment_status: 'Pending' },
    { payment_id: 'PAY-2025-004', hospital_id: 'HSP-001', hospital_name: 'KIMS Hospital', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', request_id: 'REQ-2025-004', amount: 2000, payment_date: '2025-01-15', payment_status: 'Pending' },
];

export const mockPendingApprovals = [
    { id: 'APR-001', type: 'Hospital', org_name: 'Lakeshore Hospital', city: 'Ernakulam', submitted: '2025-01-14', contact: 'dr.admin@lakeshore.in', ref: 'HEM-2025-KL-00849', status: 'Pending' },
    { id: 'APR-002', type: 'Blood Bank', org_name: 'Lakeshore Blood Bank', city: 'Ernakulam', submitted: '2025-01-14', contact: 'admin@lakeshorebank.in', ref: 'HEM-2025-KL-00850', status: 'Pending' },
    { id: 'APR-003', type: 'Hospital', org_name: 'Aster Medcity', city: 'Ernakulam', submitted: '2025-01-12', contact: 'admin@aster.in', ref: 'HEM-2025-KL-00848', status: 'Under Review' },
];

export const mockSystemUsers = [
    { user_id: 'USR-001', name: 'Dr. Anitha Krishnan', email: 'anitha@kims.in', role: 'Hospital Admin', org: 'KIMS Hospital', district: 'Thiruvananthapuram', last_active: '2025-01-15', status: 'Active' },
    { user_id: 'USR-002', name: 'Dr. Suresh Menon', email: 'suresh@kimsbank.in', role: 'Blood Bank Admin', org: 'KIMS Blood Bank', district: 'Thiruvananthapuram', last_active: '2025-01-15', status: 'Active' },
    { user_id: 'USR-003', name: 'Arjun Nair', email: 'arjun@gmail.com', role: 'Donor', org: '—', district: 'Ernakulam', last_active: '2025-01-14', status: 'Active' },
    { user_id: 'USR-004', name: 'Priya Menon', email: 'priya@gmail.com', role: 'Donor', org: '—', district: 'Thrissur', last_active: '2025-01-13', status: 'Active' },
    { user_id: 'USR-005', name: 'Admin Kerala', email: 'admin@hema.health', role: 'Super Admin', org: 'HEM∆ System', district: 'Thiruvananthapuram', last_active: '2025-01-15', status: 'Active' },
];

export const mockDistrictData = [
    { district: 'Thiruvananthapuram', hospitals: 42, blood_banks: 12, donors: 1840, total_units: 1240, status: 'Healthy' },
    { district: 'Ernakulam', hospitals: 58, blood_banks: 15, donors: 2240, total_units: 1680, status: 'Healthy' },
    { district: 'Kozhikode', hospitals: 38, blood_banks: 10, donors: 1420, total_units: 980, status: 'Low' },
    { district: 'Thrissur', hospitals: 32, blood_banks: 8, donors: 1180, total_units: 840, status: 'Healthy' },
    { district: 'Palakkad', hospitals: 24, blood_banks: 6, donors: 820, total_units: 480, status: 'Low' },
    { district: 'Malappuram', hospitals: 28, blood_banks: 7, donors: 940, total_units: 560, status: 'Critical' },
    { district: 'Kannur', hospitals: 22, blood_banks: 5, donors: 740, total_units: 420, status: 'Healthy' },
    { district: 'Wayanad', hospitals: 14, blood_banks: 3, donors: 380, total_units: 180, status: 'Critical' },
    { district: 'Kasaragod', hospitals: 16, blood_banks: 4, donors: 420, total_units: 240, status: 'Low' },
    { district: 'Idukki', hospitals: 18, blood_banks: 4, donors: 460, total_units: 260, status: 'Low' },
    { district: 'Kottayam', hospitals: 26, blood_banks: 6, donors: 880, total_units: 620, status: 'Healthy' },
    { district: 'Alappuzha', hospitals: 20, blood_banks: 5, donors: 680, total_units: 440, status: 'Healthy' },
    { district: 'Pathanamthitta', hospitals: 16, blood_banks: 4, donors: 420, total_units: 300, status: 'Healthy' },
    { district: 'Kollam', hospitals: 28, blood_banks: 7, donors: 860, total_units: 580, status: 'Healthy' },
];

export const mockSystemTrendData = [
    { month: 'Aug', donations: 180, requests: 84, units: 3800 },
    { month: 'Sep', donations: 220, requests: 102, units: 4200 },
    { month: 'Oct', donations: 195, requests: 96, units: 4100 },
    { month: 'Nov', donations: 248, requests: 118, units: 4600 },
    { month: 'Dec', donations: 202, requests: 88, units: 4300 },
    { month: 'Jan', donations: 140, requests: 62, units: 4200 },
];

export const mockAuditLogs = [
    { log_id: 'LOG-001', timestamp: '2025-01-15 09:42', user: 'Dr. Anitha Krishnan', role: 'Hospital Admin', action: 'APPROVED', entity: 'Blood_Request', entity_id: 'REQ-2025-002', detail: 'Approved 3 units O+', ip: '192.168.1.42', severity: 'Info' },
    { log_id: 'LOG-002', timestamp: '2025-01-15 09:38', user: 'Dr. Suresh Menon', role: 'Blood Bank Admin', action: 'ADDED', entity: 'Donation_Record', entity_id: 'DON-2024-004', detail: 'Added 450ml A+ donation', ip: '192.168.1.55', severity: 'Info' },
    { log_id: 'LOG-003', timestamp: '2025-01-15 09:15', user: 'System', role: 'Auto', action: 'ALERT', entity: 'Blood_Stock', entity_id: 'STK-004', detail: 'B- stock below 30% threshold', ip: '—', severity: 'Warning' },
    { log_id: 'LOG-004', timestamp: '2025-01-15 08:55', user: 'Admin Kerala', role: 'Super Admin', action: 'APPROVED', entity: 'Hospital', entity_id: 'HSP-003', detail: 'Approved Medical College registration', ip: '192.168.1.10', severity: 'Info' },
    { log_id: 'LOG-005', timestamp: '2025-01-15 08:30', user: 'Unknown', role: '—', action: 'FAILED_LOGIN', entity: 'Auth', entity_id: '—', detail: '3 failed login attempts', ip: '103.24.56.78', severity: 'Critical' },
];
