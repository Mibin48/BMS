import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Phone, Clock, Building2, Users, X, Check, Loader2, 
    AlertCircle, Droplets, Calendar, ChevronRight, Search, 
    Heart, Info, ShieldCheck 
} from 'lucide-react';
import { donorService } from '../../services/donorService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

/* ─── Utils ────────────────────────────────────────────────────── */
const fmt = (dateStr, { short } = {}) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return short
        ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

/* ─── Standardized Booking Modal ────────────────────────────── */
function BookingModal({ bank, onClose }) {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleConfirm = async () => {
        if (!date || !time) return;
        setLoading(true);
        try {
            const formattedDate = date.toISOString().split('T')[0];
            await donorService.bookAppointment({
                bank_id: bank.bank_id,
                date: formattedDate,
                time: time,
                notes: `Slot booked at ${time}`
            });
            setDone(true);
            toast.success('Appointment scheduled!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="var(--text3)" />
                </button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Check size={36} color="#22C55E" />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', marginBottom: 8 }}>Confirmed!</h2>
                        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>{bank?.bank_name}</p>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', background: 'rgba(217,0,37,0.08)', display: 'inline-block', padding: '8px 20px', borderRadius: 100, marginBottom: 32 }}>
                            {date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {time}
                        </div>
                        <button onClick={onClose} style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: '#fff' }}>
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(217,0,37,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={18} color="var(--red)" />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff', lineHeight: 1 }}>Book Slot</h2>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{bank?.bank_name}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>SELECT DATE</div>
                            <div className="no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                                {days.map((d, i) => {
                                    const isSelected = date?.toDateString() === d.toDateString();
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setDate(d)} 
                                            style={{
                                                flexShrink: 0, width: 60, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                                                background: isSelected ? 'var(--red)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${isSelected ? 'var(--red)' : 'rgba(255,255,255,0.06)'}`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: isSelected ? '#fff' : 'var(--text3)' }}>
                                                {d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>
                                                {d.getDate()}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 36 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>SELECT TIME</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {TIME_SLOTS.map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setTime(t)} 
                                        style={{
                                            padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                                            background: time === t ? 'var(--red)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${time === t ? 'var(--red)' : 'rgba(255,255,255,0.06)'}`,
                                            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                                            color: time === t ? '#fff' : 'var(--text2)', transition: 'all 0.2s'
                                        }}
                                    >
                                        {t.replace(':00 ', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} disabled={loading} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button 
                                onClick={handleConfirm} 
                                disabled={!date || !time || loading} 
                                style={{
                                    flex: 2, background: date && time ? 'var(--red)' : 'rgba(255,255,255,0.05)',
                                    border: 'none', borderRadius: 10, padding: '13px 0', cursor: date && time ? 'pointer' : 'not-allowed',
                                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: date && time ? '#fff' : 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                {loading ? <Loader2 size={16} className="spin" /> : 'Confirm Slot'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function DonorSchedule() {
    const navigate = useNavigate();
    const { showExpiryModal } = useAuth();
    const [tab, setTab] = useState('bank');
    const [bookingBank, setBookingBank] = useState(null);
    const [eligibility, setElig] = useState(null);
    const [banks, setBanks] = useState([]);
    const [appointments, setAppts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apptStatus, setApptStatus] = useState('All');
    const [camps, setCamps] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const init = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [eligRes, banksRes, apptsRes, campsRes] = await Promise.all([
                donorService.getEligibility(),
                donorService.getBloodBanks({ limit: 50, status: 'Active' }),
                donorService.getAppointments(),
                donorService.getAvailableCamps()
            ]);
            setElig(eligRes.data.data);
            setBanks(banksRes.data?.data?.banks || []);
            setAppts(apptsRes.data.data.appointments || []);
            setCamps(campsRes.data.data || []);
        } catch (err) {
            if (!showExpiryModal) toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { init(); }, []);

    const isEligible = eligibility?.status === 'Eligible';

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} color="var(--red)" className="spin" />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AnimatePresence>
                {bookingBank && (
                    <BookingModal bank={bookingBank} onClose={() => { setBookingBank(null); init(true); }} />
                )}
            </AnimatePresence>

            {/* ROW 1 Welcome Banner (Aligned with Dashboard) */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
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
                    fontFamily: 'var(--font-display)', fontSize: 180, color: 'rgba(217,0,37,0.06)',
                    lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                }}>
                    {isEligible ? 'GO' : 'WAIT'}
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
                        ◈ SCHEDULING UNIT
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', lineHeight: 1, marginBottom: 12 }}>
                        {isEligible ? 'Ready to help.' : 'Pending rest.'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: isEligible ? '#22c55e' : 'var(--text3)' }}>
                        {isEligible 
                            ? '🟢 You are eligible. Choose a facility below.' 
                            : eligibility?.status === 'Cooling' 
                                ? `🟡 Rest active. Eligible in ${eligibility.days_remaining} days.`
                                : '🔴 Check your health records for status.'}
                    </div>
                </div>
            </motion.div>

            {/* TAB Navigation (Dashboard Style) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', flex: 1 }}>
                    {[
                        { id: 'bank', label: 'Blood Banks' },
                        { id: 'camps', label: 'Donation Camps' },
                        { id: 'my', label: 'My Appointments' }
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                            color: tab === t.id ? '#fff' : 'var(--text3)',
                            padding: '16px 24px', letterSpacing: '0.1em',
                            borderBottom: tab === t.id ? '2px solid var(--red)' : '2px solid transparent',
                            marginBottom: -1, transition: 'all 0.2s', textTransform: 'uppercase'
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>
                
                {tab !== 'my' && (
                    <div style={{ position: 'relative', width: 260, marginBottom: 8 }}>
                        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" placeholder="Search by city..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 10, padding: '10px 12px 10px 36px', color: '#fff', 
                                fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none'
                            }} 
                        />
                    </div>
                )}
            </div>

            {/* Content Logic */}
            <AnimatePresence mode="wait">
                {tab === 'bank' ? (
                    <motion.div key="banks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                            {banks
                                .filter(b => b.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.city.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(bank => (
                                <motion.div key={bank.bank_id}
                                    whileHover={{ y: -4, borderColor: 'rgba(217,0,37,0.3)' }}
                                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.2s' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 size={20} color="var(--red)" />
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Facility</div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bank.bank_name}</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>{bank.city}</div>
                                    
                                    <button 
                                        onClick={() => isEligible && setBookingBank(bank)} 
                                        disabled={!isEligible}
                                        style={{ 
                                            width: '100%', background: isEligible ? 'var(--red)' : 'rgba(255,255,255,0.05)', 
                                            border: 'none', borderRadius: 10, padding: '13px 0', 
                                            cursor: isEligible ? 'pointer' : 'not-allowed', 
                                            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, 
                                            color: isEligible ? '#fff' : 'var(--text3)', transition: 'all 0.2s' 
                                        }}
                                    >
                                        {isEligible ? 'Book Slot' : 'Not Eligible'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : tab === 'camps' ? (
                    <motion.div key="camps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {camps
                                .filter(c => c.camp_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(camp => {
                                const isGoing = camp.my_rsvp === 'Going';
                                return (
                                    <div key={camp.camp_id} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                            <div style={{ width: 44, height: 44, background: 'rgba(217,0,37,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Heart size={20} color="var(--red)" fill="var(--red)" />
                                            </div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>{camp.camp_name}</div>
                                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>{camp.city}</div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>{fmt(camp.camp_date)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => !isGoing && isEligible && donorService.rsvpToCamp(camp.camp_id, { status: 'Going' }).then(() => init(true))} 
                                            disabled={!isEligible || isGoing}
                                            style={{ 
                                                background: isGoing ? 'rgba(34,197,94,0.1)' : (isEligible ? '#fff' : 'rgba(255,255,255,0.05)'), 
                                                border: isGoing ? '1px solid rgba(34,197,94,0.3)' : 'none', 
                                                borderRadius: 10, padding: '12px 32px',
                                                cursor: isEligible && !isGoing ? 'pointer' : 'not-allowed', 
                                                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, 
                                                color: isGoing ? '#22c55e' : (isEligible ? '#111' : 'var(--text3)'), 
                                                transition: 'all 0.2s' 
                                            }}
                                        >
                                            {isGoing ? '✓ RSVP' : (isEligible ? 'Participate' : 'Status Locked')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="my" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {['All', 'Scheduled', 'Fulfilled', 'Cancelled'].map(s => (
                                <button key={s} onClick={() => setApptStatus(s)} style={{ 
                                    background: apptStatus === s ? 'rgba(217,0,37,0.1)' : 'transparent',
                                    border: apptStatus === s ? '1px solid rgba(217,0,37,0.3)' : '1px solid transparent',
                                    borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)', fontSize: 10, color: apptStatus === s ? 'var(--red)' : 'var(--text3)',
                                    transition: 'all 0.2s', fontWeight: 700
                                }}>
                                    {s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {appointments
                                .filter(a => apptStatus === 'All' || a.status === apptStatus)
                                .map(appt => {
                                    const sc = {
                                        Scheduled: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
                                        Confirmed: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6' },
                                        Fulfilled: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
                                        Cancelled: { bg: 'rgba(217,0,37,0.1)', text: 'var(--red)' }
                                    }[appt.status] || { bg: 'rgba(255,255,255,0.05)', text: 'var(--text3)' };
                                    
                                    return (
                                        <div key={appt.appointment_id} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, textAlign: 'center', minWidth: 64 }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{new Date(appt.appointment_date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</div>
                                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff' }}>{new Date(appt.appointment_date).getDate()}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>{appt.bank_name}</div>
                                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{appt.appointment_time}</div>
                                                        <div style={{ background: sc.bg, borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: sc.text, fontWeight: 700 }}>{appt.status.toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {appt.status === 'Scheduled' && (
                                                <button 
                                                    onClick={async () => { if (window.confirm('Cancel this?')) { await donorService.cancelAppointment(appt.appointment_id); init(); } }}
                                                    style={{ background: 'none', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '8px 16px', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                                >CANCEL</button>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
