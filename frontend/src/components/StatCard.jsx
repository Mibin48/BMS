import { useEffect, useRef, useState } from 'react';

const colorMap = {
    red: { icon: '#D90025', bg: 'rgba(217,0,37,0.08)', glow: '0 0 20px rgba(217,0,37,0.08)' },
    green: { icon: '#22c55e', bg: 'rgba(34,197,94,0.08)', glow: '0 0 20px rgba(34,197,94,0.08)' },
    amber: { icon: '#f59e0b', bg: 'rgba(245,158,11,0.08)', glow: '0 0 20px rgba(245,158,11,0.08)' },
    blue: { icon: '#3b82f6', bg: 'rgba(59,130,246,0.08)', glow: '0 0 20px rgba(59,130,246,0.08)' },
    purple: { icon: '#7C3AED', bg: 'rgba(124,58,237,0.08)', glow: '0 0 20px rgba(124,58,237,0.08)' },
    white: { icon: '#fff', bg: 'rgba(255,255,255,0.08)', glow: 'none' },
};

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        const target = typeof value === 'number' ? value : 0;
        const duration = 800;
        const start = performance.now();
        const from = 0;

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (target - from) * eased);

            setDisplay(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value]);

    return (
        <span>
            {prefix}
            {display.toLocaleString('en-IN')}
            {suffix}
        </span>
    );
};

export default function StatCard({ label, value, sub, description, icon: Icon, color = 'red', trend, loading, children }) {
    const c = colorMap[color] || colorMap.red;
    const finalSub = sub || description;

    if (loading) return (
        <div style={{
            background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: 24, minHeight: 130,
        }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.05)', marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '60%', height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '50%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        </div>
    );

    const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value.replace(/,/g, ''))) && !value.includes('₹') && !value.includes('%') && !value.includes(' ') && !value.includes('d'));
    const parsedValue = isNumeric ? parseFloat(typeof value === 'string' ? value.replace(/,/g, '') : value) : value;

    return (
        <div
            style={{
                background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 24, minHeight: 130,
                boxShadow: c.glow,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', flexDirection: 'column', minWidth: 140,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = c.glow.replace('20px', '30px'); e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = c.glow; e.currentTarget.style.transform = 'translateY(0)' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                {Icon && (
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: c.bg, color: c.icon,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}>
                        <Icon size={22} />
                    </div>
                )}
                {trend !== undefined && (
                    <span style={{
                        fontFamily: 'var(--font-space)', fontSize: 11,
                        background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(217,0,37,0.1)',
                        padding: '4px 8px', borderRadius: 8,
                        color: trend >= 0 ? '#22c55e' : '#D90025',
                    }}>
                        {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: '#9B9BA4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 30, color: '#fff', lineHeight: 1, marginBottom: 0 }}>
                {isNumeric ? <AnimatedNumber value={parsedValue} /> : (value ?? '--')}
            </p>
            {finalSub && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginTop: 12 }}>{finalSub}</p>}
            {children}
        </div>
    );
}
