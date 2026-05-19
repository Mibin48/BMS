export default function CheckboxField({ label, checked, onChange, required }) {
    return (
        <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)',
            lineHeight: 1.5,
        }}>
            <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    background: checked ? 'var(--red)' : '#0F0F17',
                    border: `1.5px solid ${checked ? 'var(--red)' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                }}>
                    {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>
            <span>
                {label}
                {required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
            </span>
        </label>
    );
}
