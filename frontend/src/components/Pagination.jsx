export default function Pagination({ total, limit, offset, onChange }) {
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    const bS = {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)',
        transition: 'all 0.15s',
    };
    const disabledS = { opacity: 0.3, cursor: 'not-allowed' };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
                Showing <span style={{ color: '#fff' }}>{Math.min(offset + 1, total)}–{Math.min(offset + limit, total)}</span> of <span style={{ color: '#fff' }}>{total}</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                    disabled={offset === 0}
                    onClick={() => onChange(Math.max(0, offset - limit))}
                    style={{ ...bS, ...(offset === 0 ? disabledS : {}) }}
                >← Prev</button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '0 6px' }}>{page} / {totalPages}</span>
                <button
                    disabled={offset + limit >= total}
                    onClick={() => onChange(offset + limit)}
                    style={{ ...bS, ...(offset + limit >= total ? disabledS : {}) }}
                >Next →</button>
            </div>
        </div>
    );
}
