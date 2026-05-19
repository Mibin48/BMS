import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, ChevronDown, CreditCard, CheckCircle2, AlertTriangle, TrendingUp, X, MapPin, Receipt, Clock, User, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import Pagination from '../../components/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../../hooks/useDebounce';

export default function AdminPayments() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 20;
    const debouncedSearch = useDebounce(search, 500);

    const { data: resp, loading, error, refetch } = useFetch(
        adminService.getAllPayments,
        { status: statusFilter, search: debouncedSearch, limit, offset },
        [statusFilter, debouncedSearch, offset]
    );

    const updateApi = useApi(adminService.updatePaymentStatus, {
        onSuccess: () => {
            toast.success('Payment marked as received');
            setIsPaid(true);
            refetch();
        }
    });

    const payments = resp?.payments || [];
    const sum = resp?.summary || { total: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 };

    const handleMarkPaid = async () => {
        if (!selectedPaymentId) return;
        await updateApi.execute(selectedPaymentId, 'Paid');
    };

    const closePayoutModal = () => {
        setSelectedPaymentId(null);
        setIsPaid(false);
    };

    const iqStyle = {
        background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '12px 16px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', outline: 'none', transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
            <AnimatePresence>
                {selectedPaymentId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) closePayoutModal(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 440, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                        >
                            <button onClick={closePayoutModal} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#9B9BA4' }}><X size={20} /></button>

                            {isPaid ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle2 size={40} color="#22c55e" />
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 8 }}>Success!</h2>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', marginBottom: 32 }}>The record has been updated.</p>
                                    <button onClick={closePayoutModal} style={{ width: '100%', background: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 700, color: '#000', cursor: 'pointer' }}>Finish</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertTriangle size={24} color="#22c55e" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>Is this paid?</h2>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Update Bill</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#CACACE', lineHeight: 1.6 }}>
                                            Please confirm that you have received the payment for this bill.
                                        </div>
                                        <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.1)', paddingLeft: '32px', position: 'relative' }}>
                                            <Info size={14} style={{ position: 'absolute', left: 10, top: 12 }} color="#f59e0b" />
                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#f59e0b' }}>This will update the records to show that the bill is paid.</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <button onClick={closePayoutModal} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#CACACE', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleMarkPaid} disabled={updateApi.loading} style={{ background: '#22c55e', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.2)', opacity: updateApi.loading ? 0.7 : 1 }}>{updateApi.loading ? 'Updating...' : 'Mark as Paid'}</button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Trace */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 2, background: 'linear-gradient(90deg, #22c55e, transparent)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#22c55e', letterSpacing: '0.12em', fontWeight: 700 }}>PAYMENTS ONLINE</span>
                </div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Secure Ledger V1.0</div>
            </div>

            {/* Metrics */}
            {loading ? <SkeletonStats count={4} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                    <StatCard label="Total Revenue" value={`₹${(sum.total_amount ?? 0).toLocaleString()}`} icon={TrendingUp} color="white" description="Total expected income" />
                    <StatCard label="Received Amount" value={`₹${(sum.paid_amount ?? 0).toLocaleString()}`} icon={CheckCircle2} color="green" description="Successfully settled" />
                    <StatCard label="Pending Dues" value={`₹${(sum.pending_amount ?? 0).toLocaleString()}`} icon={AlertTriangle} color="amber" description="Awaiting hospital payment" />
                    <StatCard label="Transactions" value={(sum.total ?? 0).toLocaleString()} icon={CreditCard} color="blue" description="Total payment records" />
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Paid', 'Pending', 'Overdue'].map(t => {
                        const val = t === 'Show All' ? '' : t;
                        const isActive = statusFilter === val;
                        return (
                            <button key={t} onClick={() => { setStatusFilter(val); setOffset(0); }} style={{
                                background: isActive ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 100, padding: '8px 20px', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600,
                                color: isActive ? '#D90025' : '#9B9BA4', transition: 'all 0.2s'
                            }}>{t}</button>
                        );
                    })}
                </div>
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
                        placeholder="Search by Hospital, Blood Bank, or Bill ID..."
                        style={{ ...iqStyle, width: '100%', paddingLeft: 52, background: 'transparent', border: 'none' }}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                    <Download size={16} /> Download List
                </button>
            </div>

            {/* Payment List */}
            <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 28, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Bills and Payments</div>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{resp?.total || 0} BILLS FOUND</div>
                </div>

                {loading ? <div style={{ padding: 32 }}><SkeletonTable rows={10} cols={7} /></div> : payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)' }}>
                        <CreditCard size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 20 }} />
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 12 }}>No Bills Found</div>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 400, margin: '0 auto' }}>Try changing your search to find what you are looking for.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px 32px' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '130px 2fr 1.5fr 140px 110px 120px 40px', gap: 20,
                            padding: '24px 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800
                        }}>
                            {['BILL ID', 'HOSPITAL', 'BLOOD BANK', 'AMOUNT', 'STATUS', 'ACTION', ''].map(h => <div key={h}>{h}</div>)}
                        </div>

                        {/* Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                            {payments.map((p, i) => {
                                const isOpen = expanded === p.payment_id;
                                const accent = p.payment_status === 'Paid' ? '#22c55e' : (p.payment_status === 'Overdue' ? '#D90025' : '#f59e0b');
                                return (
                                    <div key={p.payment_id}>
                                        <div
                                            onClick={() => setExpanded(isOpen ? null : p.payment_id)}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '130px 2fr 1.5fr 140px 110px 120px 40px', gap: 20, alignItems: 'center',
                                                padding: '16px', background: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${isOpen ? `${accent}44` : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                            }}
                                        >
                                            {isOpen && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: accent, borderRadius: '0 4px 4px 0' }} />}

                                            <div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#fff' }}>#{p.payment_id?.split('-').pop()?.toUpperCase()}</div>
                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{formatDate(p.created_at)}</div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', wordBreak: 'break-word' }}>{p.hospital_name}</div>
                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={10} /> {p.patient_name}</div>
                                            </div>

                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.6)', wordBreak: 'break-word', minWidth: 0 }}>{p.bank_name}</div>

                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#fff' }}>₹{p.amount.toLocaleString()}</div>

                                            <div><StatusBadge status={p.payment_status} size="sm" /></div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                {p.payment_status === 'Pending' ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPaymentId(p.payment_id); }}
                                                        style={{ background: '#22c55e15', border: '1px solid #22c55e44', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 11, fontWeight: 700, color: '#22c55e' }}
                                                    >Mark as Paid</button>
                                                ) : (
                                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>PAID</div>
                                                )}
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
                                                        padding: '32px', margin: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 32,
                                                        borderLeft: `4px solid ${accent}`
                                                    }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <Receipt size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order Details</div>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{p.units_required} Units</div>
                                                                    <BloodGroupBadge group={p.blood_group} size="sm" />
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    Priority: <span style={{ color: p.priority === 'Emergency' ? '#ef4444' : '#60a5fa', fontWeight: 700 }}>{p.priority}</span>
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <Clock size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment Details</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff', lineHeight: 1.6 }}>
                                                                    {p.payment_date ? (
                                                                        <>
                                                                            Paid on: {formatDate(p.payment_date)}<br />
                                                                            Paid via: Bank Transfer
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Status: Waiting for payment<br />
                                                                            Note: Contact the hospital if payment is overdue.
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                    <ShieldCheck size={16} color={accent} />
                                                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Info</div>
                                                                </div>
                                                                <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                                                    System ID: #{p.payment_id?.split('-').pop()?.toUpperCase()}<br />
                                                                    Hash: 0x{p.payment_id?.replace(/-/g, '').substring(0, 12).toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                            {p.payment_status === 'Pending' && (
                                                                <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff' }}>Send Reminder</button>
                                                            )}
                                                            <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, color: '#fff' }}>See History</button>
                                                            <button style={{ background: accent, border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 700, color: '#fff' }}>Print Bill</button>
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

function Info({ size, color, style }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    );
}

function ShieldCheck({ size, color, style }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" />
        </svg>
    );
}
