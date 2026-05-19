import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Plus, Droplets } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import BBModal, { BBModalFooter } from '../../components/bloodbank/BBModal';
import { cardBase, inputStyle, selectStyle, labelStyle, primaryBtn, ghostBtn, VitalPill } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import Pagination from '../../components/Pagination';
import { InlineLoader } from '../../components/LoadingSpinner';
import { formatML } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';

export default function BloodBankHealthChecks() {
    const location = useLocation();
    const preselectedDonor = location.state?.donor || null;
    const [offset, setOffset] = useState(0);
    const limit = 10;
    const [showCreate, setShowCreate] = useState(!!preselectedDonor);

    const fetchParams = { limit, offset };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getHealthChecks, fetchParams, [offset]);

    const checks = result?.health_checks || [];
    const total = result?.total || 0;

    if (error) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 28, color: '#fff' }}>Health Checks</h1>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', marginTop: 4 }}>Donor health checks</p>
                </div>
                <button onClick={() => setShowCreate(true)} style={primaryBtn}><Plus size={14} /> NEW HEALTH CHECK</button>
            </div>

            {/* List */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ ...cardBase, padding: 28 }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ background: '#14141E', borderRadius: 16, height: 100, animation: 'pulse 1.5s infinite' }} />)}</div>
                ) : checks.length === 0 ? (
                    <BBEmptyState icon={Stethoscope} title="No health checks" subtitle="Record donor health checks here" action={() => setShowCreate(true)} actionLabel="+ NEW HEALTH CHECK" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {checks.map(hc => {
                            const dt = new Date(hc.check_date);
                            const status = hc.eligibility_status;
                            const statusColor = 
                                status === 'Eligible' ? '#22c55e' : 
                                status === 'Cooling' ? '#f59e0b' : 
                                '#D90025'; // Deferred

                            return (
                                <motion.div 
                                    key={hc.check_id}
                                    whileHover="hover"
                                    style={{
                                        position: 'relative', overflow: 'hidden',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: 16, border: `1px solid ${statusColor}40`,
                                        boxShadow: `inset 0 0 12px ${statusColor}10`,
                                        padding: 20, cursor: 'default',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Animated Beam */}
                                    <motion.div
                                        variants={{
                                            hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            position: 'absolute', inset: '1px',
                                            background: `linear-gradient(90deg, transparent, ${statusColor}12, transparent)`,
                                            pointerEvents: 'none', zIndex: 0
                                        }}
                                    />
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        {/* Date block */}
                                        <div style={{ flexShrink: 0, textAlign: 'center', background: '#14141E', borderRadius: 12, padding: '12px 14px', width: 64, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1 }}>{dt.getDate()}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase' }}>{dt.toLocaleString('en-IN', { month: 'short' })}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55' }}>{dt.getFullYear()}</p>
                                        </div>
                                        {/* Main */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                                                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{hc.donor_name}</p>
                                                <BBBloodBadge group={hc.donor_blood_group || hc.blood_group} size="xs" />
                                                <BBStatusBadge status={status} size="xs" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                                <VitalPill label="Hb" value={`${hc.hemoglobin}g`} good={hc.hemoglobin >= 12.5} />
                                                <VitalPill label="Wt" value={`${hc.weight}kg`} good={hc.weight >= 50} />
                                                <VitalPill label="BP" value={hc.blood_pressure} good={true} />
                                            </div>
                                        </div>
                                        {/* Donation link */}
                                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                            {hc.donation_id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 10, padding: '8px 12px' }}>
                                                    <Droplets size={12} color="#22c55e" />
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#22c55e', fontWeight: 700, letterSpacing: '0.05em' }}>DONATED</p>
                                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(34,197,94,0.5)' }}>{formatML(hc.quantity_ml)}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ padding: '8px 12px' }}>
                                                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', fontWeight: 600 }}>PENDING ACTION</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
            <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />


            <AnimatePresence>
                {showCreate && <CreateHealthCheckModal preselected={preselectedDonor} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch(); }} />}
            </AnimatePresence>
        </div>
    );
}

function CreateHealthCheckModal({ preselected, onClose, onCreated }) {
    const { data: donorsResult } = useFetch(bloodBankService.getDonors, { limit: 200, eligibility: 'Eligible' });
    const donorList = donorsResult?.donors || [];

    const [form, setForm] = useState({
        donor_id: preselected?.donor_id || '', hemoglobin: '', weight: '', blood_pressure: '', disease_history: '',
        check_date: new Date().toISOString().split('T')[0],
    });
    const [saving, setSaving] = useState(false);

    // Live eligibility preview
    const hb = parseFloat(form.hemoglobin);
    const wt = parseFloat(form.weight);
    const eligPreview = !isNaN(hb) && !isNaN(wt) ? (hb >= 12.5 && wt >= 50 ? 'Eligible' : 'Deferred') : null;

    const handleSubmit = async () => {
        if (!form.donor_id || !form.hemoglobin || !form.weight || !form.blood_pressure) { toast.error('Fill all required fields'); return; }
        setSaving(true);
        try {
            await bloodBankService.createHealthCheck({
                ...form, hemoglobin: parseFloat(form.hemoglobin), weight: parseFloat(form.weight),
            });
            toast.success('Health check recorded!'); onCreated();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <BBModal onClose={onClose} title="New Health Check" subtitle="Pre-donation screening" icon={Stethoscope} maxWidth={520}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={labelStyle}>Donor *</label>
                    <select value={form.donor_id} onChange={e => setForm(f => ({ ...f, donor_id: e.target.value }))} style={selectStyle}>
                        <option value="">Select donor...</option>
                        {donorList.map(d => <option key={d.donor_id} value={d.donor_id}>{d.name} ({d.blood_group})</option>)}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 12, alignItems: 'end' }}>
                    <NumberStepper
                        label="Hemoglobin (g/dL)"
                        value={parseFloat(form.hemoglobin) || 12.5}
                        onChange={v => setForm(f => ({ ...f, hemoglobin: String(v) }))}
                        min={5}
                        max={20}
                        step={0.1}
                    />
                    <NumberStepper
                        label="Weight (kg)"
                        value={parseInt(form.weight) || 50}
                        onChange={v => setForm(f => ({ ...f, weight: String(v) }))}
                        min={30}
                        max={200}
                        step={1}
                    />
                    <div>
                        <label style={labelStyle}>Blood Pressure *</label>
                        <input value={form.blood_pressure} onChange={e => setForm(f => ({ ...f, blood_pressure: e.target.value }))} style={inputStyle} placeholder="120/80" />
                    </div>
                </div>
                <div><label style={labelStyle}>Disease History</label><textarea value={form.disease_history} onChange={e => setForm(f => ({ ...f, disease_history: e.target.value }))} style={{ ...inputStyle, resize: 'none', minHeight: 50 }} placeholder="Any relevant medical history..." /></div>
                <div><label style={labelStyle}>Check Date</label><input type="date" value={form.check_date} onChange={e => setForm(f => ({ ...f, check_date: e.target.value }))} style={inputStyle} /></div>

                {/* Live eligibility preview */}
                {eligPreview && (
                    <div style={{
                        background: eligPreview === 'Eligible' ? 'rgba(34,197,94,0.08)' : 'rgba(217,0,37,0.08)',
                        border: `1px solid ${eligPreview === 'Eligible' ? 'rgba(34,197,94,0.20)' : 'rgba(217,0,37,0.20)'}`,
                        borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4' }}>Eligibility prediction:</p>
                        <BBStatusBadge status={eligPreview} size="md" />
                    </div>
                )}
            </div>
            <BBModalFooter>
                <button onClick={onClose} style={ghostBtn}>CANCEL</button>
                <button onClick={handleSubmit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.5 : 1 }}>{saving ? <><InlineLoader /> SAVING...</> : <><Stethoscope size={14} /> RECORD CHECK</>}</button>
            </BBModalFooter>
        </BBModal>
    );
}
