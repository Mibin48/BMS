import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react'
import { authService } from '../services/authService.js'
import SessionExpiredModal from '../components/SessionExpiredModal.jsx'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showExpiryModal, setShowExpiryModal] = useState(false)

    // ── LOAD USER ON APP BOOT ──────────────────────
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('hema_token')

            if (!token) {
                setLoading(false)
                return
            }

            try {
                // Verify token is still valid
                const { data } = await authService.getMe()
                setUser(data.data)
                setRole(data.data.role)
            } catch (err) {
                // Token invalid → clear storage
                localStorage.removeItem('hema_token')
                localStorage.removeItem('hema_refresh')
                localStorage.removeItem('hema_user')
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // ── SESSION EXPIRY LISTENER ──────────────────
        const handleExpiry = () => {
            setShowExpiryModal(true)
            // We DON'T clear user/role immediately so the background dashboard stays visible
        }

        window.addEventListener('auth:expired', handleExpiry)
        return () => window.removeEventListener('auth:expired', handleExpiry)
    }, [])

    // ── LOGIN ──────────────────────────────────────
    const login = useCallback(async (email, password, userRole) => {
        setError(null)
        const { data: responseBody } = await authService.login({
            email,
            password,
            role: userRole
        })

        const data = responseBody.data;

        // Store tokens
        localStorage.setItem('hema_token', data.token)
        localStorage.setItem('hema_refresh', data.refresh_token)
        localStorage.setItem('hema_user', JSON.stringify({
            user_id: data.user_id,
            role: data.role,
            entity_id: data.entity_id,
            name: data.name
        }))

        setUser({
            user_id: data.user_id,
            role: data.role,
            entity_id: data.entity_id,
            name: data.name
        })
        setRole(data.role)

        // Return redirect path
        return data.redirect
    }, [])

    // ── LOGOUT ─────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authService.logout()
        } catch (_) {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem('hema_token')
            localStorage.removeItem('hema_refresh')
            localStorage.removeItem('hema_user')
            setUser(null)
            setRole(null)
        }
    }, [])

    // ── REGISTER ───────────────────────────────────
    const register = useCallback(async (roleType, formData) => {
        setError(null)
        let response

        switch (roleType) {
            case 'donor':
                response = await authService.registerDonor(formData)
                // Auto login donor - access nested data property
                const donorData = response.data.data
                if (donorData && donorData.token) {
                    localStorage.setItem('hema_token', donorData.token)
                    localStorage.setItem('hema_refresh', donorData.refresh_token)
                    setUser({
                        user_id: donorData.user_id,
                        role: 'donor',
                        entity_id: donorData.donor_id,
                        name: formData.name
                    })
                    setRole('donor')
                }
                break

            case 'hospital':
                response = await authService.registerHospital(formData)
                // No auto-login — pending approval
                break

            case 'bloodbank':
                response = await authService.registerBloodBank(formData)
                // No auto-login — pending approval
                break

            default:
                throw new Error(`Unknown role type: ${roleType}`)
        }

        return response.data.data
    }, [])

    // ── IS AUTHENTICATED ───────────────────────────
    const isAuthenticated = !!localStorage.getItem('hema_token') && !!user

    // ── CONTEXT VALUE ──────────────────────────────
    const value = {
        user,
        role,
        loading,
        error,
        isAuthenticated,
        showExpiryModal,
        login,
        logout,
        register,
        setError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
            <SessionExpiredModal 
                isOpen={showExpiryModal} 
                onConfirm={() => {
                    setShowExpiryModal(false)
                    setUser(null)
                    setRole(null)
                    window.location.href = '/login'
                }} 
            />
        </AuthContext.Provider>
    );
}

// Hook
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

export default AuthContext
