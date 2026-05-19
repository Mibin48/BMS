const COLORS = {
    pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
    error: { bg: 'rgba(217,0,37,0.12)', border: 'rgba(217,0,37,0.3)', text: 'var(--red)' },
    info: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#818cf8' },
};

export default function StatusBadge({ status = 'info', label }) {
    const c = COLORS[status] || COLORS.info;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 100, padding: '4px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: c.text, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.text }} />
            {label}
        </span>
    );
}
