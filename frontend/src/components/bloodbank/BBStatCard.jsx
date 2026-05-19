import { useState } from 'react';
import { motion } from 'framer-motion';
import BBSkeleton from './BBSkeleton';

const colorMap = {
    red: { icon: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.15)', glow: 'rgba(220,38,38,0.1)' },
    green: { icon: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', glow: 'rgba(34,197,94,0.1)' },
    amber: { icon: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.1)' },
    blue: { icon: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', glow: 'rgba(59,130,246,0.1)' },
    white: { icon: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', glow: 'transparent' },
};

export default function BBStatCard({ label, value, sub, icon: Icon, color = 'red', trend, pulse, loading }) {
    const [hovered, setHovered] = useState(false);
    const c = colorMap[color] || colorMap.red;

    if (loading) return (
        <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, height: 160 }}>
            <BBSkeleton width="44px" height="44px" borderRadius="14px" style={{ marginBottom: 16 }} />
            <BBSkeleton width="50%" height="12px" style={{ marginBottom: 16 }} />
            <BBSkeleton width="80%" height="32px" />
        </div>
    );

    return (
        <motion.div 
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -4 }}
            style={{
                position: 'relative', overflow: 'hidden',
                background: 'rgba(15,15,23,0.6)', 
                border: `1px solid ${c.icon}40`, 
                borderRadius: 24, padding: 24,
                boxShadow: hovered ? `0 20px 40px -12px ${c.glow}40` : `inset 0 0 20px ${c.glow}20`, 
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
            }}
        >
            {/* Grid Overlay */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                backgroundImage: `linear-gradient(${c.icon}10 1px, transparent 1px), linear-gradient(90deg, ${c.icon}10 1px, transparent 1px)`,
                backgroundSize: '20px 20px', pointerEvents: 'none', opacity: 0.3, zIndex: 0 
            }} />

            {/* Liquid Ambient Background */}
            <motion.div
                animate={{ 
                    x: [0, 15, -15, 0], 
                    y: [0, -10, 10, 0] 
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', inset: '-50%',
                    background: `radial-gradient(circle at center, ${c.icon}03, transparent 40%)`,
                    pointerEvents: 'none'
                }}
            />

            {/* Hover Beam */}
            <motion.div
                variants={{
                    hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', inset: '1px',
                    background: `linear-gradient(90deg, transparent, ${c.icon}10, transparent)`,
                    pointerEvents: 'none', zIndex: 0
                }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    {pulse && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: `${c.bg}`, border: `1px solid ${c.border}`,
                            padding: '4px 10px', borderRadius: 100
                        }}>
                            <motion.span 
                                animate={{ opacity: [1, 0.4, 1] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ width: 6, height: 6, borderRadius: '50%', background: c.icon }} 
                            />
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: c.icon, fontWeight: 700, letterSpacing: '0.05em' }}>ACTIVE</span>
                        </div>
                    )}
                    {trend !== undefined && (
                        <span style={{ 
                            fontFamily: 'var(--font-space)', fontSize: 12, 
                            color: trend >= 0 ? '#22c55e' : '#dc2626', 
                            fontWeight: 600,
                            background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                            padding: '2px 8px', borderRadius: 100
                        }}>
                            {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
                        </span>
                    )}
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: c.bg, color: c.icon,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${c.border}`,
                        boxShadow: `inset 0 0 12px ${c.bg}`
                    }}>
                        {Icon && <Icon size={20} />}
                    </div>
                </div>

                <p style={{
                    fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700
                }}>{label}</p>

                <p style={{
                    fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 36,
                    color: '#fff', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.02em'
                }}>{value}</p>

                {sub && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text3)', opacity: 0.6 }}>{sub}</p>}
            </div>
        </motion.div>
    );
}
