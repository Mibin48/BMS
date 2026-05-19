import api from './api.js'

export const bloodBankService = {

    getProfile: () =>
        api.get('/bloodbank/profile'),

    updateProfile: (data) =>
        api.put('/bloodbank/profile', data),

    getDashboard: () =>
        api.get('/bloodbank/dashboard'),

    getStats: () =>
        api.get('/bloodbank/stats'),

    // Inventory
    getInventory: () =>
        api.get('/bloodbank/inventory'),

    updateStock: (stock_id, data) =>
        api.put(`/bloodbank/inventory/${stock_id}`, data),

    // Donors
    getDonors: (params) =>
        api.get('/bloodbank/donors', { params }),

    getDonorById: (id) =>
        api.get(`/bloodbank/donors/${id}`),

    createDonor: (data) =>
        api.post('/bloodbank/donors', data),

    updateDonor: (id, data) =>
        api.put(`/bloodbank/donors/${id}`, data),

    recallDonors: (data) =>
        api.post('/bloodbank/donors/recall', data),

    // Health Checks
    getHealthChecks: (params) =>
        api.get('/bloodbank/health-checks', { params }),

    getHealthCheckById: (id) =>
        api.get(`/bloodbank/health-checks/${id}`),

    createHealthCheck: (data) =>
        api.post('/bloodbank/health-checks', data),

    // Donations
    getDonations: (params) =>
        api.get('/bloodbank/donations', { params }),

    getDonationById: (id) =>
        api.get(`/bloodbank/donations/${id}`),

    createDonation: (data) =>
        api.post('/bloodbank/donations', data),

    // Requests
    getRequests: (params) =>
        api.get('/bloodbank/requests', { params }),

    getRequestById: (id) =>
        api.get(`/bloodbank/requests/${id}`),

    approveRequest: (id) =>
        api.put(`/bloodbank/requests/${id}/approve`),

    rejectRequest: (id, reason) =>
        api.put(`/bloodbank/requests/${id}/reject`, { reason }),

    // Issues
    getIssues: (params) =>
        api.get('/bloodbank/issues', { params }),

    getIssueById: (id) =>
        api.get(`/bloodbank/issues/${id}`),

    createIssue: (data) =>
        api.post('/bloodbank/issues', data),

    // Payments
    getPayments: (params) =>
        api.get('/bloodbank/payments', { params }),

    markPaid: (id) =>
        api.put(`/bloodbank/payments/${id}/paid`),

    // Appointments
    getAppointments: (params) =>
        api.get('/bloodbank/appointments', { params }),

    updateAppointmentStatus: (id, status) =>
        api.put(`/bloodbank/appointments/${id}/status`, { status }),

    // Camps
    getCamps: () =>
        api.get('/bloodbank/camps'),

    createCamp: (data) =>
        api.post('/bloodbank/camps', data),

    updateCamp: (id, data) =>
        api.put(`/bloodbank/camps/${id}`, data),

    deleteCamp: (id) =>
        api.delete(`/bloodbank/camps/${id}`),

    getCampRSVPs: (id) =>
        api.get(`/bloodbank/camps/${id}/rsvps`)
}

