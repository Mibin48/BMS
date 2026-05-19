import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, Download, ChevronDown, Droplet, Users, HeartHandshake, Database, Activity, ClipboardCheck, Archive } from 'lucide-react';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../../hooks/useDebounce';

function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ color: '#9B9BA4' }}>{p.name}:</span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
}

function initials(n) {
    if (!n) return '';
    return n.split(' ').slice(0, 2).map(w => w[0]).join('');
}

export default function AdminDonations() {
    const { showExpiryModal } = useAuth();
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading } = useFetch(
        adminService.getAllDonations,
        { search: debouncedSearch, limit, offset },
        [debouncedSearch, offset]
    );
    const { data: trendsResp } = useFetch(adminService.getTrends, '6m');

    const donations = resp?.donations || [];
    const sum = resp?.summary || { total: 0, total_ml: 0, unique_donors: 0 };
    const chartData = (trendsResp?.trends || []).map(d => ({ month: d.label, donations: d.donations }));

    const iqStyle = {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
            <SectionHeader
                title="Donation Records"
                subtitle="Keep track of all blood donations happening across Kerala."
                action={<div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(217,0,37,0.1)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(217,0,37,0.2)' }}>
                    <Droplet size={14} color="#D90025" />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, color: '#D90025', textTransform: 'uppercase' }}>Live Updates</span>
                </div>}
            />

            {/* Top Metrics */}
            {loading ? (
                <SkeletonStats count={4} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                    <StatCard label="Total Donations" value={(sum.total ?? 0).toLocaleString()} icon={HeartHandshake} color="red" description="Total donor visits" />
                    <StatCard label="Total Volume" value={`${(Number(sum.total_ml) || 0).toLocaleString()} ml`} icon={Droplet} color="green" description="Amount of blood collected" />
                    <StatCard label="Total Donors" value={(Number(sum.unique_donors) ?? 0).toLocaleString()} icon={Users} color="blue" description="How many donors we have" />
                    <StatCard label="Average Donation Size" value={sum.total > 0 ? `${Math.round((Number(sum.total_ml) || 0) / sum.total)} ml` : '0ml'} icon={Database} color="purple" description="Average blood given" />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
                {/* Visual Trends */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, padding: 32, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(217,0,37,0.02))', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={22} color="#D90025" /></div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, color: '#fff' }}>Donation Trends</div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Monthly contribution volume tracking</div>
                        </div>
                    </div>

                    <div style={{ height: 260, marginTop: 16 }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={40}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-space)', fontSize: 10, fill: '#9B9BA4' }} axisLine={false} tickLine={false} dy={12} />
                                    <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="donations" name="Donations" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ef4444' : 'rgba(217,0,37,0.4)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>
                                Getting the latest chart data...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by donor name, ID, or blood bank..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 52, background: 'transparent', border: 'none' }}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    <Download size={16} /> Download List
                </button>
            </div>

            {/* Record List */}
            <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Past Donations</div>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resp?.total || 0} RESULTS FOUND</div>
                </div>

                {loading ? (
                    <div style={{ padding: 32 }}><SkeletonTable rows={10} cols={6} /></div>
                ) : donations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)' }}>
                        <Archive size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>No Results Found</div>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 400, margin: '0 auto' }}>Try a different search to find a donation record.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px 32px' }}>
                        {/* Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '120px 2.2fr 100px 100px 1.8fr 120px 40px', gap: 24,
                            padding: '24px 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800
                        }}>
                            {['ID', 'Donor', 'Blood Type', 'Amount', 'Blood Bank', 'Health Check', ''].map(h => <div key={h}>{h}</div>)}
                        </div>

                        {/* Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {donations.map((d, i) => {
                                const isOpen = expanded === d.donation_id;
                                return (
                                    <div key={d.donation_id}>
                                        <div
                                            onClick={() => setExpanded(isOpen ? null : d.donation_id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '120px 2.2fr 100px 100px 1.8fr 120px 40px', gap: 24, alignItems: 'center',
                                                padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${isOpen ? 'rgba(217,0,37,0.2)' : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                            }}
                                        >
                                            {isOpen && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: '#D90025', borderRadius: '0 4px 4px 0' }} />}

                                            <div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#fff' }}>#{d.donation_id?.split('-').pop()?.substring(0, 6).toUpperCase()}</div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{formatDate(d.donation_date)}</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontSize: 12, fontWeight: 700, color: '#D90025', flexShrink: 0 }}>
                                                    {initials(d.donor_name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.donor_name}</div>
                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Donor ID: {d.donor_id?.split('-').pop()?.substring(0, 6)}</div>
                                                </div>
                                            </div>

                                            <div><BloodGroupBadge group={d.blood_group} size="sm" /></div>

                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{d.quantity_ml}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>ml</div>
                                            </div>

                                            <div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.bank_name}</div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{d.bank_city}</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#10b981', fontWeight: 700 }}>Pass</div>
                                            </div>

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
                                                        padding: '24px 32px', margin: '8px 16px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 48,
                                                        borderLeft: '4px solid #D90025'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Donor Details</div>
                                                            <div style={{ display: 'flex', gap: 12 }}>
                                                                <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-dm)', fontSize: 12, color: '#fff' }}>Age: {d.donor_age}Y</div>
                                                                <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-dm)', fontSize: 12, color: '#fff' }}>Gender: {d.donor_gender}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Medical Check</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <ClipboardCheck size={16} color="#10b981" />
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>Check ID: {d.check_id?.split('-').pop()?.toUpperCase()}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                                                            <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }}>Download Receipt</button>
                                                            <button style={{ background: '#D90025', border: '1px solid #D90025', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s' }}>More Details</button>
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
