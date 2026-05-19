import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ShieldCheck, AlertTriangle, AlertOctagon, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';

const ACTION_MAP = {
    'APPROVED': { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', b: 'rgba(34,197,94,0.3)' },
    'REJECTED': { bg: 'rgba(217,0,37,0.1)', c: '#D90025', b: 'rgba(217,0,37,0.3)' },
    'CREATED': { bg: 'rgba(59,130,246,0.1)', c: '#3b82f6', b: 'rgba(59,130,246,0.3)' },
    'UPDATED': { bg: 'rgba(139,92,246,0.1)', c: '#8b5cf6', b: 'rgba(139,92,246,0.3)' },
    'DELETED': { bg: 'rgba(245,158,11,0.1)', c: '#f59e0b', b: 'rgba(245,158,11,0.3)' },
    'FAILED_LOGIN': { bg: 'rgba(217,0,37,0.1)', c: '#D90025', b: 'rgba(217,0,37,0.3)' },
    'LOGIN': { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', b: 'rgba(34,197,94,0.3)' },
};

function ActionBadge({ action }) {
    const s = ACTION_MAP[action] || { bg: 'rgba(255,255,255,0.05)', c: '#9B9BA4', b: 'rgba(255,255,255,0.1)' };
    return (
        <span style={{
            background: s.bg, border: `1px solid ${s.b}`, borderRadius: 100,
            padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: s.c, textTransform: 'uppercase'
        }}>
            {action}
        </span>
    );
}

export default function AdminAudit() {
    const { showExpiryModal } = useAuth();
    const [actionFilter, setActionFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error } = useFetch(
        adminService.getAuditLogs,
        { action: actionFilter, search: debouncedSearch, limit, offset },
        [actionFilter, debouncedSearch, offset]
    );

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    const logs = resp?.logs || [];

    const sum = resp?.summary || { total: 0, today: 0, warnings: 0, critical: 0 };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
        padding: '10px 14px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'border-color 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                <StatCard label="Total Logs entered" value={(sum.total ?? 0).toLocaleString()} icon={Activity} color="white" />
                <StatCard label="Standard Updates" value={(sum.info_count ?? 0).toLocaleString()} icon={ShieldCheck} color="blue" />
                <StatCard label="Warning Events" value={(sum.warning_count ?? 0).toLocaleString()} icon={AlertTriangle} color="amber" />
                <StatCard label="Critical Alerts" value={(sum.critical_count ?? 0).toLocaleString()} icon={AlertOctagon} color="red" />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: '', l: 'Show All' }, { v: 'APPROVED', l: 'Approvals' }, { v: 'REJECTED', l: 'Rejections' }, { v: 'FAILED_LOGIN', l: 'Login Failures' }].map(t => {
                        const isActive = actionFilter === t.v;
                        return (
                            <button key={t.v} onClick={() => { setActionFilter(t.v); setOffset(0); }} style={{
                                background: isActive ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 500,
                                color: isActive ? '#D90025' : '#9B9BA4'
                            }}>{t.l}</button>
                        );
                    })}
                </div>

                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} color="#9B9BA4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by name, item, or action..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 40 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(217,0,37,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}><Download size={14} /> Export Logs</button>
                </div>
            </div>

            {/* List */}
            <GlassCard>
                <SectionHeader title="Activity Record" subtitle="Recent History" />

                {loading ? (
                    <SkeletonTable rows={10} cols={6} />
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Activity size={32} color="#9B9BA4" />
                        </div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', color: '#fff' }}>No Activity Yet</div>
                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>Everything that happens in the system will be listed here.</div>
                    </div>
                ) : (
                    <div>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr minmax(120px, 1fr) 2fr minmax(100px, 1fr)', gap: 20, padding: '0 16px 12px', fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>DATE & TIME</div>
                            <div>WHO DID IT</div>
                            <div>ENTITY</div>
                            <div>ACTION</div>
                            <div style={{ textAlign: 'right' }}>LOCATION</div>
                        </div>

                        {/* Table Rows */}
                        <AnimatePresence>
                            {logs.map((log, i) => {
                                const isCrit = log.severity === 'Critical';
                                const isWarn = log.severity === 'Warning';
                                const isExpanded = expanded === log.log_id;

                                return (
                                    <div key={log.log_id} style={{
                                        position: 'relative',
                                        background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        marginBottom: isExpanded ? 16 : 0,
                                        borderRadius: isExpanded ? 16 : 0,
                                        border: isExpanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                        boxShadow: isExpanded ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        zIndex: isExpanded ? 10 : 1
                                    }}>
                                        <div
                                            onClick={() => setExpanded(isExpanded ? null : log.log_id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr minmax(120px, 1fr) 2fr minmax(100px, 1fr)', gap: 20, alignItems: 'center',
                                                padding: '20px 16px', borderBottom: (!isExpanded && i < logs.length - 1) ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                                cursor: 'pointer', transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                            onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s'
                                                }}>
                                                    <ChevronDown size={14} color={isExpanded ? '#fff' : '#9B9BA4'} />
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: isExpanded ? '#fff' : '#9B9BA4' }}>{log.created_at ? formatDate(log.created_at, true) : 'Unknown time'}</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 12, color: '#D90025' }}>
                                                    {(log.user_name || 'S')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2, wordBreak: 'break-word', minWidth: 0 }}>{log.user_name || log.user_id || 'SYSTEM'}</div>
                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#D90025', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{log.role || 'ADMIN'}</div>
                                                </div>
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 600, color: '#CACACE', marginBottom: 4, wordBreak: 'break-word' }}>{log.entity}</div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>ID: #{log.entity_id?.split('-').pop()?.substring(0, 6)}</div>
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                    <ActionBadge action={log.action} />
                                                    {isCrit && <div style={{ animation: 'pulse 2s infinite', background: 'rgba(217,0,37,0.1)', color: '#D90025', fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 800, border: '1px solid rgba(217,0,37,0.3)' }}>CRITICAL</div>}
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: isExpanded ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: '90%', wordBreak: 'break-word' }}>{log.detail}</div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff', marginBottom: 4 }}>{log.ip_address || '127.0.0.1'}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>LOCATION</div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                                >
                                                    <div style={{ padding: '0 32px 32px 64px' }}>
                                                        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(217,0,37,0.2) 0%, transparent 100%)', marginBottom: 24 }} />
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 40 }}>
                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#D90025', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em', fontWeight: 700 }}>What Happened</div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    {log.detail}
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                                                <div>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em' }}>Technical Info</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 8 }}>
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Internet Address</span>
                                                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#fff' }}>{log.ip_address || 'Local'}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 8 }}>
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Importance</span>
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: isCrit ? '#D90025' : '#3b82f6', fontWeight: 700 }}>{log.severity}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Exact Time</span>
                                                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{new Date(log.created_at).toISOString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em' }}>Refers To</div>
                                                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 16 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025', boxShadow: '0 0 10px rgba(217,0,37,0.5)' }} />
                                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{log.entity}</div>
                                                                    </div>
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#666', background: '#000', padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                                                                        ID: {log.entity_id || 'System Wide'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
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
            </GlassCard>
        </div>
    );
}
