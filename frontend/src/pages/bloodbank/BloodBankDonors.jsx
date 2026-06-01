import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, ChevronRight, Radio, UserPlus, Eye, X, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBStatCard from '../../components/bloodbank/BBStatCard';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import BBModal, { BBModalFooter } from '../../components/bloodbank/BBModal';
import { cardBase, inputStyle, selectStyle, labelStyle, primaryBtn, ghostBtn } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import Pagination from '../../components/Pagination';
import { InlineLoader } from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import BBSkeleton, { BBStatSkeleton, BBListSkeleton } from '../../components/bloodbank/BBSkeleton';
import { useAuth } from '../../context/AuthContext.jsx';


function initials(name) { return name ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?'; }

const KERALA = ['Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function BloodBankDonors() {
    const { showExpiryModal } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [eligibility, setEligibility] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 12;
    const [showRegister, setShowRegister] = useState(false);
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [showRecall, setShowRecall] = useState(false);
    const [showDetail, setShowDetail] = useState(null);

    const fetchParams = { limit, offset, search: search || undefined, eligibility: eligibility || undefined };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getDonors, fetchParams, [search, eligibility, offset]);

    const donors = result?.donors || [];
    const stats = result?.stats || {};
    const total = result?.total || 0;

    if (error && !showExpiryModal) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <BBStatSkeleton key={i} />)
                    ) : (
                        <>
                            <BBStatCard icon={Users} label="TOTAL DONORS" value={String(stats.total ?? total)} color="white" />
                            <BBStatCard icon={Users} label="READY TO DONATE" value={String(stats.eligible ?? 0)} sub="Eligible donors" color="green" />
                            <BBStatCard icon={Users} label="ON HOLD" value={`${stats.cooling ?? 0} / ${stats.deferred ?? 0}`} sub="Cooling / Deferred" color="amber" />
                        </>
                    )}
                </div>


                {/* Header + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 360 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A4A55' }} />
                            <input value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }} placeholder="Search donors..."
                                style={{ ...inputStyle, paddingLeft: 36 }}
                                onFocus={e => { e.target.style.borderColor = 'rgba(217,0,37,0.50)'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }} />
                        </div>
                        <select value={eligibility} onChange={e => { setEligibility(e.target.value); setOffset(0); }} style={{ ...selectStyle, width: 'auto', minWidth: 120 }}>
                            <option value="">All Status</option>
                            <option value="Eligible">Eligible</option>
                            <option value="Cooling">Cooling Period</option>
                            <option value="Deferred">Deferred</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowRecall(true)} style={{ ...ghostBtn, gap: 6 }}><Radio size={14} /> RECALL</button>
                        <button onClick={() => setShowGlobalSearch(true)} style={{ ...ghostBtn, gap: 6 }}><Search size={14} /> FIND GLOBAL DONOR</button>
                        <button onClick={() => setShowRegister(true)} style={primaryBtn}><UserPlus size={14} /> REGISTER DONOR</button>
                    </div>
                </div>

                {/* Donor List */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardBase, padding: 28 }}>
                    {loading ? (
                        <BBListSkeleton rows={12} height={72} />
                    ) : donors.length === 0 ? (

                        <BBEmptyState icon={Users} title="No donors found" subtitle="Register a new donor to get started" action={() => setShowRegister(true)} actionLabel="+ REGISTER DONOR" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {donors.map(d => {
                                const status = d.current_eligibility || 'Eligible';
                                const statusColor = 
                                    status === 'Eligible' ? '#22c55e' : 
                                    status === 'Cooling' ? '#f59e0b' : 
                                    '#D90025'; // Deferred
                                
                                return (
                                    <motion.div 
                                        key={d.donor_id}
                                        onClick={() => setShowDetail(d.donor_id)}
                                        whileHover="hover"
                                        style={{
                                            position: 'relative', overflow: 'hidden',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: 16, border: `1px solid ${statusColor}40`,
                                            boxShadow: `inset 0 0 12px ${statusColor}10`,
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '14px 16px', cursor: 'pointer',
                                            transition: 'all 0.3s ease'
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
                                                background: `linear-gradient(90deg, transparent, ${statusColor}15, transparent)`,
                                                pointerEvents: 'none', zIndex: 0
                                            }}
                                        />
                                        
                                        {/* Avatar */}
                                        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#14141E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{initials(d.name)}</div>
                                            <span style={{
                                                position: 'absolute', bottom: -2, right: -2,
                                                fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 8,
                                                padding: '1px 5px', borderRadius: 4,
                                                background: d.blood_group?.includes('-') ? '#D90025' : '#1A1A26',
                                                color: '#fff', border: d.blood_group?.includes('-') ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                            }}>{d.blood_group}</span>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{d.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#4A4A55', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} />{d.phone}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.05)' }}>·</span>
                                                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{d.city}</span>
                                            </div>
                                        </div>

                                        {/* Eligibility */}
                                        <BBStatusBadge status={status} size="sm" />

                                        {/* Donation info */}
                                        <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: 4 }}>
                                            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1 }}>{d.donations_to_this_bank ?? 0}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', marginTop: 4, textTransform: 'uppercase' }}>
                                                {d.days_since_donation !== null ? `${d.days_since_donation}d ago` : 'No history'}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} color="rgba(255,255,255,0.1)" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />


            {/* ── REGISTER MODAL ──────────────────────────── */}
            <AnimatePresence>
                {showRegister && <RegisterDonorModal onClose={() => setShowRegister(false)} onCreated={() => { setShowRegister(false); refetch(); }} />}
            </AnimatePresence>

            {/* ── GLOBAL SEARCH MODAL ───────────────────────── */}
            <AnimatePresence>
                {showGlobalSearch && <FindGlobalDonorModal onClose={() => setShowGlobalSearch(false)} onCreated={() => { setShowGlobalSearch(false); refetch(); }} />}
            </AnimatePresence>

            {/* ── RECALL MODAL ────────────────────────────── */}
            <AnimatePresence>
                {showRecall && <RecallDonorsModal onClose={() => setShowRecall(false)} />}
            </AnimatePresence>

            {/* ── DONOR DETAIL MODAL ──────────────────────── */}
            <AnimatePresence>
                {showDetail && <DonorDetailModal donorId={showDetail} onClose={() => setShowDetail(null)} navigate={navigate} />}
            </AnimatePresence>
        </div>
    );
}

/* ────────────── REGISTER DONOR ────────────── */
function RegisterDonorModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', blood_group: '', gender: 'Male', city: '', address: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.blood_group || !form.age) { toast.error('Name, phone, age and blood group required'); return; }
        setSaving(true);
        try { await bloodBankService.createDonor(form); toast.success('Donor registered!'); onCreated(); }
        catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
        finally { setSaving(false); }
    };

    return (
        <BBModal onClose={onClose} title="Register Donor" subtitle="Add a new donor to your blood bank" icon={UserPlus} maxWidth={520}>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="John Doe" /></div>
                <div><label style={labelStyle}>Phone *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+91 ..." /></div>
                <div><label style={labelStyle}>Age *</label><input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} style={inputStyle} placeholder="25" /></div>
                <div><label style={labelStyle}>Email (Optional)</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="john@…" /></div>
                <div>
                    <label style={labelStyle}>Blood Group *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {BLOOD.map(g => (
                            <button key={g} onClick={() => setForm(f => ({ ...f, blood_group: g }))}
                                style={{
                                    padding: '6px 10px', borderRadius: 10, fontFamily: 'var(--font-space)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                                    background: form.blood_group === g ? (g.includes('-') ? 'rgba(217,0,37,0.20)' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${form.blood_group === g ? (g.includes('-') ? 'rgba(217,0,37,0.40)' : 'rgba(255,255,255,0.30)') : 'rgba(255,255,255,0.08)'}`,
                                    color: form.blood_group === g ? (g.includes('-') ? '#D90025' : '#fff') : '#9B9BA4',
                                }}>{g}</button>
                        ))}
                    </div>
                </div>
                <div><label style={labelStyle}>Gender</label><select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={selectStyle}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div><label style={labelStyle}>City</label><select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={selectStyle}><option value="">Select city</option>{KERALA.map(c => <option key={c}>{c}</option>)}</select></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Address</label><textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ ...inputStyle, resize: 'none', minHeight: 60 }} placeholder="Full address..." /></div>
            </div>
            <BBModalFooter>
                <button onClick={onClose} style={ghostBtn}>CANCEL</button>
                <button onClick={handleSubmit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.5 : 1 }}>{saving ? <><InlineLoader /> SAVING...</> : <><UserPlus size={14} /> REGISTER</>}</button>
            </BBModalFooter>
        </BBModal>
    );
}

/* ────────────── RECALL DONORS ─────────────── */
function RecallDonorsModal({ onClose }) {
    const [form, setForm] = useState({ blood_group: '', city: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleRecall = async () => {
        setSending(true);
        try { const res = await bloodBankService.recallDonors(form); toast.success(res.data?.message || 'Recall sent!'); onClose(); }
        catch (err) { toast.error(err.response?.data?.message || 'Recall failed'); }
        finally { setSending(false); }
    };

    return (
        <BBModal onClose={onClose} title="Recall Donors" subtitle="Notify eligible donors via SMS" icon={Radio} maxWidth={480}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label style={labelStyle}>Blood Group <span style={{ color: '#4A4A55' }}>(optional)</span></label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {['', ...BLOOD].map(g => (
                            <button key={g} onClick={() => setForm(f => ({ ...f, blood_group: g }))}
                                style={{
                                    padding: '6px 12px', borderRadius: 12, fontFamily: 'var(--font-space)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                                    background: form.blood_group === g ? (g && g.includes('-') ? 'rgba(217,0,37,0.20)' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${form.blood_group === g ? (g && g.includes('-') ? 'rgba(217,0,37,0.40)' : 'rgba(255,255,255,0.30)') : 'rgba(255,255,255,0.08)'}`,
                                    color: form.blood_group === g ? (g && g.includes('-') ? '#D90025' : '#fff') : '#9B9BA4',
                                }}>{g || 'All'}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>City <span style={{ color: '#4A4A55' }}>(optional)</span></label>
                    <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={selectStyle}><option value="">All cities</option>{KERALA.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                {/* Preview */}
                <div style={{ background: '#14141E', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4' }}>
                        Will notify <span style={{ color: '#fff', fontWeight: 600 }}>all eligible donors</span>
                        {form.blood_group && <span style={{ color: '#D90025', fontFamily: 'var(--font-space)', fontWeight: 700, margin: '0 4px' }}>{form.blood_group}</span>}
                        {form.city ? ` in ${form.city}` : ' across Kerala'}
                    </p>
                </div>
            </div>
            <BBModalFooter>
                <button onClick={onClose} style={ghostBtn}>CANCEL</button>
                <button onClick={handleRecall} disabled={sending} style={{ ...primaryBtn, opacity: sending ? 0.5 : 1 }}>{sending ? <><InlineLoader /> SENDING...</> : <><Radio size={14} /> SEND RECALL</>}</button>
            </BBModalFooter>
        </BBModal>
    );
}

/* ────────────── DONOR DETAIL ──────────────── */
function DonorDetailModal({ donorId, onClose, navigate }) {
    const { data: result, loading } = useFetch(() => bloodBankService.getDonorById(donorId), undefined, [donorId]);
    const donor = result?.donor;

    return (
        <BBModal onClose={onClose} title={donor?.name || 'Loading...'} subtitle={donor ? `${donor.blood_group} · ${donor.city}` : 'Accessing donor registry...'} icon={Eye} maxWidth={520}>
            <div style={{ padding: 24 }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{Array.from({ length: 4 }).map((_, i) => <BBSkeleton key={i} height="48px" borderRadius="12px" />)}</div>
                ) : donor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'PHONE', val: donor.phone },
                                { label: 'EMAIL', val: donor.email || '--' },
                                { label: 'BLOOD GROUP', val: donor.blood_group },
                                { label: 'GENDER', val: donor.gender },
                                { label: 'CITY', val: donor.city },
                                { label: 'ELIGIBILITY', val: donor.eligibility || 'Unknown' },
                            ].map(({ label, val }) => (
                                <div key={label} style={{ background: '#14141E', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#4A4A55', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff' }}>{val}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => { onClose(); navigate('/bloodbank/health-checks', { state: { donor } }); }} style={ghostBtn}>Schedule Health Check</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>Failed to retrieve donor records.</p>
                    </div>
                )}
            </div>
        </BBModal>
    );
}

/* ────────── FIND GLOBAL DONOR ────────── */
function FindGlobalDonorModal({ onClose, onCreated }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [linkingId, setLinkingId] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) { toast.error('Please enter name or phone number'); return; }
        setLoading(true);
        try {
            const isPhone = /^\+?[0-9\s-]{5,20}$/.test(query);
            const params = isPhone ? { phone: query.trim() } : { search: query.trim() };
            const res = await bloodBankService.searchGlobalDonors(params);
            setResults(res.data?.data || []);
            if ((res.data?.data || []).length === 0) {
                toast.error('No donors found in global registry');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async (donor_id) => {
        setLinkingId(donor_id);
        try {
            await bloodBankService.registerExistingDonor(donor_id);
            toast.success('Donor successfully linked!');
            // Refresh result state locally
            setResults(prev => prev.map(d => d.donor_id === donor_id ? { ...d, is_registered: 1 } : d));
            onCreated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to link donor');
        } finally {
            setLinkingId(null);
        }
    };

    return (
        <BBModal onClose={onClose} title="Find Global Donor" subtitle="Search global registry to link a donor to your bank" icon={Search} maxWidth={540}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A4A55' }} />
                        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or phone..."
                            style={{ ...inputStyle, paddingLeft: 36 }} />
                    </div>
                    <button type="submit" disabled={loading} style={{ ...primaryBtn, padding: '0 20px', height: 42 }}>
                        {loading ? 'SEARCHING...' : 'SEARCH'}
                    </button>
                </form>

                {/* Results list */}
                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                    {results.length > 0 ? (
                        results.map(d => (
                            <div key={d.donor_id} style={{
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.name}</p>
                                        <span style={{
                                            fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 9,
                                            padding: '1px 5px', borderRadius: 4, background: '#1A1A26', color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.15)'
                                        }}>{d.blood_group}</span>
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#4A4A55', marginTop: 4 }}>{d.phone} · {d.city}</p>
                                </div>

                                {d.is_registered ? (
                                    <span style={{
                                        fontFamily: 'var(--font-space)', fontSize: 9, fontWeight: 700,
                                        color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                        padding: '4px 8px', borderRadius: 8
                                    }}>LINKED</span>
                                ) : (
                                    <button onClick={() => handleLink(d.donor_id)} disabled={linkingId !== null}
                                        style={{ ...primaryBtn, fontSize: 10, padding: '6px 12px', height: 'auto', borderRadius: 8 }}>
                                        {linkingId === d.donor_id ? 'LINKING...' : 'LINK TO BANK'}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: '#4A4A55' }}>
                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13 }}>Enter a query to find donors across Kerala.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
            <BBModalFooter>
                <button onClick={onClose} style={ghostBtn}>CLOSE</button>
            </BBModalFooter>
        </BBModal>
    );
}
