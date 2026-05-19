import api from './api.js'

export const donorService = {

    getProfile: () =>
        api.get('/donor/profile'),

    updateProfile: (data) =>
        api.put('/donor/profile', data),

    getHealthChecks: (params) =>
        api.get('/donor/health-checks', { params }),

    getHealthCheckById: (id) =>
        api.get(`/donor/health-checks/${id}`),

    getDonations: (params) =>
        api.get('/donor/donations', { params }),

    getDonationById: (id) =>
        api.get(`/donor/donations/${id}`),

    getEligibility: () =>
        api.get('/donor/eligibility'),

    getStats: (params) =>
        api.get('/donor/stats', { params }),

    getBloodBanks: (params) =>
        api.get('/blood-banks', { params }),

    getBankStock: (bank_id) =>
        api.get(`/blood-banks/${bank_id}/stock`),

    // Appointments
    getAppointments: () =>
        api.get('/donor/appointments'),

    bookAppointment: (data) =>
        api.post('/donor/appointments', data),

    cancelAppointment: (id) =>
        api.put(`/donor/appointments/${id}/cancel`),

    // Camps
    getAvailableCamps: (params) =>
        api.get('/donor/camps', { params }),

    getMyRSVPs: () =>
        api.get('/donor/my-rsvps'),

    rsvpToCamp: (camp_id, data) =>
        api.post(`/donor/camps/${camp_id}/rsvp`, data)
}

