import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, ChevronDown, Users, HeartPulse,
    Droplet, Activity, Mail, Phone, Calendar, Clock, MapPin,
    X, BellRing, History, Shield
} from 'lucide-react';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';
import toast from 'react-hot-toast';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function AdminDonors() {
    const { showExpiryModal } = useAuth();
    const [bloodFilter, setBloodFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [selectedDonorId, setSelectedDonorId] = useState(null);
    const [reminding, setReminding] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error, refetch } = useFetch(
        adminService.getAllDonors,
        { blood_group: bloodFilter, search: debouncedSearch, limit, offset },
        [bloodFilter, debouncedSearch, offset]
    );

    const { data: profileData } = useFetch(
        () => selectedDonorId ? adminService.getDonorById(selectedDonorId) : Promise.resolve(null),
        null,
        [selectedDonorId]
    );

    const suspendApi = useApi(adminService.suspendUser, { onSuccess: () => { toast.success('Account suspended'); refetch(); } });
    const activateApi = useApi(adminService.activateUser, { onSuccess: () => { toast.success('Account activated'); refetch(); } });

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    const donors = resp?.donors || [];
    const sum = resp?.summary || { total: 0, male: 0, female: 0, blood_groups: {}, eligibility: {} };

    const handleSendReminder = async (id) => {
        try {
            setReminding(true);
            await adminService.sendDonorReminder(id);
            toast.success('Donation reminder sent');
        } catch (err) {
            toast.error('Connection timeout');
        } finally {
            setReminding(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <SectionHeader
                title="Donor List"
                subtitle="Managing everyone who donates blood."
                action={<div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(59,130,246,0.1)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} className="animate-pulse" />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Records Updated</span>
                </div>}
            />

            {/* Matrix Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                <StatCard label="TOTAL DONORS" value={(sum.total ?? 0).toLocaleString()} sub="Registered Donors" icon={Users} color="blue" />
                <StatCard label="ELIGIBLE NOW" value={sum.eligibility?.eligible || 0} sub="People who can donate today." icon={HeartPulse} color="green" />
                <StatCard label="O- DONORS" value={sum.blood_groups?.['O-'] || 0} sub="Universal donors." icon={Droplet} color="red" />
                <StatCard label="TIME TO REST" value={sum.eligibility?.cooling || 0} sub="Donors in Recovery Period." icon={Clock} color="amber" />
            </div>

            {/* Dynamic Search & Neural Filter */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ position: 'relative' }}>
                    <Droplet size={14} color="#ef4444" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
                    <select
                        value={bloodFilter} onChange={e => { setBloodFilter(e.target.value); setOffset(0); }}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer', paddingLeft: 44, minWidth: 160 }}
                    >
                        <option value="" style={{ background: '#0F0F17' }}>Filter Blood Group</option>
                        {BLOOD_TYPES.map(t => <option key={t} value={t} style={{ background: '#0F0F17' }}>{t}</option>)}
                    </select>
                </div>

                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by name, phone, or email..."
                        style={{ width: '100%', background: 'transparent', border: 'none', paddingLeft: 52, color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 14, outline: 'none' }}
                    />
                </div>
            </div>

            {/* Identity Registry */}
            <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#fff' }}>Donor Database</div>
                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                            Showing {donors.length} people out of {resp?.total || 0} donors.
                        </div>
                    </div>
                    <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 12, cursor: 'pointer' }}>
                        <Download size={14} /> Download List
                    </button>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {loading ? (
                        <SkeletonTable rows={10} />
                    ) : donors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Users size={40} color="rgba(255,255,255,0.1)" />
                            </div>
                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 8 }}>No Results Found</div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>We couldn't find any donors with these details.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {/* Header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '100px 1.8fr 1fr 100px 120px 130px 40px', gap: 20,
                                padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 800
                            }}>
                                {['REG_ID', 'NAME', 'DISTRICT', 'TYPE', 'DONATIONS', 'STATUS', ''].map(h => <div key={h}>{h}</div>)}
                            </div>

                            {donors.map((d, i) => {
                                const isOpen = expanded === d.donor_id;
                                const isEligible = d.current_eligibility === 'Eligible';
                                const accent = isEligible ? '#22c55e' : (d.current_eligibility === 'Cooling' ? '#f59e0b' : '#3b82f6');
                                return (
                                    <motion.div key={d.donor_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                        <div
                                            onClick={() => setExpanded(isOpen ? null : d.donor_id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '100px 1.8fr 1fr 100px 120px 130px 40px', gap: 20, alignItems: 'center',
                                                padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${isOpen ? `${accent}44` : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>
                                                #{d.donor_id?.slice(-6).toUpperCase()}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${accent}22, transparent)`, border: `1px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: accent }}>
                                                    {d.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', wordBreak: 'break-word' }}>{d.name}</div>
                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{d.gender} • {d.age} YRS</div>
                                                </div>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.5)', wordBreak: 'break-word', minWidth: 0 }}>{d.city}</div>
                                            <div><BloodGroupBadge group={d.blood_group} size="sm" /></div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 16, color: '#fff' }}>{d.total_donations || 0} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}></span></div>
                                            <div><StatusBadge status={d.current_eligibility || 'Registered'} size="sm" /></div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ChevronDown size={14} color="rgba(255,255,255,0.2)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></div>
                                        </div>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '24px 32px', margin: '8px 16px 16px', borderLeft: `3px solid ${accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: 48 }}>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Contact Information</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{d.phone}</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{d.email}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Total Blood Given</div>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{(d.total_ml / 1000).toFixed(2)} Litres</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Total contribution so far.</div>
                                                            </div>
                                                        </div>                                                         <div style={{ display: 'flex', gap: 12 }}>
                                                            <button onClick={() => setSelectedDonorId(d.donor_id)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Full Profile</button>
                                                            <button onClick={() => handleSendReminder(d.donor_id)} disabled={reminding || !isEligible} style={{ padding: '8px 16px', background: isEligible ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isEligible ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, color: isEligible ? '#3b82f6' : 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 700, cursor: isEligible ? 'pointer' : 'not-allowed' }}>Send Reminder</button>
                                                            {d.is_active ?
                                                                <button onClick={() => suspendApi.execute(d.user_id)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Pause Account</button>
                                                                : <button onClick={() => activateApi.execute(d.user_id)} style={{ padding: '8px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Resume Account</button>
                                                            }
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 32px 32px' }}>
                    <Pagination total={resp?.total || 0} limit={limit} offset={offset} onChange={setOffset} />
                </div>
            </GlassCard>

            {/* Matrix Profile Modal */}
            <AnimatePresence>
                {selectedDonorId && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDonorId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '90%', maxWidth: 700, background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, overflow: 'hidden' }}>
                            <div style={{ padding: 40, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={32} color="#3b82f6" />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>{profileData?.name}</div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                <BloodGroupBadge group={profileData?.blood_group} size="sm" />
                                                <StatusBadge status={profileData?.current_eligibility || 'Registered'} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedDonorId(null)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={18} /></button>
                                </div>
                            </div>
                            <div style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                                <div>                                     <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 20 }}>Personal Information</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {[
                                            { icon: MapPin, label: 'City', value: profileData?.city },
                                            { icon: Mail, label: 'Email', value: profileData?.email },
                                            { icon: Phone, label: 'Phone', value: profileData?.phone },
                                            { icon: Users, label: 'Age/Gender', value: `${profileData?.age} years / ${profileData?.gender}` }
                                        ].map(i => (
                                            <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <i.icon size={14} color="rgba(255,255,255,0.2)" />
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{i.label}:</span>
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{i.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>                                 <div>
                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 20 }}>Donation Records</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>TOTAL TIMES</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: '#fff' }}>{profileData?.total_donations || 0}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>TOTAL LITRES</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: '#fff' }}>{(profileData?.total_ml / 1000).toFixed(1)}L</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '24px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setSelectedDonorId(null)} style={{ padding: '12px 24px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, color: '#3b82f6', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

