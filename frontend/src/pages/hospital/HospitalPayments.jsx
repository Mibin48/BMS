import React, { useState, useEffect } from 'react';
import { 
    Search, Download, CreditCard, X, Check, Droplets, AlertCircle, 
    TrendingUp, Wallet, Receipt, Hourglass, ArrowRight, History 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBadge from '../../components/hospital/StatusBadge';
import Pagination from '../../components/Pagination';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonStats, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

function fmt(d) { if (!d) return '--'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

const PAY_TABS = ['All', 'Paid', 'Pending'];

export default function HospitalPayments() {
    const { showExpiryModal } = useAuth();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [payingId, setPayingId] = useState(null);
    const limit = 20;

    const fetchParams = {
        limit,
        offset,
        status: filter !== 'All' ? filter : undefined
    };

    const { data, loading, error, refetch } = useFetch(hospitalService.getPayments, fetchParams, [filter, offset]);

    const payments = data?.payments || [];
    const total = data?.total || 0;
    const summary = data?.summary || {};

    // Local search filter
    const filtered = payments.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (p.payment_id?.toLowerCase().includes(q) || p.bank_name?.toLowerCase().includes(q) || p.patient_name?.toLowerCase().includes(q));
    });

    const handlePay = async () => {
        if (!selectedPayment) return;
        setPayingId(selectedPayment.payment_id);
        try {
            await hospitalService.payNow(selectedPayment.payment_id);
            toast.success('Payment marked as paid!');
            setIsPaid(true);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setPayingId(null);
        }
    };

    const closePaymentModal = () => {
        setSelectedPayment(null);
        setIsPaid(false);
    };

    useEffect(() => { setOffset(0); }, [filter]);

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <>
            <AnimatePresence>
                {selectedPayment && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) closePaymentModal(); }}
                    >
                        <motion.div 
                            initial={{ scale: 0.93, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                            style={{ 
                                background: 'linear-gradient(135deg, rgba(15,15,23,0.95), rgba(10,10,15,0.98))', 
                                border: '1px solid rgba(217,0,37,0.3)', borderRadius: 32, padding: 48, 
                                width: '100%', maxWidth: 500, position: 'relative',
                                maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 50px rgba(217,0,37,0.1)' 
                            }}
                        >
                            <button onClick={closePaymentModal} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} color="rgba(255,255,255,0.4)" /></button>
                            
                            {isPaid ? (
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(34,197,148,0.2)' }}>
                                        <Check size={40} color="#22c55e" />
                                    </div>
                                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Transaction Authorized</h2>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Payment logic processed. Registry updated for session {selectedPayment.payment_id.slice(0, 8)}.</p>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={closePaymentModal}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 40px', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 700, color: '#fff' }}
                                    >Dismiss Registry</motion.button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 32 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={22} color="var(--red)" />
                                            </div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>Confirm Payment</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.15em' }}>REG: {selectedPayment.payment_id}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: 'linear-gradient(bottom left, transparent 50%, rgba(217,0,37,0.05) 50%)' }} />
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BLOOD RECIPIENT</span>
                                                <span style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff', fontWeight: 700 }}>{selectedPayment.patient_name || '--'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ALLOCATION SOURCE</span>
                                                <span style={{ fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff', fontWeight: 700 }}>{selectedPayment.bank_name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>RESOURCE TYPE</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--red)', fontWeight: 800 }}>{selectedPayment.blood_group}</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '0.1em' }}>TOTAL AMOUNT</span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 0.8, letterSpacing: '-0.02em' }}>₹{(selectedPayment.amount ?? 0).toLocaleString('en-IN')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '14px 20px', marginBottom: 32 }}>
                                        <AlertCircle size={18} color="#f59e0b" strokeWidth={2.5} />
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#f59e0b', fontWeight: 500, lineHeight: 1.4 }}>Authorized settlement will update inventory logistics across the encrypted network.</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <motion.button 
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                            onClick={closePaymentModal}
                                            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}
                                        >CANCEL</motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(217,0,37,0.4)' }} whileTap={{ scale: 0.98 }}
                                            onClick={handlePay}
                                            disabled={payingId}
                                            style={{ 
                                                flex: 2, background: 'linear-gradient(135deg, var(--red), var(--red-h))', border: 'none', 
                                                borderRadius: 16, padding: '16px 0', cursor: 'pointer', 
                                                fontFamily: 'var(--font-sub)', fontSize: 16, fontWeight: 800, color: '#fff', 
                                                opacity: payingId ? 0.7 : 1, boxShadow: '0 10px 40px rgba(217,0,37,0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                            }}
                                        >
                                            {payingId ? 'PROCESSING...' : <><Wallet size={20} /> AUTHORIZE PAYMENT</>}
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats Container - High Fidelity Glassmorphism */}
                <div style={{ minHeight: 120 }}>
                    <AnimatePresence mode="wait">
                        {loading && !data ? (
                            <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <SkeletonStats count={4} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="stats-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}
                            >
                                {[
                                    { label: 'TOTAL PAID', val: `₹${(summary.total_paid ?? 0).toLocaleString('en-IN')}`, color: '#22c55e', icon: Receipt },
                                    { label: 'WAITING PAYMENT', val: `₹${(summary.total_pending ?? 0).toLocaleString('en-IN')}`, color: '#f59e0b', icon: Hourglass },
                                    { label: 'TOTAL TO PAY', val: `₹${(summary.total_amount ?? 0).toLocaleString('en-IN')}`, color: '#fff', icon: Wallet },
                                    { label: 'ORDER VOLUME', val: summary.total ?? 0, color: 'var(--red)', icon: TrendingUp },
                                ].map(({ label, val, color, icon: Icon }, i) => (
                                    <motion.div 
                                        key={label} whileHover={{ y: -5, borderColor: 'rgba(217,0,37,0.35)' }}
                                        style={{ background: 'rgba(15, 15, 23, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: -20, right: -10, width: 80, height: 80, background: `radial-gradient(circle at center, ${color}15, transparent 70%)`, filter: 'blur(15px)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={16} color={color} />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{label}</div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{val}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Header Container */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(217,0,37,0.05)' }}>
                            <History size={32} color="var(--red)" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>Billing History</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.05em' }}>
                                CHECKING <span style={{ color: '#fff', fontWeight: 700 }}>{total}</span> BILLS · <span style={{ color: '#f59e0b', fontWeight: 700 }}>{summary.total_pending > 0 ? 'PAYMENT NEEDED' : 'ALL CLEAR'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <motion.button 
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.98 }}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                            borderRadius: 16, padding: '14px 24px', cursor: 'pointer', 
                            fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: '#fff',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Download size={18} color="var(--red)" /> Generate Audit Statement
                    </motion.button>
                </div>

                {/* Filters & Search - Modern Strip */}
                <div style={{ 
                    display: 'flex', gap: 20, padding: '12px 24px', 
                    background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, 
                    alignItems: 'center', backdropFilter: 'blur(10px)' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>FILTER status:</div>
                        {PAY_TABS.map(t => (
                            <motion.button 
                                key={t} onClick={() => setFilter(t)} 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    background: filter === t ? 'rgba(217,0,37,0.15)' : 'transparent', 
                                    border: `1px solid ${filter === t ? 'rgba(217,0,37,0.25)' : 'transparent'}`, 
                                    borderRadius: 10, padding: '6px 16px', cursor: 'pointer', 
                                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: filter === t ? 700 : 500,
                                    color: filter === t ? 'var(--red)' : 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s'
                                }}
                            >{t.toUpperCase()}</motion.button>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="var(--red)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH BY ID / PATIENT / PROVIDER..."
                            style={{ 
                                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: 12, padding: '10px 16px 10px 42px', 
                                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box',
                                letterSpacing: '0.05em'
                            }} 
                        />
                    </div>
                </div>

                {/* Table Container - Cinematic List */}
                {loading ? <SkeletonTable rows={4} cols={6} /> : (
                    <div style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 180px 120px 120px 140px 100px', gap: 12, padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {['BLOOD SOURCE', 'PATIENT NAME', 'BILL AMOUNT', 'DATE', 'STATUS', 'ACTION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '0.1em' }}>{h}</div>)}
                        </div>
                        
                        {filtered.length === 0 ? (
                            <div style={{ padding: '60px 0' }}>
                                <EmptyState icon={CreditCard} title="No transaction records" subtitle="Logistics clear. No pending settlements detected." />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filtered.map((p, i) => (
                                    <motion.div 
                                        key={p.payment_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                        style={{ display: 'grid', gridTemplateColumns: '1.2fr 180px 120px 120px 140px 100px', gap: 12, alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                                    >
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>{p.bank_name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', fontWeight: 800, letterSpacing: '0.05em' }}>{p.blood_group}</span>
                                                <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.1)' }} />
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{p.units_required} UNITS · {p.priority}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{p.patient_name || '--'}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>ID: {p.payment_id.slice(0, 12)}</div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>₹{(p.amount ?? 0).toLocaleString('en-IN')}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.02em' }}>{p.payment_date ? fmt(p.payment_date) : 'PENDING'}</div>
                                        <div>
                                            <StatusBadge status={p.payment_status} />
                                        </div>
                                        <div>
                                            <motion.button
                                                whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => p.payment_status === 'Pending' ? setSelectedPayment(p) : null}
                                                disabled={payingId === p.payment_id}
                                                style={{
                                                    background: 'transparent', border: 'none', cursor: p.payment_status === 'Pending' ? 'pointer' : 'default',
                                                    fontFamily: 'var(--font-sub)', fontSize: 12, fontWeight: 800, padding: 0,
                                                    color: p.payment_status === 'Pending' ? 'var(--red)' : '#22c55e',
                                                    opacity: payingId === p.payment_id ? 0.5 : 1,
                                                    display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em'
                                                }}>
                                                {payingId === p.payment_id ? 'WAITING...' : p.payment_status === 'Pending' ? <><Wallet size={14} /> PAY NOW</> : <><Receipt size={14} /> RECEIPT</>}
                                                {p.payment_status === 'Pending' && <ArrowRight size={14} />}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />
            </div>
        </>
    );
}
