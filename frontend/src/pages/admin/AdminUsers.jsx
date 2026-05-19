import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, Filter, ShieldCheck, ShieldAlert,
    Activity, Globe, User, Building2, Droplets, Zap,
    MoreHorizontal, Key, Mail, Shield, Trash2, Ban,
    ArrowUpRight, Target, Network, ChevronDown, ChevronUp, Phone, MapPin
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import BloodGroupBadge from '../../components/BloodGroupBadge';

/* ─── Modern Stat Component ─────────────────────────────────── */
function IdentityStat({ label, value, sub, description, icon: Icon, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}33` }}>
                    <Icon size={20} color={color} />
                </div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            </div>
            <div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{description || sub}</div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}44, transparent)` }} />
        </motion.div>
    );
}

export default function AdminUsers() {
    const { showExpiryModal } = useAuth();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [offset, setOffset] = useState(0);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error, refetch } = useFetch(
        adminService.getUsers,
        { search: debouncedSearch, role: roleFilter, limit, offset },
        [debouncedSearch, roleFilter, offset]
    );

    const suspendApi = useApi(adminService.suspendUser, { onSuccess: () => { toast.success('User access blocked'); refetch(); } });
    const activateApi = useApi(adminService.activateUser, { onSuccess: () => { toast.success('User access unblocked'); refetch(); } });

    const toggleExpand = (id) => setExpandedUserId(prev => prev === id ? null : id);

    const users = resp?.users || [];
    const summary = resp?.summary || {};
    const scale = summary.system_scale || { donors: 0, hospitals: 0, banks: 0 };
    const distribution = summary.role_distribution || [];

    const COLORS = ['#3b82f6', '#22c55e', '#D90025', '#f59e0b', '#8b5cf6'];
    const pieData = useMemo(() => {
        return distribution.map(d => ({ name: d.role.toUpperCase(), value: d.count }))
            .filter(d => d.value > 0);
    }, [distribution]);

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><GlassCard><SectionHeader title="System Error" subtitle={error} /></GlassCard></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* ── Identities & Presence Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', gap: 24 }}>
                {/* Visual Distribution */}
                <GlassCard style={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <Zap size={16} color="#3b82f6" style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>USER TYPES</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={75} outerRadius={105}
                                    paddingAngle={8} dataKey="value"
                                    animationBegin={200}
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 16px' }}
                                    itemStyle={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 900, color: '#fff' }}>{resp?.total || 0}</div>
                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: -2 }}>TOTAL ACCOUNTS</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24, justifyContent: 'center' }}>
                        {pieData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{d.name}</span>
                                <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#fff', fontWeight: 700 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* System Scale Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <IdentityStat label="Donors" value={scale.donors || 0} sub="People who donate blood." icon={Droplets} color="#D90025" delay={0.1} />
                    <IdentityStat label="Hospitals" value={scale.hospitals || 0} sub="Hospitals we support." icon={Building2} color="#3b82f6" delay={0.2} />
                    <IdentityStat label="Blood Banks" value={scale.banks || 0} sub="Centers that store blood." icon={Target} color="#22c55e" delay={0.3} />
                    <IdentityStat label="System Health" value="99.8%" sub="Everything is running smoothly." icon={Activity} color="#f59e0b" delay={0.4} />
                </div>

                {/* Network Overview */}
                <GlassCard style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Network size={18} color="#3b82f6" />
                            </div>
                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16 }}>System Status</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { l: 'Kerala Blood Bank Network', v: 'Working', c: '#22c55e' },
                                { l: 'Authentication & Security', v: 'Safe', c: '#3b82f6' },
                                { l: 'Database Status', v: 'Up to date', c: '#22c55e' },
                                { l: 'System Health', v: '99.8%', c: '#f59e0b' },
                                { l: 'Last Sync', v: '1 min ago', c: '#22c55e' },
                                { l: 'Average Response Time', v: '140 ms', c: '#3b82f6' }

                            ].map(x => (
                                <div key={x.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{x.l}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: x.c }} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#fff', fontWeight: 600 }}>{x.v}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <ShieldCheck size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                                Keeping donor accounts safe and secure.
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* ── Identity Matrix Registry ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Search & Filter Header */}
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                        <input
                            value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                            placeholder="Search for someone by name, email, or role..."
                            style={{
                                width: '100%', background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16,
                                padding: '16px 20px 16px 52px', fontFamily: 'var(--font-dm)', fontSize: 15, color: '#fff',
                                outline: 'none', transition: 'all 0.3s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            { id: '', label: 'All Roles', icon: Globe },
                            { id: 'donor', label: 'Donors', icon: User },
                            { id: 'hospital', label: 'Hospitals', icon: Building2 },
                            { id: 'bloodbank', label: 'Blood Banks', icon: Target }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => { setRoleFilter(f.id); setOffset(0); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: roleFilter === f.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${roleFilter === f.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                                    borderRadius: 14, padding: '12px 20px', cursor: 'pointer',
                                    fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 600,
                                    color: roleFilter === f.id ? '#3b82f6' : '#9B9BA4', transition: 'all 0.2s'
                                }}
                            >
                                <f.icon size={16} /> {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <GlassCard noPad>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SectionHeader title="All Users" subtitle="A list of everyone registered with us." style={{ margin: 0 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                                TOTAL<br /><span style={{ color: '#fff' }}>#{(resp?.total || 0).toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '24px 32px' }}>
                        {loading ? <SkeletonTable rows={10} cols={6} /> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {/* Advanced Header */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 120px 80px', gap: 20,
                                    padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontWeight: 800
                                }}>
                                    {['USER', 'ROLE', 'EMAIL', 'DONOR/WORKPLACE', 'STATUS', 'ACTIONS'].map(h => <div key={h}>{h}</div>)}
                                </div>

                                {/* Rows */}
                                {users.map((u, i) => {
                                    const isOpen = expandedUserId === u.user_id;
                                    const r = u.role?.toLowerCase();
                                    const roleColor = r === 'donor' ? '#D90025' : r === 'hospital' ? '#3b82f6' : '#22c55e';

                                    return (
                                        <motion.div
                                            key={u.user_id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            style={{
                                                display: 'flex', flexDirection: 'column',
                                                background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${isOpen ? `${roleColor}44` : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div
                                                onClick={() => toggleExpand(u.user_id)}
                                                style={{
                                                    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 120px 80px', gap: 20, alignItems: 'center',
                                                    padding: '20px 16px', cursor: 'pointer', position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${roleColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${roleColor}33` }}>
                                                        {r === 'donor' ? <Droplets size={18} color="#D90025" /> :
                                                            r === 'hospital' ? <Building2 size={18} color="#3b82f6" /> : <Target size={18} color="#22c55e" />}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff', wordBreak: 'break-word' }}>{u.display_name || 'User Profile'}</div>
                                                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.05em' }}>ID_{u.user_id.substring(0, 8).toUpperCase()}</div>
                                                    </div>
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <span style={{
                                                        fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 800,
                                                        color: roleColor, background: `${roleColor}11`, padding: '6px 12px', borderRadius: 8,
                                                        border: `1px solid ${roleColor}22`
                                                    }}>{u.role?.toUpperCase()}</span>
                                                </div>

                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.5)', wordBreak: 'break-word', minWidth: 0 }}>{u.email}</div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 13, color: '#fff', wordBreak: 'break-word' }}>{u.entity_name || 'Master Admin'}</div>
                                                </div>

                                                <div><StatusBadge status={u.is_active ? 'Active' : 'Suspended'} size="sm" /></div>

                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                                    {u.is_active ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); suspendApi.execute(u.user_id); }}
                                                            style={{ background: 'rgba(217,0,37,0.1)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer' }}
                                                        >
                                                            <Ban size={14} color="#D90025" />
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); activateApi.execute(u.user_id); }}
                                                            style={{ background: 'rgba(34,197,94,0.1)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer' }}
                                                        >
                                                            <ShieldCheck size={14} color="#22c55e" />
                                                        </motion.button>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32 }}>
                                                        {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <div style={{ padding: '0 24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: 40, marginTop: 32 }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Last Online</div>
                                                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{u.last_login ? formatDate(u.last_login, true) : 'Never'}</div>
                                                                        </div>
                                                                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Joined</div>
                                                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{formatDate(u.created_at)}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        {r === 'donor' ? (
                                                                            <div>
                                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: roleColor, marginBottom: 12, fontWeight: 800 }}>DONOR DETAILS</div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Blood Group</span>
                                                                                        <BloodGroupBadge group={u.blood_group} size="sm" />
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Age</span>
                                                                                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.age || '--'} Years</span>
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Gender</span>
                                                                                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.gender || '--'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: roleColor, marginBottom: 12, fontWeight: 800 }}>WORKPLACE DETAILS</div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>REG_ID</span>
                                                                                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-space)' }}>{u.hosp_reg || u.bank_reg || 'N/A'}</span>
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>PHONE</span>
                                                                                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.hosp_contact || u.bank_contact || 'None'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontWeight: 800 }}>CONTACT INFO</div>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                                    <Mail size={12} color="rgba(255,255,255,0.4)" />
                                                                                    <span style={{ color: '#fff', fontSize: 13 }}>{u.email}</span>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                                    <Phone size={12} color="rgba(255,255,255,0.4)" />
                                                                                    <span style={{ color: '#fff', fontSize: 13 }}>{u.phone || 'No number provided'}</span>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                                    <MapPin size={12} color="rgba(255,255,255,0.4)" />
                                                                                    <span style={{ color: '#fff', fontSize: 13 }}>{u.city || 'Kerala Region'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 40 }}>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontWeight: 800 }}>ACCOUNT CONTROLS</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                        <button style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                                            <Key size={16} color="rgba(255,255,255,0.4)" /> Send Password Reset
                                                                        </button>
                                                                        <button style={{ width: '100%', padding: '14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, color: '#3b82f6', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                                            <User size={16} /> More Info
                                                                        </button>
                                                                        <button style={{ width: '100%', padding: '14px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 12, color: '#ef4444', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                                            <Trash2 size={16} /> Remove Account
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '0 32px 32px' }}>
                        <Pagination
                            total={resp?.total || 0} limit={limit}
                            offset={offset} onChange={setOffset}
                        />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
