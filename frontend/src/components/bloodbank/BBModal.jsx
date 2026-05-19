import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BBModal({ children, onClose, title, subtitle, icon: Icon, maxWidth = 480 }) {
    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            {/* Backdrop */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(12px)' }} />
            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative', width: '100%', maxWidth,
                    background: '#0F0F17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                    boxShadow: '0 0 100px rgba(0,0,0,0.8)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                }}>
                {/* Header */}
                {title && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {Icon && (
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(217,0,37,0.10)', border: '1px solid rgba(217,0,37,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color="#D90025" />
                                </div>
                            )}
                            <div>
                                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, color: '#fff', fontSize: 16 }}>{title}</p>
                                {subtitle && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4', marginTop: 2 }}>{subtitle}</p>}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B9BA4', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9B9BA4'; }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Shared footer bar for modals
export function BBModalFooter({ children }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {children}
        </div>
    );
}
