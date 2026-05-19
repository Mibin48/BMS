import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, ChevronDown, Building2, CheckCircle2,
    Clock, Activity, MapPin, Mail, Phone, X, Shield, History,
    Ban, Check, AlertCircle, TrendingUp, Calendar
} from 'lucide-react';
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
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';
import Modal, { ModalFooter } from '../../components/Modal';

export default function AdminHospitals() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error, refetch } = useFetch(
        adminService.getAllHospitals,
        { status: statusFilter, search: debouncedSearch, limit, offset },
        [statusFilter, debouncedSearch, offset]
    );

    const { data: profile, loading: profileLoading } = useFetch(
        () => selectedId ? adminService.getHospitalById(selectedId) : Promise.resolve(null),
        null,
        [selectedId]
    );

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    const approveApi = useApi(adminService.approveEntity, { onSuccess: () => { toast.success('Hospital verified and active'); refetch(); } });
    const rejectApi = useApi(adminService.rejectEntity, { onSuccess: () => { toast.success('Application rejected'); refetch(); setRejectModal(null); } });
    const suspendApi = useApi(adminService.suspendUser, { onSuccess: () => { toast.success('Center suspended'); refetch(); } });
    const activateApi = useApi(adminService.activateUser, { onSuccess: () => { toast.success('Center activated'); refetch(); } });

    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('Incomplete documentation');

    const hospitals = resp?.hospitals || [];
    const sum = resp?.summary || { total: 0, active: 0, pending: 0, active_requests: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Action Modals */}
            <AnimatePresence>
                {rejectModal && (
                    <Modal title="Decline Hospital Application" subtitle="Let them know why you are saying no." icon={Ban} onClose={() => setRejectModal(null)}>
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['Missing documents', 'Hospital verify failed', 'Already has an account', 'Safety concerns'].map(r => (
                                    <label key={r} onClick={() => setRejectReason(r)} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                                        background: rejectReason === r ? 'rgba(217,0,37,0.05)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${rejectReason === r ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        padding: '14px 16px', borderRadius: 12, transition: 'all 0.2s'
                                    }}>
                                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${rejectReason === r ? '#D90025' : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {rejectReason === r && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025' }} />}
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: rejectReason === r ? '#fff' : '#9B9BA4' }}>{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <ModalFooter>
                            <button onClick={() => setRejectModal(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>Cancel</button>
                            <button onClick={() => rejectApi.execute(rejectModal, rejectReason)} disabled={rejectApi.loading} style={{ background: '#D90025', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>{rejectApi.loading ? 'Declining...' : 'Decline'}</button>
                        </ModalFooter>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Stats Overview */}
            <div style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16, display: 'grid' }}>
                <StatCard label="TOTAL HOSPITALS" value={(sum.total || 0).toLocaleString()} sub="Registered with us." icon={Building2} color="blue" />
                <StatCard label="ACTIVE PARTNERS" value={sum.active || 0} sub="Currently order and receive blood." icon={CheckCircle2} color="green" />
                <StatCard label="NEW APPLICATIONS" value={sum.pending || 0} sub="New centers waiting for approval." icon={Clock} color="amber" />
                <StatCard label="PENDING REQUESTS" value={(sum.active_requests || 0).toLocaleString()} sub="Total blood units requested." icon={Activity} color="white" />
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '16px 24px', backdropFilter: 'blur(10px)' }}>
                <select
                    value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setOffset(0); }}
                    style={{ ...iqStyle, cursor: 'pointer', appearance: 'none', minWidth: 160 }}
                >
                    <option value="" style={{ background: '#0F0F17' }}>Filter by Status</option>
                    {['Active', 'Pending', 'Suspended'].map(t => <option key={t} value={t} style={{ background: '#0F0F17' }}>{t}</option>)}
                </select>

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by hospital name or city..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 48, background: 'rgba(255,255,255,0.02)' }}
                    />
                </div>

                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <Download size={15} /> Download Report
                </button>
            </div>

            {/* Main List */}
            <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <SectionHeader title="Hospital Network" subtitle={`Supporting ${resp?.total || 0} hospitals and clinics.`} style={{ margin: 0 }} />
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {loading ? (
                        <SkeletonTable rows={10} cols={8} />
                    ) : hospitals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Building2 size={40} color="rgba(255,255,255,0.1)" />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 8 }}>No Results Found</h3>
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: '#9B9BA4' }}>We couldn't find any hospitals matching your search.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '90px 1.8fr 1fr 60px 80px 100px 120px 40px', gap: 20,
                                padding: '0 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 800
                            }}>
                                {['ID', 'NAME', 'CITY', 'BEDS', 'PATIENTS', 'REQUESTS', 'STATUS', ''].map(h => <div key={h}>{h}</div>)}
                            </div>

                            {/* Rows */}
                            <AnimatePresence mode="popLayout">
                                {hospitals.map((h, i) => {
                                    const isOpen = expanded === h.hospital_id;
                                    const statusColor = h.status === 'Active' ? '#22c55e' : (h.status === 'Pending' ? '#f59e0b' : '#ef4444');
                                    return (
                                        <motion.div key={h.hospital_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : h.hospital_id)}
                                                style={{
                                                    display: 'grid', gridTemplateColumns: '90px 1.8fr 1fr 60px 80px 100px 120px 40px', gap: 20, alignItems: 'center',
                                                    padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                    border: `1px solid ${isOpen ? `${statusColor}44` : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                                            >
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: statusColor }} />

                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                                                    {h.hospital_id?.split('-').pop()?.substring(0, 6).toUpperCase()}
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', wordBreak: 'break-word' }}>{h.hospital_name}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                        <Phone size={10} color="rgba(255,255,255,0.3)" />
                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: '#9B9BA4' }}>{h.contact_number}</span>
                                                    </div>
                                                </div>

                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word', minWidth: 0 }}>{h.city}</div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{h.beds}</div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{h.active_patients || 0}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <History size={12} color={statusColor} />
                                                        <span style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 800, color: '#fff' }}>{h.total_requests || 0}</span>
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>TOTAL</div>
                                                </div>

                                                <div><StatusBadge status={h.status} size="sm" /></div>

                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                                        <ChevronDown size={16} color="rgba(255,255,255,0.2)" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16,
                                                            padding: '24px 32px', margin: '8px 16px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 48,
                                                            borderLeft: `4px solid ${statusColor}`
                                                        }}>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Contact Information</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                        <Mail size={12} color={statusColor} />
                                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{h.email}</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                        <Calendar size={12} color="rgba(255,255,255,0.3)" />
                                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Joined on: {formatDate(h.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Blood Request Records</div>
                                                                <div style={{ display: 'flex', gap: 24 }}>
                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                                                        {h.fulfilled || 0}<span style={{ fontSize: 13, color: '#22c55e', marginLeft: 4 }}>Fulfilled</span>
                                                                    </div>
                                                                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                                                        {h.denied || 0}<span style={{ fontSize: 13, color: '#ef4444', marginLeft: 4 }}>Denied</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                                                                <button onClick={() => setSelectedId(h.hospital_id)}
                                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>View Profile</button>

                                                                {h.status === 'Active' && (
                                                                    <button onClick={() => suspendApi.execute(h.user_id)} disabled={suspendApi.loading}
                                                                        style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#D90025' }}>Suspend</button>
                                                                )}
                                                                {h.status === 'Suspended' && (
                                                                    <button onClick={() => activateApi.execute(h.user_id)} disabled={activateApi.loading}
                                                                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Activate</button>
                                                                )}
                                                                {h.status === 'Pending' && (
                                                                    <>
                                                                        <button onClick={() => approveApi.execute(h.hospital_id)} disabled={approveApi.loading}
                                                                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Yes, Approve Hospital</button>
                                                                        <button onClick={() => setRejectModal(h.hospital_id)}
                                                                            style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#D90025' }}>No, Reject</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 32px 32px' }}>
                    <Pagination
                        total={resp?.total || 0}
                        limit={limit}
                        offset={offset}
                        onChange={setOffset}
                    />
                </div>
            </GlassCard>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedId && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ position: 'relative', width: '95%', maxWidth: 850, background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                            <div style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)', position: 'relative' }}>
                                <button onClick={() => setSelectedId(null)} style={{ position: 'absolute', right: 24, top: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={18} /></button>
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={40} color="#3b82f6" /></div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, color: '#fff' }}>{profile?.hospital_name}</div>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}><StatusBadge status={profile?.status} size="md" /></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, overflowY: 'auto', maxHeight: '65vh' }}>
                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Hospital Details</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {[
                                            { icon: Building2, label: 'Beds', value: profile?.beds },
                                            { icon: MapPin, label: 'Location', value: profile?.city },
                                            { icon: Mail, label: 'Email', value: profile?.email },
                                            { icon: Phone, label: 'Contact', value: profile?.contact_number },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <item.icon size={14} color="rgba(255,255,255,0.3)" />
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14 }}><span style={{ color: 'rgba(255,255,255,0.3)', marginRight: 8 }}>{item.label}:</span><span style={{ color: '#fff' }}>{item.value}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Operation Insights</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div style={{ padding: 16, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 16 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(34,197,94,0.7)', marginBottom: 8 }}>FULFILLED</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{profile?.request_stats?.fulfilled || 0}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(239,68,68,0.7)', marginBottom: 8 }}>DENIED</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{profile?.request_stats?.denied || 0}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}> TOTAL MONEY PAID</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: '#fff' }}>₹{(profile?.payments?.paid || 0).toLocaleString()}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>PENDING DUES</div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: '#ef4444' }}>₹{(profile?.payments?.pending || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 24, padding: 16, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><TrendingUp size={14} color="#3b82f6" /><span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>CURRENT PATIENTS</span></div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>Currently caring for <b>{profile?.patient_stats?.admitted || 0}</b> people.</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setSelectedId(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 24px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>Close</button>
                                <button style={{ background: '#3b82f6', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>View Full History</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

