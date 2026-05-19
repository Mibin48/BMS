import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert, ArrowRight } from 'lucide-react';

export default function SessionExpiredModal({ isOpen, onConfirm }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(5, 5, 8, 0.85)',
                            backdropFilter: 'blur(12px)'
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'relative', width: '100%', maxWidth: 440,
                            background: '#0A0A0F',
                            border: '1px solid rgba(217, 0, 37, 0.2)',
                            borderRadius: 24, padding: 40,
                            textAlign: 'center',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 40px rgba(217, 0, 37, 0.1)'
                        }}
                    >
                        {/* Status Icon */}
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(217, 0, 37, 0.05)',
                            border: '1px solid rgba(217, 0, 37, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 28px',
                            position: 'relative'
                        }}>
                            <ShieldAlert size={36} color="var(--red)" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid var(--red)', opacity: 0.1 }}
                            />
                        </div>

                        <h2 style={{
                            fontFamily: 'var(--font-head)', fontSize: 32, color: '#fff',
                            marginBottom: 16, letterSpacing: '-0.02em'
                        }}>
                            SESSION EXPIRED
                        </h2>

                        <p style={{
                            fontFamily: 'var(--font-body)', color: 'var(--text2)',
                            fontSize: 16, lineHeight: 1.6, marginBottom: 32, fontWeight: 300
                        }}>
                            For your security, your session has timed out. Please sign in again to continue accessing the account.
                        </p>

                        <button
                            onClick={onConfirm}
                            style={{
                                width: '100%', padding: '16px', borderRadius: 14,
                                background: 'var(--red)', color: '#fff', border: 'none',
                                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 10, letterSpacing: '0.1em',
                                boxShadow: '0 8px 20px rgba(217, 0, 37, 0.25)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            RE-AUTHENTICATE <ArrowRight size={18} />
                        </button>

                        <div style={{
                            marginTop: 24, padding: '12px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                            fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
                            letterSpacing: '0.1em', textTransform: 'uppercase'
                        }}>
                            ◈ SECURITY PROTOCOL 2026-B1 ◈
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
