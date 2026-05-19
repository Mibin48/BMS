import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, IndianRupee, Clock, Hospital, User, Phone, MapPin, ChevronDown, Droplets, AtSign } from 'lucide-react';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBStatCard from '../../components/bloodbank/BBStatCard';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import { cardBase, labelStyle, primaryBtn, ghostBtn } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import Pagination from '../../components/Pagination';
import { InlineLoader } from '../../components/LoadingSpinner';
import { formatDate, timeAgo } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { BBListSkeleton } from '../../components/bloodbank/BBSkeleton';

export default function BloodBankPayments() {
    const [status, setStatus] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 10;
    const [markingPaid, setMarkingPaid] = useState(null);

    const fetchParams = { limit, offset, status: status || undefined };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getPayments, fetchParams, [status, offset]);

    const payments = result?.payments || [];
    const summary = result?.summary || {};
    const total = result?.total || 0;

    const handleMarkPaid = async (pay) => {
        setMarkingPaid(pay.payment_id);
        try { 
            await bloodBankService.markPaid(pay.payment_id); 
            toast.success(`₹${pay.amount?.toLocaleString('en-IN')} confirmed from ${pay.hospital_name}`); 
            refetch(); 
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Failed'); 
        } finally { 
            setMarkingPaid(null); 
        }
    };

    if (error) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Statistics Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { icon: CreditCard, label: 'TOTAL INVOICES', val: String(summary.total ?? '--'), color: 'white' },
                        { icon: IndianRupee, label: 'TOTAL REVENUE', val: `₹${(summary.total_amount ?? 0).toLocaleString('en-IN')}`, color: 'blue' },
                        { icon: CheckCircle, label: 'RECEIVED', val: `₹${(summary.total_received ?? 0).toLocaleString('en-IN')}`, color: 'green' },
                        { icon: Clock, label: 'PENDING', val: `₹${(summary.total_pending ?? 0).toLocaleString('en-IN')}`, color: 'amber', pulse: (summary.total_pending ?? 0) > 0 },
                    ].map((c, i) => (
                        <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <BBStatCard {...c} value={c.val} loading={loading} />
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['', 'Pending', 'Paid'].map(s => (
                            <button key={s} onClick={() => { setStatus(s); setOffset(0); }}
                                style={{
                                    background: status === s ? '#D90025' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${status === s ? '#D90025' : '#D9002540'}`,
                                    borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
                                    fontFamily: 'var(--font-space)', fontSize: 11, color: status === s ? '#fff' : '#9B9BA4',
                                    transition: 'all 0.2s', fontWeight: 600, letterSpacing: '0.05em'
                                }}>{s.toUpperCase() || 'ALL INVOICES'}</button>
                        ))}
                    </div>
                </div>

                {/* Payment List */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardBase, padding: 12 }}>
                    {loading ? (
                        <BBListSkeleton rows={5} />
                    ) : payments.length === 0 ? (
                        <div style={{ padding: 40 }}><BBEmptyState icon={CreditCard} title="No payments" subtitle="Financial records will appear here" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {payments.map(pay => <PaymentRow key={pay.payment_id} pay={pay} onMarkPaid={handleMarkPaid} markingPaid={markingPaid} />)}
                        </div>
                    )}
                </motion.div>
                
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />
            </div>
    );
}

function PaymentRow({ pay, onMarkPaid, markingPaid }) {
    const [open, setOpen] = useState(false);
    const statusCol = pay.payment_status === 'Paid' ? '#22c55e' : '#f59e0b';

    return (
        <div style={{ borderRadius: 16, marginBottom: 4 }}>
            <motion.div 
                whileHover="hover"
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 16,
                    border: `1px solid ${statusCol}40`,
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.3s ease', cursor: 'pointer',
                    overflow: 'hidden'
                }}
            >
                {/* Inner Glow */}
                <div style={{
                    position: 'absolute', inset: 0,
                    boxShadow: `inset 0 0 12px ${statusCol}08`,
                    pointerEvents: 'none', zIndex: 0
                }} />
                {/* Animated Beam */}
                <motion.div
                    variants={{
                        hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', inset: '1px',
                        background: `linear-gradient(90deg, transparent, ${statusCol}15, transparent)`,
                        pointerEvents: 'none', zIndex: 0
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ 
                        width: 44, height: 44, borderRadius: 14, 
                        background: `${statusCol}12`, 
                        border: `1px solid ${statusCol}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <IndianRupee size={18} color={statusCol} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{pay.hospital_name}</p>
                            <BBStatusBadge status={pay.payment_status} size="xs" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'var(--text3)' }}>INV: {pay.payment_id}</p>
                            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'var(--text3)' }}>{timeAgo(pay.created_at)}</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 10 }}>
                        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1 }}>₹{(pay.amount || 0).toLocaleString('en-IN')}</p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#4A4A55', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Amount</p>
                    </div>

                    <motion.div animate={{ rotate: open ? 180 : 0 }}>
                        <ChevronDown size={18} color="rgba(255,255,255,0.2)" />
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="payment-content"
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '24px 32px', borderLeft: `3px solid ${statusCol}`, margin: '4px 20px 24px', borderRadius: '0 0 20px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: statusCol }}>
                                        <Hospital size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>FACILITY INFO</span>
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{pay.hospital_name}</p>
                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{pay.hospital_city}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: statusCol }}>
                                        <User size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>TRANSACTION CASE</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(217, 0, 37, 0.40)', padding: 16 }}>
                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff' }}>Patient: {pay.patient_name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                            <BBBloodBadge group={pay.blood_group} size="sm" />
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 14, color: '#fff', fontWeight: 700 }}>{pay.units_required} Units</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: statusCol }}>
                                        <Clock size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>SETTLEMENT</span>
                                    </div>
                                    <div>
                                        <p style={{ ...labelStyle, fontSize: 10 }}>{pay.payment_status === 'Paid' ? 'SETTLEMENT DATE' : 'PENDING SINCE'}</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#fff', marginTop: 4 }}>{pay.payment_date ? formatDate(pay.payment_date) : timeAgo(pay.created_at)}</p>
                                        
                                        <div style={{ marginTop: 16 }}>
                                            {pay.status === 'Pending' && (
                                                <button onClick={(e) => { e.stopPropagation(); onMarkPaid(pay); }} disabled={markingPaid === pay.payment_id}
                                                    style={{ ...primaryBtn, width: '100%', justifyContent: 'center', background: '#22c55e' }}>
                                                    {markingPaid === pay.payment_id ? <InlineLoader /> : <CheckCircle size={14} />} CONFIRM
                                                </button>
                                            )}
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
}
