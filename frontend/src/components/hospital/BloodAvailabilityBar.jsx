export default function BloodAvailabilityBar({ units, maxUnits = 250, label, showLabel = true }) {
    const pct = Math.min((units / maxUnits) * 100, 100);
    const color = pct > 60 ? '#22c55e' : pct > 30 ? '#f59e0b' : '#D90025';

    return (
        <div style={{ width: '100%' }}>
            {showLabel && label && (
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
                }}>
                    {label}
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: `${pct}%`,
                        background: color, borderRadius: 3,
                        transition: 'width 0.8s ease',
                    }} />
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: color, whiteSpace: 'nowrap', minWidth: 52, textAlign: 'right',
                }}>
                    {units} units
                </span>
            </div>
        </div>
    );
}
