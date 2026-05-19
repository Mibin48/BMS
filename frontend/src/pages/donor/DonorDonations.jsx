import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Building2, Download, ChevronDown, ChevronUp, Activity, Thermometer, ShieldCheck, Phone } from 'lucide-react';
import { donorService } from '../../services/donorService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonCard, SkeletonTable, SkeletonStats } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';

function fmt(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{payload[0].value} ml</div>
        </div>
    );
}

export default function DonorDonations() {
    const { showExpiryModal } = useAuth();
    const [filters, setFilters] = useState({ year: '', limit: 10, offset: 0 });
    const [expandedRow, setExpandedRow] = useState(null);

    const { data: result, loading, error, refetch } = useFetch(
        donorService.getDonations, filters, [filters.year, filters.limit, filters.offset]
    );

    const donations = result?.donations || [];
    const summary = result?.summary || {};
    const total = result?.total || 0;

    // Generate year options
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    // Area chart data
    const areaData = [...donations].reverse().map(d => ({
        date: fmt(d.donation_date),
        ml: d.quantity_ml,
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {error && !showExpiryModal && <ErrorCard message={error} onRetry={refetch} />}

                {/* Stats */}
                {loading && donations.length === 0 ? (
                    <SkeletonStats count={3} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        {[
                            { icon: Droplets, label: 'TOTAL DONATIONS', val: summary.total_donations ?? '--' },
                            { icon: Droplets, label: 'TOTAL VOLUME', val: summary.total_ml ? `${summary.total_ml} ml` : '--' },
                            { icon: Building2, label: 'AVG PER SESSION', val: summary.average_ml ? `${summary.average_ml} ml` : '--' },
                        ].map(({ icon: Icon, label, val }, i) => (
                            <motion.div key={label}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
                                style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={18} color="var(--red)" />
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1 }}>{val}</div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Donation Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Donations</div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>
                            <Download size={13} /> Export PDF
                        </button>
                    </div>

                    {/* Year filter */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
                        <button
                            onClick={() => setFilters(f => ({ ...f, year: '', offset: 0 }))}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14,
                                color: !filters.year ? 'var(--red)' : 'var(--text3)',
                                borderBottom: !filters.year ? '2px solid var(--red)' : '2px solid transparent',
                                padding: '4px 12px',
                            }}
                        >All</button>
                        {years.map(yr => (
                            <button key={yr} onClick={() => setFilters(f => ({ ...f, year: yr, offset: 0 }))} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14,
                                color: filters.year === yr ? 'var(--red)' : 'var(--text3)',
                                borderBottom: filters.year === yr ? '2px solid var(--red)' : '2px solid transparent',
                                padding: '4px 12px',
                            }}>{yr}</button>
                        ))}
                    </div>

                    {loading ? (
                        <SkeletonTable rows={5} cols={7} />
                    ) : donations.length === 0 ? (
                        <EmptyState
                            icon={Droplets}
                            title={filters.year ? `No donations in ${filters.year}` : 'No donations yet'}
                            subtitle={filters.year ? 'Try a different year filter' : 'Visit a blood bank to donate and your history will appear here'}
                        />
                    ) : (
                        <>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 2fr 80px 80px 100px 100px 40px', gap: 12, padding: '0 0 10px', marginBottom: 4 }}>
                                {['#', 'DATE', 'BLOOD BANK', 'GROUP', 'QTY', 'HB', 'STATUS', ''].map(h => (
                                    <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                ))}
                            </div>

                            {donations.map((d, i) => (
                                <div key={d.donation_id} style={{
                                    borderBottom: i < donations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                }}>
                                    <div 
                                        onClick={() => setExpandedRow(expandedRow === d.donation_id ? null : d.donation_id)}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '40px 1fr 2fr 80px 80px 100px 100px 40px',
                                            gap: 12, alignItems: 'center', padding: '16px 0',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{String(filters.offset + i + 1).padStart(2, '0')}</span>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>
                                                {fmt(d.donation_date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{d.bank_name}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{d.bank_city || 'Kerala'}</div>
                                        </div>
                                        <span style={{ display: 'inline-block', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>{d.blood_group}</span>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff' }}>{d.quantity_ml} ml</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
                                            {d.hemoglobin ? `${d.hemoglobin} g/dL` : '--'}
                                        </div>
                                        <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e', display: 'inline-block' }}>Completed</span>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            {expandedRow === d.donation_id ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Details Dropdown */}
                                    <AnimatePresence>
                                        {expandedRow === d.donation_id && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '20px 24px', margin: '0 0 16px', display: 'flex', gap: 48 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <Activity size={12} color="var(--text3)" /> Health Snapshot
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Weight</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{d.weight ? `${d.weight} kg` : '--'}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Hemoglobin</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{d.hemoglobin ? `${d.hemoglobin} g/dL` : '--'}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Eligibility</div>
                                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#22c55e' }}>{d.eligibility_status || 'Eligible'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <Building2 size={12} color="var(--text3)" /> Facility Details
                                                        </div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <div style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff' }}>{d.bank_name}</div>
                                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{d.bank_city}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                                                            <Phone size={12} /> {d.bank_phone || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
                                    Showing {donations.length} of {total} donations
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        disabled={filters.offset === 0}
                                        onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
                                        style={{
                                            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                            padding: '6px 14px', cursor: filters.offset === 0 ? 'not-allowed' : 'pointer',
                                            fontFamily: 'var(--font-body)', fontSize: 13, color: filters.offset === 0 ? 'var(--text3)' : '#fff',
                                            opacity: filters.offset === 0 ? 0.5 : 1,
                                        }}
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        disabled={filters.offset + filters.limit >= total}
                                        onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
                                        style={{
                                            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                            padding: '6px 14px', cursor: filters.offset + filters.limit >= total ? 'not-allowed' : 'pointer',
                                            fontFamily: 'var(--font-body)', fontSize: 13, color: filters.offset + filters.limit >= total ? 'var(--text3)' : '#fff',
                                            opacity: filters.offset + filters.limit >= total ? 0.5 : 1,
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Area Chart */}
                {areaData.length > 1 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Donation Volume Trend</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D90025" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D90025" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
                                <Area type="monotone" dataKey="ml" stroke="#D90025" strokeWidth={2} fill="url(#areaGrad)"
                                    isAnimationActive animationDuration={800} animationEasing="ease-out" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>
        );
    }
