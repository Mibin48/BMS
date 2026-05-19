const statusMap = {
    Healthy: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Low: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    Critical: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025', pulse: true },
    Pending: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    Processing: { bg: 'rgba(59,130,246,0.10)', text: '#3b82f6', ring: 'rgba(59,130,246,0.20)', dot: '#3b82f6' },
    Fulfilled: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Cancelled: { bg: 'rgba(255,255,255,0.05)', text: '#9B9BA4', ring: 'rgba(255,255,255,0.10)', dot: '#9B9BA4' },
    Active: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Suspended: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025' },
    Eligible: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Cooling: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b', pulse: true },
    Deferred: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025' },
    Emergency: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025', pulse: true },
    Urgent: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    Routine: { bg: 'rgba(255,255,255,0.05)', text: '#9B9BA4', ring: 'rgba(255,255,255,0.10)', dot: '#9B9BA4' },
    Paid: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Overdue: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025', pulse: true },
    Admitted: { bg: 'rgba(59,130,246,0.10)', text: '#3b82f6', ring: 'rgba(59,130,246,0.20)', dot: '#3b82f6' },
    Stable: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Discharged: { bg: 'rgba(255,255,255,0.05)', text: '#9B9BA4', ring: 'rgba(255,255,255,0.10)', dot: '#9B9BA4' },
    Approved: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    Rejected: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025' },
    Info: { bg: 'rgba(59,130,246,0.10)', text: '#3b82f6', ring: 'rgba(59,130,246,0.20)', dot: '#3b82f6' },
    Warning: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    OPEN: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    CLOSED: { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025' },
    Adequate: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
    if (!status) return null;
    const s = statusMap[status] || statusMap.Routine;
    const pad = size === 'sm' ? '5px 14px' : '8px 20px';
    const fs = size === 'sm' ? 11 : 13;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: pad, borderRadius: 100,
            fontFamily: 'var(--font-space)', fontSize: fs, fontWeight: 700,
            letterSpacing: '0.05em',
            background: s.bg, color: s.text,
            border: `1px solid ${s.ring}`,
            textTransform: 'uppercase'
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: s.dot,
                boxShadow: `0 0 10px ${s.dot}`,
                animation: s.pulse ? 'pulse 2s ease-in-out infinite' : 'none',
            }} />
            {status === 'Cooling' ? 'Cooling Period' : status}
        </span>
    );
};

export default StatusBadge;
