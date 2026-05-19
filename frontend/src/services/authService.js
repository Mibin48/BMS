import api from './api.js'

export const authService = {

    registerDonor: (data) =>
        api.post('/auth/register/donor', data),

    registerHospital: (data) =>
        api.post('/auth/register/hospital', data),

    registerBloodBank: (data) =>
        api.post('/auth/register/bloodbank', data),

    login: (data) =>
        api.post('/auth/login', data),

    sendOTP: (phone) =>
        api.post('/auth/send-otp', { phone }),

    verifyOTP: (phone, otp) =>
        api.post('/auth/verify-otp', { phone, otp }),

    otpLogin: (data) =>
        api.post('/auth/otp-login', data),

    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (data) =>
        api.post('/auth/reset-password', data),

    refreshToken: (refresh_token) =>
        api.post('/auth/refresh-token', { refresh_token }),

    logout: () =>
        api.post('/auth/logout'),

    reapply: (email) =>
        api.post('/auth/reapply', { email }),

    getMe: () =>
        api.get('/auth/me')
}
