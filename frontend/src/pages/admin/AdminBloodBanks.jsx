import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Download, ChevronDown, CheckCircle2, Clock, Droplet,
    Package, Calendar, Mail, Phone, X, Shield, MapPin,
    TrendingUp, Ban, Check, AlertTriangle, Layers, RefreshCcw,
    Minus, Plus
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
import Modal, { ModalFooter } from '../../components/Modal';

export default function AdminBloodBanks() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, refetch } = useFetch(
        adminService.getAllBloodBanks,
        { status: statusFilter, search: debouncedSearch, limit, offset },
        [statusFilter, debouncedSearch, offset]
    );

    const { data: profile, loading: profileLoading, refetch: refetchProfile } = useFetch(
        () => selectedId ? adminService.getBloodBankById(selectedId) : Promise.resolve(null),
        null,
        [selectedId]
    );

    const [isCorrecting, setIsCorrecting] = useState(false);
    const [correctingItems, setCorrectingItems] = useState([]);

    const handleInventoryCorrect = async (bloodGroup, action) => {
        setCorrectingItems(prev => [...prev, bloodGroup]);
        try {
            await adminService.updateInventoryStock(selectedId, bloodGroup, {
                action,
                units: 1,
                notes: `Admin manual correction (${action})`
            });
            toast.success(`${action === 'add' ? 'Added' : 'Removed'} 1 unit of ${bloodGroup}`);
            await refetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Correction failed');
        } finally {
            setCorrectingItems(prev => prev.filter(i => i !== bloodGroup));
        }
    };

    const approveApi = useApi(adminService.approveEntity, { onSuccess: () => { toast.success('Bank verified and operational'); refetch(); } });
    const rejectApi = useApi(adminService.rejectEntity, { onSuccess: () => { toast.success('Application declined'); refetch(); setRejectModal(null); } });
    const suspendApi = useApi(adminService.suspendUser, { onSuccess: () => { toast.success('Center suspended'); refetch(); } });
    const activateApi = useApi(adminService.activateUser, { onSuccess: () => { toast.success('Center activated'); refetch(); } });

    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('Incomplete documentation');

    const banks = resp?.blood_banks || [];
    const sum = resp?.summary || { total: 0, active: 0, global_stock: 0, monthly_donations: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* decline Modal */}
            <AnimatePresence>
                {rejectModal && (
                    <Modal title="Decline Bank Application" subtitle="Let them know why you are saying no." icon={Ban} onClose={() => setRejectModal(null)}>
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['Missing documents', 'Bank verify failed', 'Storage issues', 'Safety concerns'].map(r => (
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
                            <button onClick={() => rejectApi.execute(rejectModal, rejectReason)} disabled={rejectApi.loading} style={{ background: '#D90025', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>{rejectApi.loading ? 'Declining...' : 'Reject'}</button>
                        </ModalFooter>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                <StatCard label="BLOOD BANKS" value={(sum.total || 0).toLocaleString()} sub="Centers storing blood." icon={Droplet} color="red" />
                <StatCard label="ACTIVE BANKS" value={sum.active || 0} sub="Currently helping donors." icon={CheckCircle2} color="green" />
                <StatCard label="TOTAL STOCK" value={(sum.global_stock || 0).toLocaleString()} sub="Blood units available now." icon={Package} color="blue" />
                <StatCard label="RECENT DONATIONS" value={(sum.monthly_donations || 0).toLocaleString()} sub="Donations in the past 30 days." icon={TrendingUp} color="white" />
            </div>

            {/* Filter Hub */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '16px 24px', backdropFilter: 'blur(10px)' }}>
                <select
                    value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setOffset(0); }}
                    style={{ ...iqStyle, cursor: 'pointer', appearance: 'none', minWidth: 160 }}
                >
                    <option value="" style={{ background: '#0F0F17' }}>Filter By Status</option>
                    {['Active', 'Pending', 'Suspended'].map(t => <option key={t} value={t} style={{ background: '#0F0F17' }}>{t}</option>)}
                </select>

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by Bank Name or Area..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 48, background: 'rgba(255,255,255,0.02)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>
                        <Download size={15} /> Download List
                    </button>
                </div>
            </div>

            {/* Main Network Registry */}
            <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <SectionHeader title="Blood Bank Network" subtitle={`Monitoring ${resp?.total || 0} active storage centers.`} style={{ margin: 0 }} />
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {loading ? (
                        <SkeletonTable rows={10} cols={8} />
                    ) : banks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Droplet size={40} color="rgba(255,255,255,0.1)" />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 8 }}>No Results Found</h3>
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: '#9B9BA4' }}>We couldn't find any blood banks matching your search.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'minmax(90px, 0.5fr) 1.8fr 1fr 100px 80px 120px 120px 40px', gap: 20,
                                padding: '0 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 800,
                                alignItems: 'center'
                            }}>
                                {['ID', ' BANK NAME', 'AREA', 'MAX CAPACITY', 'CURRENT STOCK', 'DONATIONS', 'STATUS', ''].map(h => <div key={h} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>)}
                            </div>

                            {/* Network Rows */}
                            <AnimatePresence mode="popLayout">
                                {banks.map((b, i) => {
                                    const isOpen = expanded === b.bank_id;
                                    const statusColor = b.status === 'Active' ? '#22c55e' : (b.status === 'Pending' ? '#f59e0b' : '#ef4444');
                                    const stockPercentage = Math.min(100, (Number(b.total_units) / Number(b.storage_capacity)) * 100);

                                    return (
                                        <motion.div key={b.bank_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : b.bank_id)}
                                                style={{
                                                    display: 'grid', gridTemplateColumns: 'minmax(90px, 0.5fr) 1.8fr 1fr 100px 80px 120px 120px 40px', gap: 20, alignItems: 'center',
                                                    padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                    border: `1px solid ${isOpen ? `${statusColor}44` : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                                                    minHeight: 80
                                                }}
                                                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                                            >
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: statusColor }} />

                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {b.bank_id?.split('-').pop()?.substring(0, 6).toUpperCase()}
                                                </div>

                                                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', wordBreak: 'break-word', lineHeight: 1.2 }}>{b.bank_name}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                        <Phone size={10} color="rgba(255,255,255,0.3)" />
                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: '#9B9BA4', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.contact_number}</span>
                                                    </div>
                                                </div>

                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word', minWidth: 0, lineHeight: 1.2 }}>{b.city}</div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{b.storage_capacity} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>u</span></div>
                                                </div>

                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff', display: 'flex', alignItems: 'center' }}>{b.total_units || 0}</div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        < Droplet size={12} color={statusColor} />
                                                        <span style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 800, color: '#fff' }}>{b.total_donations || 0}</span>
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>DONATIONS</div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center' }}><StatusBadge status={b.status} size="sm" /></div>

                                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{b.email}</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                        <Clock size={12} color="rgba(255,255,255,0.3)" />
                                                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Hours: {b.operating_hours || '24/7 Service'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Blood Issue Records</div>
                                                                <div style={{ display: 'flex', gap: 24 }}>
                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                                                        {b.fulfilled || 0}<span style={{ fontSize: 13, color: '#22c55e', marginLeft: 4 }}>Issued</span>
                                                                    </div>
                                                                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                                                        {b.denied || 0}<span style={{ fontSize: 13, color: '#ef4444', marginLeft: 4 }}>Rejected</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Collection Volume</div>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                                                    {(b.total_ml / 1000).toFixed(1)}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>Litres Collected</span>
                                                                </div>
                                                            </div>

                                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                                                                <button onClick={() => setSelectedId(b.bank_id)}
                                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>View Profile</button>

                                                                {b.status === 'Active' && (
                                                                    <button onClick={() => suspendApi.execute(b.user_id)} disabled={suspendApi.loading}
                                                                        style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#D90025' }}>Suspend</button>
                                                                )}
                                                                {b.status === 'Suspended' && (
                                                                    <button onClick={() => activateApi.execute(b.user_id)} disabled={activateApi.loading}
                                                                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Activate</button>
                                                                )}
                                                                {b.status === 'Pending' && (
                                                                    <>
                                                                        <button onClick={() => approveApi.execute(b.bank_id)} disabled={approveApi.loading}
                                                                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Yes, Approve</button>
                                                                        <button onClick={() => setRejectModal(b.bank_id)}
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
                            style={{ position: 'relative', width: '95%', maxWidth: 900, background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                            <div style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(217,0,37,0.1) 0%, transparent 100%)', position: 'relative' }}>
                                <button onClick={() => setSelectedId(null)} style={{ position: 'absolute', right: 24, top: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={18} /></button>
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Droplet size={40} color="#ef4444" /></div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, color: '#fff' }}>{profile?.bank_name}</div>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}><StatusBadge status={profile?.status} size="md" /> <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', alignSelf: 'center' }}>{profile?.city}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '32px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>BLOOD GATHERED</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, color: '#fff' }}>{(profile?.operation_stats?.total_ml / 1000).toFixed(1)}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Total Litres</div>
                                            </div>
                                            <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: '70%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                                            </div>
                                        </div>

                                        <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>BLOOD ISSUE HISTORY</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Fulfilled Requests</span>
                                                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{profile?.operation_stats?.fulfilled || 0}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Denied / Expired</span>
                                                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#ef4444' }}>{profile?.operation_stats?.denied || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>CURRENT STOCK</div>
                                            <button 
                                                onClick={() => setIsCorrecting(!isCorrecting)}
                                                style={{ 
                                                    background: isCorrecting ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', 
                                                    border: `1px solid ${isCorrecting ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, 
                                                    borderRadius: 8, padding: '4px 8px', color: isCorrecting ? '#ef4444' : 'rgba(255,255,255,0.4)', 
                                                    fontFamily: 'var(--font-space)', fontSize: 9, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 
                                                }}
                                            >
                                                <RefreshCcw size={10} className={isCorrecting ? 'animate-spin' : ''} />
                                                {isCorrecting ? 'EXIT CORRECTION' : 'MANAGE INVENTORY'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((grp, i) => {
                                                const s = profile?.stock?.find(stock => stock.blood_group === grp) || { blood_group: grp, available_units: 0 };
                                                const isUpdating = correctingItems.includes(grp);
                                                
                                                return (
                                                    <div key={i} style={{ 
                                                        padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, 
                                                        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
                                                        position: 'relative', overflow: 'hidden'
                                                    }}>
                                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 12, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{s.blood_group}</div>
                                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 800, color: s.available_units < 10 ? '#ef4444' : '#fff' }}>
                                                            {isUpdating ? <span className="animate-pulse">...</span> : s.available_units}
                                                        </div>
                                                        
                                                        {isCorrecting && (
                                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                                                                <button 
                                                                    disabled={isUpdating || s.available_units <= 0}
                                                                    onClick={() => handleInventoryCorrect(grp, 'remove')}
                                                                    style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}
                                                                >
                                                                    <Minus size={12} />
                                                                </button>
                                                                <button 
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleInventoryCorrect(grp, 'add')}
                                                                    style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Financial Records</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ padding: 16, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 16 }}>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(34,197,94,0.7)', marginBottom: 4 }}>MONEY RECEIVED</div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: '#22c55e' }}>₹{(profile?.payments?.received || 0).toLocaleString()}</div>
                                            </div>
                                            <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16 }}>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(239,68,68,0.7)', marginBottom: 4 }}>MONEY TO BE RECEIVED</div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800, color: '#ef4444' }}>₹{(profile?.payments?.pending || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 20 }}>Bank Information</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Layers size={14} color="rgba(255,255,255,0.3)" />
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Storage</div>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{profile?.storage_capacity} Units</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Clock size={14} color="rgba(255,255,255,0.3)" />
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Hours</div>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{profile?.operating_hours || '24/7 Ops'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setSelectedId(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 24px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 14 }}>Close</button>
                                <button style={{ background: '#3b82f6', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 700 }}>View Full Report</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
