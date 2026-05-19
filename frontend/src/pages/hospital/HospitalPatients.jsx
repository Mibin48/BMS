import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    LayoutGrid, List, Search, X, Check, Trash2, Droplets, Trash, 
    Users, TrendingUp, AlertTriangle, Plus, ChevronDown, UserPlus, Fingerprint 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import Pagination from '../../components/Pagination';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const WARDS = ['All', 'Emergency', 'Surgery', 'Oncology', 'Maternity', 'ICU', 'General'];
const STATUSES = ['All', 'Critical', 'Stable', 'Admitted', 'Discharged'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ALL_WARDS = ['Emergency', 'Surgery', 'Oncology', 'Maternity', 'ICU', 'General'];

function avatarBg(bg) { if (!bg) return 'rgba(255,255,255,0.1)'; if (bg.startsWith('A')) return 'rgba(99,102,241,0.35)'; if (bg.startsWith('B')) return 'rgba(34,197,94,0.25)'; if (bg.startsWith('O')) return 'rgba(217,0,37,0.25)'; return 'rgba(168,85,247,0.3)'; }
function statusStyle(s) {
    if (s === 'Critical') return { bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.3)', color: 'var(--red)', pulse: true };
    if (s === 'Stable') return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22c55e', pulse: false };
    if (s === 'Discharged') return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', color: 'var(--text3)', pulse: false };
    return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--text3)', pulse: false };
}
function fmt(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function initials(name) { if (!name) return '?'; return name.split(' ').slice(0, 2).map(n => n[0]).join(''); }

/* ─── Add Patient Modal ─── */
function AddPatientModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [bg, setBg] = useState('');
    const [ward, setWard] = useState('Emergency');
    const { execute: createPatient, loading } = useApi(hospitalService.createPatient);
    const [done, setDone] = useState(false);
    const [createdId, setCreatedId] = useState('');

    const iS = { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, marginTop: 24, fontWeight: 800 };

    const handleSubmit = async () => {
        if (!name || !age || !bg) { toast.error('Fill name, age, and blood group'); return; }
        try {
            const result = await createPatient({ name, age: parseInt(age), gender, blood_group: bg, ward, status: 'Admitted' });
            setCreatedId(result?.patient_id || '');
            setDone(true);
            toast.success('Patient added!');
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add patient');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ 
                    background: 'linear-gradient(135deg, rgba(15,15,23,0.95), rgba(10,10,15,0.98))', 
                    border: '1px solid rgba(217,0,37,0.3)', borderRadius: 32, padding: 48, 
                    width: '100%', maxWidth: 500, position: 'relative',
                    maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 50px rgba(217,0,37,0.1)' 
                }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} color="rgba(255,255,255,0.4)" /></button>
                
                {done ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(34,197,148,0.2)' }}>
                            <Check size={40} color="#22c55e" />
                        </motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 8 }}>Patient Registered</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginBottom: 24, letterSpacing: '0.1em' }}>REG ID: {createdId}</div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 40px', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 700, color: '#fff' }}>Dismiss Window</motion.button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={22} color="var(--red)" />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>Add Patient</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Initialize new clinical record.</div>
                                </div>
                            </div>
                        </div>

                        <label style={lS}><Fingerprint size={12} /> IDENTITY ALIAS</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Patient Name" style={iS} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'end' }}>
                            <div>
                                <label style={lS}><TrendingUp size={12} /> BIOMETRIC AGE</label>
                                <NumberStepper value={parseInt(age) || 30} onChange={v => setAge(String(v))} min={0} max={120} />
                            </div>
                            <div>
                                <label style={lS}>GENDER CATEGORY</label>
                                <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                                    {['Male', 'Female', 'Other'].map(g => <option key={g} style={{ background: '#0F0F17' }}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <label style={lS}><Droplets size={12} /> RESOURCE COMPATIBILITY</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {BLOOD_TYPES.map(b => (
                                <motion.button 
                                    key={b} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setBg(b)} 
                                    style={{ 
                                        padding: '10px 0', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                                        background: bg === b ? 'var(--red)' : 'rgba(255,255,255,0.03)', 
                                        border: `1px solid ${bg === b ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`, 
                                        fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 12, color: '#fff',
                                        transition: 'all 0.2s'
                                    }}
                                >{b}</motion.button>
                            ))}
                        </div>

                        <label style={lS}>ASSIGNMENT WARD</label>
                        <select value={ward} onChange={e => setWard(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                            {ALL_WARDS.map(w => <option key={w} style={{ background: '#0F0F17' }}>{w.toUpperCase()}</option>)}
                        </select>

                        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
                            <motion.button 
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                onClick={onClose} 
                                style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}
                            >DISCARD</motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit} disabled={loading} 
                                style={{ 
                                    flex: 2, background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', 
                                    borderRadius: 16, padding: '14px 0', cursor: 'pointer', 
                                    fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 800, color: '#fff', 
                                    opacity: loading ? 0.7 : 1, boxShadow: '0 10px 40px rgba(217,0,37,0.2)'
                                }}
                            >{loading ? 'INITIALIZING...' : 'AUTHORIZE ADMISSION →'}</motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Edit Patient Modal ─── */
function EditPatientModal({ patient, onClose, onSuccess }) {
    const [name, setName] = useState(patient.name || '');
    const [age, setAge] = useState(patient.age || '');
    const [gender, setGender] = useState(patient.gender || 'Male');
    const [bg, setBg] = useState(patient.blood_group || '');
    const [ward, setWard] = useState(patient.ward || 'General');
    const [status, setStatus] = useState(patient.status || 'Admitted');
    const { execute: updatePatient, loading } = useApi((data) => hospitalService.updatePatient(patient.patient_id, data));
    
    const iS = { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, marginTop: 20, fontWeight: 800 };

    const handleSubmit = async () => {
        try {
            await updatePatient({ name, age: parseInt(age), gender, blood_group: bg, ward, status });
            toast.success('Patient updated!');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ 
                    background: 'linear-gradient(135deg, rgba(15,15,23,0.95), rgba(10,10,15,0.98))', 
                    border: '1px solid rgba(217,0,37,0.3)', borderRadius: 32, padding: 48, 
                    width: '100%', maxWidth: 500, position: 'relative',
                    maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 50px rgba(217,0,37,0.1)' 
                }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} color="rgba(255,255,255,0.4)" /></button>
                
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>Edit Record</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginTop: 8, letterSpacing: '0.1em' }}>REG ID: {patient.patient_id}</div>
                </div>

                <label style={lS}>FULL NAME</label><input value={name} onChange={e => setName(e.target.value)} style={iS} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                        <label style={lS}>AGE</label>
                        <NumberStepper value={parseInt(age) || 30} onChange={v => setAge(String(v))} min={0} max={120} />
                    </div>
                    <div>
                        <label style={lS}>GENDER</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                            {['Male', 'Female', 'Other'].map(g => <option key={g} style={{ background: '#0F0F17' }}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div><label style={lS}>WARD</label><select value={ward} onChange={e => setWard(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>{ALL_WARDS.map(w => <option key={w} style={{ background: '#0F0F17' }}>{w.toUpperCase()}</option>)}</select></div>
                    <div><label style={lS}>STATUS</label><select value={status} onChange={e => setStatus(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>{['Critical', 'Stable', 'Admitted', 'Discharged'].map(s => <option key={s} style={{ background: '#0F0F17' }}>{s.toUpperCase()}</option>)}</select></div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
                    <motion.button 
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        onClick={onClose} 
                        style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}
                    >CANCEL</motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit} disabled={loading} 
                        style={{ 
                            flex: 2, background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', 
                            borderRadius: 16, padding: '14px 0', cursor: 'pointer', 
                            fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 800, color: '#fff', 
                            opacity: loading ? 0.7 : 1, boxShadow: '0 10px 40px rgba(217,0,37,0.2)'
                        }}
                    >{loading ? 'SAVING...' : 'UPDATE PATIENT →'}</motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Main Page ─── */
export default function HospitalPatients() {
    const { showExpiryModal } = useAuth();
    const [view, setView] = useState('grid');
    const [ward, setWard] = useState('All');
    const [status, setStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const limit = 20;

    const fetchParams = {
        limit, offset,
        ward: ward !== 'All' ? ward : undefined,
        status: status !== 'All' ? status : undefined,
        search: search || undefined
    };

    const { data, loading, error, refetch } = useFetch(hospitalService.getPatients, fetchParams, [ward, status, search, offset]);

    const patients = data?.patients || [];
    const total = data?.total || 0;
    const summary = data?.summary || {};

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await hospitalService.deletePatient(deleteTarget.patient_id);
            toast.success('Patient record deleted');
            setIsDeleted(true);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setIsDeleted(false);
    };

    // Reset offset when filters change
    useEffect(() => { setOffset(0); }, [ward, status, search]);

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <>

            <AnimatePresence>{showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} onSuccess={() => { refetch(); }} />}</AnimatePresence>
            <AnimatePresence>{editingPatient && <EditPatientModal patient={editingPatient} onClose={() => setEditingPatient(null)} onSuccess={() => { refetch(); }} />}</AnimatePresence>
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) closeDeleteModal(); }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 440, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                        >
                            <button onClick={closeDeleteModal} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={20} /></button>
                            
                            {isDeleted ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <Check size={40} color="#22c55e" />
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 8 }}>Record Deleted</h2>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)', marginBottom: 32 }}>Patient record has been permanently removed from the system.</p>
                                    <button onClick={closeDeleteModal} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Close Window</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={24} color="var(--red)" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>Delete Patient?</h2>
                                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Permanent Removal</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#CACACE', lineHeight: 1.6 }}>
                                            Are you sure you want to delete <span style={{ color: '#fff', fontWeight: 600 }}>{deleteTarget?.name}</span>?
                                        </p>
                                        <p style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(217,0,37,0.05)', borderRadius: 8, border: '1px solid rgba(217,0,37,0.1)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--red)' }}>
                                            ⚠ This action cannot be undone and will erase all data associated with this patient record.
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <button onClick={closeDeleteModal} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleDelete} disabled={isDeleting} style={{ background: 'var(--red)', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217,0,37,0.3)', opacity: isDeleting ? 0.7 : 1 }}>
                                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats Container */}
                <div style={{ minHeight: 120 }}>
                    <AnimatePresence mode="wait">
                        {loading && !data ? (
                            <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonStats count={3} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="stats-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
                            >
                                {[
                                    { label: 'TOTAL PATIENTS', val: summary.total ?? total, color: '#fff', icon: Users }, 
                                    { label: 'CRITICAL STATUS', val: summary.critical ?? 0, color: 'var(--red)', icon: AlertTriangle }, 
                                    { label: 'ACTIVE QUEUE', val: summary.active ?? 0, color: '#22c55e', icon: TrendingUp }
                                ].map(({ label, val, color, icon: Icon }, i) => (
                                    <motion.div 
                                        key={label} whileHover={{ y: -5, borderColor: 'rgba(217,0,37,0.35)' }}
                                        style={{ background: 'rgba(15, 15, 23, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: -20, right: -10, width: 80, height: 80, background: `radial-gradient(circle at center, ${color}15, transparent 70%)`, filter: 'blur(15px)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={16} color={color} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{label}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{val}</div>
                                            {label === 'CRITICAL STATUS' && val > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 10px var(--red)', animation: 'pulse 1.2s infinite' }} />}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Header Container */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(217,0,37,0.05)' }}>
                            <Users size={32} color="var(--red)" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>Patient List</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.05em' }}>
                                <span style={{ color: '#fff', fontWeight: 700 }}>{total}</span> TOTAL RECORDS · <span style={{ color: 'var(--red)', fontWeight: 700 }}>{summary.critical ?? 0}</span> HIGH PRIORITY
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <button onClick={() => setView('grid')} style={{ background: view === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: view === 'grid' ? '#fff' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                                <LayoutGrid size={14} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>GRID</span>
                            </button>
                            <button onClick={() => setView('table')} style={{ background: view === 'table' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: view === 'table' ? '#fff' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                                <List size={14} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>LIST</span>
                            </button>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddModal(true)} 
                            style={{ 
                                background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', cursor: 'pointer', 
                                borderRadius: 16, padding: '14px 32px', fontFamily: 'var(--font-sub)', 
                                fontSize: 15, fontWeight: 700, color: '#fff',
                                boxShadow: '0 10px 40px rgba(217,0,37,0.25)',
                                display: 'flex', alignItems: 'center', gap: 10
                            }}
                        >
                            <Plus size={20} strokeWidth={3} /> New Patient
                        </motion.button>
                    </div>
                </div>

                {/* Filters & Search - Modernized Strip */}
                <div style={{ 
                    display: 'flex', gap: 24, padding: '12px 24px', 
                    background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, 
                    alignItems: 'center', backdropFilter: 'blur(10px)' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>WARD:</div>
                        {WARDS.slice(0, 5).map(w => (
                            <motion.button 
                                key={w} onClick={() => setWard(w)} 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    background: ward === w ? 'rgba(217,0,37,0.15)' : 'transparent', 
                                    border: `1px solid ${ward === w ? 'rgba(217,0,37,0.25)' : 'transparent'}`, 
                                    borderRadius: 10, padding: '6px 14px', cursor: 'pointer', 
                                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: ward === w ? 700 : 500,
                                    color: ward === w ? 'var(--red)' : 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s'
                                }}
                            >{w.toUpperCase()}</motion.button>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>STATUS:</div>
                        {STATUSES.map(t => (
                            <motion.button 
                                key={t} onClick={() => setStatus(t)} 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    background: status === t ? 'rgba(255,255,255,0.08)' : 'transparent', 
                                    border: `1px solid ${status === t ? 'rgba(255,255,255,0.15)' : 'transparent'}`, 
                                    borderRadius: 10, padding: '6px 14px', cursor: 'pointer', 
                                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: status === t ? 700 : 500,
                                    color: status === t ? '#fff' : 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s'
                                }}
                            >{t.toUpperCase()}</motion.button>
                        ))}
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="var(--red)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="FIND PATIENT BY NAME OR ID..."
                            style={{ 
                                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 12, padding: '10px 16px 10px 42px', 
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box',
                                letterSpacing: '0.05em'
                            }} 
                        />
                    </div>
                </div>
                {/* Content */}
                <div style={{ minHeight: 400 }}>
                    <AnimatePresence mode="wait">
                        {loading && !data ? (
                            <motion.div key="loading-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonTable rows={view === 'grid' ? 6 : 8} cols={view === 'grid' ? 3 : 8} />
                            </motion.div>
                        ) : patients.length === 0 ? (
                            <motion.div key="empty-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <EmptyState icon={Droplets} title="No patients found" subtitle="Adjust filters or add a new patient" />
                            </motion.div>
                        ) : (
                            <motion.div key="patients-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {view === 'grid' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                        {patients.map((p, i) => {
                                            const sts = statusStyle(p.status);
                                            return (
                                                <motion.div key={p.patient_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                                    whileHover={{ y: -8, borderColor: 'rgba(217,0,37,0.4)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                                    style={{ background: 'rgba(15, 15, 23, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${sts.color}15, transparent 70%)` }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                                        <div style={{ width: 52, height: 52, borderRadius: 16, background: avatarBg(p.blood_group), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>{initials(p.name)}</div>
                                                        <motion.div 
                                                            style={{ 
                                                                background: sts.bg, border: `1px solid ${sts.border}`, borderRadius: 10, padding: '4px 10px', 
                                                                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: sts.color,
                                                                display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em'
                                                            }}
                                                        >
                                                            {sts.pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: sts.color, boxShadow: `0 0 8px ${sts.color}`, animation: 'pulse 1.2s infinite' }} />}
                                                            {p.status?.toUpperCase()}
                                                        </motion.div>
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4 }}>{p.name}</div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 20, letterSpacing: '0.1em' }}>{p.patient_id}</div>
                                                    
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 24, border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>WARD</div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{p.ward || 'General'}</div></div>
                                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>BLOOD</div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{p.blood_group}</div></div>
                                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 2 }}>AGE</div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{p.age}</div></div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }} onClick={() => setEditingPatient(p)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 12, fontWeight: 700, color: '#fff' }}>Edit Record</motion.button>
                                                        <motion.button whileHover={{ backgroundColor: 'rgba(217,0,37,0.1)' }} onClick={() => setDeleteTarget(p)} style={{ width: 42, background: 'transparent', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--red)' }}><Trash2 size={16} /></motion.button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 8, overflow: 'hidden' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 100px 100px 120px 120px 120px', gap: 12, padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {['ID', 'PATIENT NAME', 'AGE', 'GENDER', 'BLOOD', 'WARD', 'STATUS', 'ACTIONS'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '0.1em' }}>{h}</div>)}
                                        </div>
                                        {patients.map((p, i) => {
                                            const sts = statusStyle(p.status);
                                            return (
                                                <motion.div key={p.patient_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                                    style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 100px 100px 120px 120px 120px', gap: 12, alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{String(offset + i + 1).padStart(2, '0')}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarBg(p.blood_group), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}>{initials(p.name)}</div>
                                                        <div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{p.name}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{p.patient_id}</div></div>
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', letterSpacing: '-0.02em' }}>{p.age}</div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{p.gender?.toUpperCase()}</div>
                                                    <div><BloodGroupBadge group={p.blood_group} small /></div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', fontWeight: 600 }}>{p.ward?.toUpperCase() || '--'}</div>
                                                    <div>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sts.bg, border: `1px solid ${sts.border}`, borderRadius: 8, padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: sts.color }}>
                                                            {sts.pulse && <span style={{ width: 4, height: 4, borderRadius: '50%', background: sts.color, animation: 'pulse 1.2s infinite' }} />}
                                                            {p.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <motion.button onClick={() => setEditingPatient(p)} whileHover={{ color: 'var(--red)' }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>EDIT</motion.button>
                                                        <motion.button onClick={() => setDeleteTarget(p)} whileHover={{ color: 'var(--red)' }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}><Trash size={14} /></motion.button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Pagination */}
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />
            </div>
        </>
    );
}

