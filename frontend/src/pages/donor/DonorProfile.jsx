import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Download, Heart } from 'lucide-react';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';
import { donorService } from '../../services/donorService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { SkeletonCard } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import { InlineLoader } from '../../components/LoadingSpinner';
import { formatDate, formatML } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const DISTRICTS = ['Ernakulam', 'Thiruvananthapuram', 'Thrissur', 'Kozhikode', 'Kannur', 'Alappuzha', 'Kottayam', 'Idukki', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Kasaragod', 'Wayanad', 'Kollam'];
const TABS = ['Personal Details', 'Account Settings'];

const NOTIFY_ROWS = [
    { key: 'donation', label: 'Donation Reminders', sub: 'Remind me before eligibility date', default: true },
    { key: 'eligibility', label: 'Eligibility Notifications', sub: 'Alert when I become eligible', default: true },
    { key: 'camps', label: 'Nearby Camp Alerts', sub: 'Notify about donation camps nearby', default: true },
    { key: 'whatsapp', label: 'WhatsApp Notifications', sub: 'Messages via WhatsApp', default: false },
    { key: 'sms', label: 'SMS Alerts', sub: 'Text message notifications', default: true },
];

function Toggle({ on, onChange }) {
    return (
        <div
            onClick={() => onChange(!on)}
            style={{
                width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                background: on ? 'var(--red)' : 'rgba(255,255,255,0.12)',
                position: 'relative', transition: 'background 0.3s', flexShrink: 0,
            }}
        >
            <div style={{
                position: 'absolute', top: 3, left: on ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }} />
        </div>
    );
}

export default function DonorProfile() {
    const { showExpiryModal } = useAuth();
    const { data: profile, loading, error, refetch } = useFetch(donorService.getProfile);
    const { execute: updateProfile, loading: saving } = useApi(donorService.updateProfile);

    const [tab, setTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bg, setBg] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [notifs, setNotifs] = useState(Object.fromEntries(NOTIFY_ROWS.map(r => [r.key, r.default])));

    // Pre-populate form when profile loads
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setAge(profile.age || '');
            setGender(profile.gender || '');
            setBg(profile.blood_group || '');
            setPhone(profile.phone || '');
            setCity(profile.city || '');
        }
    }, [profile]);

    const initials = (profile?.name || '--').split(' ').map(n => n[0]).join('');

    const handleSave = async () => {
        try {
            await updateProfile({ name, age: parseInt(age), gender, blood_group: bg, phone, city });
            toast.success('Profile updated!');
            setIsEditing(false);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 14,
        color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 20,
        transition: 'all 0.2s',
    };
    const focusStyle = (e) => {
        e.target.style.background = 'rgba(255,255,255,0.05)';
        e.target.style.borderColor = 'rgba(217,0,37,0.4)';
    };
    const blurStyle = (e) => {
        e.target.style.background = 'rgba(255,255,255,0.03)';
        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    };

    const labelStyle = {
        display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, fontWeight: 500
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <SkeletonCard height={200} />
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                <SkeletonCard height={400} />
                <SkeletonCard height={400} />
            </div>
        </div>
    );

    if (error && !showExpiryModal) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <ErrorCard message={error} onRetry={refetch} />
        </div>
    );

    const completeness = [name, age, gender, bg, phone, city].filter(Boolean).length;
    const completenessPct = Math.round((completeness / 6) * 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Profile Header - Premium Glassmorphism */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(20,20,30,0.8) 0%, rgba(10,10,15,0.9) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 40px',
                        display: 'flex', alignItems: 'center', gap: 40,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                    {/* Decorative Blob */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(217,0,37,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: 32,
                            background: 'linear-gradient(135deg, #D90025, #900018)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: 44, color: '#fff',
                            border: '4px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 15px 30px rgba(217,0,37,0.3)',
                            flexShrink: 0, letterSpacing: 2,
                        }}>
                            {initials}
                        </div>
                        <div style={{ 
                            position: 'absolute', bottom: -10, right: -10, 
                            background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)',
                            width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--red)', transition: 'all 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            <Edit2 size={18} />
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#fff', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {profile?.name || '--'}
                            </div>
                            <EligibilityBadge status={profile?.current_eligibility || 'Eligible'} />
                        </div>
                        
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '6px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>GROUP</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#fff', fontWeight: 700 }}>{profile?.blood_group || '--'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: '6px 16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,158,11,0.6)' }}>RANK</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
                                    {(profile?.total_donations ?? 0) >= 10 ? 'GOLD DONOR' : (profile?.total_donations ?? 0) >= 5 ? 'SILVER DONOR' : 'BRONZE DONOR'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 24, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 4 }}>DONOR ID</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff' }}>{profile?.donor_id || '--'}</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 4 }}>LOCATION</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{profile?.city || '--'}, Kerala</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 4 }}>TENURE</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{profile?.member_since ? `${new Date().getFullYear() - new Date(profile.member_since).getFullYear()} Years` : '--'}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: 140, textAlign: 'center' }}>
                         <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                             <svg width="80" height="80" viewBox="0 0 80 80">
                                 <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                 <circle cx="40" cy="40" r="36" fill="none" stroke="var(--red)" strokeWidth="6" 
                                    strokeDasharray={226} strokeDashoffset={226 - (226 * completenessPct) / 100}
                                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                             </svg>
                             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff' }}>
                                 {completenessPct}%
                             </div>
                         </div>
                         <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em' }}>PROFILE COMPLETE</div>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Tabs - Modern Minimal */}
                    <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 8px' }}>
                        {TABS.map((t, i) => (
                            <button key={t} onClick={() => setTab(i)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16,
                                color: tab === i ? '#fff' : 'var(--text3)',
                                padding: '16px 4px',
                                position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}>
                                {t}
                                {tab === i && (
                                    <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, background: 'var(--red)', borderRadius: '3px 3px 0 0' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === 0 ? (
                            <motion.div key="personal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 32 }}>
                                    {/* Personal Info Form */}
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.06)', 
                                        borderRadius: 24, padding: 40,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}>
                                        <div style={{ marginBottom: 32 }}>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 8 }}>Personal Information</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>Update your identity and contact preferences</div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={labelStyle}>FULL NAME</label>
                                                <input value={name} onChange={e => setName(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} style={inputStyle} placeholder="Full legal name" readOnly={!isEditing} />
                                            </div>

                                            <div>
                                                <NumberStepper 
                                                    label="AGE"
                                                    value={parseInt(age) || 18} 
                                                    onChange={v => setAge(String(v))}
                                                    min={18}
                                                    max={65}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>GENDER</label>
                                                <select 
                                                    value={gender} 
                                                    onChange={e => isEditing && setGender(e.target.value)} 
                                                    onMouseDown={e => !isEditing && e.preventDefault()}
                                                    onFocus={focusStyle} onBlur={blurStyle} 
                                                    style={{ ...inputStyle, cursor: 'default' }}
                                                >
                                                    {GENDERS.map(g => <option key={g} value={g} style={{ background: '#0A0A12' }}>{g}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <label style={labelStyle}>BLOOD GROUP</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                                                <button key={b} onClick={() => isEditing && setBg(b)} style={{
                                                    padding: '12px 0', borderRadius: 12, cursor: 'default',
                                                    background: bg === b ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${bg === b ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                                    fontFamily: 'var(--font-mono)', fontSize: 14, color: bg === b ? '#fff' : 'rgba(255,255,255,0.4)',
                                                    transition: 'all 0.2s', fontWeight: 600,
                                                    opacity: !isEditing && bg !== b ? 0.5 : 1
                                                }}>{b}</button>
                                            ))}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                            <div>
                                                <label style={labelStyle}>PHONE NUMBER</label>
                                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} style={inputStyle} placeholder="+91 XXXX XXX XXX" readOnly={!isEditing} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>CITY / DISTRICT</label>
                                                <select 
                                                    value={city} 
                                                    onChange={e => isEditing && setCity(e.target.value)} 
                                                    onMouseDown={e => !isEditing && e.preventDefault()}
                                                    onFocus={focusStyle} onBlur={blurStyle} 
                                                    style={{ ...inputStyle, cursor: 'default' }}
                                                >
                                                    {DISTRICTS.map(d => <option key={d} value={d} style={{ background: '#0A0A12' }}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 12 }}>
                                            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={saving} style={{
                                                background: isEditing ? 'var(--green, #22c55e)' : 'var(--red)', border: 'none', borderRadius: 14,
                                                padding: '16px 32px', cursor: saving ? 'not-allowed' : 'pointer',
                                                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
                                                color: '#fff', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: saving ? 0.7 : 1,
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                boxShadow: isEditing ? '0 8px 16px rgba(34,197,94,0.2)' : '0 8px 16px rgba(217,0,37,0.2)',
                                            }} onMouseEnter={e => { if(!saving) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isEditing ? '0 12px 24px rgba(34,197,94,0.3)' : '0 12px 24px rgba(217,0,37,0.3)'; }}
                                               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isEditing ? '0 8px 16px rgba(34,197,94,0.2)' : '0 8px 16px rgba(217,0,37,0.2)'; }}>
                                                {saving ? <><InlineLoader /> UPDATING...</> : (isEditing ? 'SAVE CHANGES' : 'EDIT CHANGES')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats & Summary Card */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.02)', 
                                            border: '1px solid rgba(255,255,255,0.06)', 
                                            borderRadius: 24, padding: 32,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                        }}>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Heart size={18} color="var(--red)" />
                                                Impact Summary
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>DONATIONS</div>
                                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', fontWeight: 600 }}>{profile?.total_donations ?? 0}</div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>LIVES SAVED</div>
                                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#22c55e', fontWeight: 600 }}>{(profile?.total_donations ?? 0) * 3}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {[
                                                    { label: 'VOLUME CONTRIBUTED', val: formatML(profile?.total_ml) },
                                                    { label: 'LAST DONATION', val: profile?.last_donation_date ? formatDate(profile.last_donation_date) : 'Never' },
                                                    { label: 'ELIGIBILITY STATUS', val: <EligibilityBadge status={profile?.current_eligibility || 'Eligible'} small /> },
                                                    { label: 'ACCOUNT EMAIL', val: profile?.email || '--' },
                                                ].map(({ label, val }) => (
                                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{label}</span>
                                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', fontWeight: 500 }}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <button style={{ 
                                                display: 'flex', alignItems: 'center', gap: 10, 
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                                                borderRadius: 14, padding: '14px 24px', cursor: 'pointer', 
                                                fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', 
                                                marginTop: 24, width: '100%', justifyContent: 'center', transition: 'all 0.2s',
                                                fontWeight: 600
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                                <Download size={16} /> Download Donor Pass
                                            </button>
                                        </div>

                                        <div style={{ background: 'linear-gradient(rgba(217,0,37,0.1), rgba(217,0,37,0.02))', border: '1px solid rgba(217,0,37,0.15)', borderRadius: 24, padding: 24, textAlign: 'center' }}>
                                            <Heart size={24} color="var(--red)" style={{ marginBottom: 12 }} />
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 4 }}>You are making a difference!</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Each donation can save up to 3 lives in emergency situations.</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                    {/* Security Section */}
                                    <div style={{ marginBottom: 48 }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24, fontWeight: 700 }}>Security & Authentication</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {[
                                                { label: 'Primary Password', sub: 'Last changed 3 months ago', action: 'Update Secret' },
                                                { label: 'Identity Verification', sub: `Official ID linked: ${profile?.phone || '--'}`, action: null, badge: 'VERIFIED' },
                                                { label: 'Digital Account', sub: profile?.email || '--', action: null },
                                                { label: 'Session Integrity', sub: `Last active: ${profile?.last_login ? new Date(profile.last_login).toLocaleString('en-IN') : 'New account'}`, action: null },
                                            ].map(({ label, sub, action, badge }) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <div>
                                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16, color: '#fff', marginBottom: 4 }}>{label}</div>
                                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
                                                    </div>
                                                    {action && (
                                                        <button style={{ 
                                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                                                            borderRadius: 10, padding: '8px 20px', cursor: 'pointer', 
                                                            fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff',
                                                            transition: 'all 0.2s'
                                                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>{action}</button>
                                                    )}
                                                    {badge && (
                                                        <span style={{ 
                                                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', 
                                                            borderRadius: 8, padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: '0.05em' 
                                                        }}>{badge}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notifications Section */}
                                    <div style={{ marginBottom: 48 }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24, fontWeight: 700 }}>Communication Preferences</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                            {NOTIFY_ROWS.map(({ key, label, sub }) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <div>
                                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 16, color: '#fff', marginBottom: 4 }}>{label}</div>
                                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
                                                    </div>
                                                    <Toggle on={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div style={{ 
                                        padding: 32, borderRadius: 20, 
                                        background: 'rgba(217,0,37,0.03)', 
                                        border: '1px solid rgba(217,0,37,0.15)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: 'var(--red)', marginBottom: 4 }}>Critical Operations</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 400 }}>
                                                Deactivating your account will disable your login and hide your profile from the network. Donation history is preserved.
                                            </div>
                                        </div>
                                        <button style={{ 
                                            background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', 
                                            borderRadius: 12, padding: '14px 28px', cursor: 'pointer', 
                                            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red)', 
                                            transition: 'all 0.2s', fontWeight: 600
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,0,37,0.2)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,0,37,0.1)'; }}>
                                            Deactivate Profile
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
        </div>
    );
}


