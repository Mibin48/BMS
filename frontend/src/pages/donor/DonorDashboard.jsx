import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Sector
} from 'recharts';
import { Droplets, HeartHandshake, Activity, Award,
    Calendar, CheckCircle, AlertCircle, Clock, XCircle, Building2, MapPin,
    Shield, Star, Zap, Flame, Feather, Heart, Check, ChevronDown
} from 'lucide-react';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';
import { donorService } from '../../services/donorService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonCard, SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatML, timeAgo } from '../../utils/formatters.js';
import { useNotifications } from '../../context/NotificationContext.jsx';

/* ─── Helpers ─────────────────────────────────────────────── */
function fmt(dateStr, { short } = {}) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return short
        ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ─── Stat Card ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, children, delay = 0 }) {
    const [count, setCount] = useState(0);
    const numVal = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const suffix = String(value).replace(/[0-9.]/g, '');

    useEffect(() => {
        if (numVal === 0) { setCount(0); return; }
        let start = 0;
        const step = numVal / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= numVal) { setCount(numVal); clearInterval(timer); }
            else setCount(start);
        }, 37);
        return () => clearInterval(timer);
    }, [numVal]);

    const display = Number.isInteger(numVal)
        ? Math.round(count) + suffix
        : count.toFixed(2) + suffix;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, borderColor: 'rgba(217,0,37,0.3)' }}
            style={{
                background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 24, transition: 'all 0.2s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color="var(--red)" />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    {label}
                </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
                {display}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{sub}</div>
            {children}
        </motion.div>
    );
}

/* ─── Custom bar tooltip ──────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const value = payload[0].value;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
                background: 'rgba(15, 15, 23, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(217, 0, 37, 0.4)', 
                borderRadius: 12, 
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
        >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                {label} {new Date().getFullYear()}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, color: '#fff', lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>ML</div>
            </div>
            <div style={{ marginTop: 8, height: 2, background: 'rgba(217,0,37,0.1)', borderRadius: 1 }}>
                <div style={{ height: '100%', width: `${Math.min((value / 500) * 100, 100)}%`, background: 'var(--red)' }} />
            </div>
        </motion.div>
    );
}

/* ─── Eligibility Status helpers ──────────────────────────── */
const statusColor = { 'Eligible': '#00E699', 'Cooling': '#FFB347', 'Deferred': '#D90025' };
const statusIcon = { 'Eligible': CheckCircle, 'Cooling': Clock, 'Deferred': XCircle };
const statusLabel = { 'Eligible': 'Eligible', 'Cooling': 'Cooling Period', 'Deferred': 'Deferred' };

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function DonorDashboard() {
    const navigate = useNavigate();
    const { user, showExpiryModal } = useAuth();
    const { socket } = useNotifications();

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedBadge, setSelectedBadge] = useState(null);

    // ── All API calls ────────────────────────────────
    const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useFetch(donorService.getProfile);
    const { data: stats, loading: statsLoading, refetch: refetchStats } = useFetch(donorService.getStats, { year: selectedYear }, [selectedYear]);
    const { data: eligibility, loading: eligLoading, refetch: refetchElig } = useFetch(donorService.getEligibility);
    const { data: donationsData, loading: donationsLoading, refetch: refetchDonations } = useFetch(donorService.getDonations, { limit: 5 });
    const { data: banksData, loading: banksLoading, refetch: refetchBanks } = useFetch(donorService.getBloodBanks);

    useEffect(() => {
        if (!socket) return;
        const handleNotif = () => {
            refetchProfile();
            refetchStats();
            refetchElig();
            refetchDonations();
            refetchBanks();
        };
        socket.on('notification', handleNotif);
        return () => socket.off('notification', handleNotif);
    }, [socket, refetchProfile, refetchStats, refetchElig, refetchDonations, refetchBanks]);

    const firstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Donor';
    const chartData = stats?.monthly_chart || [];
    const recentDonations = donationsData?.donations || [];
    const totalMl = profile?.total_ml || 0;
    const memberYear = profile?.member_since ? new Date(profile.member_since).getFullYear() : '--';
    const banks = banksData?.banks?.slice(0, 3) || [];

    // Greeting based on time of day
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Eligibility display
    const eligStatus = eligibility?.status || 'Loading...';
    const eligColor = statusColor[eligStatus] || '#9B9BA4';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* ── Error State ─── */}
                {profileError && !showExpiryModal && (
                    <ErrorCard message={profileError} onRetry={refetchProfile} />
                )}

                {/* ── ROW 1 Welcome Banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg,#0F0F17 0%,#1A0A0F 100%)',
                        border: '1px solid rgba(217,0,37,0.2)',
                        borderRadius: 20, padding: '32px 40px',
                        position: 'relative', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                >
                    <div style={{
                        position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
                        fontFamily: 'var(--font-display)', fontSize: 200, color: 'rgba(217,0,37,0.06)',
                        lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                    }}>
                        {profile?.blood_group || '--'}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
                            ◈ WELCOME BACK
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1, marginBottom: 12 }}>
                            {greeting}, {firstName}.
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-body)', fontSize: 15,
                            color: eligColor,
                        }}>
                            {eligStatus === 'Eligible' && '🟢 You are eligible to donate today!'}
                            {eligStatus === 'Cooling' && `🟡 ${eligibility?.days_remaining || '--'} days until eligible`}
                            {eligStatus === 'Deferred' && '🔴 Currently deferred from donating'}
                            {!['Eligible', 'Cooling', 'Deferred'].includes(eligStatus) && 'Loading eligibility...'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, position: 'relative' }}>
                        <button
                            onClick={() => navigate('/donor/schedule')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer',
                                padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                                fontFamily: 'var(--font-body)',
                                boxShadow: '0 4px 20px rgba(217,0,37,0.4)', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(217,0,37,0.55)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(217,0,37,0.4)'}
                        >
                            <Calendar size={16} /> Schedule Now
                        </button>
                    </div>
                </motion.div>

                {/* ── ROW 2 KPI Cards ── */}
                {profileLoading ? (
                    <SkeletonStats count={4} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                        <StatCard icon={Droplets} label="Total Donations" value={`${profile?.total_donations ?? 0}`} sub={`Since ${memberYear}`} delay={0.05}>
                            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e' }}>Each donation counts</div>
                        </StatCard>
                        <StatCard icon={HeartHandshake} label="Lives Impacted" value={`${profile?.lives_saved ?? 0}`} sub="Each donation saves 3 lives" delay={0.1}>
                            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Est. calculation</div>
                        </StatCard>
                        <StatCard icon={Activity} label="Blood Donated" value={totalMl >= 1000 ? `${(totalMl / 1000).toFixed(2)}L` : `${totalMl}ml`} sub="Total millilitres" delay={0.15}>
                            <div style={{ marginTop: 10 }}>
                                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min((totalMl / 5000) * 100, 100)}%`, background: 'var(--red)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>
                                    {totalMl} / 5,000 ml to next badge
                                </div>
                            </div>
                        </StatCard>
                        <StatCard icon={Award} label="Member Since" value={`${memberYear}`} sub={`${new Date().getFullYear() - (typeof memberYear === 'number' ? memberYear : new Date().getFullYear())} years active`} delay={0.2}>
                            <div style={{ marginTop: 10, display: 'inline-block', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#f59e0b', letterSpacing: '0.08em' }}>
                                {(profile?.total_donations ?? 0) >= 10 ? 'GOLD DONOR' : (profile?.total_donations ?? 0) >= 5 ? 'SILVER DONOR' : 'BRONZE DONOR'}
                            </div>
                        </StatCard>
                    </div>
                )}

                {/* ── ROW Badges — Premium Trophy Case Redesign ── */}
                {!statsLoading && stats?.badges?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 }}
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(217,0,37,0.04) 0%, rgba(15,15,23,0) 100%)', 
                            border: '1px solid rgba(217,0,37,0.15)', 
                            borderRadius: 24, 
                            padding: 32, 
                            margin: '16px 0',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative background glow */}
                        <div style={{ 
                            position: 'absolute', top: -80, right: -80, width: 250, height: 250, 
                            background: 'radial-gradient(circle, rgba(217,0,37,0.08) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, position: 'relative' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>MILESTONES</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Donor Trophy Case</div>
                            </div>
                            <div style={{ 
                                background: 'rgba(217,0,37,0.1)', 
                                padding: '6px 14px', 
                                borderRadius: 100, 
                                border: '1px solid rgba(217,0,37,0.12)',
                                fontFamily: 'var(--font-mono)', 
                                fontSize: 11, 
                                color: 'var(--red)', 
                                fontWeight: 700 
                            }}>
                                {stats.badges.length} UNLOCKED
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            gap: 20, 
                            overflowX: 'auto', 
                            paddingBottom: 12, 
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {stats.badges.map((badge) => {
                                const IconMap = { Award, Shield, Star, Zap, Flame, Feather, Heart };
                                const BadgeIcon = IconMap[badge.icon] || Award;
                                
                                // Precise color mapping based on backend badge definitions
                                const accentColor = badge.color.includes('orange') ? '#FB923C' : 
                                               badge.color.includes('slate') ? '#CBD5E1' :
                                               badge.color.includes('yellow') ? '#FACC15' :
                                               badge.color.includes('cyan') ? '#22D3EE' :
                                               badge.color.includes('rose') ? '#FB7185' :
                                               badge.color.includes('emerald') ? '#34D399' :
                                               badge.color.includes('purple') ? '#C084FC' : '#D90025';

                                return (
                                    <motion.div
                                        key={badge.id}
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        onClick={() => setSelectedBadge(badge)}
                                        style={{
                                            flex: '0 0 auto',
                                            minWidth: 190, 
                                            padding: '28px 24px', 
                                            borderRadius: 24,
                                            background: 'rgba(255,255,255,0.02)', 
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            textAlign: 'center', 
                                            gap: 12, 
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ 
                                            width: 56, height: 56, borderRadius: '50%', 
                                            background: 'rgba(255,255,255,0.04)', 
                                            border: `1px solid ${accentColor}40`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            marginBottom: 8,
                                            position: 'relative',
                                            boxShadow: `0 0 20px ${accentColor}10`
                                        }}>
                                            <BadgeIcon size={26} style={{ color: accentColor }} />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>{badge.name}</div>
                                            <div style={{ 
                                                fontFamily: 'var(--font-body)', 
                                                fontSize: 12, 
                                                color: 'var(--text3)', 
                                                lineHeight: 1.5,
                                                maxWidth: 160,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {badge.desc}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}


                {/* ── ROW 3 Chart + Next Eligible ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                    {/* Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                        style={{ 
                            background: '#0F0F17', 
                            border: '1px solid rgba(255,255,255,0.06)', 
                            borderRadius: 24, 
                            padding: 32,
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <div style={{ 
                            position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
                            background: 'radial-gradient(circle at 100% 0%, rgba(217,0,37,0.05) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, position: 'relative' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <Activity size={16} color="var(--red)" />
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Donation History</div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>Monthly blood contribution frequency</div>
                            </div>
                            <div style={{ 
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        style={{ 
                                            background: 'var(--bg2)', 
                                            color: '#fff', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: 10, 
                                            padding: '6px 32px 6px 14px',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = 'var(--red)';
                                            e.target.style.boxShadow = '0 0 12px var(--red-glow)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'var(--border)';
                                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                                        }}
                                    >
                                        {[...new Set([new Date().getFullYear(), ...(stats?.by_year?.map(y => y.year) || [])])].sort((a,b) => b-a).map(year => (
                                            <option key={year} value={year} style={{ background: '#0F0F17' }}>{year}</option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }}>
                                        <ChevronDown size={12} color="var(--red)" />
                                    </div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>
                                    SERIES
                                </div>
                            </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>
                                    All units in ml
                                </div>
                            </div>
                        </div>

                        {statsLoading ? (
                            <SkeletonCard />
                        ) : chartData.length > 0 ? (
                            <div style={{ position: 'relative', minHeight: 240, margin: '24px 0' }}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#D90025" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#D90025" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#D90025" stopOpacity={0.15} />
                                                <stop offset="100%" stopColor="#D90025" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month" 
                                            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} 
                                            axisLine={false} 
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis 
                                            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} 
                                            axisLine={false} 
                                            tickLine={false} 
                                        />
                                        <Tooltip 
                                            content={<ChartTooltip />} 
                                            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} 
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="ml" 
                                            fill="url(#glowGradient)" 
                                            stroke="none" 
                                            isAnimationActive 
                                        />
                                        <Bar 
                                            dataKey="ml" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={24}
                                            isAnimationActive 
                                            animationDuration={1000}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill="url(#barGradient)" 
                                                    style={{ filter: entry.ml > 0 ? 'drop-shadow(0 0 8px rgba(217,0,37,0.3))' : 'none' }}
                                                />
                                            ))}
                                        </Bar>
                                    </ComposedChart>
                                </ResponsiveContainer>
                                {chartData.every(m => m.ml === 0) && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(15, 15, 23, 0.6)',
                                            backdropFilter: 'blur(4px)',
                                            borderRadius: 16,
                                            border: '1px solid rgba(255,255,255,0.03)',
                                            zIndex: 10
                                        }}
                                    >
                                        <div style={{ textAlign: 'center', maxWidth: 280, padding: 20 }}>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>
                                                No activity in {selectedYear}
                                            </div>
                                            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)', fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
                                                {selectedYear === new Date().getFullYear() 
                                                    ? "Your contribution journey for this year hasn't started yet. Ready to make an impact?" 
                                                    : `No donation records found for the historical series of ${selectedYear}.`}
                                            </p>
                                            {selectedYear === new Date().getFullYear() && (
                                                <button 
                                                    onClick={() => navigate('/donor/schedule')}
                                                    style={{ 
                                                        background: 'var(--red)', color: '#fff', border: 'none', 
                                                        padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                                        cursor: 'pointer', fontFamily: 'var(--font-sub)',
                                                        boxShadow: '0 4px 12px rgba(217,0,37,0.3)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    Schedule Donation
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 16 }}>
                                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)', fontSize: 14 }}>
                                    Data initialization in progress...
                                </p>
                            </div>
                        )}

                        {/* Summary Stats below Chart */}
                        <div style={{ 
                            marginTop: 'auto', 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: 16, 
                            paddingTop: 32, 
                            borderTop: '1px solid rgba(255,255,255,0.06)' 
                        }}>
                            {[
                                { 
                                    label: `${selectedYear} Total Contributions`, 
                                    val: `${stats?.yearly_summary?.total_donations ?? 0}`,
                                    sub: 'Donations',
                                    icon: Droplets
                                },
                                { 
                                    label: `${selectedYear} Total Volume`, 
                                    val: stats?.yearly_summary?.total_ml ? (stats.yearly_summary.total_ml >= 1000 ? `${(stats.yearly_summary.total_ml / 1000).toFixed(1)}` : `${stats.yearly_summary.total_ml}`) : '0',
                                    sub: (stats?.yearly_summary?.total_ml >= 1000) ? 'Liters' : 'Milliliters',
                                    icon: Activity
                                },
                                { 
                                    label: `${selectedYear} Average / Session`, 
                                    val: stats?.yearly_summary?.average_ml ?? 0,
                                    sub: 'ML / donation',
                                    icon: Zap
                                },
                            ].map(({ label, val, sub, icon: Icon }) => (
                                <motion.div 
                                    key={label}
                                    whileHover={{ y: -4, background: 'rgba(255,255,255,0.04)' }}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        padding: '18px 24px', 
                                        borderRadius: 20,
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{label}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                        <div style={{ fontFamily: 'var(--font-head)', fontSize: 36, color: '#fff', lineHeight: 1 }}>{val}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{sub}</div>
                                    </div>
                                    <Icon size={16} color="var(--red)" style={{ position: 'absolute', top: 18, right: 18, opacity: 0.3 }} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Next Eligible Card — Premium HEM∆ Redesign */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(15,15,23,0.8), rgba(20,10,15,0.9))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: `0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                            borderRadius: 24, 
                            padding: 32, 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                        {/* Status-driven background glow — Optimized to be subtle */}
                        <div style={{ 
                            position: 'absolute', top: '-20%', right: '-20%', width: '140%', height: '140%',
                            background: `radial-gradient(circle at 100% 0%, ${eligColor}10 0%, transparent 60%)`,
                            pointerEvents: 'none',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>NEXT DONATION</div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 22, color: '#fff' }}>Eligibility Status</div>
                                </div>
                                {eligStatus === 'Eligible' && (
                                    <motion.div 
                                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                                        style={{ width: 8, height: 8, borderRadius: '50%', background: eligColor, boxShadow: `0 0 10px ${eligColor}` }} 
                                    />
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, marginBottom: 32 }}>
                                <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Multiple Outer Rings for depth */}
                                    <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: `1px solid rgba(255,255,255,0.02)` }} />
                                    <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: `radial-gradient(circle, transparent 60%, ${eligColor}05 100%)` }} />
                                    
                                    {/* Inner Glowing Core */}
                                    <motion.div 
                                        animate={eligStatus === 'Eligible' ? { scale: [1, 1.05, 1], boxShadow: [`inset 0 0 20px ${eligColor}20, 0 10px 30px rgba(0,0,0,0.5), 0 0 40px ${eligColor}30`, `inset 0 0 30px ${eligColor}40, 0 10px 40px rgba(0,0,0,0.6), 0 0 80px ${eligColor}60`, `inset 0 0 20px ${eligColor}20, 0 10px 30px rgba(0,0,0,0.5), 0 0 40px ${eligColor}30`] } : {}}
                                        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                                        style={{
                                            width: 160, height: 160, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${eligColor}1A, rgba(0,0,0,0.5))`,
                                            backdropFilter: 'blur(10px)',
                                            border: `1px solid ${eligColor}40`,
                                            boxShadow: `inset 0 0 20px ${eligColor}20, 0 10px 30px rgba(0,0,0,0.5)`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative', zIndex: 2
                                        }}
                                    >
                                        {eligStatus === 'Eligible' ? (
                                            <>
                                                <motion.div 
                                                    animate={{ opacity: [0.8, 1, 0.8], textShadow: [`0 0 20px ${eligColor}60`, `0 0 50px ${eligColor}`, `0 0 20px ${eligColor}60`] }}
                                                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                                                    style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: '#fff', lineHeight: 1 }}
                                                >
                                                    NOW
                                                </motion.div>
                                                <div style={{ 
                                                    fontFamily: 'var(--font-mono)', fontSize: 11, color: eligColor, 
                                                    textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.15em', fontWeight: 600,
                                                }}>
                                                    READY
                                                </div>
                                            </>
                                        ) : eligStatus === 'Cooling' ? (
                                            <>
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: '#fff', lineHeight: 1 }}>{eligibility?.days_remaining ?? '--'}</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: eligColor, textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.1em' }}>DAYS LEFT</div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={52} color={eligColor} style={{ opacity: 0.9 }} />
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: eligColor, textTransform: 'uppercase', marginTop: 8, letterSpacing: '0.1em' }}>DEFERRED</div>
                                            </>
                                        )}
                                    </motion.div>

                                    {/* Orbital Dash Ring */}
                                    {eligStatus === 'Eligible' && (
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                            style={{ 
                                                position: 'absolute', inset: 0, 
                                                border: `2px dashed ${eligColor}30`, 
                                                borderRadius: '50%',
                                                maskImage: 'linear-gradient(transparent, black 20%, black 80%, transparent)',
                                                WebkitMaskImage: 'linear-gradient(transparent, black 20%, black 80%, transparent)'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: 10, 
                                    padding: '8px 20px', borderRadius: 100, 
                                    background: `linear-gradient(180deg, ${eligColor}15, transparent)`, 
                                    border: `1px solid ${eligColor}30`,
                                    boxShadow: `0 4px 12px ${eligColor}10`,
                                    marginBottom: 20
                                }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: eligColor, boxShadow: `0 0 10px ${eligColor}` }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{statusLabel[eligStatus] || eligStatus}</span>
                                </div>
                                
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                                    {eligStatus === 'Eligible' && 'You have reached peak eligibility. Your contribution can save up to 3 lives today.'}
                                    {eligStatus === 'Cooling' && `You are currently in the recovery phase. Eligibility resets on ${eligibility?.next_eligible_date ? formatDate(eligibility.next_eligible_date) : '--'}.`}
                                    {eligStatus === 'Deferred' && 'A temporary deferral is active based on your latest health check. Consult medical staff for guidance.'}
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2, boxShadow: eligStatus === 'Eligible' ? '0 12px 30px rgba(217,0,37,0.4)' : 'none' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/donor/schedule')}
                                style={{
                                    width: '100%', 
                                    background: eligStatus === 'Eligible' ? 'linear-gradient(90deg, #D90025, #FF3355)' : 'rgba(255,255,255,0.05)', 
                                    color: eligStatus === 'Eligible' ? '#fff' : 'var(--text3)',
                                    border: eligStatus === 'Eligible' ? 'none' : '1px solid rgba(255,255,255,0.1)', 
                                    cursor: 'pointer', padding: '16px 0',
                                    borderRadius: 14, fontFamily: 'var(--font-sub)', fontSize: 15,
                                    fontWeight: 700, marginTop: 40, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: eligStatus === 'Eligible' ? '0 8px 24px rgba(217,0,37,0.25)' : 'none',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {eligStatus === 'Eligible' ? 'Schedule Donation →' : 'View Full Protocol'}
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* ── ROW 4 Recent Donations + Health Summary ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Recent Donations */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Recent Donations</div>
                            <button onClick={() => navigate('/donor/donations')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>
                                View All →
                            </button>
                        </div>
                        {donationsLoading ? (
                            <SkeletonTable rows={3} cols={4} />
                        ) : recentDonations.length === 0 ? (
                            <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20 }}>
                                <div style={{ width: 64, height: 64, background: 'rgba(217,0,37,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Heart size={24} color="var(--red)" style={{ opacity: 0.4 }} />
                                </div>
                                <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>
                                    Your donation journey hasn't started yet. Visit a facility to make your first impact.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recentDonations.map((d, i) => (
                                    <motion.div 
                                        key={d.donation_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(217,0,37,0.2)', x: 4 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 20px', background: 'rgba(255,255,255,0.01)',
                                            border: '1px solid var(--border)', borderRadius: 16, transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                            {/* Date Block */}
                                            <div style={{ 
                                                background: 'var(--bg2)', padding: '8px 12px', borderRadius: 12, 
                                                textAlign: 'center', minWidth: 64, border: '1px solid var(--border)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                            }}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase' }}>
                                                    {new Date(d.donation_date).toLocaleDateString('en-IN', { month: 'short' })}
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, color: '#fff', lineHeight: 1 }}>
                                                    {new Date(d.donation_date).getDate()}
                                                </div>
                                            </div>

                                            {/* Info Block */}
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>
                                                    {d.bank_name}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>
                                                        <MapPin size={11} /> {d.bank_city || 'Kerala'}
                                                    </div>
                                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>
                                                        VERIFIED
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 2 }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{d.quantity_ml}</span>
                                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)' }}>ML</span>
                                                </div>
                                                <div style={{ 
                                                    display: 'inline-block', background: 'rgba(217,0,37,0.1)', 
                                                    border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, 
                                                    padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, 
                                                    color: 'var(--red)', fontWeight: 800 
                                                }}>
                                                    {profile?.blood_group || d.blood_group || '--'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) }
                    </motion.div>

                    {/* Health Summary */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Last Health Check</div>
                            <button onClick={() => navigate('/donor/health-check')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>
                                View History →
                            </button>
                        </div>
                        {eligLoading ? (
                            <SkeletonCard />
                        ) : eligibility?.last_check ? (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>CHECK DATE</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{formatDate(eligibility.last_check.check_date)}</div>
                                        <EligibilityBadge status={eligibility.last_check.eligibility_status} small />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[
                                        { label: 'WEIGHT', value: eligibility.last_check.weight, unit: 'kg', ok: eligibility.last_check.weight >= 50 },
                                        { label: 'HEMOGLOBIN', value: eligibility.last_check.hemoglobin, unit: 'g/dL', ok: eligibility.last_check.hemoglobin >= 12.5 },
                                        { label: 'ELIGIBILITY', value: eligibility.last_check.eligibility_status, unit: '', ok: eligibility.last_check.eligibility_status === 'Eligible' },
                                        { label: 'LAST DONATION', value: eligibility.last_donation?.donation_date ? formatDate(eligibility.last_donation.donation_date) : 'Never', unit: '', ok: true },
                                    ].map(({ label, value, unit, ok }) => (
                                        <div key={label} style={{ background: '#0A0A12', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: 'space-between' }}>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff' }}>{value ?? '--'}</span>
                                                    {unit && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{unit}</span>}
                                                </div>
                                                {ok ? <CheckCircle size={14} color="#22c55e" /> : <AlertCircle size={14} color="#f59e0b" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={Activity}
                                title="No health checks"
                                subtitle="Your health screening records will appear here after your first check"
                            />
                        )}
                        <button
                            onClick={() => navigate('/donor/health-check')}
                            style={{
                                width: '100%', marginTop: 16, background: 'none',
                                border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text2)',
                                cursor: 'pointer', padding: '11px 0', borderRadius: 10,
                                fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text2)'; }}
                        >
                            Schedule Check-up
                        </button>
                    </motion.div>
                </div>

                {/* ── ROW 5 Nearby Blood Banks ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 6 }}>Nearby Blood Banks</div>
                            <span style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{profile?.city || 'Kerala'}</span>
                        </div>
                        <button onClick={() => navigate('/donor/find-bank')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>View All →</button>
                    </div>
                    {banksLoading ? (
                        <SkeletonTable rows={3} cols={3} />
                    ) : banks.length === 0 ? (
                        <EmptyState icon={Building2} title="No blood banks found" subtitle="Blood banks in your area will appear here" />
                    ) : (
                        banks.map((bank, i) => (
                            <div key={bank.bank_id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 0', borderBottom: i < banks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={16} color="var(--red)" />
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{bank.bank_name}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{bank.city}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                    <span style={{
                                        background: bank.open ? 'rgba(34,197,94,0.1)' : 'rgba(217,0,37,0.1)',
                                        border: `1px solid ${bank.open ? 'rgba(34,197,94,0.25)' : 'rgba(217,0,37,0.25)'}`,
                                        borderRadius: 100, padding: '2px 8px',
                                        fontFamily: 'var(--font-mono)', fontSize: 9,
                                        color: bank.open ? '#22c55e' : 'var(--red)',
                                    }}>{bank.open ? 'OPEN' : 'CLOSED'}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                                        {bank.total_units} units
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            
            {/* ── Badge Detail Modal — Cinematic Experience ── */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, 
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, padding: 24
                        }}
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: 460,
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 32,
                                padding: '48px 40px',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Status-driven background glow */}
                            {(() => {
                                const IconMap = { Award, Shield, Star, Zap, Flame, Feather, Heart };
                                const BadgeIcon = IconMap[selectedBadge.icon] || Award;
                                const accentColor = selectedBadge.color.includes('orange') ? '#FB923C' : 
                                               selectedBadge.color.includes('slate') ? '#CBD5E1' :
                                               selectedBadge.color.includes('yellow') ? '#FACC15' :
                                               selectedBadge.color.includes('cyan') ? '#22D3EE' :
                                               selectedBadge.color.includes('rose') ? '#FB7185' :
                                               selectedBadge.color.includes('emerald') ? '#34D399' :
                                               selectedBadge.color.includes('purple') ? '#C084FC' : '#D90025';

                                return (
                                    <>
                                        <div style={{ 
                                            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
                                            width: 300, height: 300, 
                                            background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
                                            pointerEvents: 'none'
                                        }} />

                                        <button 
                                            onClick={() => setSelectedBadge(null)}
                                            style={{ 
                                                position: 'absolute', top: 24, right: 24, 
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                                width: 40, height: 40, borderRadius: '50%', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                color: 'var(--text3)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text3)'; }}
                                        >
                                            <XCircle size={20} />
                                        </button>

                                        <motion.div 
                                            initial={{ rotateY: 180 }}
                                            animate={{ rotateY: 0 }}
                                            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                                            style={{ 
                                                width: 100, height: 100, borderRadius: '50%', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                border: `2px solid ${accentColor}50`,
                                                margin: '0 auto 32px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 0 40px ${accentColor}20`
                                            }}
                                        >
                                            <BadgeIcon size={48} style={{ color: accentColor }} />
                                        </motion.div>

                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 12 }}>
                                            UNLOCKED MILESTONE
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-head)', fontSize: 36, color: '#fff', marginBottom: 16 }}>
                                            {selectedBadge.name}
                                        </div>
                                        <div style={{ 
                                            fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text2)', 
                                            lineHeight: 1.6, marginBottom: 40, padding: '0 20px'
                                        }}>
                                            {selectedBadge.desc}
                                        </div>

                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button 
                                                style={{ 
                                                    flex: 1, 
                                                    background: 'rgba(255,255,255,0.05)', 
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    padding: '16px', borderRadius: 16,
                                                    fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff',
                                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                                    textTransform: 'uppercase', letterSpacing: '0.08em'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onClick={() => setSelectedBadge(null)}
                                            >
                                                Keep Exploring
                                            </button>
                                            <button 
                                                style={{ 
                                                    flex: 1, 
                                                    background: accentColor, 
                                                    border: 'none',
                                                    padding: '16px', borderRadius: 16,
                                                    fontFamily: 'var(--font-mono)', fontSize: 12, color: '#000',
                                                    fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s',
                                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                                    boxShadow: `0 8px 16px ${accentColor}40`
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                            >
                                                Share Achievement
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
