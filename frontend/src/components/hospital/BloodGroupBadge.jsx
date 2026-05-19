const RARE = ['O-', 'B-', 'AB-', 'A-'];

export default function BloodGroupBadge({ group, small }) {
    const isRare = RARE.includes(group);

    return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{
                display: 'inline-block',
                background: isRare ? 'rgba(217,0,37,0.25)' : 'rgba(217,0,37,0.15)',
                border: `1px solid ${isRare ? 'rgba(217,0,37,0.5)' : 'rgba(217,0,37,0.3)'}`,
                borderRadius: 8, padding: small ? '2px 8px' : '3px 12px',
                fontFamily: 'var(--font-sub)', fontWeight: 700,
                fontSize: small ? 11 : 13, color: '#fff',
                boxShadow: isRare ? '0 0 8px rgba(217,0,37,0.2)' : 'none',
                letterSpacing: '0.02em',
            }}>
                {group}
            </span>
            {isRare && !small && (
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8,
                    color: 'var(--red)', letterSpacing: '0.1em',
                }}>RARE</span>
            )}
        </div>
    );
}
