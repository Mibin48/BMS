export const mockHospital = {
    hospital_id: 'HSP-2024-KL-00112',
    hospital_name: 'KIMS Hospital',
    city: 'Thiruvananthapuram',
    contact_number: '+91 471 234 5678',
    admin_name: 'Dr. Anitha Krishnan',
    role: 'Medical Superintendent',
    beds: 340,
    departments: ['Emergency', 'Surgery', 'Oncology', 'Maternity'],
}

export const mockPatients = [
    { patient_id: 'PAT-2024-001', hospital_id: 'HSP-2024-KL-00112', name: 'Rajan Pillai', age: 45, gender: 'Male', blood_group: 'O+', ward: 'Surgery', admitted_on: '2025-01-10', status: 'Admitted' },
    { patient_id: 'PAT-2024-002', hospital_id: 'HSP-2024-KL-00112', name: 'Meera Nair', age: 32, gender: 'Female', blood_group: 'A+', ward: 'Maternity', admitted_on: '2025-01-12', status: 'Admitted' },
    { patient_id: 'PAT-2024-003', hospital_id: 'HSP-2024-KL-00112', name: 'Suresh Kumar', age: 60, gender: 'Male', blood_group: 'B-', ward: 'Oncology', admitted_on: '2025-01-08', status: 'Critical' },
    { patient_id: 'PAT-2024-004', hospital_id: 'HSP-2024-KL-00112', name: 'Lakshmi Devi', age: 28, gender: 'Female', blood_group: 'AB+', ward: 'Emergency', admitted_on: '2025-01-15', status: 'Stable' },
    { patient_id: 'PAT-2024-005', hospital_id: 'HSP-2024-KL-00112', name: 'Arun Menon', age: 52, gender: 'Male', blood_group: 'O-', ward: 'Surgery', admitted_on: '2025-01-14', status: 'Stable' },
]

export const mockBloodRequests = [
    { request_id: 'REQ-2025-001', hospital_id: 'HSP-2024-KL-00112', patient_id: 'PAT-2024-003', patient_name: 'Suresh Kumar', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', blood_group: 'B-', units_required: 2, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency', ward: 'Oncology' },
    { request_id: 'REQ-2025-002', hospital_id: 'HSP-2024-KL-00112', patient_id: 'PAT-2024-001', patient_name: 'Rajan Pillai', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', blood_group: 'O+', units_required: 3, request_date: '2025-01-14', status: 'Fulfilled', priority: 'Urgent', ward: 'Surgery' },
    { request_id: 'REQ-2025-003', hospital_id: 'HSP-2024-KL-00112', patient_id: 'PAT-2024-005', patient_name: 'Arun Menon', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', blood_group: 'O-', units_required: 1, request_date: '2025-01-14', status: 'Processing', priority: 'Routine', ward: 'Surgery' },
    { request_id: 'REQ-2025-004', hospital_id: 'HSP-2024-KL-00112', patient_id: 'PAT-2024-002', patient_name: 'Meera Nair', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', blood_group: 'A+', units_required: 2, request_date: '2025-01-13', status: 'Fulfilled', priority: 'Routine', ward: 'Maternity' },
    { request_id: 'REQ-2025-005', hospital_id: 'HSP-2024-KL-00112', patient_id: 'PAT-2024-004', patient_name: 'Lakshmi Devi', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', blood_group: 'AB+', units_required: 4, request_date: '2025-01-15', status: 'Pending', priority: 'Emergency', ward: 'Emergency' },
]

export const mockBloodIssues = [
    { issue_id: 'ISS-2025-001', request_id: 'REQ-2025-002', issue_date: '2025-01-14', units_issued: 3 },
    { issue_id: 'ISS-2025-002', request_id: 'REQ-2025-004', issue_date: '2025-01-13', units_issued: 2 },
]

export const mockPayments = [
    { payment_id: 'PAY-2025-001', hospital_id: 'HSP-2024-KL-00112', bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', request_id: 'REQ-2025-002', amount: 1500, payment_date: '2025-01-14', payment_status: 'Paid' },
    { payment_id: 'PAY-2025-002', hospital_id: 'HSP-2024-KL-00112', bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', request_id: 'REQ-2025-004', amount: 1000, payment_date: '2025-01-13', payment_status: 'Paid' },
    { payment_id: 'PAY-2025-003', hospital_id: 'HSP-2024-KL-00112', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', request_id: 'REQ-2025-001', amount: 2000, payment_date: '2025-01-15', payment_status: 'Pending' },
    { payment_id: 'PAY-2025-004', hospital_id: 'HSP-2024-KL-00112', bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', request_id: 'REQ-2025-005', amount: 4000, payment_date: '2025-01-15', payment_status: 'Pending' },
]

export const mockHospitalBanks = [
    {
        bank_id: 'BNK-001', bank_name: 'KIMS Blood Bank', city: 'Thiruvananthapuram', contact_number: '+91 471 234 5678', distance_km: 0.5, open: true,
        stock: { 'A+': 120, 'A-': 40, 'B+': 95, 'B-': 12, 'O+': 200, 'O-': 35, 'AB+': 60, 'AB-': 8 },
    },
    {
        bank_id: 'BNK-002', bank_name: 'Amrita Blood Bank', city: 'Ernakulam', contact_number: '+91 484 234 5678', distance_km: 210, open: true,
        stock: { 'A+': 80, 'A-': 20, 'B+': 60, 'B-': 5, 'O+': 150, 'O-': 18, 'AB+': 40, 'AB-': 3 },
    },
    {
        bank_id: 'BNK-003', bank_name: 'Medical College Blood Bank', city: 'Kozhikode', contact_number: '+91 495 234 5678', distance_km: 380, open: true,
        stock: { 'A+': 45, 'A-': 10, 'B+': 30, 'B-': 2, 'O+': 90, 'O-': 8, 'AB+': 20, 'AB-': 1 },
    },
]

export const mockRequestChartData = [
    { month: 'Aug', requests: 8, fulfilled: 7 },
    { month: 'Sep', requests: 12, fulfilled: 11 },
    { month: 'Oct', requests: 10, fulfilled: 9 },
    { month: 'Nov', requests: 15, fulfilled: 14 },
    { month: 'Dec', requests: 9, fulfilled: 8 },
    { month: 'Jan', requests: 5, fulfilled: 3 },
]

export const mockBloodGroupDemand = [
    { group: 'O+', units: 12 },
    { group: 'A+', units: 8 },
    { group: 'B-', units: 6 },
    { group: 'AB+', units: 5 },
    { group: 'O-', units: 4 },
    { group: 'B+', units: 3 },
]

export const mockPaymentChartData = [
    { month: 'Aug', paid: 3500, pending: 500 },
    { month: 'Sep', paid: 4200, pending: 1000 },
    { month: 'Oct', paid: 2800, pending: 800 },
    { month: 'Nov', paid: 5100, pending: 600 },
    { month: 'Dec', paid: 3900, pending: 200 },
    { month: 'Jan', paid: 2500, pending: 6000 },
]
