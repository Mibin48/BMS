import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';
import AuthLayout from '../auth/AuthLayout';
import AuthButton from '../auth/AuthButton';
import AuthInput from '../auth/AuthInput';
import OTPInput from '../auth/OTPInput';
import { Lock } from 'lucide-react';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
});

export default function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        phone,
        email,
        mode = 'phone',
    } = location.state || {};

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpSuccess, setOtpSuccess] = useState(false);
    const [countdown, setCountdown] = useState(45);
    const [canResend, setCanResend] = useState(false);
    const [attempts, setAttempts] = useState(3);
    const [error, setError] = useState(null);

    // Password reset fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showResetFields, setShowResetFields] = useState(false);

    // Redirect if no valid state
    useEffect(() => {
        if (!phone && !email) {
            navigate('/login');
        }
    }, [phone, email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (canResend) return;
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(timer); setCanResend(true); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [canResend]);

    const handleVerify = async () => {
        if (otp.length < 6) return;
        setLoading(true);
        setError(null);

        if (mode === 'phone') {
            // Phone verification
            try {
                await authService.verifyOTP(phone, otp);
                setOtpSuccess(true);
                setOtpError(false);
                toast.success('Phone verified! ✓');
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Account verified. Please login.' },
                    });
                }, 2000);
            } catch (err) {
                const msg = err.response?.data?.message || 'Invalid OTP';
                setError(msg);
                toast.error(msg);
                setOtpError(true);
                setAttempts(a => a - 1);
                setTimeout(() => setOtpError(false), 1000);
                setOtp('');
            } finally {
                setLoading(false);
            }
        } else if (mode === 'login') {
            // New OTP Login Mode
            try {
                const res = await authService.otpLogin({
                    phone,
                    otp,
                    role: location.state?.role || 'donor'
                });
                
                setOtpSuccess(true);
                toast.success('Logged in successfully! ◈');
                
                // Store tokens using keys expected by AuthContext
                const { token, name, role, entity_id, user_id, redirect } = res.data.data;
                localStorage.setItem('hema_token', token);
                localStorage.setItem('hema_user', JSON.stringify({ name, role, entity_id, user_id }));
                
                // Set default axios header
                import('../services/api.js').then(m => {
                    m.default.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                });

                setTimeout(() => {
                    // Force a hard reload to the dashboard so AuthContext catches the new token
                    window.location.href = redirect;
                }, 1500);
            } catch (err) {
                const msg = err.response?.data?.message || 'Login failed';
                setError(msg);
                toast.error(msg);
                setOtpError(true);
                setAttempts(a => a - 1);
                setTimeout(() => setOtpError(false), 1000);
            } finally {
                setLoading(false);
            }
        } else if (mode === 'reset') {
            // Password reset mode: show password fields after OTP entry
            if (!showResetFields) {
                setShowResetFields(true);
                setLoading(false);
                return;
            }

            // Validate passwords
            if (newPassword.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }
            if (newPassword !== confirmPass) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            try {
                await authService.resetPassword({
                    email,
                    otp,
                    new_password: newPassword,
                });
                setOtpSuccess(true);
                toast.success('Password reset! Please login.');
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Password reset successful. Please login with your new password.' },
                    });
                }, 2000);
            } catch (err) {
                const msg = err.response?.data?.message || 'Reset failed';
                setError(msg);
                toast.error(msg);
                setOtpError(true);
                setTimeout(() => setOtpError(false), 1000);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        try {
            if (mode === 'phone') {
                await authService.sendOTP(phone);
            } else {
                await authService.forgotPassword(email);
            }
            toast.success('New OTP sent!');
        } catch (err) {
            toast.error('Failed to resend OTP');
        }
        setCountdown(45);
        setCanResend(false);
        setOtp('');
        setError(null);
    };

    const displayTarget = (mode === 'phone' || mode === 'login')
        ? (phone ? phone : 'your phone number')
        : (email || 'your email address');

    const headerTitle = mode === 'reset' && showResetFields
        ? 'Set New Password'
        : 'Enter Verification Code';

    const headerDesc = mode === 'reset' && showResetFields
        ? 'Enter your new password below'
        : (mode === 'login' || mode === 'phone')
            ? 'We sent a 6-digit code to your phone'
            : 'We sent a 6-digit code to';

    return (
        <AuthLayout
            tagline={['VERIFY', 'YOUR', 'IDENTITY']}
            subtitle={mode === 'reset' ? 'Reset your password with OTP' : 'OTP sent to your registered phone number'}
            backTo="/login"
            backLabel="Back to Login"
        >
            <AnimatePresence mode="wait">
                {otpSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '40px 0' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}
                            style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}
                        >
                            <CheckCircle size={40} color="#22c55e" />
                        </motion.div>
                        <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
                            {mode === 'reset' ? 'Password Reset!' : 'Identity Verified!'}
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', marginBottom: 8 }}>Redirecting to login...</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#22c55e' }}>◈ {mode === 'reset' ? 'PASSWORD UPDATED' : 'SESSION AUTHENTICATED'}</p>
                    </motion.div>
                ) : (
                    <motion.div key="form">
                        <motion.div {...fadeUp(0)} style={{ marginBottom: 36 }}>
                            <h1 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 30, marginBottom: 8 }}>{headerTitle}</h1>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--text2)', fontSize: 15 }}>{headerDesc}</p>
                            {!(mode === 'reset' && showResetFields) && (
                                <p style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16, color: '#fff', marginTop: 4 }}>{displayTarget}</p>
                            )}
                        </motion.div>

                        {/* OTP Boxes (always visible unless reset password fields shown) */}
                        {!showResetFields && (
                            <motion.div {...fadeUp(0.1)} style={{ marginBottom: 24 }}>
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    error={otpError}
                                    success={otpSuccess}
                                />
                                {otpError && (
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)', marginTop: 12 }}>
                                        {error || 'Invalid OTP.'} {attempts > 0 && `${attempts} attempt${attempts !== 1 ? 's' : ''} remaining.`}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Reset password fields */}
                        {showResetFields && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginBottom: 24 }}
                            >
                                <div style={{
                                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: 12, padding: '10px 16px', marginBottom: 20,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <CheckCircle size={14} color="#22c55e" />
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e' }}>OTP verified — set your new password</span>
                                </div>
                                <AuthInput
                                    label="NEW PASSWORD" type="password"
                                    placeholder="Min 6 characters"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    icon={Lock} required
                                />
                                <AuthInput
                                    label="CONFIRM PASSWORD" type="password"
                                    placeholder="Re-enter password"
                                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                                    icon={Lock} required
                                />
                                {error && (
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)', marginTop: 8 }}>
                                        {error}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Resend */}
                        {!showResetFields && (
                            <motion.div {...fadeUp(0.15)} style={{ marginBottom: 28 }}>
                                {canResend ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Didn't receive it?</span>
                                        <button onClick={handleResend} style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: 'var(--red)', padding: 0,
                                        }}>Resend OTP</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Didn't receive it?</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)' }}>
                                            Resend in 0:{countdown.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <motion.div {...fadeUp(0.2)} style={{ marginBottom: 24 }}>
                            <AuthButton
                                variant="primary" fullWidth loading={loading}
                                disabled={showResetFields ? false : otp.length < 6}
                                onClick={handleVerify}
                            >
                                {showResetFields ? 'Reset Password →' : mode === 'reset' ? 'Verify OTP →' : 'Verify & Continue →'}
                            </AuthButton>
                        </motion.div>

                        <motion.div {...fadeUp(0.25)} style={{ textAlign: 'center' }}>
                            <Link to="/login" style={{
                                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)',
                                textDecoration: 'none',
                            }}>← Back to Login</Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}
