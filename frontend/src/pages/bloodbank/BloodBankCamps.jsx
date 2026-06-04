import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Calendar, MapPin, Building2, Users, Loader2, 
    MoreVertical, Trash2, Edit2, CheckCircle, Clock, X, AlertCircle, TrendingUp, Info
} from 'lucide-react';
import { bloodBankService } from '../../services/bloodBankService';
import toast from 'react-hot-toast';
import BBSkeleton, { BBStatSkeleton } from '../../components/bloodbank/BBSkeleton.jsx';

function fmt(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Stat Card Helper ───
const CampStat = ({ label, value, icon: Icon, color }) => (
    <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 200px', minWidth: 'min(100%, 200px)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
        </div>
        <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', fontWeight: 600 }}>{value}</div>
        </div>
    </div>
);

export default function BloodBankCamps() {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [rsvps, setRSVPs] = useState([]);
    const [rsvpsLoading, setRsvpsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        camp_name: '', 
        camp_date: '', 
        location: '', 
        city: 'Ernakulam', 
        description: '', 
        start_time: '09:00', 
        end_time: '16:00'
    });

    const KERALA_DISTRICTS = [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 
        'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 
        'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ];

    const HOURS = Array.from({ length: 24 }, (_, i) => ({
        label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`,
        value: `${String(i).padStart(2, '0')}:00`
    }));

    const fetchCamps = async () => {
        setLoading(true);
        try {
            const res = await bloodBankService.getCamps();
            setCamps(res.data.data);
        } catch (err) {
            toast.error('Failed to load camps');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCamps(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Backend expects start_time, end_time as strings
            await bloodBankService.createCamp(formData);
            toast.success('Camp scheduled successfully!');
            setShowModal(false);
            setFormData({ camp_name: '', camp_date: '', location: '', city: 'Ernakulam', description: '', start_time: '09:00', end_time: '16:00' });
            fetchCamps();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create camp');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this drive?')) return;
        setIsDeleting(id);
        try {
            await bloodBankService.deleteCamp(id);
            toast.success('Camp deleted');
            fetchCamps();
        } catch (err) {
            toast.error('Failed to delete');
        } finally {
            setIsDeleting(null);
        }
    };

    const viewRSVPs = async (camp) => {
        setSelectedCamp(camp);
        setRSVPs([]); // Clear old list
        setRsvpsLoading(true);
        try {
            const res = await bloodBankService.getCampRSVPs(camp.camp_id);
            setRSVPs(res.data.data);
        } catch (err) {
            // toast.error('Failed to load RSVPs');
        } finally {
            setRsvpsLoading(false);
        }
    };

    // Derived stats
    const upcomingCamps = camps.filter(c => new Date(c.camp_date) >= new Date()).length;
    const totalRSVPs = camps.reduce((s, c) => s + (c.rsvp_count || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, color: '#fff', margin: 0 }}>Donation Camps</h1>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>Organize external blood donation drives and manage donor registrations.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, boxShadow: '0 4px 14px rgba(217,0,37,0.3)' }}
                >
                    <Plus size={18} /> Schedule New Camp
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ flex: '1 1 200px', minWidth: 'min(100%, 200px)' }}>
                            <BBStatSkeleton delay={i * 0.05} />
                        </div>
                    ))
                ) : (
                    <>
                        <CampStat label="Total Scheduled" value={camps.length} icon={Calendar} color="var(--red)" />
                        <CampStat label="Upcoming Drives" value={upcomingCamps} icon={Clock} color="#3b82f6" />
                        <CampStat label="Total Registrations" value={totalRSVPs} icon={Users} color="#22c55e" />
                        <CampStat label="Fulfillment Goal" value="85%" icon={TrendingUp} color="#f59e0b" />
                    </>
                )}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, height: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <BBSkeleton width="48px" height="48px" borderRadius="12px" />
                                <div style={{ flex: 1 }}>
                                    <BBSkeleton width="60%" height="16px" style={{ marginBottom: 6 }} />
                                    <BBSkeleton width="40%" height="12px" />
                                </div>
                            </div>
                            <BBSkeleton width="100%" height="60px" borderRadius="12px" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                                <BBSkeleton width="80%" height="12px" />
                                <BBSkeleton width="120%" height="12px" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                                <BBSkeleton width="80px" height="12px" />
                                <BBSkeleton width="60px" height="12px" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : camps.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '80px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <Calendar size={48} color="var(--text3)" style={{ marginBottom: 16, opacity: 0.2 }} />
                    <h3 style={{ fontFamily: 'var(--font-sub)', color: '#fff', fontSize: 18, marginBottom: 8 }}>Ready to start a drive?</h3>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)', fontSize: 14, maxWidth: 300, margin: '0 auto 24px' }}>Camps help you reach donors outside the bank premises.</p>
                    <button onClick={() => setShowModal(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-sub)', fontWeight: 600 }}>Create First Camp</button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {camps.map(camp => (
                        <motion.div key={camp.camp_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 0, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ background: 'linear-gradient(rgba(217,0,37,0.05), transparent)', height: 80, borderBottom: '1px solid rgba(255,255,255,0.03)' }} />
                            
                            <div style={{ padding: 24, marginTop: -40 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#161622', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={20} color="var(--red)" />
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => viewRSVPs(camp)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, cursor: 'pointer' }} title="View Donors"><Users size={14} /></button>
                                        <button onClick={() => handleDelete(camp.camp_id)} disabled={isDeleting === camp.camp_id} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', color: 'var(--red)', borderRadius: 8, cursor: 'pointer', opacity: isDeleting === camp.camp_id ? 0.5 : 1 }} title="Delete Drive">{isDeleting === camp.camp_id ? <Loader2 size={12} className="spin" /> : <Trash2 size={14} />}</button>
                                    </div>
                                </div>
                                
                                <h3 style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>{camp.camp_name}</h3>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{camp.description || 'General donation drive for collective support.'}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}><Calendar size={13} color="var(--red)" /> {fmt(camp.camp_date)}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}><MapPin size={13} color="var(--red)" /> {camp.location}, {camp.city}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}><Clock size={13} color="var(--red)" /> {camp.start_time?.slice(0,5)} – {camp.end_time?.slice(0,5)}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: '#1A1A27', border: '2px solid #0F0F17', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--text3)', marginLeft: i > 0 ? -8 : 0 }}>{['A','B','O'][i]}</div>
                                            ))}
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{camp.rsvp_count || 0} RSVPs</span>
                                    </div>
                                    <span style={{ background: camp.status === 'Scheduled' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', border: '1px solid currentColor', borderRadius: 100, padding: '3px 12px', fontFamily: 'var(--font-mono)', fontSize: 9, color: camp.status === 'Scheduled' ? '#3b82f6' : '#22c55e', letterSpacing: '0.05em' }}>{camp.status.toUpperCase()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal - RE-STRUCTURED FOR RESPONSIVENESS */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: '#09090D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: '560px', maxHeight: '95vh', overflowY: 'auto' }}>
                            <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', margin: 0 }}>Schedule Drive</h2>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text3)', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8, letterSpacing: '0.05em' }}>CAMP NAME</label>
                                        <input required value={formData.camp_name} onChange={e => setFormData({...formData, camp_name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none' }} placeholder="e.g. KV Nagar Community Drive" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>DATE</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Calendar size={14} color="var(--red)" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
                                            <input required type="date" value={formData.camp_date} onChange={e => setFormData({...formData, camp_date: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px 12px 38px', color: '#fff', outline: 'none', colorScheme: 'dark' }} min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                            {[
                                                { label: 'Tmrw', d: 1 },
                                                { label: '7d', d: 7 },
                                                { label: '14d', d: 14 }
                                            ].map(q => (
                                                <button key={q.label} type="button" onClick={() => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + q.d);
                                                    setFormData({ ...formData, camp_date: d.toISOString().split('T')[0] });
                                                }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', fontSize: 10, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,0,37,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>+{q.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>CITY (DISTRICT)</label>
                                        <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none', cursor: 'pointer' }}>
                                            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>START TIME</label>
                                        <select required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none', cursor: 'pointer' }}>
                                            {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>END TIME</label>
                                        <select required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none', cursor: 'pointer' }}>
                                            {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>EXACT LOCATION</label>
                                        <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none' }} placeholder="e.g. Community Center Hall A" />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>DESCRIPTION / DRIVE NOTES</label>
                                        <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', outline: 'none', resize: 'none' }} placeholder="Add landmarks or volunteer instructions..." />
                                    </div>
                                </div>
                                <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', marginTop: 12, cursor: 'pointer', fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>Schedule Drive & Notify Donors</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RSVPs Drawer/Modal - IMPROVED WITH SCROLLBAR AND MOCK DATA FALLBACK */}
            <AnimatePresence>
                {selectedCamp && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.target === e.currentTarget && setSelectedCamp(null)}>
                        <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} style={{ background: '#09090D', borderLeft: '1px solid rgba(255,255,255,0.1)', height: '100%', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column' }}>
                             <div style={{ padding: 40, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', margin: 0 }}>Donor RSVPs</h2>
                                    <button onClick={() => setSelectedCamp(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={20} /></button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ background: 'var(--red)', width: 6, height: 6, borderRadius: '50%' }} />
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'var(--text3)', margin: 0 }}>{selectedCamp.camp_name}</p>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 40 }} className="custom-scroll">
                                {rsvpsLoading ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <BBSkeleton width="50%" height="16px" style={{ marginBottom: 8 }} />
                                                    <BBSkeleton width="30%" height="12px" />
                                                </div>
                                                <BBSkeleton width="60px" height="24px" borderRadius="100px" />
                                            </div>
                                        ))}
                                    </div>
                                ) : rsvps.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <AlertCircle size={48} color="var(--text3)" style={{ opacity: 0.1, marginBottom: 16 }} />
                                        <h4 style={{ color: '#fff', marginBottom: 8 }}>No Live Registrations</h4>
                                        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24 }}>Once donors "Join" this camp from their portal, they will appear here.</p>
                                        
                                        {/* Mock Visualization Block */}
                                        <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'rgba(255,255,255,0.4)' }}>
                                                <Info size={14} />
                                                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>EXAMPLE VIEW</span>
                                            </div>
                                            {[
                                                { name: 'Dr. Arjun Varma', blood: 'B+', loc: 'Kochi', status: 'GOING' },
                                                { name: 'Sarah Joseph', blood: 'O-', loc: 'Kochi', status: 'GOING' },
                                                { name: 'Manoj Kumar', blood: 'A+', loc: 'Ernakulam', status: 'DECLINED' },
                                                { name: 'Priya Nair', blood: 'AB-', loc: 'Kochi', status: 'GOING' },
                                                { name: 'Rahul R', blood: 'B-', loc: 'Aluva', status: 'GOING' }
                                            ].map((m, i, arr) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: i > 2 ? 0.3 : 0.5 }}>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{m.name}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.blood} • {m.loc}</div>
                                                    </div>
                                                    <span style={{ border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '2px 8px', fontSize: 9, color: '#22c55e' }}>{m.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{rsvps.length} DONORS REGISTERED</div>
                                        {rsvps.map(r => (
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={r.rsvp_id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16, color: '#fff' }}>{r.donor_name}</div>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>{r.blood_group}</span>
                                                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{r.city}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '3px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e', fontWeight: 600 }}>{r.status.toUpperCase()}</span>
                                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>{timeAgo(r.created_at)}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                <button style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontFamily: 'var(--font-sub)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelectedCamp(null)}>Close View</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatDate(date);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
