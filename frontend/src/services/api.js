import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ── REQUEST INTERCEPTOR ──────────────────────────
// Auto-attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hema_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE INTERCEPTOR ─────────────────────────
// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config

    // 1. Token expired → try refresh once
    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem('hema_refresh')
    ) {
      original._retry = true
      try {
        const { data: responseBody } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {
            refresh_token: localStorage.getItem('hema_refresh')
          }
        )
        const newToken = responseBody.data.token
        localStorage.setItem('hema_token', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)

      } catch (refreshErr) {
        // Refresh failed → clear storage and notify AuthContext
        localStorage.removeItem('hema_token')
        localStorage.removeItem('hema_refresh')
        localStorage.removeItem('hema_user')
        window.dispatchEvent(new CustomEvent('auth:expired'))
        return Promise.reject(refreshErr)
      }
    }

    // 2. If 401 and no refresh token or retry failed, dispatch expiry
    // skip dispatch if it's already a logout request to avoid loops
    if (error.response?.status === 401 && !original.url?.includes('/auth/logout')) {
        localStorage.removeItem('hema_token')
        localStorage.removeItem('hema_refresh')
        localStorage.removeItem('hema_user')
        window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  }
)

export default api
