import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Phone, Mail, Clock, MapPin, HardDrive, Shield, Calendar, Edit2, Lock, Smartphone, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cardBase, inputStyle, labelStyle, primaryBtn, ghostBtn } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import ErrorCard from '../../components/ErrorCard';
import { formatDate, formatDateTime } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BloodBankProfile() {
    const { showExpiryModal } = useAuth();
    const { data: profile, loading, error, refetch } = useFetch(bloodBankService.getProfile);
    const { execute: updateProfile, loading: saving } = useApi(bloodBankService.updateProfile);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('business');
    const [form, setForm] = useState({ bank_name: '', city: '', contact_number: '', storage_capacity: '', operating_hours: '' });

    useEffect(() => {
        if (profile) setForm({ 
            bank_name: profile.bank_name || '', 
            city: profile.city || '', 
            contact_number: profile.contact_number || '', 
            storage_capacity: profile.storage_capacity || '', 
            operating_hours: profile.operating_hours || '' 
        });
    }, [profile]);

    const handleSave = async () => {
        try { await updateProfile(form); toast.success('Profile updated!'); setEditMode(false); refetch(); }
        catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;
    if (loading) return <LoadingSkel />;

    const statusColor = profile?.status === 'Active' ? '#22c55e' : '#f59e0b';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 32, color: '#fff' }}>Settings & Profile</h1>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', marginTop: 4 }}>Manage your blood bank's public information and security parameters.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {activeTab === 'business' && (
                        editMode ? (
                            <>
                                <button onClick={() => setEditMode(false)} style={ghostBtn}>Cancel</button>
                                <button onClick={handleSave} disabled={saving} style={primaryBtn}>
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditMode(true)} style={{ ...primaryBtn, background: 'rgba(217, 0, 37, 0.1)', border: '1px solid rgba(217, 0, 37, 0.2)', color: '#D90025' }}>
                                <Edit2 size={16} /> Update Info
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ 
                display: 'flex', gap: 8, padding: 6, borderRadius: 16, 
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
                width: 'fit-content'
            }}>
                {['business', 'security'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px', borderRadius: 12, border: 'none',
                            background: activeTab === tab ? 'rgba(217, 0, 37, 0.1)' : 'transparent',
                            color: activeTab === tab ? '#D90025' : '#9B9BA4',
                            fontFamily: 'var(--font-space)', fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        {tab === 'business' ? 'Business Info' : 'Account Security'}
                    </button>
                ))}
            </div>

            {activeTab === 'business' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
                    {/* 1. General Identification */}
                    <Section title="General Information" icon={Building2} grid="span 7">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <InputField label="Bank Name" value={form.bank_name} onChange={v => setForm(f => ({ ...f, bank_name: v }))} editMode={editMode} />
                            <InputField label="Bank ID (Read only)" value={profile?.bank_id} editMode={false} />
                            <InputField label="Location / City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} editMode={editMode} icon={MapPin} />
                            <div>
                                <label style={labelStyle}>Current Status</label>
                                <div style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}` }} />
                                    <span style={{ color: statusColor, fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-space)' }}>{profile?.status?.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 2. Operational Capacity */}
                    <Section title="Inventory Management" icon={HardDrive} grid="span 5">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <NumberStepper 
                                label="Total Storage Capacity (Units)"
                                value={parseInt(form.storage_capacity) || 0} 
                                onChange={v => setForm(f => ({ ...f, storage_capacity: String(v) }))}
                                min={0} max={50000} disabled={!editMode}
                            />
                            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: 11, color: '#4A4A55', fontWeight: 600, marginBottom: 4 }}>CURRENT STOCK LEVEL</p>
                                <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{profile?.total_units} <span style={{ fontSize: 13, color: '#4A4A55', fontWeight: 400 }}>Units stored</span></p>
                            </div>
                        </div>
                    </Section>

                    {/* 3. Contact Details */}
                    <Section title="Contact & Support" icon={Phone} grid="span 6">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <InputField label="Contact Number" value={form.contact_number} onChange={v => setForm(f => ({ ...f, contact_number: v }))} editMode={editMode} icon={Phone} />
                            <InputField label="Operating Hours" value={form.operating_hours} onChange={v => setForm(f => ({ ...f, operating_hours: v }))} editMode={editMode} icon={Clock} />
                        </div>
                    </Section>

                    {/* 4. Security & Account */}
                    <Section title="Account Details" icon={Shield} grid="span 6">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <InputField label="Registry Email" value={profile?.email} editMode={false} icon={Mail} />
                            <InputField label="Member Since" value={formatDate(profile?.member_since)} editMode={false} icon={Calendar} />
                            <InputField label="Last Login" value={formatDateTime(profile?.last_login)} editMode={false} icon={Clock} />
                            <InputField label="System Role" value="Blood Bank Administrator" editMode={false} icon={Shield} />
                        </div>
                    </Section>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Verification & Shielding */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ 
                            background: 'rgba(15, 15, 23, 0.4)', borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: 32, display: 'flex', flexDirection: 'column', gap: 28
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Lock size={20} color="#D90025" />
                                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Verification & Shielding</h2>
                            </div>
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>Secure your data and institution access.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <SecurityRow icon={Lock} title="Change Master Password" detail="LAST CHANGED 3 MONTHS AGO" />
                            <SecurityRow icon={Smartphone} title="Phone Lock" detail="BOUND TO ENDING IN 4686" />
                            <SecurityRow icon={ShieldCheck} title="2FA Authentication" detail="NOT ACTIVE • ENHANCES SAFETY DURING HIGH VALUE ORDERS" isWarning />
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ 
                            background: 'rgba(217, 0, 37, 0.03)', borderRadius: 24, border: '1px solid rgba(217, 0, 37, 0.15)',
                            padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                    >
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#D90025', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AlertTriangle size={20} /> Danger Zone
                            </h3>
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(217, 0, 37, 0.7)', marginTop: 8, maxWidth: 400 }}>
                                Deleting your account will purge all records and disconnected your blood bank facility from the national network permanently.
                            </p>
                        </div>
                        <button style={{ 
                            padding: '12px 24px', borderRadius: 12, background: 'transparent', 
                            border: '1px solid #D90025', color: '#D90025', fontWeight: 600, 
                            fontFamily: 'var(--font-space)', cursor: 'pointer', transition: 'all 0.3s'
                        }} onMouseEnter={e => e.target.style.background = 'rgba(217, 0, 37, 0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                            Deactivate Station
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

/* UI Components */
function Section({ title, icon: Icon, children, grid }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
                gridColumn: grid,
                background: 'rgba(15, 15, 23, 0.4)',
                borderRadius: 20, 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
                padding: 24,
                display: 'flex', flexDirection: 'column', gap: 20
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Icon size={18} color="#D90025" />
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{title}</h2>
            </div>
            {children}
        </motion.div>
    );
}

function InputField({ label, value, onChange, editMode, icon: Icon }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                {Icon && <Icon size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A4A55' }} />}
                {editMode ? (
                    <input value={value} onChange={e => onChange(e.target.value)} 
                        style={{ ...inputStyle, paddingLeft: Icon ? 38 : 16 }} />
                ) : (
                    <div style={{ 
                        padding: Icon ? '12px 16px 12px 38px' : '12px 16px', borderRadius: 12, 
                        background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff'
                    }}>
                        {value || '--'}
                    </div>
                )}
            </div>
        </div>
    );
}


function SecurityRow({ title, detail, isWarning }) {
    return (
        <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '20px 24px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s'
        }}>
            <div>
                <h4 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 15, color: '#fff' }}>{title}</h4>
                <p style={{ 
                    fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, 
                    color: isWarning ? '#D90025' : '#4A4A55', marginTop: 4, letterSpacing: '0.05em' 
                }}>{detail.toUpperCase()}</p>
            </div>
            <button style={{ 
                padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-dm)', cursor: 'pointer' 
            }}>Update</button>
        </div>
    );
}

function LoadingSkel() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 200, background: '#14141E', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />)}
        </div>
    );
}


