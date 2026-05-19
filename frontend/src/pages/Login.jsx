import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Building, ShieldCheck, CheckCircle, AlertCircle, Droplets, Microscope, ChevronRight, Phone, Fingerprint, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import AuthLayout from '../auth/AuthLayout';
import AuthInput from '../auth/AuthInput';
import AuthButton from '../auth/AuthButton';
import CheckboxField from '../auth/CheckboxField';
import { authService } from '../services/authService';

// ── Role Definitions ──────────────────────────────────────────
const ROLES = [
    {
        id: 'donor',
        label: 'Donor',
        icon: Droplets,
        tagline: ['DONATE', 'BLOOD', 'SAVE', 'LIVES'],
        subtitle: 'Log in to manage your donations and track your impact.',
        badge: 'Donor',
        color: '#D90025',
    },
    {
        id: 'hospital',
        label: 'Hospital',
        icon: Building,
        tagline: ['AUTHORISED', 'HOSPITAL', 'SERVICES'],
        subtitle: 'Log in to request blood and manage your hospital needs.',
        badge: 'Hospital Staff',
        color: '#4F46E5',
    },
    {
        id: 'blood_bank',
        label: 'Blood Bank',
        icon: Microscope,
        tagline: ['BLOOD', 'BANK', 'SERVICES'],
        subtitle: 'Sign in to check blood stock and manage supply.',
        badge: 'Blood Bank',
        color: '#F59E0B',
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: ShieldCheck,
        tagline: ['ADMIN', 'PORTAL', 'ACCESS'],
        subtitle: 'Sign in to manage accounts and monitor the system.',
        badge: 'Administrator',
        color: '#71717A',
    },
];

// Map frontend role ids to backend role values
const ROLE_MAP = {
    donor: 'donor',
    hospital: 'hospital',
    blood_bank: 'bloodbank',
    admin: 'admin',
};

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
});

const ensurePlus91 = (val) => {
    if (!val) return '+91 ';
    const trimmed = val.trim();
    if (trimmed.startsWith('+91 ')) return trimmed;
    if (trimmed.startsWith('+91')) return '+91 ' + trimmed.substring(3).trim();
    return '+91 ' + trimmed;
};

const handlePhoneChange = (e, setter) => {
    let val = e.target.value;
    if (!val.startsWith('+91 ')) {
        setter('+91 ');
        return;
    }

    // Get only the numeric digits after +91 
    let digits = val.substring(4).replace(/\D/g, '').slice(0, 10);

    // Format: +91 XXXXX XXXXX
    let formatted = '+91 ';
    if (digits.length > 5) {
        formatted += digits.substring(0, 5) + ' ' + digits.substring(5);
    } else {
        formatted += digits;
    }

    setter(formatted);
};

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const queryRole = new URLSearchParams(location.search).get('role');

    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+91 ');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [shake, setShake] = useState(false);

    // Success message from registration or password reset
    const successMessage = location.state?.message;

    // Set role from query if present
    useEffect(() => {
        if (queryRole) {
            const role = ROLES.find(r => r.id === queryRole);
            if (role) setSelectedRole(role);
        }
    }, [queryRole]);

    const handleLogin = async () => {
        const newErrors = {};
        if (loginMethod === 'password') {
            if (!email) newErrors.email = 'Email address is required';
            if (!password) newErrors.password = 'Password is required';
        } else {
            const digitCount = phone.substring(4).replace(/\D/g, '').length;
            if (digitCount === 0) newErrors.phone = 'Phone number is required';
            else if (digitCount < 10) newErrors.phone = 'Please enter a valid 10-digit number';
        }

        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
        setErrors({});
        setError(null);
        setLoading(true);

        try {
            const backendRole = ROLE_MAP[selectedRole.id];

            if (loginMethod === 'password') {
                const redirect = await login(email, password, backendRole);
                toast.success('Login successful!');
                setSuccess(true);
                setTimeout(() => {
                    const from = location.state?.from?.pathname || redirect || `/${backendRole}/dashboard`;
                    navigate(from, { replace: true });
                }, 1800);
            } else {
                // Request OTP for Login
                await authService.sendOTP(phone);
                toast.success('OTP sent to your phone!');
                navigate('/verify-otp', {
                    state: { phone, mode: 'login', role: backendRole }
                });
            }

        } catch (err) {
            const msg = err.response?.data?.message || 'Authentication failed';
            setError(msg);
            setShake(true);
            setTimeout(() => setShake(false), 500);

            const lMsg = msg.toLowerCase();
            const isApprovalIssue = lMsg.includes('not approved') || lMsg.includes('pending') || lMsg.includes('rejected') || lMsg.includes('suspended');

            if (isApprovalIssue) {
                const status = err.response?.data?.data?.status || 'Pending';
                setTimeout(() => {
                    navigate('/pending-approval', { state: { email, role: selectedRole.id, status } });
                }, 1500);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSSORedirect = () => {
        window.location.href = "https://sso.entebhoomi.kerala.gov.in/sso/web/login";
    };

    if (success) {
        return (
            <AuthLayout tagline={selectedRole.tagline} subtitle={selectedRole.subtitle} backTo="/" backLabel="Back to home">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '60px 0' }}
                >
                    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 32px' }}>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            style={{
                                position: 'absolute', inset: 0,
                                borderRadius: '50%',
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <CheckCircle size={52} color="#22c55e" strokeWidth={1.5} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid #22c55e', opacity: 0 }}
                        />
                    </div>
                    <motion.h2
                        {...fadeUp(0.1)}
                        style={{ fontFamily: 'var(--font-head)', fontSize: 42, marginBottom: 12, color: '#fff' }}
                    >
                        LOGIN SUCCESSFUL
                    </motion.h2>
                    <motion.p
                        {...fadeUp(0.2)}
                        style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', marginBottom: 24, fontSize: 16 }}
                    >
                        Redirecting to {selectedRole.label} Dashboard...
                    </motion.p>
                    <motion.div
                        {...fadeUp(0.3)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '8px 20px', borderRadius: 100,
                            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)',
                            fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e',
                            letterSpacing: '0.15em'
                        }}
                    >
                        SIGNED IN AS {selectedRole.label.toUpperCase()}
                    </motion.div>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            tagline={selectedRole.tagline}
            subtitle={selectedRole.subtitle}
            badge={`WELCOME BACK ${selectedRole.label.toUpperCase()}`}
            backTo="/"
            backLabel="Back to home"
        >
            {/* Role Switcher */}
            <div style={{ marginBottom: 40, position: 'relative' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    background: 'rgba(10, 10, 15, 0.6)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 20, padding: 6, position: 'relative', overflow: 'hidden',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)'
                }}>
                    {/* Active Indicator Follower */}
                    <motion.div
                        layoutId="activeRoleIndicator"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            left: `${(ROLES.findIndex(r => r.id === selectedRole.id)) * 25}%`,
                            width: '25%', height: 'calc(100% - 12px)',
                            background: 'linear-gradient(135deg, rgba(217, 0, 37, 0.12), rgba(217, 0, 37, 0.04))',
                            border: '1px solid rgba(217, 0, 37, 0.4)',
                            borderRadius: 14, top: 6, zIndex: 0,
                            boxShadow: '0 0 20px rgba(217, 0, 37, 0.15), inset 0 0 10px rgba(217, 0, 37, 0.1)'
                        }}
                    />

                    {ROLES.map((role) => (
                        <motion.button
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedRole(role)}
                            style={{
                                position: 'relative', zIndex: 1,
                                background: 'transparent', border: 'none', outline: 'none',
                                padding: '16px 0', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <role.icon
                                size={20}
                                color={selectedRole.id === role.id ? 'var(--red)' : 'rgba(255,255,255,0.3)'}
                                style={{
                                    filter: selectedRole.id === role.id ? 'drop-shadow(0 0 8px rgba(217,0,37,0.6))' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                strokeWidth={selectedRole.id === role.id ? 2.5 : 1.5}
                            />
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: 10,
                                fontWeight: 800, letterSpacing: '0.1em',
                                color: selectedRole.id === role.id ? '#fff' : 'rgba(255,255,255,0.3)',
                                transition: 'all 0.3s ease'
                            }}>
                                {role.label.toUpperCase()}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                {/* Header Section */}
                <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: 'var(--red)', boxShadow: '0 0 10px var(--red)'
                        }} />
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 11,
                            color: 'var(--text3)', letterSpacing: '0.15em'
                        }}>
                            LOGIN AREA
                        </span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 44, marginBottom: 8, color: '#fff', lineHeight: 1 }}>
                        SIGN IN
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)' }}>
                        {loginMethod === 'password'
                            ? 'Please enter your email and password to continue.'
                            : 'Enter your registered phone number to receive a secure login code.'}
                    </p>
                </motion.div>

                {/* Notifications */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', marginBottom: 20 }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: 12, padding: '14px 18px',
                            }}>
                                <CheckCircle size={18} color="#22c55e" />
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#22c55e', margin: 0 }}>{successMessage}</p>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', marginBottom: 20 }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.2)',
                                borderRadius: 12, padding: '14px 18px',
                            }}>
                                <AlertCircle size={18} color="var(--red)" style={{ marginTop: 2 }} />
                                <div>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', margin: 0, opacity: 0.9 }}>{error}</p>
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                        {error.toLowerCase().includes('not found') && (
                                            <Link to="/register" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>CREATE AN ACCOUNT</Link>
                                        )}
                                        {error.toLowerCase().includes('password') && (
                                            <Link to="/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>FORGOT PASSWORD?</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Login Form */}
                <motion.div
                    {...fadeUp(0.1)}
                    style={{
                        animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none',
                        position: 'relative'
                    }}
                >
                    {loginMethod === 'password' ? (
                        <>
                            <AuthInput
                                label="EMAIL ADDRESS" type="email"
                                placeholder="Enter your email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                icon={Mail} required error={errors.email}
                            />
                            <AuthInput
                                label="PASSWORD" type="password"
                                placeholder="Enter your password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                icon={Lock} required error={errors.password}
                            />
                        </>
                    ) : (
                        <div style={{ marginBottom: 24 }}>
                            <AuthInput
                                label="PHONE NUMBER" type="tel"
                                placeholder="..."
                                value={phone} onChange={e => handlePhoneChange(e, setPhone)}
                                icon={Phone} required error={errors.phone}
                            />
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginTop: -12, marginBottom: 20 }}>
                                We will send a 6-digit code to this number.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        {loginMethod === 'password' ? (
                            <>
                                <CheckboxField label="Remember me" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                <Link to="/forgot-password" style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
                                    textDecoration: 'none', letterSpacing: '0.05em'
                                }}>
                                    FORGOT PASSWORD?
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => setLoginMethod('password')}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--red)',
                                    fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
                                    letterSpacing: '0.05em', padding: 0,
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                <ArrowLeft size={16} /> BACK TO PASSWORD
                            </button>
                        )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <AuthButton variant="primary" fullWidth loading={loading} onClick={handleLogin}>
                            {loginMethod === 'password' ? 'LOG IN' : 'GET ONE-TIME OTP'} <ChevronRight size={16} style={{ marginLeft: 4 }} />
                        </AuthButton>
                    </div>
                </motion.div>

                {/* Alternative Auth */}
                <motion.div {...fadeUp(0.2)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06))' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em' }}>OTHER OPTIONS</span>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
                        <AuthButton variant="ghost" icon={Building} onClick={handleSSORedirect}>
                            GOVT. SSO
                        </AuthButton>
                        <AuthButton
                            variant={loginMethod === 'otp' ? 'primary' : 'ghost'}
                            icon={Fingerprint}
                            onClick={() => setLoginMethod(loginMethod === 'otp' ? 'password' : 'otp')}
                        >
                            {loginMethod === 'otp' ? 'VIA PASSWORD' : 'ONE-TIME OTP'}
                        </AuthButton>
                    </div>

                    <div style={{
                        textAlign: 'center', padding: '24px 0',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>
                            New to HEM∆?
                        </span>
                        <Link to="/register" style={{
                            fontFamily: 'var(--font-head)', fontSize: 20,
                            color: 'var(--red)', textDecoration: 'none', letterSpacing: '0.05em'
                        }}>
                            REGISTER HERE →
                        </Link>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </AuthLayout>
    );
}
