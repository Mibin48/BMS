import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { mockBloodStock } from '../../data/bloodBankMockData';
import BloodGroupBadge from '../hospital/BloodGroupBadge';
import BloodAvailabilityBar from '../hospital/BloodAvailabilityBar';

export default function IssueBloodModal({ onClose, request }) {
    const [units, setUnits] = useState(request?.units_required || 1);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const stockItem = mockBloodStock.find(s => s.blood_group === request?.blood_group);
    const available = stockItem?.available_units || 0;
    const capacity = stockItem?.capacity || 100;
    const sufficient = available >= units;

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 16 };

    const handleSubmit = () => { setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1500); };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Check size={28} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Blood Issued!</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 6 }}>ISS-2025-003 created</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Stock updated · Payment record auto-generated.</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', marginTop: 16 }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 20 }}>Issue Blood</div>

                        {/* Request summary */}
                        {request && (
                            <div style={{ background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[['Request ID', request.request_id], ['Hospital', request.hospital_name], ['Patient', request.patient_name], ['Units Needed', request.units_required]].map(([l, v]) => (
                                        <div key={l}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>{l}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{v}</div></div>
                                    ))}
                                </div>
                                {request.blood_group && <div style={{ marginTop: 10 }}><BloodGroupBadge group={request.blood_group} /></div>}
                            </div>
                        )}

                        {/* Stock check */}
                        <div style={{ background: '#0A0A12', border: `1px solid ${sufficient ? 'rgba(34,197,94,0.25)' : 'rgba(217,0,37,0.3)'}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>CURRENT STOCK — {request?.blood_group}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: sufficient ? '#22c55e' : 'var(--red)', lineHeight: 1, marginBottom: 12 }}>{available}</div>
                            <BloodAvailabilityBar units={available} maxUnits={capacity} showLabel={false} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: sufficient ? '#22c55e' : 'var(--red)', marginTop: 8 }}>
                                {sufficient ? `✓ Sufficient stock available` : `✗ Only ${available} units available`}
                            </div>
                        </div>

                        <label style={{ ...lS, marginTop: 0 }}>UNITS TO ISSUE</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <button onClick={() => setUnits(u => Math.max(1, u - 1))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18 }}>−</button>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', minWidth: 40, textAlign: 'center' }}>{units}</div>
                            <button onClick={() => setUnits(u => Math.min(available, u + 1))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18 }}>+</button>
                        </div>
                        {units < (request?.units_required || 0) && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b', marginBottom: 10 }}>⚠ Issuing partial quantity ({units} of {request.units_required})</div>
                        )}

                        <label style={lS}>ISSUE DATE</label>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={iS} />

                        <label style={lS}>NOTES (OPTIONAL)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes..."
                            style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Processing...' : 'Confirm Issue →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
