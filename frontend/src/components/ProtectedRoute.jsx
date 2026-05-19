import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, role: requiredRole }) => {
    const { isAuthenticated, role, loading, showExpiryModal } = useAuth()
    const location = useLocation()

    // Still checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-[#07070B] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#D90025] border-t-transparent rounded-full animate-spin" />
                    <p className="font-mono text-[#D90025] text-sm tracking-widest">
                        LOADING...
                    </p>
                </div>
            </div>
        )
    }

    // Not logged in (don't redirect if we are just showing the expiry modal background)
    if (!isAuthenticated && !showExpiryModal) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        )
    }

    // Wrong role
    if (requiredRole && role !== requiredRole) {
        return (
            <Navigate
                to={`/${role}/dashboard`}
                replace
            />
        )
    }

    return children
}

export default ProtectedRoute
