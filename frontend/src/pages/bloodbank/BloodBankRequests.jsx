import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Inbox, Check, X, ArrowRight, AlertTriangle, CheckCircle, 
    Hospital, User, Clock, ChevronDown, Droplets, MapPin, 
    Search, Filter, Activity, PieChart, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import BBModal, { BBModalFooter } from '../../components/bloodbank/BBModal';
import BBStatCard from '../../components/bloodbank/BBStatCard';
import { cardBase, inputStyle, labelStyle, primaryBtn, ghostBtn, dangerBtn, VitalPill } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import Pagination from '../../components/Pagination';
import { InlineLoader } from '../../components/LoadingSpinner';
import { formatDate, timeAgo } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { BBListSkeleton } from '../../components/bloodbank/BBSkeleton';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BloodBankRequests() {
    const { showExpiryModal } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 10;
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);

    const fetchParams = { limit, offset, status: status || undefined };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getRequests, fetchParams, [status, offset]);

    const requests = result?.requests || [];
    const total = result?.total || 0;
    const summary = result?.summary || {};

    const handleApprove = async (req) => {
        setActionLoading(req.request_id);
        try { 
            await bloodBankService.approveRequest(req.request_id); 
            toast.success(`${req.blood_group} request approved!`); 
            refetch(); 
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Approval failed'); 
        } finally { 
            setActionLoading(null); 
        }
    };

    const handleReject = async () => {
        setRejecting(true);
        try { 
            await bloodBankService.rejectRequest(rejectTarget.request_id, { reason: rejectReason }); 
            toast.success('Request rejected'); 
            setRejectTarget(null); 
            setRejectReason(''); 
            refetch(); 
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Rejection failed'); 
        } finally { 
            setRejecting(false); 
        }
    };

    if (error && !showExpiryModal) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Statistics Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { icon: Inbox, label: 'TOTAL REQUESTS', val: String(summary.total ?? total), color: 'white' },
                        { icon: Clock, label: 'PENDING', val: String(summary.pending ?? 0), color: 'amber', pulse: (summary.pending ?? 0) > 0 },
                        { icon: Activity, label: 'IN PROGRESS', val: String(summary.processing ?? 0), color: 'blue' },
                        { icon: CheckCircle, label: 'COMPLETED', val: String(summary.fulfilled ?? 0), color: 'green' },
                    ].map((c, i) => (
                        <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <BBStatCard {...c} value={c.val} loading={loading} />
                        </motion.div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {[{ k: '', l: 'All' }, { k: 'Pending', l: 'Pending' }, { k: 'Processing', l: 'In Progress' }, { k: 'Fulfilled', l: 'Completed' }].map(t => (
                        <button key={t.l} onClick={() => { setStatus(t.k); setOffset(0); }} style={{
                            background: (status || '') === t.k ? '#D90025' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${(status || '') === t.k ? '#D90025' : 'rgba(255,255,255,0.10)'}`,
                            borderRadius: 100, padding: '6px 16px', cursor: 'pointer',
                            fontFamily: 'var(--font-space)', fontSize: 11, color: (status || '') === t.k ? '#fff' : '#9B9BA4',
                            transition: 'all 0.2s', fontWeight: 600
                        }}>{t.l.toUpperCase()}</button>
                    ))}
                </div>

                {/* Request List */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardBase, padding: 12 }}>
                    {loading ? (
                        <BBListSkeleton rows={5} />
                    ) : requests.length === 0 ? (
                        <div style={{ padding: 40 }}><BBEmptyState icon={Inbox} title="No requests" subtitle="Hospitals will send blood requests here" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {requests.map(req => (
                                <RequestRow 
                                    key={req.request_id} 
                                    req={req} 
                                    onApprove={handleApprove} 
                                    onReject={(r) => setRejectTarget(r)} 
                                    actionLoading={actionLoading}
                                    navigate={navigate}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
                
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />

            {/* Reject Confirmation Modal */}
            <AnimatePresence>
                {rejectTarget && (
                    <BBModal onClose={() => { setRejectTarget(null); setRejectReason(''); }} title="Reject Request" subtitle={`${rejectTarget.hospital_name} — ${rejectTarget.units_required}U ${rejectTarget.blood_group}`} icon={X} maxWidth={440}>
                        <div style={{ padding: 24 }}>
                            <label style={labelStyle}>Reason for rejection</label>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ ...inputStyle, resize: 'none', minHeight: 80 }} placeholder="e.g. Insufficient stock, donor unavailable..." />
                        </div>
                        <BBModalFooter>
                            <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} style={ghostBtn}>CANCEL</button>
                            <button onClick={handleReject} disabled={rejecting} style={{ ...dangerBtn, opacity: rejecting ? 0.5 : 1 }}>{rejecting ? <><InlineLoader /> REJECTING...</> : <><X size={14} /> REJECT REQUEST</>}</button>
                        </BBModalFooter>
                    </BBModal>
                )}
            </AnimatePresence>
        </div>
    );
}

function RequestRow({ req, onApprove, onReject, actionLoading, navigate }) {
    const [open, setOpen] = useState(false);
    const isEmerg = req.priority === 'Emergency';
    const isUrg = req.priority === 'Urgent';

    const isFulfilled = req.status === 'Fulfilled';
    const statusColor = 
        isFulfilled ? '#22c55e' : 
        req.status === 'Pending' ? '#f59e0b' : 
        req.status === 'Cancelled' ? '#9B9BA4' : 
        '#3b82f6'; // Processing

    const accentColor = isFulfilled ? '#22c55e' : (isEmerg ? '#D90025' : (isUrg ? '#f59e0b' : statusColor));

    return (
        <div style={{ borderRadius: 16, marginBottom: 2 }}>
            <motion.div 
                onClick={() => setOpen(!open)}
                initial={false}
                whileHover="hover"
                style={{
                    position: 'relative',
                    background: `${accentColor}05`, // 2% tint
                    borderRadius: 16,
                    border: `1px solid ${accentColor}4D`, // 30% opacity
                    boxShadow: `inset 0 0 15px ${accentColor}08`,
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.3s ease', cursor: 'pointer',
                    overflow: 'hidden'
                }}
            >
                {/* Animated Beam */}
                <motion.div
                    variants={{
                        hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', inset: '1px',
                        background: `linear-gradient(90deg, transparent, ${accentColor}12, transparent)`,
                        pointerEvents: 'none', zIndex: 0
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ width: 45, textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 13, color: 'var(--text3)' }}>{new Date(req.created_at).getDate()}</p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', textTransform: 'uppercase' }}>{new Date(req.created_at).toLocaleString('en-IN', { month: 'short' })}</p>
                    </div>

                    <BBBloodBadge group={req.blood_group} size="md" />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{req.hospital_name}</p>
                            <BBStatusBadge status={req.priority} size="xs" />
                        </div>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4' }}>{req.patient_name} · {req.units_required} Units</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <BBStatusBadge status={req.status} size="sm" />
                        
                        <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 10 }}>
                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1 }}>{req.units_required}U</p>
                            <p style={{ 
                                fontFamily: 'var(--font-space)', fontSize: 10, 
                                color: req.stock_check === 'Sufficient' ? '#22c55e' : '#f59e0b', 
                                marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4
                            }}>
                                {req.stock_available} in stock
                            </p>
                        </div>

                        <motion.div animate={{ rotate: open ? 180 : 0 }}>
                            <ChevronDown size={18} color="rgba(255,255,255,0.2)" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="request-content"
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '24px 32px', borderLeft: `3px solid ${isEmerg ? '#D90025' : '#4A4A55'}`, margin: '4px 20px 24px', borderRadius: '0 0 20px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <Hospital size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>HOSPITAL PROFILE</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{req.hospital_name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <MapPin size={12} color="#4A4A55" />
                                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text3)' }}>{req.hospital_city}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <User size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>PATIENT CASE</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <p style={{ fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 700, color: '#fff' }}>{req.patient_name}</p>
                                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                                            {req.patient_age} Years • {req.patient_blood_group}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
                                        <Clock size={16} />
                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>STATUS TIMELINE</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <p style={{ ...labelStyle, fontSize: 10 }}>REQUESTED</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#fff' }}>{formatDate(req.created_at)}</p>
                                        </div>
                                        
                                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); onApprove(req); }} disabled={actionLoading === req.request_id}
                                                        style={{ ...primaryBtn, flex: 1, justifyContent: 'center', background: '#22c55e' }}>
                                                        {actionLoading === req.request_id ? <InlineLoader /> : <Check size={14} />} APPROVE
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); onReject(req); }}
                                                        style={{ ...dangerBtn, flex: 0.5, justifyContent: 'center' }}>
                                                        <X size={14} /> REJECT
                                                    </button>
                                                </>
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

function Phone({ size, color }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    )
}
