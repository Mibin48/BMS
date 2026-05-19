const BloodGroupBadge = ({ group, size = 'sm' }) => {
    if (!group) return null;
    const isNeg = group.includes('-');
    const sizeMap = {
        xs: { padding: '2px 6px', fontSize: 10, borderRadius: 8, minWidth: 28 },
        sm: { padding: '3px 8px', fontSize: 11, borderRadius: 10, minWidth: 36 },
        md: { padding: '5px 12px', fontSize: 13, borderRadius: 12, minWidth: 44 },
        lg: { padding: '8px 16px', fontSize: 16, borderRadius: 14, minWidth: 52 },
    };
    const s = sizeMap[size] || sizeMap.sm;

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-space)', fontWeight: 600, textAlign: 'center',
            ...s,
            background: isNeg ? 'rgba(217,0,37,0.10)' : 'rgba(255,255,255,0.08)',
            color: isNeg ? '#D90025' : '#fff',
            border: `1px solid ${isNeg ? 'rgba(217,0,37,0.20)' : 'rgba(255,255,255,0.12)'}`,
        }}>
            {group}
        </span>
    );
};

export default BloodGroupBadge;
