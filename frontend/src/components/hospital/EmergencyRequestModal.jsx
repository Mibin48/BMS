import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Droplets, Users, MapPin, Zap } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import toast from 'react-hot-toast';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function EmergencyRequestModal({ onClose }) {
    const [patientId, setPatientId] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [bankId, setBankId] = useState('');
    const [units, setUnits] = useState(1);
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(480);
    const [createdId, setCreatedId] = useState('');

    const { data: patientsData } = useFetch(hospitalService.getPatients, { limit: 100 });
    const { data: banksData } = useFetch(hospitalService.getBloodBanks);
    const { execute: createRequest, loading } = useApi(hospitalService.createRequest);

    const patients = patientsData?.patients || [];
    const banks = banksData?.banks || [];
    const selectedPatient = patients.find(p => p.patient_id === patientId);
    
    // Auto-select first bank if none selected
    useEffect(() => {
        if (banks.length > 0 && !bankId) setBankId(banks[0].bank_id);
    }, [banks, bankId]);

    const nearestBank = banks.find(b => b.bank_id === bankId) || banks[0];

    const handleSubmit = async () => {
        if (!patientId || !bloodGroup || !bankId) {
            toast.error('All critical parameters must be specified');
            return;
        }

        try {
            const result = await createRequest({
                patient_id: patientId,
                bank_id: bankId,
                blood_group: bloodGroup,
                units_required: units,
                priority: 'Emergency',
                notes: notes || 'EMERGENCY REQUEST VIA TOPBAR'
            });

            setCreatedId(result?.request_id || 'REQ-EMERG');
            setSuccess(true);
            toast.success('EMERGENCY BROADCAST SENT');
            
            const timer = setInterval(() => {
                setCountdown(c => {
                    if (c <= 0) { clearInterval(timer); return 0; }
                    return c - 1;
                });
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Broadcast failed');
        }
    };

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const countdownColor = countdown > 180 ? '#22c55e' : countdown > 60 ? '#f59e0b' : '#D90025';

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.93, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.93, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    background: '#0A0A12', border: '1px solid rgba(217,0,37,0.4)',
                    borderRadius: 20, width: '100%', maxWidth: 520,
                    maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 0 60px rgba(217,0,37,0.15)',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div style={{
                    background: 'rgba(217,0,37,0.1)', borderBottom: '1px solid rgba(217,0,37,0.2)',
                    padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertTriangle size={20} color="var(--red)" style={{ animation: 'bounce 1s infinite' }} />
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: 'var(--red)' }}>Emergency Blood Request</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Notifies blood bank immediately</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <X size={18} color="var(--text3)" />
                    </button>
                </div>

                <div style={{ padding: 32 }}>
                    {success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '16px 0' }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'rgba(217,0,37,0.15)', border: '2px solid rgba(217,0,37,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    boxShadow: '0 0 30px rgba(217,0,37,0.3)',
                                }}>
                                <AlertTriangle size={36} color="var(--red)" />
                            </motion.div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 8 }}>Emergency Request Sent!</div>
                            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', marginBottom: 6 }}>{nearestBank.bank_name} has been notified</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>Expected response: &lt; 8 minutes</div>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, marginBottom: 6,
                                color: countdownColor, transition: 'color 1s',
                            }}>
                                {fmt(countdown)}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 28 }}>TIME REMAINING</div>
                            <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Close</button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Patient */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>SELECT PATIENT</label>
                                <select value={patientId} onChange={e => { 
                                    setPatientId(e.target.value); 
                                    const p = patients.find(x => x.patient_id === e.target.value); 
                                    if (p) setBloodGroup(p.blood_group); 
                                }}
                                    style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', cursor: 'pointer', marginBottom: 0, boxSizing: 'border-box' }}>
                                    <option value="" style={{ background: '#0F0F17' }}>Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p.patient_id} value={p.patient_id} style={{ background: '#0F0F17' }}>
                                            {p.name} · {p.blood_group} · {p.ward || 'General'}
                                        </option>
                                    ))}
                                </select>
                                {selectedPatient && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {[['Name', selectedPatient.name], ['Age', selectedPatient.age + ' yrs'], ['Gender', selectedPatient.gender], ['Ward', selectedPatient.ward]].map(([l, v]) => (
                                            <div key={l}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>{l}</div>
                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{v}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Blood Group */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>BLOOD GROUP</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {BLOOD_TYPES.map(b => (
                                        <button key={b} onClick={() => setBloodGroup(b)} style={{
                                            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                                            background: bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`,
                                            fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12,
                                            color: '#fff', transition: 'all 0.15s',
                                        }}>{b}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Units */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>UNITS REQUIRED</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button onClick={() => setUnits(u => Math.max(1, u - 1))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', minWidth: 32, textAlign: 'center' }}>{units}</div>
                                    <button onClick={() => setUnits(u => Math.min(50, u + 1))} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>units of blood (Max 50)</span>
                                </div>
                            </div>

                            {/* Bank */}
                             <div style={{ marginBottom: 18, background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={10} /> RELAY TARGET</div>
                                <select value={bankId} onChange={e => setBankId(e.target.value)}
                                    style={{ width: '100%', background: 'transparent', border: 'none', fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff', outline: 'none', cursor: 'pointer', padding: 0 }}>
                                    {banks.map(b => (
                                        <option key={b.bank_id} value={b.bank_id} style={{ background: '#0F0F17' }}>
                                            {b.bank_name} · {b.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>CLINICAL NOTES (OPTIONAL)</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional clinical notes..." rows={2}
                                    style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                                <button onClick={handleSubmit} disabled={loading}
                                    style={{
                                        flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '13px 0', cursor: 'pointer',
                                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff',
                                        boxShadow: loading ? 'none' : '0 4px 24px rgba(217,0,37,0.45)', opacity: loading ? 0.7 : 1,
                                        transition: 'all 0.2s',
                                    }}>
                                    {loading ? 'Sending...' : 'Send Emergency Request →'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
