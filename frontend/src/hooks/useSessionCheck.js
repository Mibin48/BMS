import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

/**
 * useSessionCheck
 * Listens for the custom 'auth:expired' event dispatched by the
 * axios response interceptor when token refresh fails (401 loop).
 * Automatically logs the user out, shows a toast, and redirects
 * to the login page.
 *
 * Mount this once in a top-level component (e.g. App.jsx).
 */
export default function useSessionCheck() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const handleExpired = async () => {
            try {
                await logout();
            } catch (_) {
                // Already clearing local state
            }
            toast.error('Session expired. Please login again.', {
                id: 'session-expired',
                duration: 5000,
                icon: '🔒',
            });
            navigate('/login', { replace: true });
        };

        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, [logout, navigate]);
}
