const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function BloodTypeSelector({ value, onChange, multi = false }) {
    const selected = multi
        ? (Array.isArray(value) ? value : [])
        : value;

    const toggle = (bt) => {
        if (multi) {
            const arr = Array.isArray(value) ? value : [];
            onChange(arr.includes(bt) ? arr.filter(x => x !== bt) : [...arr, bt]);
        } else {
            onChange(bt === value ? '' : bt);
        }
    };

    const isSelected = (bt) => multi ? selected.includes(bt) : selected === bt;

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
        }}>
            {BLOOD_TYPES.map(bt => (
                <button
                    key={bt}
                    type="button"
                    onClick={() => toggle(bt)}
                    style={{
                        padding: '12px 8px',
                        background: isSelected(bt) ? 'rgba(217,0,37,0.15)' : '#0F0F17',
                        border: `1px solid ${isSelected(bt) ? 'rgba(217,0,37,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 10,
                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16,
                        color: isSelected(bt) ? '#fff' : 'var(--text2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSelected(bt) ? '0 0 12px rgba(217,0,37,0.2)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isSelected(bt)) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (!isSelected(bt)) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text2)'; } }}
                >
                    {bt}
                </button>
            ))}
        </div>
    );
}
