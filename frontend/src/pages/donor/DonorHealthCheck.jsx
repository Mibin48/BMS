import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Heart, ChevronDown, ChevronUp, Activity, FileText, Droplets, Building2 } from 'lucide-react';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';
import { donorService } from '../../services/donorService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';

function fmt(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function DonorHealthCheck() {
    const { showExpiryModal } = useAuth();
    const [params, setParams] = useState({ limit: 10, offset: 0 });
    const [expandedRow, setExpandedRow] = useState(null);

    const { data: result, loading, error, refetch } = useFetch(
        donorService.getHealthChecks, params, [params.limit, params.offset]
    );

    const checks = result?.health_checks || [];
    const total = result?.total || 0;
    const latest = checks.length > 0 ? checks[0] : null;

    // Hemoglobin trend data (reversed for chronological order)
    const trendData = [...checks].reverse().map(h => ({
        date: new Date(h.check_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        hemoglobin: h.hemoglobin,
    }));

    const metrics = latest ? [
        { label: 'WEIGHT', value: latest.weight, unit: 'kg', ok: latest.weight >= 50 },
        { label: 'HEMOGLOBIN', value: latest.hemoglobin, unit: 'g/dL', ok: latest.hemoglobin >= 12 && latest.hemoglobin <= 17 },
        { label: 'BLOOD PRESSURE', value: latest.blood_pressure, unit: 'mmHg', ok: true },
        { label: 'ELIGIBILITY', value: latest.eligibility_status, unit: '', ok: latest.eligibility_status === 'Eligible' },
    ] : [];

    if (error && !showExpiryModal) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <ErrorCard message={error} onRetry={refetch} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Latest Check Highlight */}
                {loading ? (
                    <SkeletonCard />
                ) : latest ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                        style={{
                            background: 'linear-gradient(135deg,#0F0F17 0%,#1A0A0F 100%)',
                            border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 36,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>LATEST HEALTH CHECK</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 10 }}>
                                    {fmt(latest.check_date)}
                                </div>
                                <EligibilityBadge status={latest.eligibility_status} />
                            </div>
                            <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>
                                #{latest.check_id}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                            {metrics.map(({ label, value, unit, ok }) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1 }}>{value ?? '--'}</span>
                                            {unit && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginLeft: 6 }}>{unit}</span>}
                                        </div>
                                        {ok ? <CheckCircle size={18} color="#22c55e" /> : <AlertCircle size={18} color="#f59e0b" />}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: ok ? '#22c55e' : '#f59e0b', marginTop: 6 }}>
                                        {ok ? '✓ Normal' : '⚠ Check required'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={Heart}
                        title="No health checks yet"
                        subtitle="Your health screening records will appear here after your first check"
                    />
                )}

                {/* History Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}
                >
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 20 }}>Check History</div>

                    {loading ? (
                        <SkeletonTable rows={5} cols={6} />
                    ) : checks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Heart size={48} color="var(--text3)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)' }}>No health checks recorded yet</div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 120px 1fr 1fr 40px', gap: 12, marginBottom: 10, padding: '0 16px' }}>
                                {['CHECK DATE', 'WEIGHT', 'HEMOGLOBIN', 'BLOOD PRESS', 'ELIGIBILITY', 'DONATION', ''].map(h => (
                                    <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                ))}
                            </div>

                            {checks.map((hc, i) => (
                                <div key={hc.check_id} style={{
                                    borderBottom: i < checks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                }}>
                                    <div
                                        onClick={() => setExpandedRow(expandedRow === hc.check_id ? null : hc.check_id)}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '1fr 80px 110px 120px 1fr 1fr 40px',
                                            gap: 12, alignItems: 'center', padding: '16px',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            borderRadius: expandedRow === hc.check_id ? '16px 16px 0 0' : '16px',
                                            background: expandedRow === hc.check_id ? 'rgba(255,255,255,0.02)' : 'transparent'
                                        }}
                                        onMouseEnter={e => { if(expandedRow !== hc.check_id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                        onMouseLeave={e => { if(expandedRow !== hc.check_id) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{fmt(hc.check_date)}</div>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>
                                            {hc.weight} kg
                                            {hc.weight >= 50 ? <CheckCircle size={12} color="#22c55e" style={{ marginLeft: 5 }} /> : <AlertCircle size={12} color="#f59e0b" style={{ marginLeft: 5 }} />}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            {hc.hemoglobin} g/dL
                                            {hc.hemoglobin >= 12 ? <CheckCircle size={12} color="#22c55e" /> : <AlertCircle size={12} color="#f59e0b" />}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{hc.blood_pressure} mmHg</div>
                                        <EligibilityBadge status={hc.eligibility_status} small />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: hc.donation_id ? '#22c55e' : 'var(--text3)' }}>
                                            {hc.donation_id ? `Donated ${hc.quantity_ml}ml` : '—'}
                                        </span>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            {expandedRow === hc.check_id ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Health Report Dropdown */}
                                    <AnimatePresence>
                                        {expandedRow === hc.check_id && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0 0 16px 16px', padding: '24px', display: 'flex', gap: 48, margin: '0 16px 16px' }}>
                                                    <div style={{ flex: 1.5 }}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <Activity size={12} color="var(--text3)" /> Detailed Vitals
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Pulse Rate</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff' }}>{hc.pulse ? `${hc.pulse} bpm` : '--'}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Temperature</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff' }}>{hc.temperature ? `${hc.temperature} °C` : '--'}</div>
                                                            </div>
                                                            <div style={{ gridColumn: 'span 2' }}>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Medical Notes</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: hc.medical_notes ? '#fff' : 'var(--text2)' }}>{hc.medical_notes || 'No specific notes recorded by attending physician.'}</div>
                                                            </div>
                                                        </div>
                                                        {hc.eligibility_status !== 'Eligible' && (
                                                            <div style={{ marginTop: 20, padding: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b', marginBottom: 4 }}>DEFERRAL REASON</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{hc.deferred_reason || 'Deferred due to standard health protocol requirements.'}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {hc.donation_id && (
                                                        <>
                                                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <Droplets size={12} color="var(--red)" /> Link to Donation
                                                                </div>
                                                                <div style={{ background: 'rgba(217,0,37,0.03)', border: '1px solid rgba(217,0,37,0.1)', borderRadius: 12, padding: 16 }}>
                                                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>This health check cleared you for donation <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11 }}>#{hc.donation_id.split('-')[1]}</span>.</p>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff' }}>
                                                                        <Building2 size={14} color="var(--text3)" /> {hc.bank_name || 'Associated Bank'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
                                    Showing {checks.length} of {total} checks
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        disabled={params.offset === 0}
                                        onClick={() => setParams(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
                                        style={{
                                            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                            padding: '6px 14px', cursor: params.offset === 0 ? 'not-allowed' : 'pointer',
                                            fontFamily: 'var(--font-body)', fontSize: 13, color: params.offset === 0 ? 'var(--text3)' : '#fff',
                                            opacity: params.offset === 0 ? 0.5 : 1,
                                        }}
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        disabled={params.offset + params.limit >= total}
                                        onClick={() => setParams(p => ({ ...p, offset: p.offset + p.limit }))}
                                        style={{
                                            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                            padding: '6px 14px', cursor: params.offset + params.limit >= total ? 'not-allowed' : 'pointer',
                                            fontFamily: 'var(--font-body)', fontSize: 13, color: params.offset + params.limit >= total ? 'var(--text3)' : '#fff',
                                            opacity: params.offset + params.limit >= total ? 0.5 : 1,
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Hemoglobin Trend Chart */}
                {trendData.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}
                        style={{ 
                            background: '#0F0F17', 
                            border: '1px solid rgba(255,255,255,0.06)', 
                            borderRadius: 24, 
                            padding: '32px 28px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Hemoglobin Trend</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>Health record progress over time</div>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>HEMOGLOBIN</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '2px', border: '1px dashed #f59e0b' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>TARGET RANGE</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHb" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D90025" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#D90025" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={[10, 20]} 
                                        tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        ticks={[10, 12, 14, 16, 18, 20]}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            const val = payload[0].value;
                                            const isGood = val >= 12.5 && val <= 17.5;
                                            return (
                                                <div style={{ 
                                                    background: 'rgba(22,22,34,0.9)', 
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${isGood ? 'rgba(34,197,94,0.3)' : 'rgba(217,0,37,0.3)'}`, 
                                                    borderRadius: 12, 
                                                    padding: '12px 16px',
                                                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                                                }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff' }}>{val}</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)' }}>g/dL</span>
                                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isGood ? '#22c55e' : 'var(--red)' }}>
                                                                {isGood ? 'OPTIMAL' : 'RECHECK'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }} 
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} 
                                    />
                                    <ReferenceLine y={12.5} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} label={{ position: 'right', value: 'Min', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                                    <ReferenceLine y={17.5} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} label={{ position: 'right', value: 'Max', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                                    
                                    <Line 
                                        type="monotone" 
                                        dataKey="hemoglobin" 
                                        stroke="#D90025" 
                                        strokeWidth={3}
                                        dot={{ fill: '#0F0F17', stroke: '#D90025', strokeWidth: 2, r: 5 }}
                                        activeDot={{ fill: '#D90025', stroke: '#fff', strokeWidth: 2, r: 7 }}
                                        isAnimationActive 
                                        animationDuration={1500} 
                                        animationEasing="ease-in-out" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
        </div>
    );
}
