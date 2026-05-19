import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, ArrowRight, Beaker, Search, ChevronDown, User, Activity, Thermometer, Heart, Clock } from 'lucide-react';
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
import { formatDate, formatML } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { BBListSkeleton } from '../../components/bloodbank/BBSkeleton';
import BBStatCard from '../../components/bloodbank/BBStatCard';

function initials(n) { return n ? n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?'; }

// Sub-component: Expandable Donation Row
function DonationRow({ d }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderRadius: 16, marginBottom: 8 }}>
            <motion.div 
                whileHover="hover"
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 16, border: '1px solid rgba(217, 0, 37, 0.45)',
                    boxShadow: open ? 'inset 0 0 12px rgba(217, 0, 37, 0.1)' : 'none',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.3s ease', cursor: 'pointer'
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
                        background: 'linear-gradient(90deg, transparent, rgba(217, 0, 37, 0.1), transparent)',
                        pointerEvents: 'none', zIndex: 0
                    }}
                />
                {/* Avatar */}
                <div style={{ 
                    width: 44, height: 44, borderRadius: 14, 
                    background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.12)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#fff', 
                    flexShrink: 0 
                }}>
                    {initials(d.donor_name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.donor_name}</p>
                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{formatDate(d.donation_date)}</p>
                </div>

                <BBBloodBadge group={d.blood_group} size="sm" />

                {/* Volume */}
                <div style={{ textAlign: 'center', flexShrink: 0, width: 70 }}>
                    <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1 }}>{formatML(d.quantity_ml)}</p>
                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase' }}>volume</p>
                </div>

                {/* Quick Vitals */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <VitalPill label="Hb" value={d.hemoglobin} good={d.hemoglobin >= 12.5} />
                    <VitalPill label="BP" value={d.blood_pressure} good={true} />
                </div>

                <motion.div animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDown size={14} color="var(--text3)" />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '24px 32px', borderLeft: '3px solid var(--red)', margin: '4px 20px 20px', borderRadius: '0 0 16px 16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                                {/* Donor Profile Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <User size={14} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>DONOR PROFILE</span>
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{d.donor_name}</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{d.donor_city} | {d.donor_phone}</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4', marginTop: 8 }}>ID: <span style={{ color: 'var(--red)' }}>{d.donor_id}</span></p>
                                    </div>
                                </div>

                                {/* Clinical Vitals Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <Activity size={14} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>CLINICAL VITALS</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Heart size={12} color="var(--red)" />
                                                <span style={labelStyle}>BP</span>
                                            </div>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#fff', fontWeight: 700 }}>{d.blood_pressure}</p>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Beaker size={12} color="#3b82f6" />
                                                <span style={labelStyle}>HB</span>
                                            </div>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#fff', fontWeight: 700 }}>{d.hemoglobin} g/dL</p>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Activity size={12} color="#22c55e" />
                                                <span style={labelStyle}>WEIGHT</span>
                                            </div>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#fff', fontWeight: 700 }}>{d.weight} kg</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistic Log Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <Clock size={14} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>LOGISTIC LOG</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 8 }}>
                                            <span style={labelStyle}>DONATION ID</span>
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{d.donation_id}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 8 }}>
                                            <span style={labelStyle}>CHECK ID</span>
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{d.check_id}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={labelStyle}>ELIGIBILITY</span>
                                            <BBStatusBadge status={d.eligibility_status} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BloodBankDonations() {
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
    const limit = 10;
    const [showRecord, setShowRecord] = useState(false);

    const fetchParams = { limit, offset };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getDonations, fetchParams, [offset]);

    const donations = result?.donations || [];
    const summary = result?.summary || {};
    const total = result?.total || 0;

    const filteredDonations = donations.filter(d => 
        d.donor_name?.toLowerCase().includes(search.toLowerCase()) || 
        d.donation_id?.toLowerCase().includes(search.toLowerCase())
    );

    if (error) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <BBStatCard 
                        label="TOTAL DONATIONS" 
                        value={summary.total ?? '--'} 
                        icon={Heart} 
                        color="red" 
                        sub="Cumulative records"
                    />
                    <BBStatCard 
                        label="TOTAL BLOOD" 
                        value={`${((summary.total_ml || 0) / 1000).toFixed(1)}L`} 
                        icon={Droplets} 
                        color="red" 
                        sub={`${summary.unique_donors || 0} unique donors`}
                    />
                    <BBStatCard 
                        label="AVERAGE UNITS" 
                        value={`${summary.average_ml || 0}mL`} 
                        icon={Activity} 
                        color="white" 
                        sub="Per donation average"
                    />
                </div>

                {/* Search and Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                        <input 
                            placeholder="Search by donor or donation ID..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ 
                                ...inputStyle, paddingLeft: 42, 
                                background: 'rgba(15,15,23,0.4)', borderColor: 'rgba(255,255,255,0.06)',
                                fontFamily: 'var(--font-space)', fontSize: 12
                            }} 
                        />
                    </div>
                    <button onClick={() => setShowRecord(true)} style={primaryBtn}><Plus size={14} /> RECORD DONATION</button>
                </div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        background: 'rgba(15,15,23,0.3)', border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: 24, padding: 12 
                    }}>
                    {loading ? (
                        <BBListSkeleton rows={5} height={80} />
                    ) : filteredDonations.length === 0 ? (
                        <BBEmptyState 
                            icon={Droplets} 
                            title="No donor records" 
                            subtitle="Record blood donations from your verified donors" 
                            action={() => setShowRecord(true)} 
                            actionLabel="+ RECORD DONATION" 
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {filteredDonations.map(d => (
                                <DonationRow key={d.donation_id} d={d} />
                            ))}
                        </div>
                    )}
                </motion.div>

                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />

            <AnimatePresence>
                {showRecord && <RecordDonationModal onClose={() => setShowRecord(false)} onCreated={() => { setShowRecord(false); refetch(); }} />}
            </AnimatePresence>
        </div>
    );
}

function RecordDonationModal({ onClose, onCreated }) {
    const { data: donorsResult } = useFetch(bloodBankService.getDonors, { limit: 200 });
    const donorList = donorsResult?.donors || [];

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ donor_id: '', check_id: '', quantity_ml: 450, donation_date: new Date().toISOString().split('T')[0] });
    const [donorDetail, setDonorDetail] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadDonor = async (donorId) => {
        if (!donorId) { setDonorDetail(null); setForm(f => ({ ...f, donor_id: '' })); return; }
        try {
            const res = await bloodBankService.getDonorById(donorId);
            const d = res.data?.data || res.data;
            setDonorDetail(d);
            setForm(f => ({ ...f, donor_id: donorId }));
        } catch { toast.error('Could not load donor details'); }
    };

    const eligibleChecks = (donorDetail?.health_checks || []).filter(hc => hc.eligibility_status === 'Eligible' && !hc.donation_id);

    const handleSubmit = async () => {
        if (!form.donor_id || !form.check_id) { toast.error('Select donor & health check'); return; }
        setSaving(true);
        try {
            await bloodBankService.createDonation({ ...form, quantity_ml: parseInt(form.quantity_ml) });
            toast.success('Donation recorded successfully'); 
            onCreated();
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Failed'); 
        } finally { 
            setSaving(false); 
        }
    };

    return (
        <BBModal onClose={onClose} title="Record Donation" subtitle={step === 1 ? 'Step 1: Clinical Verification' : 'Step 2: Issuance Details'} icon={Droplets} maxWidth={520}>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 100, background: s <= step ? '#D90025' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
                    ))}
                </div>

                {step === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Select Registered Donor *</label>
                            <select value={form.donor_id} onChange={e => loadDonor(e.target.value)} style={selectStyle}>
                                <option value="">Select donor from registry...</option>
                                {donorList.map(d => <option key={d.donor_id} value={d.donor_id}>{d.name} ({d.blood_group})</option>)}
                            </select>
                        </div>
                        {donorDetail && (
                            <>
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Name: <span style={{ color: '#fff' }}>{donorDetail.name}</span></p>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Blood: <span style={{ color: '#D90025', fontWeight: 700 }}>{donorDetail.blood_group}</span></p>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Phone: <span style={{ color: '#fff' }}>{donorDetail.phone}</span></p>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>City: <span style={{ color: '#fff' }}>{donorDetail.city}</span></p>
                                </div>
                                <div>
                                    <label style={labelStyle}>Select Eligible Health Check *</label>
                                    {eligibleChecks.length === 0 ? (
                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', padding: '12px 0' }}>No eligible health checks found. <span style={{ color: 'var(--red)', fontWeight: 600 }}>Create health check first.</span></p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {eligibleChecks.map(hc => (
                                                <label key={hc.check_id} onClick={() => setForm(f => ({ ...f, check_id: hc.check_id }))}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12,
                                                        background: form.check_id === hc.check_id ? 'rgba(217,0,37,0.08)' : 'rgba(255,255,255,0.03)',
                                                        border: `1px solid ${form.check_id === hc.check_id ? 'rgba(217,0,37,0.25)' : 'rgba(255,255,255,0.08)'}`,
                                                        cursor: 'pointer', transition: 'all 0.15s',
                                                    }}>
                                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${form.check_id === hc.check_id ? '#D90025' : 'rgba(255,255,255,0.20)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {form.check_id === hc.check_id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025' }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{formatDate(hc.check_date)}</p>
                                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4' }}>BP: {hc.blood_pressure} · Hb: {hc.hemoglobin}g/dL · Wt: {hc.weight}kg</p>
                                                    </div>
                                                    <BBStatusBadge status="Eligible" size="sm" />
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'end' }}>
                            <NumberStepper
                                label="Collection Volume (mL) *"
                                value={parseInt(form.quantity_ml)}
                                onChange={v => setForm(f => ({ ...f, quantity_ml: v }))}
                                min={250}
                                max={450}
                                step={50}
                            />
                            <div>
                                <label style={labelStyle}>Donation Date</label>
                                <input type="date" value={form.donation_date} onChange={e => setForm(f => ({ ...f, donation_date: e.target.value }))} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ background: 'rgba(217,0,37,0.05)', border: '1px solid rgba(217,0,37,0.1)', borderRadius: 12, padding: 16 }}>
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                                <span style={{ color: 'var(--red)', fontWeight: 700 }}>Note:</span> Recording this donation will automatically increase the <span style={{ fontWeight: 700 }}>{donorDetail?.blood_group}</span> inventory by 1 unit and set the donor's next eligibility date to 90 days from today.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <BBModalFooter>
                {step === 1 ? (
                    <>
                        <button onClick={onClose} style={ghostBtn}>CANCEL</button>
                        <button onClick={() => setStep(2)} disabled={!form.donor_id || !form.check_id} style={{ ...primaryBtn, opacity: !form.donor_id || !form.check_id ? 0.4 : 1 }}>
                            CONTINUE <ArrowRight size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setStep(1)} style={ghostBtn}>← PREVIOUS</button>
                        <button onClick={handleSubmit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.5 : 1 }}>
                            {saving ? <><InlineLoader /> RECORDING...</> : <><Droplets size={14} /> COMPLETE RECORD</>}
                        </button>
                    </>
                )}
            </BBModalFooter>
        </BBModal>
    );
}
