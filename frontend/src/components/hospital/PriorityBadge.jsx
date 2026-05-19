export default function PriorityBadge({ priority }) {
    const cfg = {
        Emergency: {
            bg: 'rgba(217,0,37,0.15)', border: 'rgba(217,0,37,0.4)', color: '#FF4460',
            label: 'EMERGENCY', dot: true, shadow: '0 0 8px rgba(217,0,37,0.2)',
        },
        Urgent: {
            bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b',
            label: '⚡ URGENT', dot: false, shadow: 'none',
        },
        Routine: {
            bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--text3)',
            label: 'ROUTINE', dot: false, shadow: 'none',
        },
    };
    const c = cfg[priority] || cfg.Routine;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 100, padding: '3px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: c.color, letterSpacing: '0.06em',
            boxShadow: c.shadow, userSelect: 'none',
        }}>
            {c.dot && (
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#FF4460', flexShrink: 0,
                    animation: 'pulse 1.2s ease-in-out infinite',
                }} />
            )}
            {c.label}
        </span>
    );
}
