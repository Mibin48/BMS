import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function AdminRequests() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error } = useFetch(
        adminService.getAllRequests,
        { status: statusFilter, search: debouncedSearch, limit, offset },
        [statusFilter, debouncedSearch, offset]
    );

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    const requests = resp?.requests || [];
    const sum = resp?.summary || { total: 0, pending: 0, processing: 0, fulfilled: 0, cancelled: 0, emergency: 0, fulfillment_rate: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
        padding: '10px 14px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'border-color 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* System Operations Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#3b82f6', letterSpacing: '0.1em' }}>EVERYTHING LOOKS GOOD</span>
                </div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>SYSTEM UP TO DATE</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { label: "TOTAL REQUESTS", value: (sum.total ?? 0).toLocaleString(), icon: Activity, color: "white" },
                    { label: "PENDING REQUESTS", value: (sum.pending || 0) + (sum.processing || 0), icon: Clock, color: "amber" },
                    { label: "SUCCESS RATE", value: `${sum.fulfillment_rate || 0}%`, icon: CheckCircle2, color: "green" },
                    { label: "URGENT REQUESTS", value: sum.emergency || 0, icon: AlertTriangle, color: "red" }
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <StatCard {...s} />
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15,15,23,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Pending', 'Processing', 'Fulfilled', 'Cancelled'].map(t => {
                        const val = t === 'All' ? '' : t;
                        const isActive = statusFilter === val;
                        return (
                            <button key={t} onClick={() => { setStatusFilter(val); setOffset(0); }} style={{
                                background: isActive ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 100, padding: '8px 18px', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600,
                                color: isActive ? '#D90025' : '#9B9BA4', transition: 'all 0.2s'
                            }}>{t}</button>
                        );
                    })}
                </div>

                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />

                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by hospital, blood bank, or patient name..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 40, background: 'rgba(0,0,0,0.2)' }}
                    />
                    <Search size={14} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>

                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    <Download size={14} /> Download List
                </button>
            </div>

            {/* List */}
            <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
                {/* Sentient Scanning Line */}
                <motion.div
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', left: 0, right: 0, height: '40px', background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.03), transparent)', zIndex: 1, pointerEvents: 'none' }}
                />

                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <SectionHeader title="Blood Request History" subtitle={`Tracking ${resp?.total || 0} requests across the state.`} style={{ margin: 0 }} />
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {loading ? (
                        <SkeletonTable rows={10} cols={8} />
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                            <Activity size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: 16 }} />
                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>No Orders Found</div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>There are no blood orders to show right now.</div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            {/* Table Header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 140px 80px 60px 110px 115px 40px', gap: 16,
                                padding: '0 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 800
                            }}>
                                {['ID & Date', 'Hospital', 'Blood Bank', 'Patient', 'Type', 'Units', 'Priority', 'Status', ''].map(h => <div key={h}>{h}</div>)}
                            </div>

                            {/* Table Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                                {requests.map((r, i) => {
                                    const isOpen = expanded === r.request_id;
                                    const isEmg = r.priority === 'Emergency' && (r.status === 'Pending' || r.status === 'Processing');
                                    const accent = r.priority === 'Emergency' ? '#D90025' : (r.status === 'Fulfilled' ? '#22c55e' : '#3b82f6');
                                    return (
                                        <motion.div key={r.request_id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.04) }}
                                        >
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : r.request_id)}
                                                style={{
                                                    display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 140px 80px 60px 110px 115px 40px', gap: 16, alignItems: 'center',
                                                    padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                    border: `1px solid ${isOpen ? `${accent}44` : 'rgba(255,255,255,0.04)'}`,
                                                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative', overflow: 'hidden'
                                                }}
                                                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                                            >
                                                {/* Left Accent Bar */}
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent, opacity: (isOpen || isEmg) ? 1 : 0.4 }} />
                                                {isEmg && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(217,0,37,0.05), transparent)', pointerEvents: 'none' }} />}

                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#fff' }}>#{r.request_id?.split('-').pop()?.toUpperCase()}</div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{formatDate(r.request_date)}</div>
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#fff', wordBreak: 'break-word' }}>{r.hospital_name}</div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.hospital_city}</div>
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.8)', wordBreak: 'break-word' }}>{r.bank_name}</div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{r.bank_city}</div>
                                                </div>

                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)', wordBreak: 'break-word', minWidth: 0 }}>
                                                    {r.patient_name}
                                                </div>

                                                <div><BloodGroupBadge group={r.blood_group} size="xs" /></div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#fff' }}>{r.units_required}</div>

                                                <div><StatusBadge status={r.priority} size="sm" /></div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><StatusBadge status={r.status} size="sm" /></div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                                        <ChevronDown size={14} color="rgba(255,255,255,0.2)" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16,
                                                            padding: '24px 32px', margin: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 32,
                                                            borderLeft: `4px solid ${accent}`
                                                        }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 64 }}>
                                                                <div>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Patient Details</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{r.patient_name}</div>
                                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                                            <BloodGroupBadge group={r.blood_group} size="xs" />
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Needs blood right away.</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ flex: 1, minWidth: 200 }}>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Why blood is needed</div>
                                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        {r.reason || r.patient_condition || 'No specific medical notes provided for this request.'}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Payment Status</div>
                                                                    {r.payment_status ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>₹{r.amount}</div>
                                                                            <StatusBadge status={r.payment_status} size="sm" />
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Bill not yet ready.</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ display: 'flex', gap: 48 }}>
                                                                    <div>
                                                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Requested on</div>
                                                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDate(r.created_at, true)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Current Request Status</div>
                                                                        {r.issue_date ? (
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Blood Issued on {formatDate(r.issue_date, true)}</div>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#f59e0b' }}>Waiting to be sent from the blood bank.</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', gap: 12 }}>
                                                                    <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }}>
                                                                        More Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
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
        </div>
    );
}
