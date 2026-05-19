export const mockBloodBank = {
    bank_id: 'BNK-2024-KL-00001',
    bank_name: 'KIMS Blood Bank',
    city: 'Thiruvananthapuram',
    contact_number: '+91 471 234 5678',
    admin_name: 'Dr. Suresh Menon',
    role: 'Blood Bank Director',
    naco_number: 'NACO-KL-2024-0042',
    license_number: 'KHD-BL-2024-0392',
    storage_capacity: 2000,
    operating_hours: 'Mon–Sat: 8am–8pm',
    established: '2018',
}

export const mockBloodStock = [
    { stock_id: 'STK-001', bank_id: 'BNK-2024-KL-00001', blood_group: 'A+', available_units: 120, capacity: 200, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-002', bank_id: 'BNK-2024-KL-00001', blood_group: 'A-', available_units: 40, capacity: 100, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-003', bank_id: 'BNK-2024-KL-00001', blood_group: 'B+', available_units: 95, capacity: 200, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-004', bank_id: 'BNK-2024-KL-00001', blood_group: 'B-', available_units: 12, capacity: 80, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-005', bank_id: 'BNK-2024-KL-00001', blood_group: 'O+', available_units: 200, capacity: 300, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-006', bank_id: 'BNK-2024-KL-00001', blood_group: 'O-', available_units: 18, capacity: 100, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-007', bank_id: 'BNK-2024-KL-00001', blood_group: 'AB+', available_units: 60, capacity: 120, last_updated: '2025-01-15 09:00' },
    { stock_id: 'STK-008', bank_id: 'BNK-2024-KL-00001', blood_group: 'AB-', available_units: 8, capacity: 60, last_updated: '2025-01-15 09:00' },
]

export const mockDonors = [
    { donor_id: 'DNR-001', name: 'Arjun Nair', age: 28, gender: 'Male', blood_group: 'O+', phone: '+91 98765 43210', city: 'Thiruvananthapuram', last_donation_date: '2024-11-15', total_donations: 7, status: 'Eligible' },
    { donor_id: 'DNR-002', name: 'Priya Menon', age: 24, gender: 'Female', blood_group: 'A+', phone: '+91 98765 43211', city: 'Ernakulam', last_donation_date: '2024-10-10', total_donations: 3, status: 'Eligible' },
    { donor_id: 'DNR-003', name: 'Rahul Krishnan', age: 35, gender: 'Male', blood_group: 'B-', phone: '+91 98765 43212', city: 'Thrissur', last_donation_date: '2024-12-05', total_donations: 5, status: 'Cooling' },
    { donor_id: 'DNR-004', name: 'Anjali Das', age: 30, gender: 'Female', blood_group: 'AB+', phone: '+91 98765 43213', city: 'Kozhikode', last_donation_date: '2024-09-20', total_donations: 2, status: 'Eligible' },
    { donor_id: 'DNR-005', name: 'Vineeth Kumar', age: 42, gender: 'Male', blood_group: 'O-', phone: '+91 98765 43214', city: 'Thiruvananthapuram', last_donation_date: '2024-08-15', total_donations: 10, status: 'Deferred' },
]

export const mockHealthChecks = [
    { check_id: 'HC-001', donor_id: 'DNR-001', donor_name: 'Arjun Nair', check_date: '2024-11-15', weight: 72, hemoglobin: 14.5, blood_pressure: '120/80', eligibility_status: 'Eligible' },
    { check_id: 'HC-002', donor_id: 'DNR-002', donor_name: 'Priya Menon', check_date: '2024-10-10', weight: 58, hemoglobin: 13.2, blood_pressure: '115/75', eligibility_status: 'Eligible' },
    { check_id: 'HC-003', donor_id: 'DNR-003', donor_name: 'Rahul Krishnan', check_date: '2024-12-05', weight: 80, hemoglobin: 15.1, blood_pressure: '125/85', eligibility_status: 'Eligible' },
    { check_id: 'HC-004', donor_id: 'DNR-005', donor_name: 'Vineeth Kumar', check_date: '2024-08-15', weight: 75, hemoglobin: 11.8, blood_pressure: '135/90', eligibility_status: 'Deferred' },
]

export const mockDonationRecords = [
    { donation_id: 'DON-2024-001', donor_id: 'DNR-001', donor_name: 'Arjun Nair', bank_id: 'BNK-2024-KL-00001', check_id: 'HC-001', donation_date: '2024-11-15', quantity_ml: 450, blood_group: 'O+' },
    { donation_id: 'DON-2024-002', donor_id: 'DNR-002', donor_name: 'Priya Menon', bank_id: 'BNK-2024-KL-00001', check_id: 'HC-002', donation_date: '2024-10-10', quantity_ml: 450, blood_group: 'A+' },
    { donation_id: 'DON-2024-003', donor_id: 'DNR-003', donor_name: 'Rahul Krishnan', bank_id: 'BNK-2024-KL-00001', check_id: 'HC-003', donation_date: '2024-12-05', quantity_ml: 450, blood_group: 'B-' },
    { donation_id: 'DON-2024-004', donor_id: 'DNR-005', donor_name: 'Vineeth Kumar', bank_id: 'BNK-2024-KL-00001', check_id: 'HC-004', donation_date: '2024-08-15', quantity_ml: 350, blood_group: 'O-' },
]

export const mockIncomingRequests = [
    { request_id: 'REQ-2025-001', hospital_id: 'HSP-001', hospital_name: 'General Hospital', patient_id: 'PAT-001', patient_name: 'Suresh Kumar', bank_id: 'BNK-2024-KL-00001', blood_group: 'B-', units_required: 2, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency' },
    { request_id: 'REQ-2025-002', hospital_id: 'HSP-002', hospital_name: 'Medical College', patient_id: 'PAT-002', patient_name: 'Rajan Pillai', bank_id: 'BNK-2024-KL-00001', blood_group: 'O+', units_required: 3, request_date: '2025-01-14', status: 'Processing', priority: 'Urgent' },
    { request_id: 'REQ-2025-003', hospital_id: 'HSP-001', hospital_name: 'General Hospital', patient_id: 'PAT-003', patient_name: 'Meera Nair', bank_id: 'BNK-2024-KL-00001', blood_group: 'A+', units_required: 1, request_date: '2025-01-13', status: 'Fulfilled', priority: 'Routine' },
    { request_id: 'REQ-2025-004', hospital_id: 'HSP-003', hospital_name: 'KIMS Hospital', patient_id: 'PAT-004', patient_name: 'Lakshmi Devi', bank_id: 'BNK-2024-KL-00001', blood_group: 'AB+', units_required: 4, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency' },
]

export const mockBloodIssues = [
    { issue_id: 'ISS-2025-001', request_id: 'REQ-2025-003', hospital_name: 'General Hospital', blood_group: 'A+', issue_date: '2025-01-13', units_issued: 1 },
    { issue_id: 'ISS-2025-002', request_id: 'REQ-2025-002', hospital_name: 'Medical College', blood_group: 'O+', issue_date: '2025-01-14', units_issued: 2 },
]

export const mockBBPayments = [
    { payment_id: 'PAY-2025-001', hospital_id: 'HSP-002', hospital_name: 'Medical College', bank_id: 'BNK-2024-KL-00001', request_id: 'REQ-2025-003', amount: 500, payment_date: '2025-01-13', payment_status: 'Paid' },
    { payment_id: 'PAY-2025-002', hospital_id: 'HSP-001', hospital_name: 'General Hospital', bank_id: 'BNK-2024-KL-00001', request_id: 'REQ-2025-001', amount: 1000, payment_date: '2025-01-15', payment_status: 'Pending' },
    { payment_id: 'PAY-2025-003', hospital_id: 'HSP-003', hospital_name: 'KIMS Hospital', bank_id: 'BNK-2024-KL-00001', request_id: 'REQ-2025-004', amount: 2000, payment_date: '2025-01-15', payment_status: 'Pending' },
]

export const mockStockTrendData = [
    { date: 'Jan 10', 'O+': 220, 'A+': 130, 'B+': 100, 'O-': 25 },
    { date: 'Jan 11', 'O+': 210, 'A+': 125, 'B+': 98, 'O-': 22 },
    { date: 'Jan 12', 'O+': 205, 'A+': 120, 'B+': 95, 'O-': 20 },
    { date: 'Jan 13', 'O+': 215, 'A+': 118, 'B+': 97, 'O-': 19 },
    { date: 'Jan 14', 'O+': 208, 'A+': 122, 'B+': 96, 'O-': 18 },
    { date: 'Jan 15', 'O+': 200, 'A+': 120, 'B+': 95, 'O-': 18 },
]

export const mockDonationTrendData = [
    { month: 'Aug', donations: 18, quantity_ml: 8100 },
    { month: 'Sep', donations: 22, quantity_ml: 9900 },
    { month: 'Oct', donations: 19, quantity_ml: 8550 },
    { month: 'Nov', donations: 25, quantity_ml: 11250 },
    { month: 'Dec', donations: 20, quantity_ml: 9000 },
    { month: 'Jan', donations: 14, quantity_ml: 6300 },
]

export const mockPaymentTrendData = [
    { month: 'Aug', received: 1200, pending: 300 },
    { month: 'Sep', received: 1800, pending: 500 },
    { month: 'Oct', received: 900, pending: 200 },
    { month: 'Nov', received: 2200, pending: 400 },
    { month: 'Dec', received: 1500, pending: 100 },
    { month: 'Jan', received: 500, pending: 3000 },
]

export const mockStockAuditLog = [
    { date: '2025-01-15 09:00', blood_group: 'O+', prev: 205, curr: 200, change: -5, by: 'Dr. Suresh Menon' },
    { date: '2025-01-14 14:30', blood_group: 'A+', prev: 115, curr: 122, change: +7, by: 'Nurse Rekha' },
    { date: '2025-01-13 10:00', blood_group: 'A+', prev: 118, curr: 115, change: -3, by: 'Dr. Suresh Menon' },
    { date: '2025-01-12 16:00', blood_group: 'B-', prev: 15, curr: 12, change: -3, by: 'Nurse Rekha' },
    { date: '2025-01-11 09:30', blood_group: 'O-', prev: 22, curr: 18, change: -4, by: 'Dr. Suresh Menon' },
]
