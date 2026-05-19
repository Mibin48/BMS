import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Droplets, ChevronDown, ChevronUp, X, Check, 
    Users, TrendingUp, AlertTriangle, CreditCard, ChevronRight, Plus
} from 'lucide-react';
import PriorityBadge from '../../components/hospital/PriorityBadge';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import Pagination from '../../components/Pagination';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function fmt(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

/* ─── New Request Modal ─── */
function NewRequestModal({ onClose, onSuccess, initialData = {} }) {
    const [patientId, setPatientId] = useState(initialData.patientId || '');
    const [bloodGroup, setBloodGroup] = useState(initialData.bloodGroup || '');
    const [units, setUnits] = useState(initialData.units || 1);
    const [bankId, setBankId] = useState('');
    const [priority, setPriority] = useState(initialData.priority || 'Routine');
    const [notes, setNotes] = useState('');
    const [done, setDone] = useState(false);
    const [createdId, setCreatedId] = useState('');
    const [stockWarning, setStockWarning] = useState(null);

    const { data: patientsData } = useFetch(hospitalService.getPatients, { limit: 100 });
    const { data: banksData } = useFetch(hospitalService.getBloodBanks);
    const { execute: createRequest, loading } = useApi(hospitalService.createRequest);

    const clearParams = useCallback(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete('patientId');
        params.delete('bloodGroup');
        params.delete('priority');
        const newRelativePathQuery = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState(null, '', newRelativePathQuery);
    }, []);

    const patients = patientsData?.patients || [];
    const banks = banksData?.banks || [];
    const selectedPatient = patients.find(p => p.patient_id === patientId);

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 16 };

    const handleSubmit = async () => {
        if (!patientId || !bloodGroup || !bankId) { toast.error('Fill all required fields'); return; }
        try {
            const result = await createRequest({ patient_id: patientId, bank_id: bankId, blood_group: bloodGroup, units_required: units, priority, notes: notes || undefined });
            setCreatedId(result?.request_id || '');
            setStockWarning(result?.stock_warning || null);
            setDone(true);
            toast.success('Request submitted!');
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ 
                    background: 'linear-gradient(135deg, rgba(15, 15, 23, 0.95), rgba(10, 10, 15, 0.98))', 
                    border: '1px solid rgba(217,0,37,0.3)', 
                    borderRadius: 32, padding: 48, width: '100%', maxWidth: 540, 
                    maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 50px rgba(217,0,37,0.1)'
                }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} color="rgba(255,255,255,0.4)" /></button>
                
                {done ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(34,197,148,0.2)' }}>
                            <Check size={40} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 8 }}>Order Authorized</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginBottom: 16, letterSpacing: '0.1em' }}>ID: {createdId}</div>
                        {stockWarning && <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f59e0b', marginBottom: 24, lineHeight: 1.5 }}>⚠ {stockWarning}</div>}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 40px', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 700, color: '#fff' }}>Close</motion.button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 10px var(--red)' }} />
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>Blood Order</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Select patient and hospital provider for blood delivery.</div>
                        </div>

                        {/* Patient Selection */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <Users size={16} color="var(--red)" />
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>IDENTIFY RECIPIENT</label>
                            </div>
                            <select value={patientId} onChange={e => { setPatientId(e.target.value); const p = patients.find(x => x.patient_id === e.target.value); if (p) setBloodGroup(p.blood_group); }} style={iS}>
                                <option value="" style={{ background: '#0F0F17' }}>Search Patient Registry...</option>
                                {patients.map(p => <option key={p.patient_id} value={p.patient_id} style={{ background: '#0F0F17' }}>{p.name} ({p.blood_group}) · {p.ward || 'General'}</option>)}
                            </select>
                            <AnimatePresence>
                                {selectedPatient && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginTop: 12, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                                        {[
                                            ['PATIENT ALIAS', selectedPatient.name],
                                            ['CLINICAL AGE', selectedPatient.age + ' Years'],
                                            ['ASSIGNED WARD', selectedPatient.ward || 'Awaiting Placement'],
                                            ['GENDER REF', selectedPatient.gender]
                                        ].map(([l, v]) => (
                                            <div key={l}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>{l}</div>
                                                <div style={{ fontFamily: 'var(--font-sub)', fontSize: 13, color: '#fff', fontWeight: 600 }}>{v}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Resource Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <Droplets size={16} color="var(--red)" />
                                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>BLOOD TYPE</label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                    {BLOOD_TYPES.map(b => (
                                        <motion.button 
                                            key={b} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => setBloodGroup(b)} 
                                            style={{ 
                                                padding: '8px 0', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                                                background: bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.03)', 
                                                border: `1px solid ${bloodGroup === b ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`, 
                                                fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 11, color: '#fff',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {b}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <TrendingUp size={16} color="var(--red)" />
                                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>QUANTITY (UNIT)</label>
                                </div>
                                <NumberStepper value={units} onChange={setUnits} min={1} max={priority === 'Emergency' ? 50 : 20} />
                                {priority === 'Emergency' && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', marginTop: 8, opacity: 0.8 }}>Note: Emergency limit extended to 50 units</div>}
                            </div>
                        </div>

                        {/* Fulfillment Provider */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <CreditCard size={16} color="var(--red)" />
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>FULFILLMENT SOURCE</label>
                            </div>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {banks.map(bank => (
                                    <motion.div 
                                        key={bank.bank_id} 
                                        whileHover={{ x: 4, background: 'rgba(255,255,255,0.05)' }}
                                        onClick={() => setBankId(bank.bank_id)}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', 
                                            borderRadius: 14, cursor: 'pointer', 
                                            background: bankId === bank.bank_id ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.02)', 
                                            border: `1px solid ${bankId === bank.bank_id ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.06)'}`, 
                                            transition: 'all 0.2s' 
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{bank.bank_name}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{bank.city.toUpperCase()}</div>
                                        </div>
                                        {bloodGroup && bank.stock && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: (bank.stock[bloodGroup] || 0) >= units ? '#22c55e' : 'var(--red)' }}>
                                                    {bank.stock[bloodGroup] || 0} UNITS
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>AVAILABLE</div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Priority Tier */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <AlertTriangle size={16} color="var(--red)" />
                                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>SERVICE URGENCY</label>
                                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {['Emergency', 'Urgent', 'Routine'].map(p => {
                                    const isSel = priority === p;
                                    const isEmerg = p === 'Emergency';
                                    return (
                                        <motion.div 
                                            key={p} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setPriority(p)} 
                                            style={{ 
                                                padding: '16px 12px', borderRadius: 16, cursor: 'pointer', textAlign: 'center', 
                                                background: isSel ? (isEmerg ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.02)', 
                                                border: `1px solid ${isSel ? (isEmerg ? 'var(--red)' : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.06)'}`, 
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                boxShadow: isSel && isEmerg ? '0 0 20px rgba(217,0,37,0.25)' : 'none'
                                            }}
                                        >
                                            {isSel && isEmerg && (
                                                <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: -1, borderRadius: 16, border: '2px solid var(--red)', filter: 'blur(4px)' }} />
                                            )}
                                            <PriorityBadge priority={p} />
                                        </motion.div>
                                    );
                                })}
                            </div>
       </div>
                        </div>

                        <textarea 
                            value={notes} onChange={e => setNotes(e.target.value)} 
                            placeholder="OPERATIONAL NOTES (OPTIONAL)..." rows={2}
                            style={{ 
                                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 14, padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: 11, 
                                color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 32,
                                letterSpacing: '0.05em'
                            }} 
                        />

                        <div style={{ display: 'flex', gap: 16 }}>
                            <motion.button 
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                onClick={onClose} 
                                style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}
                            >
                                DISCARD
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit} disabled={loading} 
                                style={{ 
                                    flex: 2.5, background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', 
                                    borderRadius: 16, padding: '14px 0', cursor: 'pointer', 
                                    fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 800, color: '#fff', 
                                    opacity: loading ? 0.7 : 1, boxShadow: '0 10px 40px rgba(217,0,37,0.2)'
                                }}
                            >
                                {loading ? 'AUTHORIZING...' : 'AUTHORIZE REQUEST →'}
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Request Row ─── */
function RequestRow({ req, onCancel }) {
    const [open, setOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const toggleDetail = async () => {
        if (!open && !detailData) {
            setLoadingDetail(true);
            try {
                const res = await hospitalService.getRequestById(req.request_id);
                setDetailData(res.data?.data || res.data);
            } catch { /* show what we have */ }
            setLoadingDetail(false);
        }
        setOpen(v => !v);
    };

    const detail = detailData || req;

    return (
        <div style={{ marginBottom: 8 }}>
            <motion.div 
                onClick={toggleDetail}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)', x: 4 }}
                style={{ 
                    display: 'grid', gridTemplateColumns: '1.2fr 100px 70px 1fr 110px 120px 100px 28px', 
                    gap: 16, alignItems: 'center', padding: '18px 24px', 
                    background: open ? 'rgba(217,0,37,0.03)' : 'transparent',
                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    borderBottom: open ? 'none' : '1px solid rgba(255,255,255,0.04)'
                }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{req.patient_name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{req.patient_ward || 'General'}</div>
                </div>
                <BloodGroupBadge group={req.blood_group} small />
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{req.units_required}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>UNITS</div>
                </div>
                <div style={{ 
                    fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.6)', 
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500
                }}>{req.bank_name}</div>
                <PriorityBadge priority={req.priority} />
                <StatusBadge status={req.status} />
                <div style={{ textAlign: 'right' }}>
                    {req.status === 'Pending' && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); onCancel(req); }}
                            style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>CANCEL</motion.button>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.div animate={{ rotate: open ? 180 : 0 }}>
                        <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                    </motion.div>
                </div>
            </motion.div>
            
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} 
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }} 
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ 
                            background: 'linear-gradient(135deg, rgba(217,0,37,0.06), rgba(217,0,37,0.01))', 
                            borderLeft: '2px solid var(--red)',
                            borderRadius: '0 0 20px 20px',
                            margin: '0 4px',
                            padding: '32px 40px', 
                            borderBottom: '1px solid rgba(217,0,37,0.15)',
                            position: 'relative'
                        }}>
                            {loadingDetail ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                                    <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} /> FETCHING SECURE AUDIT...
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 60 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <Users size={16} color="var(--red)" />
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Patient Integrity</div>
                                        </div>
                                        <div style={{ display: 'grid', gap: 14 }}>
                                            {[
                                                ['IDENTIFIER', detail.request_id],
                                                ['FULL NAME', detail.patient_name],
                                                ['CLINICAL DATA', `${detail.patient_age || '--'} Yrs · ${detail.blood_group}`],
                                                ['WARD LOCATION', detail.patient_ward || 'Not Assigned']
                                            ].map(([l, v]) => (
                                                <div key={l}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2, letterSpacing: '0.05em' }}>{l}</div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff', fontWeight: 600 }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <Droplets size={16} color="var(--red)" />
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Resource Allocation</div>
                                        </div>
                                        {detail.issue_id ? (
                                            <div style={{ display: 'grid', gap: 14 }}>
                                                {[
                                                    ['ISSUE ID', detail.issue_id],
                                                    ['TIMESTAMP', fmt(detail.issue_date)],
                                                    ['QUANTITY', `${detail.units_issued} Units Issued`]
                                                ].map(([l, v]) => (
                                                    <div key={l}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>{l}</div>
                                                        <div style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff', fontWeight: 600 }}>{v}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Awaiting bank clearance</div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <TrendingUp size={16} color="var(--red)" />
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Request Lifecycle</div>
                                        </div>
                                        <div style={{ position: 'relative', paddingLeft: 24 }}>
                                            <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                            {(detail.timeline || [
                                                { step: 'Requested', done: true, date: detail.request_date },
                                                { step: 'In Transit', done: detail.status !== 'Pending' && detail.status !== 'Cancelled' },
                                                { step: 'Success', done: detail.status === 'Fulfilled', date: detail.issue_date },
                                            ]).map((step, idx) => (
                                                <div key={idx} style={{ position: 'relative', marginBottom: 20 }}>
                                                    <div style={{ 
                                                        position: 'absolute', left: -24, top: 2, width: 9, height: 9, borderRadius: '50%', 
                                                        background: step.done ? 'var(--red)' : '#1a1a24', 
                                                        border: step.done ? 'none' : '2px solid rgba(255,255,255,0.1)',
                                                        boxShadow: step.done ? '0 0 10px rgba(217,0,37,0.4)' : 'none'
                                                    }} />
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontSize: 13, color: step.done ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{step.step || step.label}</div>
                                                    {step.date && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{fmt(step.date)}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const STAT_TABS = ['All', 'Pending', 'Processing', 'Fulfilled', 'Cancelled'];
const PRIO_TABS = ['All', 'Emergency', 'Urgent', 'Routine'];

export default function HospitalRequests() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('All');
    const [prioFilter, setPrioFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const limit = 20;

    const fetchParams = {
        limit, offset,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: prioFilter !== 'All' ? prioFilter : undefined
    };

    const { data, loading, error, refetch } = useFetch(hospitalService.getRequests, fetchParams, [statusFilter, prioFilter, offset]);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const prePatient = searchParams.get('patientId');
        const preBlood = searchParams.get('bloodGroup');
        const isEmergency = searchParams.get('priority') === 'Emergency';

        if (prePatient || preBlood) {
            setShowModal(true);
            // The modal state is internal, so I'll need a way to pass these.
            // I'll modify NewRequestModal to accept 'initialData'.
        }
    }, [searchParams]);

    const requests = data?.requests || [];
    const total = data?.total || 0;
    const summary = data?.summary || {};

    // Local search filter
    const filtered = requests.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (r.request_id?.toLowerCase().includes(q) || r.patient_name?.toLowerCase().includes(q));
    });

    const handleCancel = async () => {
        if (!cancelTarget) return;
        setIsCancelling(true);
        try {
            await hospitalService.cancelRequest(cancelTarget.request_id);
            toast.success('Request cancelled');
            setIsCancelled(true);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancel failed');
        } finally {
            setIsCancelling(false);
        }
    };

    const closeCancelModal = () => {
        setCancelTarget(null);
        setIsCancelled(false);
    };

    useEffect(() => { setOffset(0); }, [statusFilter, prioFilter]);

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <>

            <AnimatePresence>
                {showModal && (
                    <NewRequestModal 
                        onClose={() => { setShowModal(false); clearParams(); }} 
                        onSuccess={() => { refetch(); clearParams(); }} 
                        initialData={{
                            patientId: searchParams.get('patientId'),
                            bloodGroup: searchParams.get('bloodGroup'),
                            priority: searchParams.get('priority')
                        }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {cancelTarget && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) closeCancelModal(); }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{ 
                                background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', 
                                borderRadius: 24, padding: 40, width: '100%', maxWidth: 440, position: 'relative', 
                                maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
                            }}
                        >
                            <button onClick={closeCancelModal} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={20} /></button>
                            
                            {isCancelled ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <Check size={40} color="var(--red)" />
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 8 }}>Request Cancelled</h2>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)', marginBottom: 32 }}>Your blood request {cancelTarget.request_id} has been permanently cancelled.</p>
                                    <button onClick={closeCancelModal} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Close Window</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertTriangle size={24} color="var(--red)" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>Cancel Request?</h2>
                                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reversal Action</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#CACACE', lineHeight: 1.6 }}>
                                            Are you sure you want to cancel the request for <span style={{ color: '#fff', fontWeight: 600 }}>{cancelTarget.patient_name}</span> ({cancelTarget.blood_group})?
                                        </p>
                                        <p style={{ marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
                                            This request will be removed from the active queue and the blood bank will be notified of the cancellation.
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <button onClick={closeCancelModal} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', cursor: 'pointer' }}>Go Back</button>
                                        <button onClick={handleCancel} disabled={isCancelling} style={{ background: 'var(--red)', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,0,37,0.3)', opacity: isCancelling ? 0.7 : 1 }}>
                                            {isCancelling ? 'Cancelling...' : 'Indeed, Cancel Request'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ minHeight: 120 }}>
                    <AnimatePresence mode="wait">
                        {loading && !data ? (
                            <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonStats count={4} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="stats-grid" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}
                            >
                                {[{ label: 'TOTAL REQUESTS', val: summary.total ?? 0, color: '#fff', icon: Droplets }, { label: 'FULFILLED', val: summary.fulfilled ?? 0, color: '#22c55e', icon: Check }, { label: 'PENDING', val: (summary.pending ?? 0) + (summary.processing ?? 0), color: '#f59e0b', icon: AlertTriangle }, { label: 'SUCCESS RATE', val: `${summary.fulfillment_rate ?? 0}%`, color: 'var(--red)', icon: TrendingUp }].map(({ label, val, color, icon: Icon }, i) => (
                                    <motion.div 
                                        key={label} 
                                        whileHover={{ y: -5, borderColor: 'rgba(217,0,37,0.35)' }}
                                        style={{ background: 'rgba(15, 15, 23, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: -20, right: -10, width: 80, height: 80, background: `radial-gradient(circle at center, ${color}15, transparent 70%)`, filter: 'blur(15px)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={16} color={color} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{label}</div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{val}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Header Container */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(217,0,37,0.05)' }}>
                            <Droplets size={32} color="var(--red)" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>Recent Orders</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.05em' }}>
                                TRACKING <span style={{ color: '#fff', fontWeight: 700 }}>{total}</span> ACTIVE BLOOD ORDERS
                            </div>
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)} 
                        style={{ 
                            background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', cursor: 'pointer', 
                            borderRadius: 16, padding: '14px 32px', fontFamily: 'var(--font-sub)', 
                            fontSize: 15, fontWeight: 700, color: '#fff',
                            boxShadow: '0 10px 40px rgba(217,0,37,0.25)',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}
                    >
                        <Plus size={20} strokeWidth={3} /> Submit New Request
                    </motion.button>
                </div>

                {/* Filters & Search - Modernized Strip */}
                <div style={{ 
                    display: 'flex', gap: 24, padding: '12px 24px', 
                    background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, 
                    alignItems: 'center', backdropFilter: 'blur(10px)' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>STATUS:</div>
                        {STAT_TABS.map(t => (
                            <motion.button 
                                key={t} onClick={() => setStatusFilter(t)} 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    background: statusFilter === t ? 'rgba(217,0,37,0.15)' : 'transparent', 
                                    border: `1px solid ${statusFilter === t ? 'rgba(217,0,37,0.25)' : 'transparent'}`, 
                                    borderRadius: 10, padding: '6px 14px', cursor: 'pointer', 
                                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: statusFilter === t ? 700 : 500,
                                    color: statusFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.toUpperCase()}
                            </motion.button>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>PRIORITY:</div>
                        {PRIO_TABS.map(t => (
                            <motion.button 
                                key={t} onClick={() => setPrioFilter(t)} 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    background: prioFilter === t ? 'rgba(255,255,255,0.08)' : 'transparent', 
                                    border: `1px solid ${prioFilter === t ? 'rgba(255,255,255,0.15)' : 'transparent'}`, 
                                    borderRadius: 10, padding: '6px 14px', cursor: 'pointer', 
                                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: prioFilter === t ? 700 : 500,
                                    color: prioFilter === t ? '#fff' : 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.toUpperCase()}
                            </motion.button>
                        ))}
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="var(--red)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="FIND ORDER BY PATIENT OR ID..."
                            style={{ 
                                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 12, padding: '10px 16px 10px 42px', 
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box',
                                letterSpacing: '0.05em'
                            }} 
                        />
                    </div>
                </div>
                {/* Table */}
                <div style={{ minHeight: 400 }}>
                    <AnimatePresence mode="wait">
                        {loading && !data ? (
                            <motion.div key="loading-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonTable rows={10} cols={6} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="table-content" 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ 
                                    background: 'rgba(15, 15, 23, 0.6)', 
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                                    borderRadius: 28, padding: 8, paddingBottom: 24 
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 100px 70px 1fr 110px 120px 100px 28px', gap: 16, padding: '24px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                                    {[
                                        { l: 'PATIENT', i: Users }, 
                                        { l: 'GROUP', i: Droplets }, 
                                        { l: 'UNITS', i: Droplets }, 
                                        { l: 'BANK', i: CreditCard }, 
                                        { l: 'URGENCY', i: AlertTriangle }, 
                                        { l: 'STATUS', i: TrendingUp },
                                        { l: 'ACTION', i: X },
                                        { l: '', i: ChevronDown }
                                    ].map(({ l, i: Ic }) => (
                                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                                            <Ic size={12} /> {l}
                                        </div>
                                    ))}
                                </div>
                                {filtered.length === 0 ? (
                                    <div style={{ padding: 40 }}>
                                        <EmptyState icon={Droplets} title="No requests found" subtitle="Adjust filters or create a new request" />
                                    </div>
                                ) : (
                                    <div style={{ padding: '0 8px' }}>
                                        {filtered.map(req => <RequestRow key={req.request_id} req={req} onCancel={(r) => setCancelTarget(r)} />)}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />
            </div>
        </>
    );
}

