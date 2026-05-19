import api from './api.js'

export const adminService = {

    getDashboard: () =>
        api.get('/admin/dashboard'),

    getStats: () =>
        api.get('/admin/stats'),

    getDistrictStats: () =>
        api.get('/admin/stats/districts'),

    getTrends: (period = '6m') =>
        api.get('/admin/stats/trends', { params: { period } }),

    // Approvals
    getApprovals: (params) =>
        api.get('/admin/approvals', { params }),

    getApprovalById: (id) =>
        api.get(`/admin/approvals/${id}`),

    approveEntity: (id) =>
        api.put(`/admin/approvals/${id}/approve`),

    rejectEntity: (id, reason) =>
        api.put(`/admin/approvals/${id}/reject`, { reason }),

    // Donors
    getAllDonors: (params) =>
        api.get('/admin/donors', { params }),

    getDonorById: (id) =>
        api.get(`/admin/donors/${id}`),

    updateDonor: (id, data) =>
        api.put(`/admin/donors/${id}`, data),

    deleteDonor: (id) =>
        api.delete(`/admin/donors/${id}`),

    sendDonorReminder: (id) =>
        api.post(`/admin/donors/${id}/remind`),

    // Hospitals
    getAllHospitals: (params) =>
        api.get('/admin/hospitals', { params }),

    getHospitalById: (id) =>
        api.get(`/admin/hospitals/${id}`),

    updateHospital: (id, data) =>
        api.put(`/admin/hospitals/${id}`, data),

    deleteHospital: (id) =>
        api.delete(`/admin/hospitals/${id}`),

    // Blood Banks
    getAllBloodBanks: (params) =>
        api.get('/admin/blood-banks', { params }),

    getBloodBankById: (id) =>
        api.get(`/admin/blood-banks/${id}`),

    updateBloodBank: (id, data) =>
        api.put(`/admin/blood-banks/${id}`, data),

    deleteBloodBank: (id) =>
        api.delete(`/admin/blood-banks/${id}`),

    // Operations (read)
    getAllInventory: (params) =>
        api.get('/admin/inventory', { params }),

    updateInventoryStock: (bankId, stockId, data) =>
        api.put(`/admin/inventory/${bankId}/stock/${stockId}`, data),

    getAllRequests: (params) =>
        api.get('/admin/requests', { params }),

    getRequestById: (id) =>
        api.get(`/admin/requests/${id}`),

    getAllDonations: (params) =>
        api.get('/admin/donations', { params }),

    getAllHealthChecks: (params) =>
        api.get('/admin/health-checks', { params }),

    getAllIssues: (params) =>
        api.get('/admin/issues', { params }),

    updateIssueStatus: (id, status) =>
        api.put(`/admin/issues/${id}/status`, { status }),

    getAllPayments: (params) =>
        api.get('/admin/payments', { params }),

    updatePaymentStatus: (id, status) =>
        api.put(`/admin/payments/${id}/status`, { status }),

    // Users
    getUsers: (params) =>
        api.get('/admin/users', { params }),

    getUserById: (id) =>
        api.get(`/admin/users/${id}`),

    createAdmin: (data) =>
        api.post('/admin/users/create-admin', data),

    inviteUser: (data) =>
        api.post('/admin/users/invite', data),

    suspendUser: (id) =>
        api.put(`/admin/users/${id}/suspend`),

    activateUser: (id) =>
        api.put(`/admin/users/${id}/activate`),

    deleteUser: (id) =>
        api.delete(`/admin/users/${id}`),

    // Audit
    getAuditLogs: (params) =>
        api.get('/admin/audit', { params }),

    getAuditLogById: (id) =>
        api.get(`/admin/audit/${id}`),

    // Reports
    generateReport: (data) =>
        api.post('/admin/reports/generate', data),

    getReportHistory: () =>
        api.get('/admin/reports/history'),

    // Settings
    getSettings: () =>
        api.get('/admin/settings'),

    updateSettings: (data) =>
        api.put('/admin/settings', data)
}
