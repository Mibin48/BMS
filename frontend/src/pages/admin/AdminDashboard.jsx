import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    Users, Building2, Package, TrendingUp, Heart, Activity,
    CreditCard, MapPin, AlertTriangle, ChevronRight, Check, X
} from 'lucide-react';
import IconBtn from '../../components/IconBtn';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatCard from '../../components/StatCard';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';

function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const rate = data.requests > 0 ? Math.round((data.fulfilled / data.requests) * 100) : 0;

    return (
        <div style={{ background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'var(--font-space)', textTransform: 'uppercase' }}>Donations</span>
                    <span style={{ fontSize: 12, color: '#fff', fontFamily: 'var(--font-space)', fontWeight: 700 }}>{data.donations} Units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ fontSize: 10, color: '#3b82f6', fontFamily: 'var(--font-space)', textTransform: 'uppercase' }}>Requests</span>
                    <span style={{ fontSize: 12, color: '#fff', fontFamily: 'var(--font-space)', fontWeight: 700 }}>{data.requests} Units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'var(--font-space)', textTransform: 'uppercase' }}>Fulfilled</span>
                    <span style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'var(--font-space)', fontWeight: 700 }}>{data.fulfilled} Units</span>
                </div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#9B9BA4', fontFamily: 'var(--font-dm)' }}>Efficiency</span>
                    <span style={{ fontSize: 11, color: rate > 80 ? '#22c55e' : '#f59e0b', fontFamily: 'var(--font-space)', fontWeight: 800 }}>{rate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#9B9BA4', fontFamily: 'var(--font-dm)' }}>Total Amount</span>
                    <span style={{ fontSize: 11, color: '#fff', fontFamily: 'var(--font-space)' }}>{(data.ml / 1000).toFixed(1)}L</span>
                </div>
            </div>
        </div>
    );
}

const DISTRICT_POSITIONS = {
    'Kasaragod': { x: 26, y: 8 },
    'Kannur': { x: 34, y: 16 },
    'Wayanad': { x: 48, y: 18 },
    'Kozhikode': { x: 38, y: 26 },
    'Malappuram': { x: 46, y: 34 },
    'Palakkad': { x: 62, y: 40 },
    'Thrissur': { x: 46, y: 48 },
    'Ernakulam': { x: 42, y: 58 },
    'Idukki': { x: 66, y: 64 },
    'Kottayam': { x: 50, y: 70 },
    'Alappuzha': { x: 40, y: 76 },
    'Pathanamthitta': { x: 56, y: 80 },
    'Kollam': { x: 48, y: 88 },
    'Thiruvananthapuram': { x: 58, y: 96 },
};

function DistrictMap({ districts = [] }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: 520, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0A0A12', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '90%', width: 'auto' }}>
                <img src="/keralamap.png" alt="Kerala Map" style={{ height: '100%', width: 'auto', objectFit: 'contain', opacity: 0.8, filter: 'brightness(0.8) contrast(1.2) sepia(0.5) hue-rotate(-30deg)' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, #0A0A12 100%)', pointerEvents: 'none' }} />
        </div>
    );
}

const actionBadge = (a) => {
    const s = a === 'APPROVED' ? { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', b: 'rgba(34,197,94,0.3)' } :
        a === 'LOGIN FAILED' ? { bg: 'rgba(217,0,37,0.1)', c: '#D90025', b: 'rgba(217,0,37,0.3)' } :
            a === 'ALERT' ? { bg: 'rgba(245,158,11,0.1)', c: '#f59e0b', b: 'rgba(245,158,11,0.3)' } :
                { bg: 'rgba(59,130,246,0.1)', c: '#3b82f6', b: 'rgba(59,130,246,0.3)' };
    return <span style={{ background: s.bg, border: `1px solid ${s.b}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-space)', fontSize: 9, color: s.c }}>{a}</span>;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { showExpiryModal } = useAuth();

    const { data: dash, loading: dashLoading, error, refetch } = useFetch(adminService.getDashboard);
    const { data: dTrend } = useFetch(adminService.getTrends);
    const { data: dDist } = useFetch(adminService.getDistrictStats);

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    const approveApi = useApi(adminService.approveEntity, { onSuccess: () => { toast.success("Approved successfully"); refetch(); } });
    const rejectApi = useApi(adminService.rejectEntity, { onSuccess: () => { toast.error("Application rejected"); refetch(); } });

    if (dashLoading || !dash) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <SkeletonStats count={4} />
                <SkeletonStats count={4} />
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <GlassCard><SkeletonTable rows={6} cols={1} /></GlassCard>
                    <GlassCard><SkeletonTable rows={6} cols={1} /></GlassCard>
                </div>
            </div>
        );
    }

    const { stats: s, pending_approvals, active_emergencies, recent_requests, recent_payments, critical_stock, recent_alerts } = dash;
    const trends = dTrend?.trends || [];
    const districts = dDist?.districts || [];
    const distSum = dDist?.summary || { healthy: 0, low: 0, critical: 0 };

    const pendingCount = pending_approvals.length;
    const criticalDistricts = distSum.critical;

    const kpis1 = [
        { label: 'TOTAL DONORS', value: (s.donors ?? 0).toLocaleString(), sub: 'Registered across 14 districts in Kerala', icon: Users, color: 'blue' },
        { label: 'TOTAL HOSPITALS', value: (s.hospitals ?? 0).toLocaleString(), sub: `${s.blood_banks || 0} Blood Banks`, icon: Building2, color: 'green' },
        { label: 'BLOOD IN STOCK', value: (s.total_units ?? 0).toLocaleString(), sub: 'Available now', icon: Package, color: 'red' },
        { label: 'FULFILLMENT RATE', value: `${s.fulfillment_rate || 0}%`, sub: `${s.fulfilled_requests || 0} / ${s.total_requests || 0} orders`, icon: TrendingUp, color: 'amber' },
    ];
    const kpis2 = [
        { label: 'TOTAL DONATIONS', value: (s.total_donations ?? 0).toLocaleString(), sub: `${((s.total_ml || 0) / 1000).toFixed(1)} litres collected`, icon: Heart, color: 'red' },
        { label: 'EMERGENCY CASES', value: (active_emergencies || []).length, sub: 'Immediate attention required', icon: Activity, color: 'purple' },
        { label: 'PENDING PAYMENTS', value: `₹${(s.pending_payments ?? 0).toLocaleString()}`, sub: 'Payments not yet received', icon: CreditCard, color: 'white' },
        { label: 'KERALA DISTRICTS', value: '14/14', sub: `${distSum.critical || 0} districts with low stock`, icon: MapPin, color: 'green' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Alert Banner */}
            {(pendingCount > 0 || criticalDistricts > 0) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 16, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertTriangle size={20} color="#D90025" style={{ animation: 'bounce 1s infinite' }} />
                        <div>
                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#D90025' }}>{pendingCount} New Registrations · {criticalDistricts} Districts with Low Stock</div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginTop: 2 }}>Immediate review required</div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/admin/approvals')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#D90025', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Review Now <ChevronRight size={16} />
                    </button>
                </motion.div>
            )}

            {/* KPI Rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {kpis1.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><StatCard {...k} /></motion.div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {kpis2.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}><StatCard {...k} /></motion.div>
                ))}
            </div>

            {/* Charts Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <GlassCard style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        {/* Scanning Effect on Chart */}
                        <motion.div
                            animate={{ left: ['-100%', '200%'] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', top: 0, bottom: 0, width: '40px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.05), transparent)', zIndex: 1, pointerEvents: 'none' }}
                        />

                        <SectionHeader
                            title="Operational Analytics"
                            subtitle="Daily comparison of blood donations and hospital requests."
                            action="View Details"
                            onAction={() => toast.success('Syncing information...')}
                        />
                        <div style={{
                            height: 500, position: 'relative', zIndex: 2, padding: '0 10px'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={trends} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                    <defs>
                                        <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="5 5" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontFamily: 'var(--font-space)', fontSize: 10, fill: '#9B9BA4' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={15}
                                    />
                                    <YAxis
                                        tick={{ fontFamily: 'var(--font-space)', fontSize: 10, fill: '#9B9BA4' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ fontFamily: 'var(--font-space)', fontSize: 9, letterSpacing: '0.1em', paddingTop: 0, paddingBottom: 30 }}
                                    />

                                    {/* Supply visualization */}
                                    <Bar
                                        dataKey="donations"
                                        name="COLLECTED"
                                        fill="url(#barColor)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                        animationDuration={1500}
                                    />

                                    {/* Demand Curve */}
                                    <Line
                                        type="monotone"
                                        dataKey="requests"
                                        name="REQUESTED"
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        activeDot={false}
                                    />

                                    {/* Fulfillment Line */}
                                    <Line
                                        type="monotone"
                                        dataKey="fulfilled"
                                        name="FULFILLED_REQUESTS"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#0F0F17' }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                        animationDuration={2500}
                                    />

                                    <Line
                                        type="stepAfter"
                                        dataKey="donations"
                                        name="STOCK LEVEL"
                                        stroke="#22c55e"
                                        strokeWidth={1.5}
                                        dot={false}
                                        activeDot={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard noPad style={{ background: 'rgba(10, 10, 18, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            {/* <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} /> */}
                            {/* <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#22c55e', letterSpacing: '0.2em' }}>SYSTEM LIVE</span> */}
                        </div>
                        <SectionHeader title="Geographic Status" subtitle="State-wide inventory distribution" style={{ margin: 0 }} />
                    </div>
                    <div style={{ padding: '0px 16px', position: 'relative' }}>
                        <DistrictMap districts={districts} />
                    </div>
                </GlassCard>
            </div>

            {/* Pending Approvals */}
            {pending_approvals.length > 0 && (
                <GlassCard>
                    <SectionHeader title="Pending Approvals" count={`${pendingCount} PENDING`} action="Show All" onAction={() => navigate('/admin/approvals')} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        <AnimatePresence>
                            {pending_approvals.slice(0, 3).map(a => (
                                <motion.div key={a.id} layout exit={{ scale: 0.9, opacity: 0 }}
                                    style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <span style={{ background: a.type === 'Hospital' ? 'rgba(59,130,246,0.1)' : 'rgba(217,0,37,0.1)', border: `1px solid ${a.type === 'Hospital' ? 'rgba(59,130,246,0.3)' : 'rgba(217,0,37,0.3)'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-space)', fontSize: 9, color: a.type === 'Hospital' ? '#3b82f6' : '#D90025' }}>{a.type}</span>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff', marginTop: 8 }}>{a.name}</div>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4' }}>{a.city}, Kerala</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4' }}>{formatDate(a.submitted)}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginBottom: 8 }}>{a.email}</div>
                                    <StatusBadge status="Pending" />
                                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                        <button onClick={() => approveApi.execute(a.id)} disabled={approveApi.loading} style={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Approve ✓</button>
                                        <button onClick={() => rejectApi.execute(a.id, "Rejected by admin")} disabled={rejectApi.loading} style={{ flex: 1, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#D90025' }}>Reject ✗</button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </GlassCard>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* System Requests */}
                <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <SectionHeader title="Recent Hospital Requests" count={recent_requests.length} action="View All" onAction={() => navigate('/admin/requests')} style={{ margin: 0 }} />
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px 40px 115px', gap: 20, paddingBottom: 12, opacity: 0.3 }}>
                            {['ID', 'HOSPITAL', 'BLOOD', 'QTY', 'STATUS'].map(h => <div key={h} style={{ fontFamily: 'var(--font-space)', fontSize: 9, letterSpacing: '0.12em', fontWeight: 800 }}>{h}</div>)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {recent_requests.map((r, i) => {
                                const isEmerg = r.priority === 'Emergency';
                                const accent = isEmerg ? '#D90025' : (r.status === 'Fulfilled' ? '#22c55e' : '#3b82f6');
                                return (
                                    <motion.div key={r.request_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                        whileHover={{ x: 4, background: `${accent}08` }}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '80px 1fr 60px 40px 115px', gap: 20, alignItems: 'center',
                                            padding: '12px 14px', background: `${accent}04`, border: `1px solid ${accent}22`, borderRadius: 12,
                                            cursor: 'pointer'
                                        }}>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.request_id.split('-').pop()}</div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#fff', wordBreak: 'break-word', minWidth: 0 }}>{r.hospital_name}</div>
                                        <BloodGroupBadge group={r.blood_group} size="xs" />
                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, color: '#fff', fontWeight: 800 }}>{r.units_required}</div>
                                        <StatusBadge status={r.status} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>

                {/* Payment History */}
                <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <SectionHeader title="Latest Payments" count={recent_payments.length} action="View All" onAction={() => navigate('/admin/payments')} style={{ margin: 0 }} />
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 115px', gap: 20, paddingBottom: 12, opacity: 0.3 }}>
                            {['ID', 'FROM', 'PRICE', 'STATUS'].map(h => <div key={h} style={{ fontFamily: 'var(--font-space)', fontSize: 9, letterSpacing: '0.12em', fontWeight: 800 }}>{h}</div>)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {recent_payments.map((p, i) => {
                                const isPaid = p.payment_status === 'Paid';
                                const accent = isPaid ? '#22c55e' : '#f59e0b';
                                return (
                                    <motion.div key={p.payment_id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                        whileHover={{ x: -4, background: `${accent}08` }}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '80px 1fr 100px 115px', gap: 20, alignItems: 'center',
                                            padding: '12px 14px', background: `${accent}04`, border: `1px solid ${accent}22`, borderRadius: 12,
                                            cursor: 'pointer'
                                        }}>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.payment_id.split('-').pop()}</div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#fff', wordBreak: 'break-word', minWidth: 0 }}>{p.hospital_name}</div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, color: '#fff', fontWeight: 800 }}>₹{p.amount}</div>
                                        <StatusBadge status={p.payment_status} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* System Audit Log */}
            <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <SectionHeader title="Recent Activity" action="View Full List" onAction={() => navigate('/admin/audit')} style={{ margin: 0 }} />
                </div>
                <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recent_alerts.map((log, i) => {
                            const isCrit = log.severity === 'Critical';
                            const accent = isCrit ? '#D90025' : (log.action === 'APPROVED' ? '#22c55e' : '#3b82f6');
                            return (
                                <motion.div key={log.log_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.05) }}
                                    whileHover={{ scale: 1.005, background: `${accent}08` }}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '120px 1fr 100px 140px 1fr', gap: 16, alignItems: 'center',
                                        padding: '14px 20px', background: `${accent}04`, border: `1px solid ${accent}15`, borderRadius: 12,
                                        transition: 'all 0.2s ease', cursor: 'pointer'
                                    }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{formatDate(log.created_at, true)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{log.user_name || log.user_id?.split('-')[0]}</div>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{log.role}</div>
                                    </div>
                                    <div>{actionBadge(log.action)}</div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>{log.entity}</div>
                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff', fontWeight: 700 }}>{log.entity_id?.split('-').pop()}</div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.detail}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
