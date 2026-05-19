import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LogIn, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../auth/AuthLayout';
import AuthButton from '../auth/AuthButton';
import { authService } from '../services/authService';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
});

const getTimeline = (status) => {
    const isRejected = status.toLowerCase() === 'rejected';
    const isApproved = status.toLowerCase() === 'approved';

    return [
        {
            icon: '✓', label: 'Application Submitted', desc: 'Application received',
            time: 'Completed', status: 'done', color: '#22c55e',
        },
        {
            icon: isRejected ? '×' : '⟳', 
            label: isRejected ? 'Application Rejected' : 'Under Review', 
            desc: isRejected ? 'Verification failed' : 'Verifying Health Dept. credentials',
            time: isRejected ? 'Final Decision' : 'In progress · Est. 24 hours', 
            status: isRejected ? 'error' : 'active', 
            color: isRejected ? 'var(--red)' : '#f59e0b',
        },
        {
            icon: '○', label: 'Account Activated', desc: 'Access granted to HEM∆ dashboard',
            time: isRejected ? 'Terminated' : 'Pending', 
            status: isRejected ? 'hidden' : 'upcoming', 
            color: 'var(--text3)',
        },
    ].filter(s => s.status !== 'hidden');
};

export default function PendingApproval() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [checking, setChecking] = useState(false);

    const {
        ref_number,
        org_name,
        type,
        email,
        status: initialStatus,
    } = location.state || {};
    
    const [status, setStatus] = useState(initialStatus || 'Pending');
    const isRejected = status.toLowerCase() === 'rejected';

    const reapplyApi = useApi(authService.reapply, {
        onSuccess: async (result) => {
            // Use logout from context to clear state and storage
            await logout();
            
            toast.success('Previous application cleared');
            
            const role = type?.toLowerCase().replace(' ', '_');
            navigate('/register', { 
                state: { 
                    role: role === 'blood_bank' ? 'blood_bank' : role,
                    email,
                    prevData: result // result is the prevData from backend
                },
                replace: true
            });
        }
    });

    const handleReapply = () => {
        if (window.confirm('This will clear your previous rejected application so you can register again. Continue?')) {
            reapplyApi.execute(email);
        }
    };

    const checkStatus = async () => {
        setChecking(true);
        try {
            // Just a user feedback action — actual approval check is via login attempt
            toast('Check your email for approval notification.', { icon: 'ℹ️' });
        } finally {
            setTimeout(() => setChecking(false), 1000);
        }
    };

    return (
        <AuthLayout
            tagline={['ALMOST', 'THERE,', 'HANG ON.']}
            subtitle="Your application is being reviewed by our team"
            backTo="/login"
            backLabel="Back to Login"
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 20 }}>
                {/* Animated clock icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 28,
                        boxShadow: '0 0 50px rgba(217,0,37,0.1)',
                    }}
                >
                    <Clock
                        size={56}
                        color="var(--red)"
                        style={{ animation: 'spin 8s linear infinite' }}
                    />
                </motion.div>

                <motion.h2 {...fadeUp(0.1)} style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
                    {isRejected ? 'Application Rejected' : 'Application Under Review'}
                </motion.h2>

                {/* Show org name and type if available */}
                {org_name && (
                    <motion.div {...fadeUp(0.12)} style={{ marginBottom: 8 }}>
                        <p style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 2 }}>
                            {org_name}
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em' }}>
                            {type || 'Organization'} Registration
                        </p>
                    </motion.div>
                )}

                <motion.p {...fadeUp(0.15)} style={{
                    fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16,
                    color: 'var(--text2)', lineHeight: 1.7, maxWidth: 380, marginBottom: 36,
                }}>
                    {isRejected 
                        ? 'Your application could not be verified by the Health Dept. team. Please contact support for more details.' 
                        : 'Our Kerala Health Department verification team is reviewing your credentials.'}
                </motion.p>

                {/* Timeline card */}
                <motion.div
                    {...fadeUp(0.2)}
                    style={{
                        width: '100%', maxWidth: 480, background: 'var(--card)',
                        border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px',
                        marginBottom: 24, textAlign: 'left',
                    }}
                >
                    {getTimeline(status).map(({ icon, label, desc, time, status: sStatus, color }, i, arr) => (
                        <div key={label} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                            {/* Connecting line */}
                            {i < arr.length - 1 && (
                                <div style={{
                                    position: 'absolute', left: 11, top: 28, bottom: -16,
                                    width: 1, borderLeft: '1px dashed rgba(255,255,255,0.1)',
                                }} />
                            )}
                            {/* Node */}
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                background: sStatus === 'done' ? '#22c55e' : sStatus === 'active' ? '#f59e0b' : sStatus === 'error' ? 'var(--red)' : 'transparent',
                                border: `2px solid ${color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700, color: (sStatus !== 'upcoming') ? '#fff' : color,
                                animation: sStatus === 'active' ? 'pulse 2s infinite' : 'none',
                                marginTop: 2,
                            }}>
                                {sStatus === 'done' ? (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ) : sStatus === 'active' ? (
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', display: 'block', animation: 'spin 0.8s linear infinite' }} />
                                ) : sStatus === 'error' ? (
                                    <span style={{ fontWeight: 800 }}>×</span>
                                ) : null}
                            </div>
                            {/* Content */}
                            <div style={{ paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: sStatus !== 'upcoming' ? '#fff' : 'var(--text3)', marginBottom: 4 }}>{label}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{desc}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: sStatus === 'active' ? '#f59e0b' : sStatus === 'error' ? 'var(--red)' : 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{time}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Reference number */}
                <motion.div
                    {...fadeUp(0.25)}
                    style={{
                        width: '100%', maxWidth: 480, background: 'var(--card)',
                        border: '1px solid var(--border)', borderRadius: 12, padding: '18px 24px',
                        marginBottom: 16, textAlign: 'left',
                    }}
                >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>APPLICATION REFERENCE</div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: 'var(--red)', marginBottom: 4 }}>
                        {ref_number || 'Check your email'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Save this for support queries</div>
                </motion.div>

                {/* Email notification */}
                {email && (
                    <motion.div {...fadeUp(0.27)} style={{
                        width: '100%', maxWidth: 480,
                        marginBottom: 16, textAlign: 'left',
                    }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
                            Updates will be sent to: <span style={{ color: '#fff', marginLeft: 4 }}>{email}</span>
                        </p>
                    </motion.div>
                )}

                {/* Buttons */}
                <motion.div {...fadeUp(0.3)} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!isRejected ? (
                        <AuthButton variant="ghost" fullWidth icon={RefreshCw} loading={checking} onClick={checkStatus}>
                            Check Approval Status
                        </AuthButton>
                    ) : (
                        <AuthButton fullWidth icon={RefreshCw} loading={reapplyApi.loading} onClick={handleReapply}>
                            Reapply Now
                        </AuthButton>
                    )}
                    <AuthButton variant="ghost" fullWidth icon={Mail}>Contact Support</AuthButton>
                    <AuthButton variant="ghost" fullWidth icon={LogIn} onClick={() => navigate('/login', { replace: true })}>
                        ← Back to Login
                    </AuthButton>
                </motion.div>

                <motion.div {...fadeUp(0.35)} style={{ marginTop: 28 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Expected activation within 24 business hours</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>support@hema.health · +91 471 XXX XXXX</p>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </AuthLayout>
    );
}
