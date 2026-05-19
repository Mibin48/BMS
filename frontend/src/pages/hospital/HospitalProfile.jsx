import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, Building2, ShieldCheck, Mail, Phone, MapPin,
    Bell, Lock, Trash2, Globe, TrendingUp, Users,
    Droplets, Check, X, CreditCard, Clock, Activity
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { SkeletonCard } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import { formatDate, formatDateTime } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

const TABS = ['Business Info', 'Notification Settings', 'Account Security'];

function SectionTitle({ icon: Icon, title, sub }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <Icon size={18} color="var(--red)" />
                <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20, color: '#fff' }}>{title}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
        </div>
    );
}

function ProfileStat({ label, value, icon: Icon, color = 'var(--red)' }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16
        }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
            </div>
            <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', fontWeight: 800 }}>{value}</div>
            </div>
        </div>
    );
}

function Toggle({ on, onChange, label, sub }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ paddingRight: 20 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', fontWeight: 600 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
            </div>
            <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'linear-gradient(90deg, var(--red), var(--red-h))' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} >
                <motion.div animate={{ left: on ? 22 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, boxShadow: '0 2px 5px rgba(0,0,0,0.4)' }} />
            </div>
        </div>
    );
}

export default function HospitalProfile() {
    const { showExpiryModal } = useAuth();
    const [tab, setTab] = useState(0);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [contact, setContact] = useState('');
    const [beds, setBeds] = useState('');
    const [notifs, setNotifs] = useState({ emergency: true, updates: true, payments: true, stock: true, whatsapp: false });

    const { data: profile, loading, error, refetch } = useFetch(hospitalService.getProfile);
    const { execute: updateProfile, loading: saving } = useApi(hospitalService.updateProfile);

    useEffect(() => {
        if (profile) {
            setName(profile.hospital_name || '');
            setCity(profile.city || '');
            setContact(profile.contact_number || '');
            setBeds(profile.beds || '');
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            await updateProfile({ hospital_name: name, city, contact_number: contact, beds: parseInt(beds) || 0 });
            toast.success('Successfully updated your profile');
            setEditing(false);
            refetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const iS = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', marginTop: 8, transition: 'all 0.2s' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 18, marginBottom: 4, fontWeight: 800 };

    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 32, opacity: 0.5 }}><SkeletonCard /><SkeletonCard /></div>;
    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', paddingBottom: 60 }}>
            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 48,
                    position: 'relative', overflow: 'hidden'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 36, position: 'relative', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 110, height: 110, borderRadius: 24,
                            background: 'linear-gradient(135deg, rgba(217,0,37,0.15), rgba(217,0,37,0.05))',
                            border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 50px rgba(217,0,37,0.1)'
                        }}>
                            <Building2 size={48} color="var(--red)" />
                        </div>
                        <div style={{
                            position: 'absolute', bottom: -6, right: -6, width: 32, height: 32,
                            borderRadius: '50%', background: '#22c55e', border: '4px solid #0F0F17',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 15px rgba(34,197,94,0.4)'
                        }}>
                            <ShieldCheck size={16} color="#fff" />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontSize: 48, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', fontWeight: 900 }}>{profile?.hospital_name || '--'}</div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e', fontWeight: 800 }}>VERIFIED INSTITUTION</div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={12} /> {profile?.city || '--'} · KERALA
                            </div>
                        </div>
                    </div>
                    {!editing && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setEditing(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 14, padding: '14px 24px', cursor: 'pointer', fontFamily: 'var(--font-sub)',
                                fontSize: 14, color: '#fff', fontWeight: 700
                            }}>
                            <Edit2 size={16} color="var(--red)" /> Update Info
                        </motion.button>
                    )}
                </div>
                {/* Background Glow */}
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(217,0,37,0.1), transparent 70%)', pointerEvents: 'none' }} />
            </motion.div>

            {/* ── Navigation ── */}
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 16, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                {TABS.map((t, i) => (
                    <button key={t} onClick={() => setTab(i)}
                        style={{
                            background: tab === i ? 'rgba(217,0,37,0.15)' : 'none',
                            border: tab === i ? '1px solid rgba(217,0,37,0.3)' : '1px solid transparent',
                            cursor: 'pointer', padding: '10px 24px', borderRadius: 12,
                            fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: tab === i ? 700 : 500,
                            color: tab === i ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s'
                        }}>{t}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 0 && (
                    <motion.div key="tab-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                        style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>

                        {/* Edit Info */}
                        <div style={{ background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 36, backdropFilter: 'blur(10px)' }}>
                            <SectionTitle icon={Edit2} title="Public Details" sub="Updating this info will be visible to blood banks." />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={lS}>HOSPITAL NAME</label>
                                    <input value={name} onChange={e => setName(e.target.value)} disabled={!editing} style={iS} />
                                </div>
                                <div>
                                    <label style={lS}> CITY</label>
                                    <input value={city} onChange={e => setCity(e.target.value)} disabled={!editing} style={iS} />
                                </div>
                                <div>
                                    <label style={lS}> CONTACT</label>
                                    <input value={contact} onChange={e => setContact(e.target.value)} disabled={!editing} style={iS} />
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <NumberStepper
                                    label="PATIENT CAPACITY (BEDS)"
                                    value={parseInt(beds) || 0}
                                    onChange={v => setBeds(String(v))}
                                    min={0}
                                    max={5000}
                                    disabled={!editing}
                                />
                            </div>
                            <AnimatePresence>
                                {editing && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            <button onClick={() => { setEditing(false); setName(profile?.hospital_name || ''); setCity(profile?.city || ''); setContact(profile?.contact_number || ''); setBeds(profile?.beds || ''); }}
                                                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, color: '#fff', fontWeight: 600 }}>Discard</button>
                                            <button onClick={handleSave} disabled={saving}
                                                style={{ flex: 1.5, background: 'var(--red)', border: 'none', borderRadius: 14, padding: '14px 24px', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: '0 10px 30px rgba(217,0,37,0.2)' }}>{saving ? 'Syncing...' : 'Confirm Changes'}</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Quick Stats Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 36, backdropFilter: 'blur(10px)' }}>
                                <SectionTitle icon={TrendingUp} title="Network Performance" sub="How you appear in our strategic network." />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <ProfileStat label="ORDER SUCCESS" value={`${(profile?.fulfillment_rate ?? 0).toFixed(1)}%`} icon={Droplets} />
                                    <ProfileStat label="PATIENTS" value={profile?.active_patients ?? 0} icon={Users} color="#818cf8" />
                                    <ProfileStat label="TOTAL ORDERS" value={profile?.total_requests ?? 0} icon={Activity} color="#f59e0b" />
                                    <ProfileStat label="STAY POWER" value={`${profile?.beds ?? 0} BEDS`} icon={Activity} color="#22c55e" />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 32, backdropFilter: 'blur(10px)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>JOINED NETWORK</span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', fontWeight: 600 }}>{formatDate(profile?.member_since)}</span>
                                    </div>
                                    <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.04)', margin: '14px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>LICENSE TYPE</span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#818cf8', fontWeight: 600 }}>PREMIUM PARTNER</span>
                                    </div>
                                    <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.04)', margin: '14px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>LAST ACTIVITY</span>
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{profile?.last_login ? formatDateTime(profile.last_login) : 'Live Now'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 1 && (
                    <motion.div key="tab-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                        style={{ background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 48, maxWidth: 800 }}>
                        <SectionTitle icon={Bell} title="System Alerts" sub="Customize how we reach you for critical updates." />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Toggle on={notifs.emergency} onChange={v => setNotifs(n => ({ ...n, emergency: v }))} label="Critical Order Alerts" sub="Immediate ping when life-saving blood is needed or moving." />
                            <Toggle on={notifs.updates} onChange={v => setNotifs(n => ({ ...n, updates: v }))} label="Order Status Progress" sub="Get updates as your blood delivery moves through the network." />
                            <Toggle on={notifs.payments} onChange={v => setNotifs(n => ({ ...n, payments: v }))} label="Billing Reminders" sub="Heads-up for unpaid receipts and settlement due dates." />
                            <Toggle on={notifs.stock} onChange={v => setNotifs(n => ({ ...n, stock: v }))} label="Critical Inventory Warnings" sub="Notifications when your matched banks have low blood levels." />
                            <Toggle on={notifs.whatsapp} onChange={v => setNotifs(n => ({ ...n, whatsapp: v }))} label="WhatsApp Direct" sub="Full duplex reporting via WhatsApp Business API." />
                        </div>
                    </motion.div>
                )}

                {tab === 2 && (
                    <motion.div key="tab-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800 }}>

                        <div style={{ background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, padding: 48 }}>
                            <SectionTitle icon={Lock} title="Verification & Shielding" sub="Secure your data and institution access." />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[['Change Master Password', 'Last changed 3 months ago'], ['Phone Lock', `Bound to ending in ${profile?.contact_number?.slice(-4) || '----'}`], ['2FA Authentication', 'Not active · Enhances safety during high value orders']].map(([l, s]) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', fontWeight: 600 }}>{l}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.05em' }}>{s.toUpperCase()}</div>
                                        </div>
                                        <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', fontWeight: 600 }}>Update</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Danger zone */}
                        <div style={{ background: 'rgba(217,0,37,0.03)', border: '1px solid rgba(217,0,37,0.15)', borderRadius: 28, padding: 36 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 20, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(217,0,37,0.6)', maxWidth: 400 }}>Deleting your account will purge all records and disconnected your hospital from the blood network permanently.</div>
                                </div>
                                <motion.button whileHover={{ backgroundColor: 'var(--red)', color: '#fff' }} style={{ background: 'none', border: '1px solid var(--red)', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'var(--font-sub)', fontSize: 14, fontWeight: 700, color: 'var(--red)', transition: 'all 0.3s' }}>
                                    Deactivate Station
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
