export default function SectionHeader({ title, count, action, onAction, subtitle }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 20
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff', margin: 0 }}>{title}</h3>
                    {count !== undefined && (
                        <span style={{
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 100, padding: '2px 8px',
                            fontFamily: 'var(--font-space)', fontSize: 10, color: '#CACACE'
                        }}>
                            {count}
                        </span>
                    )}
                </div>
                {subtitle && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', margin: '12px 0 0 0' }}>{subtitle}</p>}
            </div>
            {action && typeof action === 'string' ? (
                <button
                    onClick={onAction}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-dm)', fontSize: 13, color: '#D90025',
                        display: 'flex', alignItems: 'center', gap: 6, padding: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF1A3C'}
                    onMouseLeave={e => e.currentTarget.style.color = '#D90025'}
                >
                    {action}
                    <span style={{ transition: 'transform 0.2s', display: 'inline-block' }} className="arrow">→</span>
                </button>
            ) : action}
        </div>
    );
}
