import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Droplets, Inbox, CreditCard, Siren, ArrowRight, ChevronRight, Users, Activity, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BBStockCard from '../../components/bloodbank/BBStockCard';
import BBStatCard from '../../components/bloodbank/BBStatCard';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import { cardBase } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import { formatML, timeAgo } from '../../utils/formatters.js';
import BBSkeleton, { BBCardSkeleton, BBListSkeleton, BBStatSkeleton } from '../../components/bloodbank/BBSkeleton';
import { useAuth } from '../../context/AuthContext.jsx';


function initials(name) { return name ? name.split(' ').slice(0, 2).map(n => n[0]).join('') : '?'; }
function fmt(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }

export default function BloodBankDashboard() {
    const { showExpiryModal } = useAuth();
    const navigate = useNavigate();
    const [reqTab, setReqTab] = useState('All');
    const { data: dashboard, loading, error, refetch } = useFetch(bloodBankService.getDashboard);

    const inventory = dashboard?.inventory || {};
    const stats = dashboard?.stats || {};
    const emergency_requests = dashboard?.emergency_requests || [];
    const recent_donations = dashboard?.recent_donations || [];
    const recent_requests = dashboard?.recent_requests || [];
    const stock_alerts = dashboard?.stock_alerts || [];
    const stockItems = inventory?.stock || [];
    const totalUnits = inventory?.total_units ?? 0;
    const filteredReqs = reqTab === 'All' ? recent_requests : recent_requests.filter(r => r.status === reqTab);

    if (error && !showExpiryModal) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── CRITICAL STOCK ALERT ─────────────────────── */}
            {!loading && stock_alerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ boxShadow: 'inset 0 0 40px rgba(217, 0, 37, 0.1)' }}
                    style={{
                        position: 'relative', overflow: 'hidden', borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'linear-gradient(135deg, rgba(217,0,37,0.12), rgba(217,0,37,0.06), transparent)',
                        boxShadow: '0 0 60px rgba(217,0,37,0.15)',
                    }}>
                    {/* Animated BG pulse */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(217,0,37,0.05)', animation: 'pulse 3s ease-in-out infinite', pointerEvents: 'none' }} />
                    {/* Left stripe */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, transparent, #D90025, transparent)', borderRadius: '16px 0 0 16px' }} />

                    <div style={{ position: 'relative', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(217,0,37,0.20)', border: '1px solid rgba(217,0,37,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={18} color="#D90025" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#D90025', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Low Stock Alert</p>
                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(217,0,37,0.60)' }}>{stock_alerts.length} blood group{stock_alerts.length > 1 ? 's' : ''} below 15% capacity</p>
                            </div>
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#D90025', background: 'rgba(217,0,37,0.10)', border: '1px solid rgba(217,0,37,0.20)', padding: '4px 12px', borderRadius: 100, animation: 'pulse 1.5s infinite' }}>LOW STOCK</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {stock_alerts.map(s => (
                                <div key={s.blood_group} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0F0F17', border: '1px solid rgba(217,0,37,0.20)', borderRadius: 12, padding: '8px 12px' }}>
                                    <BBBloodBadge group={s.blood_group} size="sm" />
                                    <div>
                                        <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1 }}>{s.available_units}U</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#D90025', lineHeight: 1, marginTop: 2 }}>{s.capacity > 0 ? Math.round(s.available_units / s.capacity * 100) : 0}%</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => navigate('/bloodbank/inventory')} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', marginLeft: 'auto',
                                background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.30)', borderRadius: 12,
                                fontFamily: 'var(--font-space)', fontSize: 11, color: '#D90025', cursor: 'pointer', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,0,37,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,0,37,0.15)'}
                            >
                                Update Stock <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── EMERGENCY REQUESTS ───────────────────────── */}
            {!loading && emergency_requests.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    style={{
                        position: 'relative', overflow: 'hidden', borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.05), transparent)',
                    }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, transparent, #f59e0b, transparent)' }} />
                    <div style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Siren size={18} color="#f59e0b" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Emergency Requests</p>
                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(245,158,11,0.60)' }}>Requires immediate attention</p>
                            </div>
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', padding: '4px 12px', borderRadius: 100, animation: 'pulse 1.5s infinite' }}>{emergency_requests.length} ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {emergency_requests.map(req => (
                                <div key={req.request_id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(15,15,23,0.60)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <BBBloodBadge group={req.blood_group} size="sm" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.hospital_name}</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#f59e0b' }}>{req.units_required}U for {req.patient_name}</p>
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4', flexShrink: 0 }}>{timeAgo(req.created_at)}</p>
                                    <button onClick={() => navigate('/bloodbank/requests')} style={{
                                        flexShrink: 0, padding: '6px 12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)',
                                        borderRadius: 8, fontFamily: 'var(--font-space)', fontSize: 11, color: '#f59e0b', cursor: 'pointer', transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                                    >
                                        ACT →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── KPI CARDS ────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                    { icon: Package, label: 'TOTAL UNITS', val: String(totalUnits), sub: 'Across 8 blood groups', color: 'red' },
                    { icon: Droplets, label: 'DONATIONS', val: String(stats.total_donations ?? '--'), sub: `${formatML(stats.total_ml)} total`, color: 'green' },
                    { icon: Inbox, label: 'PENDING REQUESTS', val: String(stats.pending_requests ?? 0), sub: `${stats.total_requests ?? 0} total`, color: 'amber', pulse: (stats.pending_requests ?? 0) > 0 },
                    { icon: CreditCard, label: 'PAYMENTS DUE', val: `₹${(stats.pending_payments ?? 0).toLocaleString('en-IN')}`, sub: `${stats.fulfilled_requests ?? 0} fulfilled`, color: 'blue' },
                ].map((c, i) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                        {loading ? <BBStatSkeleton delay={i * 0.1} /> : <BBStatCard {...c} value={c.val} />}
                    </motion.div>

                ))}

            </div>

            {/* ── LIVE STOCK GRID ──────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ ...cardBase, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Live Stock Status</h2>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: 100, padding: '4px 12px'
                        }}>
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}
                            />
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em' }}>LIVE STOCK</span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/bloodbank/inventory')} style={{
                        display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(217, 0, 37, 0.08)', border: '1px solid rgba(217, 0, 37, 0.15)', cursor: 'pointer',
                        padding: '6px 14px', borderRadius: 10, fontFamily: 'var(--font-dm)', fontSize: 12, color: '#D90025', fontWeight: 700,
                        transition: 'all 0.3s'
                    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(217, 0, 37, 0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(217, 0, 37, 0.08)'}>
                        Manage Stock <ArrowRight size={14} />
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <BBSkeleton key={i} height="160px" borderRadius="16px" />)
                        : stockItems.map(s => <BBStockCard key={s.stock_id || s.blood_group} stock={s} />)
                    }
                </div>

            </motion.div>

            {/* ── RECENT REQUESTS ──────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ ...cardBase, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Recent Requests</h2>
                    <button onClick={() => navigate('/bloodbank/requests')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#D90025' }}>View All →</button>
                </div>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {['All', 'Pending', 'Processing', 'Fulfilled'].map(t => (
                        <button key={t} onClick={() => setReqTab(t)} style={{
                            background: reqTab === t ? '#D90025' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${reqTab === t ? '#D90025' : 'rgba(255,255,255,0.10)'}`,
                            borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
                            fontFamily: 'var(--font-space)', fontSize: 11, color: reqTab === t ? '#fff' : '#9B9BA4',
                            transition: 'all 0.2s',
                        }}>{t}</button>
                    ))}
                </div>
                {loading ? (
                    <BBListSkeleton rows={3} height={72} />
                ) : filteredReqs.length === 0 ? (

                    <BBEmptyState icon={Inbox} title="No requests" subtitle="Blood requests from hospitals will appear here" size="small" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredReqs.map(req => {
                            const isEmerg = req.priority === 'Emergency';
                            const statusCol = isEmerg ? '#D90025' : req.priority === 'Urgent' ? '#f59e0b' : '#3b82f6';
                            return (
                                <motion.div
                                    key={req.request_id}
                                    whileHover="hover"
                                    style={{
                                        position: 'relative',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: 16,
                                        border: `1px solid ${statusCol}40`,
                                        padding: '16px 20px',
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        transition: 'all 0.3s ease', cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => navigate('/bloodbank/requests')}
                                >
                                    {/* Inner Glow */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        boxShadow: `inset 0 0 12px ${statusCol}08`,
                                        pointerEvents: 'none', zIndex: 0
                                    }} />
                                    {/* Animated Beam */}
                                    <motion.div
                                        variants={{
                                            hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            position: 'absolute', inset: '1px',
                                            background: `linear-gradient(90deg, transparent, ${statusCol}12, transparent)`,
                                            pointerEvents: 'none', zIndex: 0
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                                        <BBBloodBadge group={req.blood_group} size="md" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{req.hospital_name}</p>
                                                <BBStatusBadge status={req.priority} size="sm" />
                                            </div>
                                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4' }}>{req.patient_name} · {req.units_required} Units Required</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <BBStatusBadge status={req.status} size="sm" />
                                            <ChevronRight size={18} color="#4A4A55" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* ── BOTTOM ROW ───────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent Donations */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    style={{ ...cardBase, padding: 28, border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 40px rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Recent Donations</h2>
                        <button onClick={() => navigate('/bloodbank/donations')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#D90025' }}>View All →</button>
                    </div>
                    {loading ? (
                        <BBListSkeleton rows={3} height={56} />
                    ) : recent_donations.length === 0 ? (

                        <BBEmptyState icon={Droplets} title="No donations" subtitle="Recent donations will appear here" size="small" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recent_donations.map((d, i) => (
                                <motion.div
                                    key={d.donation_id}
                                    whileHover="hover"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '12px 16px', borderRadius: 16,
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(217, 0, 37, 0.4)',
                                        transition: 'all 0.2s',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                >
                                    {/* Animated Beam */}
                                    <motion.div
                                        variants={{
                                            hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                                        }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            position: 'absolute', inset: '1px',
                                            background: `linear-gradient(90deg, transparent, rgba(217, 0, 37, 0.08), transparent)`,
                                            pointerEvents: 'none', zIndex: 0
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 13, color: '#D90025', flexShrink: 0 }}>{initials(d.donor_name)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.donor_name}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#4A4A55', fontWeight: 600 }}>{fmt(d.donation_date).toUpperCase()}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <BBBloodBadge group={d.blood_group} size="sm" />
                                            <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{formatML(d.quantity_ml)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Stats */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ ...cardBase, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Quick Stats</h2>
                        <button onClick={() => navigate('/bloodbank/donors')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#D90025' }}>Donors →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {[
                            { label: 'Unique Donors', val: stats.unique_donors ?? 0, color: '#22c55e', icon: Users },
                            { label: 'Fulfilment Rate', val: `${stats.fulfillment_rate ?? 0}%`, color: '#f59e0b', icon: Activity },
                            { label: 'Eligibility Rate', val: `${stats.eligibility_rate ?? 0}%`, color: '#3b82f6', icon: ShieldCheck },
                            { label: 'Revenue (INR)', val: (stats.received_revenue ?? 0).toLocaleString('en-IN'), color: '#fff', icon: CreditCard },
                            { label: 'Critical Groups', val: inventory?.critical_count ?? 0, color: '#ef4444', icon: AlertTriangle, animate: (inventory?.critical_count ?? 0) > 0 },
                            { label: 'Total Requests', val: stats.total_requests ?? 0, color: '#9B9BA4', icon: FileText },
                        ].map(({ label, val, color, icon: Icon, animate }) => (
                            <motion.div
                                key={label}
                                whileHover="hover"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${color}40`,
                                    borderRadius: 24, padding: '24px 16px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                                    position: 'relative', overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                {/* Static Ambient Glow */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: `radial-gradient(circle at 20% 20%, ${color}05, transparent 60%)`,
                                    pointerEvents: 'none'
                                }} />

                                {/* Moving Ambient Glow */}
                                <motion.div
                                    animate={{
                                        x: [0, 20, -20, 0],
                                        y: [0, -20, 20, 0],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        position: 'absolute', inset: '-50%',
                                        background: `radial-gradient(circle at center, ${color}03, transparent 40%)`,
                                        pointerEvents: 'none'
                                    }}
                                />

                                {/* Hover Beam */}
                                <motion.div
                                    variants={{
                                        hover: { x: ['-100%', '200%'], opacity: [0, 0.8, 0] }
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', inset: '1px',
                                        background: `linear-gradient(90deg, transparent, ${color}12, transparent)`,
                                        pointerEvents: 'none', zIndex: 0
                                    }}
                                />

                                <div style={{
                                    position: 'relative', zIndex: 1,
                                    padding: 12,
                                    borderRadius: 14,
                                    background: `${color}12`,
                                    border: `1px solid ${color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 8px 16px -4px ${color}20`
                                }}>
                                    <Icon size={20} color={color} />
                                </div>

                                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                    <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', lineHeight: 1 }}>{val}</p>
                                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 10, letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                                </div>

                                {animate && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                        style={{
                                            position: 'absolute', inset: 0,
                                            background: `radial-gradient(circle at center, ${color}30, transparent)`,
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
