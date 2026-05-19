import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, Droplet, Clock, GitCommit, Activity, Check, FileText, MapPin, Receipt, User, ShieldCheck } from 'lucide-react';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../../hooks/useDebounce';

const STEP_LABELS = ['Requested', 'Verified', 'Approved', 'Dispatched', 'Delivered'];

export default function AdminIssues() {
    const { showExpiryModal } = useAuth();
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const [expanded, setExpanded] = useState(null);
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, refetch } = useFetch(
        adminService.getAllIssues,
        { search: debouncedSearch, limit, offset },
        [debouncedSearch, offset]
    );

    const issues = resp?.issues || [];
    const sum = resp?.summary || { total: 0, total_units_issued: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
            {/* Header / Tracing Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 2, background: 'linear-gradient(90deg, #D90025, transparent)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#D90025', letterSpacing: '0.12em', fontWeight: 700 }}>DELIVERY TRACKING</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Last Updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Top Summaries */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                <StatCard label="Issued Count" value={(Number(sum.total) || 0).toLocaleString()} icon={Activity} color="white" description="Total number of blood units issued." />
                <StatCard label="Units Issued" value={(Number(sum.total_units_issued) || 0).toLocaleString()} icon={Droplet} color="red" description="Total quantity of blood received by hospitals." />
                <StatCard label="Average Issue Time" value="Fast" icon={Clock} color="blue" description="Typical time to issue blood." />
                <StatCard label="Expiry/Wastage Rate" value="0%" icon={GitCommit} color="purple" description="Rate of expired/wasted blood units." />
            </div>

            {/* Filter Hub */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search for ID, hospital, or blood bank..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 52, background: 'transparent', border: 'none' }}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    <Download size={16} /> Download List
                </button>
            </div>

            {/* Registry List */}
            <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Blood Delivery History</div>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resp?.total || 0} SEARCH RESULTS</div>
                </div>

                {loading ? (
                    <div style={{ padding: 32 }}><SkeletonTable rows={10} cols={6} /></div>
                ) : issues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)' }}>
                        <GitCommit size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>Nothing Found</div>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 400, margin: '0 auto' }}>No blood units have been issued through the system yet.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px 32px' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '130px 130px 1.5fr 1.2fr 100px 80px 40px', gap: 20,
                            padding: '24px 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800
                        }}>
                            {['ID', 'REQUEST ID', 'HOSPITAL', 'BLOOD BANK', 'GROUP', 'UNITS', ''].map(h => <div key={h}>{h}</div>)}
                        </div>

                        {/* Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                            {issues.map((iss, i) => {
                                const isOpen = expanded === iss.issue_id;
                                const accent = '#D90025';

                                const handleStatusUpdate = async (newStatus) => {
                                    try {
                                        await adminService.updateIssueStatus(iss.issue_id, newStatus);
                                        refetch();
                                    } catch (err) {
                                        console.error('Failed to update status:', err);
                                    }
                                };

                                const currentStepIdx = STEP_LABELS.indexOf(iss.status || 'Dispatched');

                                return (
                                    <div key={iss.issue_id}>
                                         <div
                                             onClick={() => setExpanded(isOpen ? null : iss.issue_id)}
                                             style={{
                                                 display: 'grid', gridTemplateColumns: '130px 130px 1.5fr 1.2fr 100px 80px 40px', gap: 20, alignItems: 'center',
                                                 padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                 border: `1px solid ${isOpen ? 'rgba(217,0,37,0.2)' : 'rgba(255,255,255,0.04)'}`,
                                                 borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                             }}
                                         >

                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#fff' }}>#{iss.issue_id?.split('-').pop()?.toUpperCase()}</div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                                                <Clock size={12} color={accent} /> #{iss.request_id?.split('-').pop()?.toUpperCase()}
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', wordBreak: 'break-word' }}>{iss.hospital_name}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {iss.hospital_city}</div>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)', wordBreak: 'break-word', minWidth: 0 }}>{iss.bank_name}</div>

                                            <div><BloodGroupBadge group={iss.blood_group} size="sm" /></div>

                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#fff' }}>{iss.units_issued}</div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                                    <ChevronDown size={14} color="rgba(255,255,255,0.2)" />
                                                </motion.div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16,
                                                        padding: '32px', margin: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 40,
                                                        borderLeft: `4px solid ${accent}`
                                                    }}>
                                                        {/* Process Flow */}
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.05em' }}>DELIVERY STATUS</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                    <select
                                                                        value={iss.status || 'Dispatched'}
                                                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{
                                                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                                            borderRadius: 8, padding: '4px 12px', color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 11,
                                                                            outline: 'none', cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {STEP_LABELS.map(s => <option key={s} value={s} style={{ background: '#12121A' }}>{s}</option>)}
                                                                    </select>
                                                                    <StatusBadge status={iss.status || 'Dispatched'} size="sm" />
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                {STEP_LABELS.map((step, idx) => {
                                                                    const complete = idx <= currentStepIdx;
                                                                    const isCurrent = idx === currentStepIdx;
                                                                    return (
                                                                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < 4 ? 1 : 0 }}>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
                                                                                <motion.div
                                                                                    animate={isCurrent ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px #22c55e', '0 0 15px #22c55e', '0 0 0px #22c55e'] } : {}}
                                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                                    style={{
                                                                                        width: 36, height: 36, borderRadius: 12,
                                                                                        background: complete ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                                                                                        border: `1px solid ${complete ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                        color: complete ? '#22c55e' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s'
                                                                                    }}
                                                                                >
                                                                                    {complete ? <Check size={16} /> : <span style={{ fontFamily: 'var(--font-space)', fontSize: 12, fontWeight: 900 }}>{idx + 1}</span>}
                                                                                </motion.div>
                                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, fontWeight: 800, color: complete ? '#fff' : 'rgba(255,255,255,0.2)', position: 'absolute', top: 48, whiteSpace: 'nowrap', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                                                    {step}
                                                                                </div>
                                                                            </div>
                                                                            {idx < 4 && (
                                                                                <div style={{ height: 2, flex: 1, background: idx < currentStepIdx ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)', margin: '0 12px', position: 'relative', top: -18 }} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Details Grid */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <User size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Patient Details</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>{iss.patient_name || 'Patient Name'}</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                                                                    Required: {iss.units_required} units<br />
                                                                    Priority: <span style={{ color: iss.priority === 'Emergency' ? '#ef4444' : '#60a5fa' }}>{iss.priority}</span>
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <Receipt size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment Information</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>₹{Number(iss.amount).toLocaleString()}</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: iss.payment_status === 'Paid' ? '#22c55e' : '#f59e0b' }} />
                                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{iss.payment_status}</div>
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <ShieldCheck size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tracking Details</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                                                                    Date: {formatDate(iss.issue_date, true)}<br />
                                                                    {/* Key: <span style={{ color: '#fff' }}>0x{iss.issue_id.substring(0, 10).toUpperCase()}</span><br /> */}
                                                                    Security Key: <span style={{ color: '#fff' }}>0x{iss.issue_id.substring(0, 10).toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                            <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <FileText size={14} /> Get Receipt
                                                            </button>
                                                            <button style={{ background: '#D90025', border: '1px solid #D90025', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                                                View Request
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ padding: '0 32px 32px' }}>
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
