export default function BBBloodBadge({ group, size = 'sm' }) {
    const isNeg = group?.includes('-');
    const sizes = {
        xs: { w: 28, h: 22, fs: 10 },
        sm: { w: 40, h: 28, fs: 12 },
        md: { w: 48, h: 36, fs: 14 },
        lg: { w: 64, h: 48, fs: 20 },
    };
    const s = sizes[size] || sizes.sm;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: s.w, height: s.h,
            borderRadius: 8,
            fontFamily: 'var(--font-space)', fontWeight: 700,
            fontSize: s.fs,
            background: isNeg ? 'rgba(217,0,37,0.10)' : 'rgba(255,255,255,0.08)',
            color: isNeg ? '#D90025' : '#fff',
            boxShadow: `inset 0 0 0 1px ${isNeg ? 'rgba(217,0,37,0.20)' : 'rgba(255,255,255,0.12)'}`,
            flexShrink: 0,
        }}>
            {group}
        </span>
    );
}
