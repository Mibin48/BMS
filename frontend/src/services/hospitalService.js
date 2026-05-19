import api from './api.js'

export const hospitalService = {

    getProfile: () =>
        api.get('/hospital/profile'),

    updateProfile: (data) =>
        api.put('/hospital/profile', data),

    getDashboard: () =>
        api.get('/hospital/dashboard'),

    getStats: () =>
        api.get('/hospital/stats'),

    // Patients
    getPatients: (params) =>
        api.get('/hospital/patients', { params }),

    getPatientById: (id) =>
        api.get(`/hospital/patients/${id}`),

    createPatient: (data) =>
        api.post('/hospital/patients', data),

    updatePatient: (id, data) =>
        api.put(`/hospital/patients/${id}`, data),

    deletePatient: (id) =>
        api.delete(`/hospital/patients/${id}`),

    // Requests
    getRequests: (params) =>
        api.get('/hospital/requests', { params }),

    getRequestById: (id) =>
        api.get(`/hospital/requests/${id}`),

    createRequest: (data) =>
        api.post('/hospital/requests', data),

    cancelRequest: (id) =>
        api.put(`/hospital/requests/${id}/cancel`),

    // Issues
    getIssues: (params) =>
        api.get('/hospital/issues', { params }),

    getIssueById: (id) =>
        api.get(`/hospital/issues/${id}`),

    // Payments
    getPayments: (params) =>
        api.get('/hospital/payments', { params }),

    getPaymentById: (id) =>
        api.get(`/hospital/payments/${id}`),

    payNow: (id) =>
        api.post(`/hospital/payments/${id}/pay`),

    // Blood Banks
    getBloodBanks: (params) =>
        api.get('/hospital/blood-banks', { params }),

    getBankStock: (bank_id) =>
        api.get(`/hospital/blood-banks/${bank_id}/stock`)
}
