const map = {
    // Stock
    'Healthy': { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    'Low': { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    'Critical': { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025', pulse: true },
    // Requests
    'Pending': { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    'Processing': { bg: 'rgba(59,130,246,0.10)', text: '#3b82f6', ring: 'rgba(59,130,246,0.20)', dot: '#3b82f6' },
    'Fulfilled': { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    'Cancelled': { bg: 'rgba(255,255,255,0.05)', text: '#9B9BA4', ring: 'rgba(255,255,255,0.10)', dot: '#9B9BA4' },
    // Eligibility
    'Eligible': { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
    'Cooling': { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b', pulse: true },
    'Deferred': { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025' },
    // Priority
    'Emergency': { bg: 'rgba(217,0,37,0.10)', text: '#D90025', ring: 'rgba(217,0,37,0.20)', dot: '#D90025', pulse: true },
    'Urgent': { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', ring: 'rgba(245,158,11,0.20)', dot: '#f59e0b' },
    'Routine': { bg: 'rgba(255,255,255,0.05)', text: '#9B9BA4', ring: 'rgba(255,255,255,0.10)', dot: '#9B9BA4' },
    // Payment
    'Paid': { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', ring: 'rgba(34,197,94,0.20)', dot: '#22c55e' },
};

export default function BBStatusBadge({ status, size = 'sm' }) {
    const s = map[status] || map['Routine'];
    const isSm = size === 'sm';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: isSm ? '3px 10px' : '5px 14px',
            borderRadius: 100,
            fontSize: isSm ? 11 : 13,
            fontFamily: 'var(--font-space)',
            fontWeight: 500,
            background: s.bg, color: s.text,
            boxShadow: `inset 0 0 0 1px ${s.ring}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: s.dot,
                animation: s.pulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
                flexShrink: 0,
            }} />
            {status === 'Cooling' ? 'Cooling Period' : status}
        </span>
    );
}
