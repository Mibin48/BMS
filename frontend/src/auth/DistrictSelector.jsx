import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISTRICTS = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta',
    'Alappuzha', 'Kottayam', 'Idukki',
    'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad',
    'Kannur', 'Kasaragod',
];

export default function DistrictSelector({ label, value, onChange, required }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef();

    const filtered = DISTRICTS.filter(d =>
        d.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div style={{ marginBottom: 20, position: 'relative' }} ref={ref}>
            {label && (
                <label style={{
                    display: 'block', marginBottom: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                    {label}
                    {required && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#0F0F17', border: `1px solid ${open ? 'rgba(217,0,37,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12, padding: '14px 16px',
                    fontFamily: 'var(--font-body)', fontSize: 14,
                    color: value ? '#fff' : 'var(--text3)',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    boxShadow: open ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none',
                }}
            >
                <span>{value || 'Select district...'}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color="var(--text3)" />
                </motion.div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100,
                            background: '#0F0F17', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Search */}
                        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Search size={13} color="var(--text3)" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search district..."
                                    style={{
                                        background: 'transparent', border: 'none', outline: 'none',
                                        fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff',
                                        width: '100%',
                                    }}
                                />
                            </div>
                        </div>
                        {/* List */}
                        <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {filtered.map(d => (
                                <div
                                    key={d}
                                    onClick={() => { onChange(d); setOpen(false); setSearch(''); }}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        fontFamily: 'var(--font-body)', fontSize: 14,
                                        color: value === d ? '#fff' : 'var(--text2)',
                                        background: value === d ? 'rgba(217,0,37,0.08)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        transition: 'background 0.15s, color 0.15s',
                                    }}
                                    onMouseEnter={e => { if (value !== d) { e.currentTarget.style.background = 'rgba(217,0,37,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                                    onMouseLeave={e => { if (value !== d) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
                                >
                                    {d}
                                    {value === d && <Check size={13} color="var(--red)" />}
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div style={{ padding: '16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
                                    No districts found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
