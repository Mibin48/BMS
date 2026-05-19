import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Phone, CheckCircle, XCircle, Clock, MoreVertical, Droplets, Search, Filter, ChevronDown } from 'lucide-react';
import { cardBase, primaryBtn, ghostBtn, successBtn, dangerBtn } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce';
import ErrorCard from '../../components/ErrorCard';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { BBListSkeleton } from '../../components/bloodbank/BBSkeleton';

const STATUS_COLOR = {
    'Scheduled': '#9B9BA4',
    'Confirmed': '#3B82F6',
    'Fulfilled': '#22C55E',
    'Cancelled': '#EF4444'
};

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'primary', loading }) {
    if (!isOpen) return null;
    const colors = {
        primary: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', btn: '#3B82F6', icon: <CheckCircle size={28} color="#3B82F6" /> },
        success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', btn: '#22C55E', icon: <Droplets size={28} color="#22C55E" /> },
        danger: { bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.3)', btn: '#D90025', icon: <XCircle size={28} color="#D90025" /> }
    };
    const c = colors[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                    style={{ background: '#0F0F17', border: `1px solid ${c.border}`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        {c.icon}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 12 }}>{title}</h3>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 0', color: '#fff', fontFamily: 'var(--font-space)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>CANCEL</button>
                        <button onClick={onConfirm} disabled={loading} style={{ flex: 1, background: c.btn, border: 'none', borderRadius: 12, padding: '12px 0', color: '#fff', fontFamily: 'var(--font-space)', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <Clock size={14} className="spin" /> : 'CONFIRM'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function BloodBankAppointments() {
    const { showExpiryModal } = useAuth();
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [bloodGroup, setBloodGroup] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const debouncedSearch = useDebounce(search, 500);

    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: null, name: '' });
    
    const filters = {
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(bloodGroup !== 'All' && { blood_group: bloodGroup }),
        ...(dateFilter === 'Today' && { date: new Date().toISOString().split('T')[0] }),
        ...(dateFilter === 'Tomorrow' && { date: new Date(Date.now() + 86400000).toISOString().split('T')[0] })
    };

    const { data: appointments, loading, error, refetch } = useFetch(
        bloodBankService.getAppointments, 
        filters,
        [statusFilter, bloodGroup, dateFilter]
    );

    const filteredAppointments = (appointments || []).filter(a => 
        a.donor_name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const { execute: updateStatus, loading: updating } = useApi(bloodBankService.updateAppointmentStatus);

    const handleConfirmUpdate = async () => {
        try {
            await updateStatus(confirmModal.id, confirmModal.status);
            toast.success(`Appointment ${confirmModal.status}`);
            setConfirmModal({ open: false, id: null, status: null, name: '' });
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 28, color: '#fff' }}>Donor Appointments</h1>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', marginTop: 4 }}>Manage incoming donor visits</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Scheduled', 'Confirmed', 'Fulfilled', 'Cancelled'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setStatusFilter(s)}
                            style={{ 
                                background: statusFilter === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: `1px solid ${statusFilter === s ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                                fontFamily: 'var(--font-space)', fontSize: 11, color: statusFilter === s ? '#fff' : '#9B9BA4',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} color="#555" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search donors by name..."
                        style={{ 
                            width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
                            borderRadius: 12, padding: '10px 16px 10px 40px', color: '#fff', outline: 'none',
                            fontFamily: 'var(--font-dm)', fontSize: 14
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    {/* Blood Group Filter */}
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            style={{ 
                                appearance: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12, padding: '10px 36px 10px 16px', color: '#fff', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 14, minWidth: 100
                            }}
                        >
                            <option value="All" style={{ background: '#111' }}>ALL TYPES</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                <option key={bg} value={bg} style={{ background: '#111' }}>{bg}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} color="#555" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>

                    {/* Date Filter */}
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ 
                                appearance: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12, padding: '10px 36px 10px 16px', color: '#fff', cursor: 'pointer',
                                fontFamily: 'var(--font-dm)', fontSize: 14, minWidth: 120
                            }}
                        >
                            <option value="All" style={{ background: '#111' }}>ANY DATE</option>
                            <option value="Today" style={{ background: '#111' }}>TODAY</option>
                            <option value="Tomorrow" style={{ background: '#111' }}>TOMORROW</option>
                        </select>
                        <ChevronDown size={14} color="#555" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardBase, padding: 28 }}>
                {loading ? (
                    <BBListSkeleton rows={5} height={100} />
                ) : filteredAppointments.length === 0 ? (
                    <BBEmptyState 
                        icon={Calendar} 
                        title="No Appointments Found" 
                        subtitle={statusFilter === 'All' ? "No donor visits matching your filters." : `No appointments in '${statusFilter}' status.`} 
                    />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                        {filteredAppointments.map((appt) => (
                            <motion.div 
                                key={appt.appointment_id}
                                whileHover="hover"
                                style={{
                                    position: 'relative',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: 16,
                                    border: `1px solid ${STATUS_COLOR[appt.status]}40`,
                                    padding: 24, display: 'flex', flexDirection: 'column', gap: 16, 
                                    transition: 'all 0.3s ease', overflow: 'hidden',
                                    cursor: 'pointer'
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
                                        background: `linear-gradient(90deg, transparent, ${STATUS_COLOR[appt.status]}12, transparent)`,
                                        pointerEvents: 'none', zIndex: 0
                                    }}
                                />

                                {/* Inner Glow */}
                                <motion.div
                                    variants={{
                                        hover: { opacity: 1 }
                                    }}
                                    initial={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        boxShadow: `inset 0 0 20px ${STATUS_COLOR[appt.status]}10`,
                                        pointerEvents: 'none', zIndex: 0
                                    }}
                                />

                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{appt.donor_name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 12, color: '#D90025' }}>{appt.blood_group}</span>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4' }}>{appt.total_donations} previous donations</span>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 10px', borderRadius: 8, fontSize: 10, fontFamily: 'var(--font-space)', fontWeight: 700,
                                        background: `${STATUS_COLOR[appt.status]}15`, color: STATUS_COLOR[appt.status], border: `1px solid ${STATUS_COLOR[appt.status]}30`
                                    }}>
                                        {appt.status.toUpperCase()}
                                    </div>
                                </div>

                                <div style={{ background: '#14141E', borderRadius: 14, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <Calendar size={10} color="#9B9BA4" />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', textTransform: 'uppercase' }}>Date</span>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{formatDate(appt.appointment_date)}</div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <Clock size={10} color="#9B9BA4" />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', textTransform: 'uppercase' }}>Time</span>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{appt.appointment_time}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <Phone size={10} color="#9B9BA4" />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', textTransform: 'uppercase' }}>Contact</span>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{appt.donor_phone}</div>
                                    </div>
                                </div>

                                {appt.status !== 'Fulfilled' && appt.status !== 'Cancelled' && (
                                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                                        {appt.status === 'Scheduled' && (
                                            <motion.button 
                                                whileHover={{ scale: 1.02, background: 'rgba(59,130,246,0.15)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setConfirmModal({ open: true, id: appt.appointment_id, status: 'Confirmed', name: appt.donor_name })}
                                                style={{ 
                                                    flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                                                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                                                    fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#3B82F6',
                                                    transition: 'all 0.2s', letterSpacing: '0.05em'
                                                }}
                                            >
                                                CONFIRM
                                            </motion.button>
                                        )}
                                        {appt.status === 'Confirmed' && (
                                            <motion.button 
                                                whileHover={{ scale: 1.02, background: 'rgba(34,197,94,0.15)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setConfirmModal({ open: true, id: appt.appointment_id, status: 'Fulfilled', name: appt.donor_name })}
                                                style={{ 
                                                    flex: 2, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                                                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                                    fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#22C55E',
                                                    transition: 'all 0.2s', letterSpacing: '0.05em'
                                                }}
                                            >
                                                FULFILLED
                                            </motion.button>
                                        )}
                                        <motion.button 
                                            whileHover={{ scale: 1.02, background: 'rgba(217,0,37,0.15)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setConfirmModal({ open: true, id: appt.appointment_id, status: 'Cancelled', name: appt.donor_name })}
                                            style={{ 
                                                flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                                                background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)',
                                                fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#D90025',
                                                transition: 'all 0.2s', letterSpacing: '0.05em'
                                            }}
                                        >
                                            CANCEL
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            <ConfirmModal 
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null, status: null, name: '' })}
                onConfirm={handleConfirmUpdate}
                loading={updating}
                title={
                    confirmModal.status === 'Confirmed' ? 'Confirm Visit?' :
                    confirmModal.status === 'Fulfilled' ? 'Donation Completed?' :
                    'Cancel Appointment?'
                }
                message={
                    confirmModal.status === 'Confirmed' ? `Are you sure you want to confirm ${confirmModal.name}'s visit? This will notify the donor.` :
                    confirmModal.status === 'Fulfilled' ? `Has ${confirmModal.name} successfully donated? This will update the blood stock and donor history.` :
                    `Are you sure you want to cancel the appointment for ${confirmModal.name}? This action cannot be undone.`
                }
                type={
                    confirmModal.status === 'Confirmed' ? 'primary' :
                    confirmModal.status === 'Fulfilled' ? 'success' :
                    'danger'
                }
            />
        </div>
    );
}
