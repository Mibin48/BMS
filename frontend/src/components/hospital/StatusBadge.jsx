export default function StatusBadge({ status }) {
    const cfg = {
        Pending: {
            bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)',
            color: '#f59e0b', label: 'PENDING',
        },
        Processing: {
            bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)',
            color: '#818cf8', label: 'PROCESSING',
        },
        Fulfilled: {
            bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
            color: '#22c55e', label: 'FULFILLED',
        },
        Cancelled: {
            bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', label: 'CANCELLED',
        },
        Paid: {
            bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)',
            color: '#22c55e', label: 'PAID',
        },
        Overdue: {
            bg: 'rgba(217,0,37,0.15)', border: 'rgba(217,0,37,0.35)',
            color: '#FF4460', label: 'OVERDUE',
        },
    };
    const c = cfg[status] || cfg.Cancelled;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 8, padding: '4px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800,
            color: c.color, letterSpacing: '0.12em',
            boxShadow: status === 'Overdue' ? '0 0 15px rgba(217,0,37,0.1)' : 'none',
            userSelect: 'none',
        }}>
            {status === 'Pending' && <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.color, animation: 'pulse 1.5s infinite' }} />}
            {c.label}
        </span>
    );
}
