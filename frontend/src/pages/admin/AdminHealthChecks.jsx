import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, Stethoscope, Activity, CheckCircle2, Ban, User, MapPin, ClipboardCheck, Thermometer, HeartPulse, ShieldAlert } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminHealthChecks() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading } = useFetch(
        adminService.getAllHealthChecks,
        { status: statusFilter, search: debouncedSearch, limit, offset },
        [statusFilter, debouncedSearch, offset]
    );

    const checks = resp?.health_checks || [];
    const sum = resp?.summary || { total: 0, eligible: 0, deferred: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
            {/* Header / Tracing Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 2, background: 'linear-gradient(90deg, #3b82f6, transparent)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#3b82f6', letterSpacing: '0.12em', fontWeight: 700 }}>HEALTH CHECKS LIVE</span>
                </div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>DATA IS SECURE</div>
            </div>

            {/* Top Summaries */}
            {loading ? <SkeletonStats count={4} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                    <StatCard label="Total Checks Done" value={(sum.total ?? 0).toLocaleString()} icon={Stethoscope} color="white" description="The number of health checks performed." />
                    <StatCard label="Eligible Donors" value={(sum.eligible ?? 0).toLocaleString()} icon={CheckCircle2} color="green" description="Donors who were ready to give blood." />
                    <StatCard label="Deferred Donors" value={(sum.deferred ?? 0).toLocaleString()} icon={Ban} color="red" description="Donors who need to wait before donating." />
                    <StatCard label="Pass Rate" value={`${(sum.total || 0) > 0 ? Math.round(((sum.eligible || 0) / sum.total) * 100) : 0}%`} icon={Activity} color="blue" description="Percentage of donors who were eligible." />
                </div>
            )}

            {/* Filter Hub */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Eligible', 'Deferred'].map(t => {
                        const val = t === 'All' ? '' : t;
                        const isActive = statusFilter === val;
                        return (
                            <button key={t} onClick={() => { setStatusFilter(val); setOffset(0); }} style={{
                                background: isActive ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600,
                                color: isActive ? '#D90025' : '#9B9BA4', transition: 'all 0.2s'
                            }}>{t}</button>
                        );
                    })}
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by donor name or blood bank..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 52, background: 'transparent', border: 'none' }}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    <Download size={16} /> Download List
                </button>
            </div>

            {/* Inventory List */}
            <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Health Check History</div>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resp?.total || 0} SEARCH RESULTS</div>
                </div>

                {loading ? <div style={{ padding: 32 }}><SkeletonTable rows={10} cols={7} /></div> : checks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)' }}>
                        <Stethoscope size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>Nothing Found</div>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 400, margin: '0 auto' }}>We couldn't find any health records matching your search.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px 32px' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '130px 2fr 1.5fr 100px 100px 100px 120px 40px', gap: 20,
                            padding: '24px 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800
                        }}>
                            {['ID', 'DONOR', 'BLOOD BANK', 'WEIGHT', 'BLOOD PRESSURE', 'HEMOGLOBIN', 'STATUS', ''].map(h => <div key={h}>{h}</div>)}
                        </div>

                        {/* Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                            {checks.map((hc, i) => {
                                const isOpen = expanded === hc.check_id;
                                const isEligible = hc.eligibility_status === 'Eligible';
                                const accent = isEligible ? '#22c55e' : '#D90025';
                                return (
                                    <div key={hc.check_id}>
                                        <div
                                            onClick={() => setExpanded(isOpen ? null : hc.check_id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '130px 2fr 1.5fr 100px 100px 100px 120px 40px', gap: 20, alignItems: 'center',
                                                padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${isOpen ? `${accent}44` : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                            }}
                                        >
                                            {isOpen && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: accent, borderRadius: '0 4px 4px 0' }} />}

                                            <div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#fff' }}>#{hc.check_id?.split('-').pop()?.toUpperCase()}</div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{formatDate(hc.check_date)}</div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{hc.donor_name}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={10} /> {hc.donor_email || hc.donor_id?.substring(0, 8)}</div>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} color="#3b82f6" /> {hc.bank_name}</div>

                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{hc.weight}</span>
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>kg</span>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{hc.blood_pressure}</div>

                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{hc.hemoglobin}</span>
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>g/dL</span>
                                            </div>

                                            <div><StatusBadge status={hc.eligibility_status} size="sm" /></div>

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
                                                        padding: '32px', margin: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 32,
                                                        borderLeft: `4px solid ${accent}`
                                                    }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                                                            {/* Detailed Stats */}
                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <Activity size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Health Measurements</div>
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                                    <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                                            <HeartPulse size={12} color="#f87171" />
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Pulse</span>
                                                                        </div>
                                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{hc.pulse || '--'}<span style={{ fontSize: 10, marginLeft: 2, fontWeight: 500 }}>bpm</span></div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                                            <Thermometer size={12} color="#60a5fa" />
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Temperature</span>
                                                                        </div>
                                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{hc.temperature || '--'}<span style={{ fontSize: 10, marginLeft: 2, fontWeight: 500 }}>°C</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Linked Donation */}
                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <ClipboardCheck size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Donation Info</div>
                                                                </div>
                                                                {hc.donation_id ? (
                                                                    <>
                                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>{hc.quantity_ml}ml Collected</div>
                                                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ref: #{hc.donation_id?.split('-').pop()?.toUpperCase()}</div>
                                                                    </>
                                                                ) : (
                                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginTop: 8 }}>No donation was made after this check.</div>
                                                                )}
                                                            </div>

                                                            {/* Outcome */}
                                                            <div style={{ padding: '20px', background: isEligible ? 'rgba(34,197,94,0.03)' : 'rgba(217,0,37,0.03)', borderRadius: 16, border: `1px solid ${isEligible ? '#22c55e22' : '#D9002522'}` }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <ShieldAlert size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Check Result</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>{isEligible ? 'Safe to Donate' : 'Please wait for now'}</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: isEligible ? 'rgba(34,197,94,0.6)' : 'rgba(217,0,37,0.6)', lineHeight: 1.5 }}>
                                                                    {isEligible ? 'The donor is healthy and good to go.' : (hc.deferred_reason || 'Standard health check did not pass.')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                            <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff' }}>More Info</button>
                                                            <button style={{ background: accent, border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#fff' }}>{isEligible ? 'Go to Donation' : 'See Past Checks'}</button>
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
