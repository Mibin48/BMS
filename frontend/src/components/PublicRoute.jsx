import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const PublicRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth()

    if (loading) return null

    if (isAuthenticated) {
        return (
            <Navigate
                to={`/${role}/dashboard`}
                replace
            />
        )
    }

    return children
}

export default PublicRoute
