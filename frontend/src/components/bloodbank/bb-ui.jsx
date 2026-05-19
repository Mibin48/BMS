// Shared inline-style helpers for blood bank UI

export const inputStyle = {
    width: '100%', background: '#14141E',
    border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12,
    padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff',
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
};

export const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'auto' };

export const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: 60 };

export const labelStyle = {
    fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    display: 'block', marginBottom: 8,
};

export const primaryBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    background: '#D90025', border: 'none',
    fontFamily: 'var(--font-space)', fontSize: 12, color: '#fff',
    letterSpacing: '0.06em', cursor: 'pointer', fontWeight: 500,
    transition: 'all 0.2s',
};

export const ghostBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
    fontFamily: 'var(--font-space)', fontSize: 12, color: '#9B9BA4',
    letterSpacing: '0.06em', cursor: 'pointer',
    transition: 'all 0.2s',
};

export const dangerBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.25)',
    fontFamily: 'var(--font-space)', fontSize: 12, color: '#D90025',
    letterSpacing: '0.06em', cursor: 'pointer',
    transition: 'all 0.2s',
};

export const successBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
    fontFamily: 'var(--font-space)', fontSize: 12, color: '#22c55e',
    letterSpacing: '0.06em', cursor: 'pointer',
    transition: 'all 0.2s',
};

export const sectionHeader = (title, subtitle) => ({
    title: { fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' },
    subtitle: subtitle ? { fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginTop: 2 } : null,
});

export const cardBase = {
    background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, transition: 'all 0.2s',
};

export const surfaceBase = { ...cardBase, padding: 24 };

export const accentFor = (pct) => {
    if (pct > 60) return { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', label: 'Healthy' };
    if (pct > 30) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', label: 'Low' };
    return { color: '#D90025', bg: 'rgba(217,0,37,0.08)', border: 'rgba(217,0,37,0.20)', label: 'CRITICAL' };
};

export const VitalPill = ({ label, value, good }) => (
    <div style={{ background: '#14141E', borderRadius: 12, padding: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#bfbfcaff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 14, color: good ? '#fff' : '#D90025' }}>{value}</p>
    </div>
);
