import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ children, onClose, title, subtitle, icon: Icon, maxWidth = 520 }) {
    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#0F0F17', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, width: '100%', maxWidth,
                    maxHeight: '90vh', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    {Icon && (
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(217,0,37,0.10)', border: '1px solid rgba(217,0,37,0.20)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon size={16} color="#D90025" />
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{title}</p>
                        {subtitle && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4', marginTop: 2 }}>{subtitle}</p>}
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        color: '#9B9BA4', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9B9BA4'; }}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ModalFooter({ children }) {
    return (
        <div style={{
            padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        }}>
            {children}
        </div>
    );
}
