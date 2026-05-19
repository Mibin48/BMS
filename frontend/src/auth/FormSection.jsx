export default function FormSection({ label, children }) {
    return (
        <div style={{ marginBottom: 32 }}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)',
                        letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{label}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
            )}
            {children}
        </div>
    );
}
