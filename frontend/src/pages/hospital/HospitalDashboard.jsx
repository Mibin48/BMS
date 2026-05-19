import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Droplets, CreditCard, TrendingUp, AlertTriangle,
    ChevronRight, Plus
} from 'lucide-react';
import PriorityBadge from '../../components/hospital/PriorityBadge';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import BloodAvailabilityBar from '../../components/hospital/BloodAvailabilityBar';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonStats, SkeletonCard, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { formatDate, timeAgo } from '../../utils/formatters.js';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/* ─── KPI StatCard ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, valueColor, children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -8, scale: 1.02, borderColor: 'rgba(217, 0, 37, 0.45)' }}
            style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.7), rgba(10, 10, 15, 0.85))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 28,
                padding: 28,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: 180
            }}
        >
            {/* Holographic light leak */}
            <div style={{
                position: 'absolute', top: -30, right: -20, width: '120px', height: '120px',
                background: 'radial-gradient(circle at center, rgba(217,0,37,0.12), transparent 70%)',
                pointerEvents: 'none', filter: 'blur(20px)'
            }} />

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: 'linear-gradient(135deg, rgba(217,0,37,0.2), rgba(21, 21, 30, 0.6))',
                        border: '1px solid rgba(217,0,37,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'inset 0 0 10px rgba(217,0,37,0.1)'
                    }}>
                        <Icon size={22} color="var(--red)" />
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.45)',
                        textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800
                    }}>{label}</span>
                </div>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900,
                    color: valueColor || '#fff', lineHeight: 1, marginBottom: 8,
                    letterSpacing: '-0.04em', textShadow: '0 0 30px rgba(0,0,0,0.4)'
                }}>{value}</div>
            </div>

            {sub && <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)',
                fontWeight: 600, letterSpacing: '0.01em', marginTop: 'auto'
            }}>{sub}</div>}
            {children}

            {/* Glass highlight */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
        </motion.div>
    );
}

/* ─── Patient avatar color by blood group ─────────────────── */
function avatarColor(bg) {
    if (!bg) return 'rgba(255,255,255,0.1)';
    if (bg.startsWith('A')) return 'rgba(99,102,241,0.3)';
    if (bg.startsWith('B')) return 'rgba(34,197,94,0.25)';
    if (bg.startsWith('O')) return 'rgba(217,0,37,0.25)';
    return 'rgba(168,85,247,0.25)';
}
function patientStatusStyle(s) {
    if (s === 'Critical') return { bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.3)', color: 'var(--red)', pulse: true };
    if (s === 'Stable') return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22c55e' };
    return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--text3)' };
}

/* ─── Dashboard ─────────────────────────────────────────────── */
export default function HospitalDashboard() {
    const navigate = useNavigate();
    const { socket } = useNotifications();
    const { showExpiryModal } = useAuth();

    const { data: dashboard, loading, error, refetch } = useFetch(hospitalService.getDashboard);

    useEffect(() => {
        if (!socket) return;

        const handleNotif = () => {
            // Refetch when any relevant event happens (Simplified: refetch on all for live feel)
            refetch();
        };

        socket.on('notification', handleNotif);
        return () => socket.off('notification', handleNotif);
    }, [socket, refetch]);

    const hospital = dashboard?.hospital || {};
    const stats = dashboard?.stats || {};
    const active_patients = dashboard?.active_patients || [];
    const recent_requests = dashboard?.recent_requests || [];
    const recent_payments = dashboard?.recent_payments || [];
    const emergency_requests = dashboard?.emergency_requests || [];
    const connected_banks = dashboard?.connected_banks || [];

    const fulfillmentRate = stats.fulfillment_rate ?? 0;
    const TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: -100, left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(217,0,37,0.06), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(217,0,37,0.04), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* ── Emergency Alert Banner ── */}
            {emergency_requests.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(217,0,37,0.1) 0%, rgba(217,0,37,0.03) 100%)',
                        border: '1px solid rgba(217,0,37,0.4)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 24, padding: '24px 32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 0 40px rgba(217,0,37,0.12)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 50%, rgba(217,0,37,0.15), transparent 50%)', pointerEvents: 'none' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%', background: 'rgba(217,0,37,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(217,0,37,0.3)',
                            animation: 'pulse 1.5s infinite ease-in-out'
                        }}>
                            <AlertTriangle size={24} color="var(--red)" />
                        </div>
                        <div>
                            <span style={{
                                fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20,
                                color: 'var(--red)', letterSpacing: '-0.01em'
                            }}>
                                {emergency_requests.length} Active Emergency {emergency_requests.length === 1 ? 'Request' : 'Requests'}
                            </span>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 500 }}>Critical life support required</div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ x: 5, backgroundColor: 'rgba(217,0,37,0.15)' }}
                        onClick={() => navigate('/hospital/requests')}
                        style={{
                            background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.3)',
                            cursor: 'pointer', borderRadius: 12, padding: '12px 20px',
                            fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: 'var(--red)',
                            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                            position: 'relative', zIndex: 1
                        }}
                    >
                        View Now <ChevronRight size={18} />
                    </motion.button>
                </motion.div>
            )}

            {/* ── KPI Cards ── */}
            <div style={{ minHeight: 140 }}>
                <AnimatePresence mode="wait">
                    {loading && !dashboard ? (
                        <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SkeletonStats count={4} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats-grid"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1.4fr 1fr',
                                gap: 24,
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <StatCard icon={Users} label="Current Patients" value={stats.active_patients ?? '--'} delay={0.05} />
                            <StatCard icon={Droplets} label="Blood Requests" value={stats.total_requests ?? '--'} delay={0.1} />
                            <StatCard icon={CreditCard} label="Pending Bills" value={`₹${(stats.pending_payments ?? 0).toLocaleString('en-IN')}`} valueColor="var(--red)" delay={0.15} />
                            <StatCard icon={TrendingUp} label="Completed Orders" value={stats.fulfilled_requests ?? '--'} delay={0.2} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* ── Active Requests Table ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                style={{
                    background: 'rgba(15, 15, 23, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 28, padding: 32,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Droplets size={28} color="var(--red)" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '-0.02em' }}>Recent Orders</div>
                                <div style={{ background: 'rgba(217,0,37,0.15)', color: 'var(--red)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(217,0,37,0.2)' }}>{recent_requests.length} IN PROGRESS</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Track your current blood orders and delivery</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/hospital/requests')}
                            style={{
                                background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', cursor: 'pointer',
                                borderRadius: 14, padding: '12px 24px', fontFamily: 'var(--font-sub)',
                                fontSize: 14, fontWeight: 700, color: '#fff',
                                boxShadow: '0 8px 30px rgba(217,0,37,0.25)',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            <Plus size={18} strokeWidth={3} /> New Request
                        </motion.button>
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                            onClick={() => navigate('/hospital/requests')}
                            style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', borderRadius: 14, padding: '12px 20px',
                                fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >
                            History <ChevronRight size={16} />
                        </motion.button>
                    </div>
                </div>

                <div style={{ minHeight: 200 }}>
                    <AnimatePresence mode="wait">
                        {loading && !dashboard ? (
                            <motion.div key="loading-requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonTable rows={3} cols={6} />
                            </motion.div>
                        ) : recent_requests.length === 0 ? (
                            <motion.div key="empty-requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <EmptyState icon={Droplets} title="No requests yet" subtitle="Create your first blood request" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="requests-list"
                                initial="hidden" animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.05 } }
                                }}
                            >
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1.2fr 100px 80px 1fr 110px 120px', gap: 16,
                                    padding: '0 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    marginBottom: 8
                                }}>
                                    {[
                                        { l: 'Patient', i: Users },
                                        { l: 'Group', i: Droplets },
                                        { l: 'Units', i: Droplets },
                                        { l: 'Provider', i: CreditCard },
                                        { l: 'Urgency', i: AlertTriangle },
                                        { l: 'Status', i: TrendingUp }
                                    ].map(({ l, i: Ic }) => (
                                        <div key={l} style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)',
                                            textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700
                                        }}>
                                            <Ic size={12} strokeWidth={2.5} /> {l}
                                        </div>
                                    ))}
                                </div>
                                {recent_requests.map((req, i) => (
                                    <motion.div
                                        key={req.request_id}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        whileHover={{ backgroundColor: 'rgba(217, 0, 37, 0.03)', x: 4 }}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '1.2fr 100px 80px 1fr 110px 120px', gap: 16,
                                            alignItems: 'center', padding: '16px 24px',
                                            borderRadius: 16, marginBottom: 4, cursor: 'pointer', transition: 'all 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                        onClick={() => navigate('/hospital/requests')}
                                    >
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{req.patient_name}</div>
                                        <BloodGroupBadge group={req.blood_group} small />
                                        <div>
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{req.units_required}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>UNIT</span>
                                        </div>
                                        <div style={{
                                            fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.6)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500
                                        }}>{req.bank_name}</div>
                                        <PriorityBadge priority={req.priority} />
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <StatusBadge status={req.status} />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>

            {/* ── Patients + Payments ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                {/* Patients */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                        background: 'rgba(15, 15, 23, 0.6)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 28, padding: 32,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.01em' }}>Current Patients</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Patients receiving medical care</div>
                        </div>
                        <button onClick={() => navigate('/hospital/patients')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-sub)', fontSize: 13, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }}>Directory →</button>
                    </div>
                    <div style={{ minHeight: 250 }}>
                        <AnimatePresence mode="wait">
                            {loading && !dashboard ? (
                                <motion.div key="loading-patients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <SkeletonTable rows={3} cols={3} />
                                </motion.div>
                            ) : active_patients.length === 0 ? (
                                <motion.div key="empty-patients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <EmptyState icon={Users} title="No active patients" subtitle="Add patients to begin tracking" />
                                </motion.div>
                            ) : (
                                <motion.div key="patients-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {active_patients.map(p => {
                                        const sts = patientStatusStyle(p.status);
                                        const ini = p.name?.split(' ').map(n => n[0]).join('') || '?';
                                        return (
                                            <div key={p.patient_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{
                                                        width: 42, height: 42, borderRadius: 14,
                                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontFamily: 'var(--font-head)', fontSize: 14, color: '#fff', letterSpacing: 1
                                                    }}>{ini}</div>
                                                    <div>
                                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{p.name}</div>
                                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.age} yrs · {p.gender} · Ward {p.ward || '--'}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        {p.status === 'Critical' && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(217,0,37,1)' }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/hospital/requests?patientId=${p.patient_id}&bloodGroup=${p.blood_group}&priority=Emergency`);
                                                                }}
                                                                style={{ 
                                                                    background: 'rgba(217,0,37,0.8)', border: 'none', borderRadius: 6, 
                                                                    padding: '4px 10px', color: '#fff', fontSize: 9, 
                                                                    fontFamily: 'var(--font-mono)', fontWeight: 800, cursor: 'pointer', 
                                                                    boxShadow: '0 0 15px rgba(217,0,37,0.3)',
                                                                    letterSpacing: '0.05em'
                                                                }}
                                                            >
                                                                QUICK EMERGENCY
                                                            </motion.button>
                                                        )}
                                                        <BloodGroupBadge group={p.blood_group} small />
                                                    </div>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                                        background: sts.bg, border: `1px solid ${sts.border}`,
                                                        borderRadius: 8, padding: '4px 10px',
                                                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: sts.color,
                                                        letterSpacing: '0.02em'
                                                    }}>
                                                        {sts.pulse && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.2s infinite' }} />}
                                                        {p.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>

                {/* Payments */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
                    style={{
                        background: 'rgba(15, 15, 23, 0.6)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 28, padding: 32,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.01em' }}>Unpaid Bills</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Payments waiting for your review</div>
                        </div>
                        <button onClick={() => navigate('/hospital/payments')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>View All Bills →</button>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(217,0,37,0.1), rgba(217,0,37,0.02))',
                        border: '1px solid rgba(217,0,37,0.2)',
                        borderRadius: 20, padding: 24, marginBottom: 28,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 10px 30px rgba(217,0,37,0.05)'
                    }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(217,0,37,0.8)', marginBottom: 8, letterSpacing: '0.1em', fontWeight: 700 }}>REMAINING TO PAY</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: '#fff', lineHeight: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>₹{(stats.pending_payments ?? 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(217,0,37,0.2)' }}>
                            <CreditCard size={24} color="var(--red)" />
                        </div>
                    </div>
                    <div style={{ minHeight: 250 }}>
                        <AnimatePresence mode="wait">
                            {loading && !dashboard ? (
                                <motion.div key="loading-payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <SkeletonTable rows={3} cols={2} />
                                </motion.div>
                            ) : recent_payments.length === 0 ? (
                                <motion.div key="empty-payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <EmptyState icon={CreditCard} title="No payments" subtitle="Payments appear when blood is requested" />
                                </motion.div>
                            ) : (
                                <motion.div key="payments-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {recent_payments.map((pay, i) => (
                                        <div key={pay.payment_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < recent_payments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{pay.bank_name}</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{pay.payment_date ? formatDate(pay.payment_date) : 'Unpaid'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>₹{(pay.amount ?? 0).toLocaleString('en-IN')}</div>
                                                <StatusBadge status={pay.payment_status} />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>
            </div>

            {/* ── Connected Blood Banks ── */}
            {connected_banks.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                    style={{
                        background: 'rgba(15, 15, 23, 0.6)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 28, padding: 32,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.01em' }}>Partner Stock</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Check blood stock in other hospitals</div>
                        </div>
                        <button onClick={() => navigate('/hospital/blood-banks')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-sub)', fontSize: 13, fontWeight: 600, color: '#fff' }}>Nearby Banks →</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(connected_banks.length, 3)},1fr)`, gap: 24 }}>
                        {connected_banks.map(bank => {
                            const stockVals = bank.stock ? Object.values(bank.stock) : [];
                            const maxStock = Math.max(...(stockVals.length ? stockVals : [1]));
                            return (
                                <motion.div
                                    key={bank.bank_id}
                                    whileHover={{ y: -5, background: 'rgba(255,255,255,0.02)' }}
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, transition: 'all 0.3s' }}
                                >
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 6 }}>{bank.bank_name}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>{bank.city} · {bank.request_count} ACTIVE REQUESTS</div>

                                    {bank.stock && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                                            {TYPES.map(t => {
                                                const units = bank.stock[t] || 0;
                                                const MAX_CAPACITY = 250;
                                                const pct = (units / MAX_CAPACITY) * 100;
                                                const colorGradients = 
                                                    pct > 60 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 
                                                    pct > 30 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                                                    'linear-gradient(90deg, #D90025, #FF0030)';
                                                
                                                return (
                                                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <BloodGroupBadge group={t} small />
                                                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                                                                style={{
                                                                    height: '100%',
                                                                    background: colorGradients,
                                                                    borderRadius: 2
                                                                }}
                                                            />
                                                        </div>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', minWidth: 20, textAlign: 'right', fontWeight: 600 }}>{units}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/hospital/requests')}
                                        style={{ width: '100%', background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', borderRadius: 12, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(217,0,37,0.2)' }}
                                    >
                                        Initiate Request
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

