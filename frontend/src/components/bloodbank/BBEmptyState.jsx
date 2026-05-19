export default function BBEmptyState({ icon: Icon, title, subtitle, action, actionLabel, size = 'default' }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: size === 'small' ? '40px 0' : '80px 0' }}>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {Icon && <Icon size={28} color="rgba(217,0,37,0.30)" />}
                </div>
                {/* Outer ring */}
                <div style={{ position: 'absolute', inset: -8, borderRadius: 20, border: '1px solid rgba(217,0,37,0.08)', pointerEvents: 'none' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>{title}</p>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', maxWidth: 300, lineHeight: 1.5, marginBottom: action ? 24 : 0 }}>{subtitle}</p>
            {action && (
                <button onClick={action} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 12,
                    background: 'rgba(217,0,37,0.10)', border: '1px solid rgba(217,0,37,0.20)',
                    fontFamily: 'var(--font-space)', fontSize: 12, color: '#D90025',
                    letterSpacing: '0.06em', cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,0,37,0.15)'; e.currentTarget.style.borderColor = 'rgba(217,0,37,0.35)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(217,0,37,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,0,37,0.10)'; e.currentTarget.style.borderColor = 'rgba(217,0,37,0.20)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
