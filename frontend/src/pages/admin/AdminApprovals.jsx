import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Check, X, FileText, CheckCircle2, Building2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import Modal, { ModalFooter } from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonCard';
import { useAuth } from '../../context/AuthContext.jsx';

import { useDebounce } from '../../hooks/useDebounce';

export default function AdminApprovals() {
    const { showExpiryModal } = useAuth();
    const [typeFilter, setTypeFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, refetch } = useFetch(
        adminService.getApprovals,
        { type: typeFilter === 'All' ? '' : typeFilter.replace(' ', '_'), search: debouncedSearch, limit, offset },
        [typeFilter, debouncedSearch, offset]
    );

    const approveApi = useApi(adminService.approveEntity, { onSuccess: () => { toast.success('Application approved successfully'); refetch(); } });
    const rejectApi = useApi(adminService.rejectEntity, { onSuccess: () => { toast.success('Application rejected'); refetch(); setRejectModal(null); } });

    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('Incomplete documentation');
    const [rejectNotes, setRejectNotes] = useState('');

    const handleReject = () => {
        if (!rejectModal) return;
        const msg = rejectNotes ? `${rejectReason}: ${rejectNotes}` : rejectReason;
        rejectApi.execute(rejectModal, msg);
    };

    const filtered = resp?.approvals || [];
    const sum = resp?.summary || { hospitals: 0, blood_banks: 0 };

    if (loading && !resp) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
                <SkeletonTable rows={4} cols={1} />
            </div>
        );
    }

    const pendingC = filtered.length;
    const iqStyle = {
        width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'border-color 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModal && (
                    <Modal title="Decline Application" subtitle="Please specify the reason for rejection" icon={X} onClose={() => setRejectModal(null)}>
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>REASON</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                {['Missing documents', 'Hospital not yet verified', 'This place already has an account', 'Other reason'].map(r => (
                                    <label key={r} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                                        background: rejectReason === r ? 'rgba(217,0,37,0.05)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${rejectReason === r ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        padding: '12px 16px', borderRadius: 12, transition: 'all 0.2s'
                                    }}>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: '50%',
                                            border: `2px solid ${rejectReason === r ? '#D90025' : 'rgba(255,255,255,0.3)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {rejectReason === r && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025' }} />}
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: rejectReason === r ? '#fff' : '#9B9BA4' }}>{r}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>MORE INFO</div>
                            <textarea
                                value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                                placeholder="Add more details here (optional)..." rows={3}
                                style={{ ...iqStyle, resize: 'none' }}
                            />
                        </div>
                        <ModalFooter>
                            <button onClick={() => setRejectModal(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                            <button onClick={handleReject} disabled={rejectApi.loading} style={{ background: '#D90025', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 600 }}>{rejectApi.loading ? 'Rejecting...' : 'Reject'}</button>
                        </ModalFooter>
                    </Modal>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    <StatCard label="TOTAL PENDING" value={(pendingC ?? 0).toLocaleString()} icon={Clock} color="amber" />
                    <StatCard label="NEW HOSPITALS" value={(sum.hospitals ?? 0).toLocaleString()} icon={Building2} color="blue" />
                    <StatCard label="NEW BLOOD BANKS" value={(sum.blood_banks ?? 0).toLocaleString()} icon={CheckCircle2} color="green" />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {['All', 'Hospitals', 'Blood Banks'].map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)} style={{
                                background: typeFilter === t ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${typeFilter === t ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 500,
                                color: typeFilter === t ? '#D90025' : '#9B9BA4'
                            }}>{t}</button>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="#9B9BA4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }} placeholder="Search by name or email address..."
                            style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px 10px 40px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(217,0,37,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                        />
                    </div>
                </div>

                {/* Approval Cards */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <CheckCircle2 size={32} color="#22c55e" />
                        </div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>All Set!</div>
                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>You have no new applications to check right now.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <AnimatePresence>
                            {filtered.map(a => (
                                <motion.div key={a.id} layout exit={{ scale: 0.9, opacity: 0 }}
                                    style={{
                                        background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 20, padding: 24,
                                        display: 'flex', flexDirection: 'column'
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div>
                                            <span style={{
                                                background: a.type === 'Hospital' ? 'rgba(59,130,246,0.1)' : 'rgba(217,0,37,0.1)',
                                                border: `1px solid ${a.type === 'Hospital' ? 'rgba(59,130,246,0.2)' : 'rgba(217,0,37,0.2)'}`,
                                                borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--font-space)', fontSize: 9, fontWeight: 600,
                                                color: a.type === 'Hospital' ? '#3b82f6' : '#D90025'
                                            }}>{a.type.replace('_', ' ')}</span>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', marginTop: 12, lineHeight: 1.2 }}>{a.org_name}</div>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', marginTop: 4 }}>{a.city}, Kerala</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4' }}>{formatDate(a.submitted)}</div>
                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#fff', marginTop: 4 }}>{a.email}</div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginBottom: 16 }}>{a.contact_number}</div>
                                        <StatusBadge status="Pending" size="sm" />
                                    </div>

                                    {/* Documents */}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                        {['Check Registration Papers', 'Check License'].map(doc => (
                                            <div key={doc} style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                background: '#0A0A12', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10,
                                                padding: '10px', cursor: 'pointer', transition: 'background 0.2s'
                                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = '#0A0A12'}>
                                                <FileText size={14} color="#9B9BA4" />
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>{doc}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                        <button onClick={() => approveApi.execute(a.id)} disabled={approveApi.loading} style={{
                                            flex: 1, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                            borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 700, color: '#22c55e',
                                            transition: 'background 0.2s'
                                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}>
                                            Approve ✓
                                        </button>
                                        <button onClick={() => setRejectModal(a.id)} disabled={rejectApi.loading} style={{
                                            flex: 1, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)',
                                            borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 700, color: '#D90025',
                                            transition: 'background 0.2s'
                                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,0,37,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,0,37,0.1)'}>
                                            Reject ✗
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <div style={{ marginTop: 24 }}>
                    <Pagination
                        total={resp?.total || 0}
                        limit={limit}
                        offset={offset}
                        onChange={setOffset}
                    />
                </div>
            </div>
        </div>
    );
}
