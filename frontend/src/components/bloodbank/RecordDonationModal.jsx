import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { mockDonors, mockBloodStock } from '../../data/bloodBankMockData';
import NumberStepper from '../NumberStepper';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
function initials(name) { return name.split(' ').slice(0, 2).map(n => n[0]).join(''); }

export default function RecordDonationModal({ onClose }) {
    const [donorId, setDonorId] = useState('');
    const [weight, setWeight] = useState('');
    const [hemo, setHemo] = useState('');
    const [bp, setBp] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [qty, setQty] = useState(450);
    const [donDate, setDonDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const donor = mockDonors.find(d => d.donor_id === donorId);
    const eligible = parseFloat(hemo) >= 12.5 && parseFloat(weight) >= 50;
    const checkedEligibility = hemo !== '' && weight !== '';

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 16 };

    const handleSubmit = () => { setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1500); };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Check size={32} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Donation Recorded!</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 6 }}>DON-2024-005 created</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Stock updated automatically.</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>Record New Donation</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>Fill details to record a donation.</div>

                        {/* Donor Selection */}
                        <label style={lS}>SELECT DONOR</label>
                        <select value={donorId} onChange={e => { setDonorId(e.target.value); const d = mockDonors.find(x => x.donor_id === e.target.value); if (d) setBloodGroup(d.blood_group); }}
                            style={{ ...iS, cursor: 'pointer' }}>
                            <option value="" style={{ background: '#0F0F17' }}>Select donor...</option>
                            {mockDonors.map(d => <option key={d.donor_id} value={d.donor_id} style={{ background: '#0F0F17' }}>{d.name} · {d.blood_group} · {d.status}</option>)}
                        </select>

                        {donor && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                {[['Donor', donor.name], ['Blood Group', donor.blood_group], ['Last Donation', donor.last_donation_date]].map(([l, v]) => (
                                    <div key={l}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>{l}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</div></div>
                                ))}
                            </motion.div>
                        )}

                        {/* Health Check */}
                        <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>HEALTH CHECK (REQUIRED)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                            <NumberStepper
                                label="WEIGHT (KG)"
                                value={parseFloat(weight) || 50}
                                onChange={v => setWeight(String(v))}
                                min={30}
                                max={150}
                            />
                            <NumberStepper
                                label="HEMOGLOBIN (G/DL)"
                                value={parseFloat(hemo) || 12.5}
                                onChange={v => setHemo(String(Math.round(v * 10) / 10))}
                                step={0.5}
                                min={5}
                                max={20}
                            />
                            <div>
                                <label style={{ ...lS, marginTop: 0 }}>BLOOD PRESSURE</label>
                                <input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" style={iS} />
                            </div>
                            <div>
                                <label style={{ ...lS, marginTop: 0 }}>ELIGIBILITY</label>
                                <div style={{ height: 46, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A12', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: checkedEligibility ? (eligible ? '#22c55e' : 'var(--red)') : 'var(--text3)' }}>
                                    {!checkedEligibility ? '—' : eligible ? '✓ ELIGIBLE' : '✕ DEFERRED'}
                                </div>
                            </div>
                        </div>

                        {checkedEligibility && !eligible && (
                            <div style={{ background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.25)', borderRadius: 8, padding: '10px 14px', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>
                                {parseFloat(hemo) < 12.5 && '⚠ Hemoglobin below 12.5 g/dL threshold. '}
                                {parseFloat(weight) < 50 && '⚠ Weight below 50kg threshold.'}
                            </div>
                        )}

                        {/* Donation Details */}
                        <label style={lS}>BLOOD GROUP</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {BLOOD_TYPES.map(b => <button key={b} onClick={() => setBloodGroup(b)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 16 }}>{b}</button>)}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <NumberStepper
                                label="QUANTITY (ML)"
                                value={qty}
                                onChange={v => setQty(v)}
                                min={100}
                                max={500}
                                step={50}
                            />
                        </div>

                        <label style={lS}>DONATION DATE</label>
                        <input type="date" value={donDate} onChange={e => setDonDate(e.target.value)} style={iS} />

                        <label style={lS}>NOTES (OPTIONAL)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2}
                            style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={loading || (checkedEligibility && !eligible)} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: (loading || (checkedEligibility && !eligible)) ? 0.5 : 1 }}>
                                {loading ? 'Recording...' : 'Record Donation →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
