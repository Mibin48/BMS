import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChevronDown, ChevronUp, Package, AlertTriangle,
    BatteryWarning, CheckCircle2, Activity, Shield, Zap,
    TrendingDown, MapPin, Loader2, Info, Archive, Droplets, HeartPulse
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];

/* ─── Inventory Lifecycle Flowchart ────────────────────────── */
function InventoryFlow() {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, color: '#fff' }}>How Blood Moves</div>
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>This shows how blood goes from donors to the hospitals</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
                {/* Animated Connecting Line */}
                <div style={{ position: 'absolute', top: '28px', left: 80, right: 80, height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0, borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                        animate={{
                            x: ['-100%', '200%'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            width: '50%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)',
                            boxShadow: '0 0 10px rgba(59,130,246,0.4)'
                        }}
                    />
                </div>
                {/* Secondary static subtle line */}
                <div style={{ position: 'absolute', top: '28px', left: 80, right: 80, height: 1, background: 'rgba(59,130,246,0.1)', zIndex: 0 }} />

                {[
                    { label: 'Collecting', icon: HeartPulse, sub: 'Donation Camps', color: '#ef4444' },
                    { label: 'Testing', icon: Shield, sub: 'Safety Checks', color: '#22c55e' },
                    { label: 'Storing', icon: Package, sub: 'In the Blood Bank', color: '#3b82f6' },
                    { label: 'Sending', icon: Zap, sub: 'Ready for Delivery', color: '#f59e0b' },
                    { label: 'Delivered', icon: CheckCircle2, sub: 'To Hospitals', color: '#8b5cf6' }
                ].map((step, i) => (
                    <motion.div
                        key={step.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1, width: 120 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, boxShadow: `0 0 20px ${step.color}33` }}
                            style={{
                                width: 56, height: 56, borderRadius: 18, background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${step.color}44`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${step.color}11, transparent 70%)` }} />
                            <step.icon size={24} color={step.color} />
                        </motion.div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700, color: '#fff' }}>{step.label}</div>
                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function AdminInventory() {
    const { showExpiryModal } = useAuth();
    const [cityFilter, setCityFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading } = useFetch(
        adminService.getAllInventory,
        { city: cityFilter, search: debouncedSearch, limit, offset },
        [cityFilter, debouncedSearch, offset]
    );

    const inventory = resp?.inventory || [];
    const sum = resp?.summary || { total_units: 0, critical_count: 0, low_count: 0, healthy_count: 0 };

    const groupTotals = useMemo(() => {
        const totals = {};
        BLOOD_TYPES.forEach(t => totals[t] = { units: 0, capacity: 0, criticalBanks: 0 });
        inventory.forEach(bank => {
            bank.stock.forEach(s => {
                if (totals[s.blood_group]) {
                    totals[s.blood_group].units += s.available_units;
                    totals[s.blood_group].capacity += (s.capacity || 0);
                    if (s.stock_status === 'Critical') totals[s.blood_group].criticalBanks++;
                }
            });
        });
        return totals;
    }, [inventory]);

    const toggleExpand = (id) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const iqStyle = {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
            <SectionHeader
                title="Blood Stock"
                subtitle={`Monitoring current stock in ${resp?.total || 0} locations.`}
                action={<div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(34,197,94,0.1)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} className="animate-pulse" />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' }}>System Updated</span>
                </div>}
            />

            {/* Top Metrics Hierarchy */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <StatCard
                    label="Total Inventory"
                    value={`${sum.total_units?.toLocaleString()} / ${sum.total_capacity?.toLocaleString() || '0'}`}
                    icon={Droplets}
                    color="blue"
                    description="Units available / Total capacity"
                />
                <StatCard label="Optimal Stock" value={sum.healthy_count} icon={CheckCircle2} color="green" description="Facilities with healthy levels" />
                <StatCard label="Low Threshold" value={sum.low_count} icon={BatteryWarning} color="amber" description="Facilities reaching critical limits" />
                <StatCard label="Shortage Alerts" value={sum.critical_count} icon={AlertTriangle} color="red" description="Immediate distribution required" />
            </div>

            {/* Visual Analytics & Flow Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <InventoryFlow />

                {/* Dynamic Volumetric Matrix */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Blood Type Summary</div>
                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>STORAGE USED: {sum.total_units?.toLocaleString()} / {sum.total_capacity?.toLocaleString()} UNITS</div>
                    </div>

                    {[BLOOD_TYPES.slice(0, 4), BLOOD_TYPES.slice(4, 8)].map((row, rowIdx) => (
                        <div key={rowIdx} style={{ display: 'flex', gap: 16, width: '100%', minHeight: 140 }}>
                            {row.map(t => {
                                const units = groupTotals[t].units;
                                const capacity = groupTotals[t].capacity;
                                const ratio = capacity > 0 ? units / capacity : 0;

                                // Status-driven color logic
                                const isCritical = ratio < 0.3;
                                const isLow = ratio >= 0.3 && ratio < 0.6;
                                const isHealthy = ratio >= 0.6;

                                const color = isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e';
                                const backgroundWash = isCritical ? 'rgba(239, 68, 68, 0.08)' : isLow ? 'rgba(245, 158, 11, 0.08)' : 'rgba(34, 197, 94, 0.08)';
                                const flexWeight = Math.max(10, units);

                                return (
                                    <motion.div
                                        key={t}
                                        whileHover={{ y: -4, scale: 1.02, background: isCritical ? 'rgba(239,68,68,0.12)' : isLow ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)' }}
                                        style={{
                                            position: 'relative', overflow: 'hidden', padding: '24px 10px',
                                            background: backgroundWash,
                                            border: `1px solid ${color}33`,
                                            borderRadius: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12,
                                            flex: `${flexWeight} 1 0px`,
                                            boxShadow: isCritical ? '0 0 30px rgba(239,68,68,0.08)' : 'none',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minWidth: '120px'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            height: `${Math.min(100, ratio * 100)}%`,
                                            background: `linear-gradient(0deg, ${color}22, transparent)`,
                                            zIndex: 0, transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }} />

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{
                                                display: 'inline-flex', padding: '4px 10px', borderRadius: 8,
                                                background: `${color}15`, border: `1px solid ${color}33`,
                                                fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 800, color: color, marginBottom: 16
                                            }}>
                                                {t}
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                                                {units}
                                                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>/ {capacity}</span>
                                            </div>
                                        </div>

                                        <div style={{
                                            position: 'absolute', top: 12, right: 12, width: 3, height: 3, borderRadius: '50%',
                                            background: color, boxShadow: `0 0 8px ${color}`
                                        }} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Suite */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ position: 'relative' }}>
                    <MapPin size={16} color="#3b82f6" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                        value={cityFilter} onChange={e => { setCityFilter(e.target.value); setOffset(0); }}
                        style={{ ...iqStyle, paddingLeft: 44, border: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', minWidth: 200 }}
                    >
                        <option value="" style={{ background: '#0F0F17' }}>Showing All Cities</option>
                        {DISTRICTS.map(d => <option key={d} value={d} style={{ background: '#0F0F17' }}>{d}</option>)}
                    </select>
                </div>

                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by blood bank or area..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 52, background: 'transparent', border: 'none' }}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>
            </div>

            {/* Facility Registry */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SkeletonTable rows={5} />
                </div>
            ) : inventory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 32 }}>
                    <Archive size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: 20 }} />
                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>No Results Found</div>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 400, margin: '0 auto' }}>Try a different search or pick another city.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {inventory.map((b) => {
                            const isOpen = expandedIds.includes(b.bank_id);
                            const isCritBank = b.stock.some(s => s.stock_status === 'Critical');
                            const isLowBank = !isCritBank && b.stock.some(s => s.stock_status === 'Low');

                            return (
                                <motion.div
                                    key={b.bank_id}
                                    layout
                                    style={{
                                        background: isCritBank ? 'rgba(239, 68, 68, 0.04)' : isLowBank ? 'rgba(245, 158, 11, 0.04)' : '#0F0F17',
                                        border: `1px solid ${isCritBank ? 'rgba(239, 68, 68, 0.15)' : isLowBank ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)'}`,
                                        borderRadius: 28,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div onClick={() => toggleExpand(b.bank_id)} style={{ padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                                            <div style={{ width: 52, height: 52, borderRadius: 16, background: isCritBank ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isCritBank ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                                                <Package size={24} color={isCritBank ? '#ef4444' : 'rgba(255,255,255,0.3)'} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 19, color: '#fff', wordBreak: 'break-word' }}>{b.bank_name}</div>
                                                    <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', flexShrink: 0 }}>{b.city}</div>
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Storage Capacity: {b.stock?.reduce((acc, s) => acc + (s.capacity || 0), 0)} Units</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Total Stock</div>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 600, color: isCritBank ? '#ef4444' : '#fff' }}>
                                                    {b.total_units}
                                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}> / {b.stock?.reduce((acc, s) => acc + (s.capacity || 0), 0)} Units</span>
                                                </div>
                                            </div>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isOpen ? <ChevronUp size={18} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={18} color="rgba(255,255,255,0.3)" />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div style={{ padding: '0 32px 32px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 100px 100px 140px 120px', gap: 24, padding: '24px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {['Blood Type', 'Stock Level', 'Units', 'Max Limit', 'Last Updated', 'Status'].map(h => <div key={h} style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{h}</div>)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {BLOOD_TYPES.map(grp => {
                                                            const st = b.stock.find(s => s.blood_group === grp) || { blood_group: grp, available_units: 0, capacity: 50, percentage: 0, stock_status: 'Critical' };
                                                            const pct = Math.min(100, st.capacity > 0 ? Math.round((st.available_units / st.capacity) * 100) : 0);
                                                            const stColor = st.stock_status === 'Critical' ? '#ef4444' : st.stock_status === 'Low' ? '#f59e0b' : '#22c55e';

                                                            return (
                                                                <div key={grp} style={{ display: 'grid', gridTemplateColumns: '120px 1.5fr 100px 100px 140px 120px', gap: 24, alignItems: 'center', padding: '16px 8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                        <div style={{ width: 4, height: 16, background: stColor, borderRadius: 2 }} />
                                                                        <BloodGroupBadge group={st.blood_group} size="sm" />
                                                                    </div>

                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingRight: 40 }}>
                                                                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: '100%', background: stColor, borderRadius: 3 }} transition={{ duration: 1, ease: 'easeOut' }} />
                                                                        </div>
                                                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.2)', width: 30, textAlign: 'right' }}>{pct}%</div>
                                                                    </div>

                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 17, color: st.available_units < 5 ? '#ef4444' : '#fff' }}>{st.available_units}</div>
                                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>{st.capacity}</div>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{st.updated_at ? formatDate(st.updated_at, true) : 'No info'}</div>
                                                                    <div><StatusBadge status={st.stock_status} size="sm" /></div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <Pagination
                            total={resp?.total || 0}
                            limit={limit}
                            offset={offset}
                            onChange={setOffset}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
