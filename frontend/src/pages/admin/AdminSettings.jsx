import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Shield, Sliders, Bell, Link2, X, Zap, Cpu, Activity, Database, Lock, Globe, Mail } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import ErrorCard from '../../components/ErrorCard';

/* ─── Premium Components ───────────────────────────────────── */

const Toggle = ({ on, onToggle }) => (
    <div
        onClick={onToggle}
        style={{
            width: 48, height: 26, borderRadius: 100,
            background: on ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${on ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: on ? '0 0 15px rgba(217,0,37,0.1)' : 'none'
        }}
    >
        <motion.div
            animate={{ x: on ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
                width: 20, height: 20, borderRadius: '50%',
                background: on ? '#D90025' : 'rgba(255,255,255,0.4)',
                position: 'absolute', top: 2,
                boxShadow: on ? '0 0 8px #D90025' : 'none'
            }}
        />
    </div>
);

const TABS = [
    { id: 'system', label: 'GENERAL SETTINGS', icon: Sliders, desc: 'Basic system options and names.' },
    { id: 'security', label: 'SECURITY', icon: Shield, desc: 'Logins, passwords, and access.' },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, desc: 'Email and alert settings.' },
    { id: 'integrations', label: 'CONNECTED APPS', icon: Link2, desc: 'External services and tools.' },
];

const SettingGroup = ({ title, children, icon: Icon, color = '#3b82f6' }) => (
    <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: `${color}10`, border: `1px solid ${color}33`, borderRadius: 10 }}>
                <Icon size={14} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</div>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}33, transparent)` }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {children}
        </div>
    </div>
);

const SettingField = ({ label, description, children, layout = 'row' }) => (
    <div style={{
        padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: layout === 'row' ? 'row' : 'column',
        justifyContent: 'space-between', alignItems: layout === 'row' ? 'center' : 'stretch', gap: 20
    }}>
        <div style={{ maxWidth: layout === 'row' ? '70%' : '100%' }}>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{description}</div>
        </div>
        {children}
    </div>
);

/* ─── Main Component ───────────────────────────────────────── */

export default function AdminSettings() {
    const { showExpiryModal } = useAuth();
    const [activeTab, setActiveTab] = useState('system');
    const { data, loading, error, refetch } = useFetch(adminService.getSettings);

    const updateApi = useApi(adminService.updateSettings, {
        onSuccess: () => {
            toast.success("Settings Saved Successfully");
            refetch();
        },
        onError: () => toast.error("Failed to Save Settings")
    });

    const [system, setSystem] = useState({
        system_name: 'HEM∆ Blood Management System',
        maintenance_mode: 'false',
        registration_open: 'true',
        data_retention_days: '365'
    });
    const [security, setSecurity] = useState({
        session_timeout: '30',
        max_login_attempts: '5',
        require_2fa: 'false',
        ip_whitelist: '127.0.0.1, 10.0.0.1'
    });
    const [notifications, setNotifications] = useState({
        email_alerts: 'true',
        stock_warnings: 'true',
        critical_sms: 'false',
        daily_reports: 'true'
    });

    useEffect(() => {
        if (data?.settings) {
            const sMap = {};
            data.settings.forEach(item => { sMap[item.key] = item.value; });

            setSystem({
                system_name: sMap.system_name || system.system_name,
                maintenance_mode: sMap.maintenance_mode || system.maintenance_mode,
                registration_open: sMap.registration_open || system.registration_open,
                data_retention_days: sMap.data_retention_days || system.data_retention_days
            });
            setSecurity({
                session_timeout: sMap.session_timeout || security.session_timeout,
                max_login_attempts: sMap.max_login_attempts || security.max_login_attempts,
                require_2fa: sMap.require_2fa || security.require_2fa,
                ip_whitelist: sMap.ip_whitelist || security.ip_whitelist
            });
            setNotifications({
                email_alerts: sMap.email_alerts || notifications.email_alerts,
                stock_warnings: sMap.stock_warnings || notifications.stock_warnings,
                critical_sms: sMap.critical_sms || notifications.critical_sms,
                daily_reports: sMap.daily_reports || notifications.daily_reports
            });
        }
    }, [data]);

    const handleSave = async (sectionData) => {
        await updateApi.execute(sectionData);
    };

    const iStyle = {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
        padding: '14px 16px', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff', outline: 'none',
        transition: 'all 0.2s', width: '100%'
    };

    const handleSysChange = (k, v) => setSystem(prev => ({ ...prev, [k]: v }));
    const handleSecChange = (k, v) => setSecurity(prev => ({ ...prev, [k]: v }));
    const handleNotifToggle = (k) => setNotifications(prev => ({ ...prev, [k]: prev[k] === 'true' ? 'false' : 'true' }));

    const INTEGRATIONS = [
        { name: 'Kerala Health Portal', connected: true, desc: 'Connected to the state health database.', type: 'GOVERNMENT' },
        { name: 'National Blood Registry', connected: true, desc: 'Sending reports to the national registry.', type: 'COMPLIANCE' },
        { name: 'SMS Service', connected: true, desc: 'Used for sending OTPs and alerts.', type: 'MESSAGING' },
        { name: 'WhatsApp Alerts', connected: false, desc: 'Send alerts directly to donor phones.', type: 'SOCIAL' },
        { name: 'Medical Records Link', connected: true, desc: 'Link with hospital medical record systems.', type: 'MEDICAL' },
        { name: 'Payment Gateway', connected: true, desc: 'Used for processing all payments.', type: 'FINANCIAL' }
    ];

    if (error && !showExpiryModal) return <div style={{ padding: 40 }}><ErrorCard message={error} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 100 }}>
            {/* ── Page Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(217,0,37,0.05) 0%, transparent 40%)',
                borderRadius: 32, padding: '40px 48px', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(217,0,37,0.1), transparent 70%)' }} />
                <div style={{ zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D90025', boxShadow: '0 0 10px #D90025' }} />
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#D90025', fontWeight: 900, letterSpacing: '0.2em' }}>SYSTEM STATUS: ACTIVE</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 42, color: '#fff', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>System Settings</h1>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 12, maxWidth: 500 }}>Manage your system name, security rules, alert settings, and connected services.</p>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>SYSTEM UPTIME</div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, color: '#fff' }}>99.98%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>SYSTEM VERSION</div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, color: '#D90025' }}>v2.5.1-Δ</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 48, alignItems: 'start' }}>
                {/* ── Immersive Side Navigation ── */}
                <div style={{ position: 'sticky', top: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <GlassCard style={{ padding: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                            background: isActive ? 'rgba(217,0,37,0.08)' : 'transparent',
                                            border: isActive ? '1px solid rgba(217,0,37,0.2)' : '1px solid transparent',
                                            borderRadius: 20, cursor: 'pointer', textAlign: 'left',
                                            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10, background: isActive ? '#D90025' : 'rgba(255,255,255,0.03)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                                        }}>
                                            <Icon size={18} color={isActive ? '#fff' : 'rgba(255,255,255,0.3)'} />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-space)', fontWeight: 800, fontSize: 11, color: isActive ? '#fff' : 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{tab.label}</div>
                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>{tab.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>

                    <div style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <Zap size={14} color="#D90025" />
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>HARDWARE STATUS</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Database</span>
                                <span style={{ color: '#22c55e', fontWeight: 600 }}>CONNECTED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Security</span>
                                <span style={{ color: '#22c55e', fontWeight: 600 }}>ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Content Matrix Area ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        {activeTab === 'system' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <GlassCard style={{ padding: 40 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 8 }}>System Basics</div>
                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Set your system name and how long data is kept.</div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSave(system)}
                                            disabled={updateApi.loading}
                                            style={{
                                                background: '#D90025', border: 'none', borderRadius: 16, padding: '14px 32px',
                                                cursor: 'pointer', fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700, color: '#fff',
                                                display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(217,0,37,0.3)'
                                            }}
                                        >
                                            <Save size={16} /> {updateApi.loading ? 'SAVING...' : 'SAVE SETTINGS'}
                                        </motion.button>
                                    </div>

                                    <SettingGroup title="BASIC INFO" icon={Cpu} color="#3b82f6">
                                        <SettingField label="System Name" description="The name of your blood management system.">
                                            <input value={system.system_name} onChange={e => handleSysChange('system_name', e.target.value)} style={iStyle} />
                                        </SettingField>
                                        <SettingField label="Data Retention" description="How many days activity records are kept before being cleared.">
                                            <NumberStepper
                                                value={parseInt(system.data_retention_days) || 365}
                                                onChange={v => handleSysChange('data_retention_days', String(v))}
                                                min={1} max={3650}
                                            />
                                        </SettingField>
                                    </SettingGroup>

                                    <SettingGroup title="SYSTEM MODES" icon={Activity} color="#f59e0b">
                                        <SettingField label="Off-Line Mode" description="Turning this on stops everyone except admins from using the system.">
                                            <Toggle on={system.maintenance_mode === 'true'} onToggle={() => handleSysChange('maintenance_mode', system.maintenance_mode === 'true' ? 'false' : 'true')} />
                                        </SettingField>
                                        <SettingField label="Public Sign-ups" description="Allow or block new donors and hospitals from signing up.">
                                            <Toggle on={system.registration_open === 'true'} onToggle={() => handleSysChange('registration_open', system.registration_open === 'true' ? 'false' : 'true')} />
                                        </SettingField>
                                    </SettingGroup>
                                </GlassCard>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <GlassCard style={{ padding: 40 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 8 }}>Security Settings</div>
                                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Control how people log in and keep the system safe.</div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSave(security)}
                                            disabled={updateApi.loading}
                                            style={{
                                                background: '#fff', border: 'none', borderRadius: 16, padding: '14px 32px',
                                                cursor: 'pointer', fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700, color: '#000',
                                                display: 'flex', alignItems: 'center', gap: 12
                                            }}
                                        >
                                            <Shield size={16} /> {updateApi.loading ? 'SAVING...' : 'SAVE SETTINGS'}
                                        </motion.button>
                                    </div>

                                    <SettingGroup title="LOGIN RULES" icon={Shield} color="#D90025">
                                        <SettingField label="Auto Log-out" description="How long someone can be idle before they are logged out.">
                                            <NumberStepper
                                                value={parseInt(security.session_timeout) || 30}
                                                onChange={v => handleSecChange('session_timeout', String(v))}
                                                min={5} max={1440}
                                            />
                                        </SettingField>
                                        <SettingField label="Failed Login Limit" description="The number of times someone can try a wrong password before being locked out.">
                                            <NumberStepper
                                                value={parseInt(security.max_login_attempts) || 5}
                                                onChange={v => handleSecChange('max_login_attempts', String(v))}
                                                min={1} max={20}
                                            />
                                        </SettingField>
                                        <SettingField label="Require Extra Login Step" description="Make everyone use an extra security code to log in.">
                                            <Toggle on={security.require_2fa === 'true'} onToggle={() => handleSecChange('require_2fa', security.require_2fa === 'true' ? 'false' : 'true')} />
                                        </SettingField>
                                    </SettingGroup>

                                    <SettingGroup title="ACCESS LIMITS" icon={Globe} color="#3b82f6">
                                        <SettingField layout="column" label="Allowed Locations (IPs)" description="Only people at these internet addresses can access the admin area.">
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                                                {(security.ip_whitelist || '').split(',').map(ip => ip.trim()).filter(Boolean).map(ip => (
                                                    <motion.div key={ip} layout
                                                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '8px 16px' }}>
                                                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: '#3b82f6' }}>{ip}</span>
                                                        <button onClick={() => {
                                                            const newIps = (security.ip_whitelist || '').split(',').map(i => i.trim()).filter(i => i !== ip).join(', ');
                                                            handleSecChange('ip_whitelist', newIps);
                                                        }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <input placeholder="Add IP address..." style={iStyle} onKeyDown={e => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        const v = e.target.value.trim();
                                                        if (!security.ip_whitelist.includes(v)) {
                                                            handleSecChange('ip_whitelist', security.ip_whitelist ? `${security.ip_whitelist}, ${v}` : v);
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }} />
                                                <button style={{
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 12, padding: '0 24px', cursor: 'pointer', fontFamily: 'var(--font-dm)',
                                                    fontSize: 13, fontWeight: 700, color: '#fff'
                                                }}>ADD</button>
                                            </div>
                                        </SettingField>
                                    </SettingGroup>
                                </GlassCard>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <GlassCard style={{ padding: 40 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', margin: 0 }}>Notification Center</h2>
                                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Control how and when the system sends alerts.</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSave(notifications)}
                                        disabled={updateApi.loading}
                                        style={{
                                            background: '#D90025', border: 'none', borderRadius: 16, padding: '14px 32px',
                                            cursor: 'pointer', fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700, color: '#fff',
                                            display: 'flex', alignItems: 'center', gap: 12
                                        }}
                                    >
                                        <Save size={16} /> {updateApi.loading ? 'SAVING...' : 'SAVE ALERTS'}
                                    </motion.button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        { k: 'email_alerts', l: 'Send System Emails', d: 'The system will send emails for security events and logs.', icon: Mail },
                                        { k: 'stock_warnings', l: 'Blood Stock Alerts', d: 'Get alerts when blood stock levels are getting low.', icon: Activity },
                                        { k: 'critical_sms', l: 'Send Emergency SMS', d: 'Send SMS messages for urgent blood needs.', icon: Zap },
                                        { k: 'daily_reports', l: 'Weekly Reports', d: 'The system will create and save a report every week.', icon: Database }
                                    ].map(({ k, l, d, icon: Icon }) => {
                                        const isOn = notifications[k] === 'true';
                                        return (
                                            <div key={k} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px',
                                                background: isOn ? 'rgba(255,255,255,0.03)' : 'transparent',
                                                border: `1px solid ${isOn ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                                                borderRadius: 24, transition: 'all 0.3s'
                                            }}>
                                                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: isOn ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isOn ? 'rgba(217,0,37,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                                                        <Icon size={18} color={isOn ? '#D90025' : 'rgba(255,255,255,0.2)'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: isOn ? '#fff' : '#CACACE', marginBottom: 4 }}>{l}</div>
                                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{d}</div>
                                                    </div>
                                                </div>
                                                <Toggle on={isOn} onToggle={() => handleNotifToggle(k)} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        )}

                        {activeTab === 'integrations' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {INTEGRATIONS.map(int => (
                                    <GlassCard key={int.name} style={{ padding: 32 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                            <div style={{
                                                width: 52, height: 52, borderRadius: 16,
                                                background: int.connected ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: `1px solid ${int.connected ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`
                                            }}>
                                                <Link2 size={24} color={int.connected ? '#22c55e' : 'rgba(255,255,255,0.2)'} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                                <span style={{
                                                    background: int.connected ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${int.connected ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: 8, padding: '4px 10px', fontFamily: 'var(--font-space)', fontSize: 9,
                                                    textTransform: 'uppercase', letterSpacing: '0.05em', color: int.connected ? '#22c55e' : '#9B9BA4', fontWeight: 800
                                                }}>
                                                    {int.connected ? 'ACTIVE' : 'DISCONNECTED'}
                                                </span>
                                                <span style={{ fontFamily: 'var(--font-space)', fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{int.type}</span>
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 8 }}>{int.name}</div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.6 }}>{int.desc}</div>
                                        <button style={{
                                            width: '100%',
                                            background: int.connected ? 'rgba(255,255,255,0.03)' : '#D90025',
                                            border: `1px solid ${int.connected ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                                            borderRadius: 14, padding: '14px 0', cursor: 'pointer',
                                            fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700,
                                            color: '#fff', transition: 'all 0.2s shadow 0.2s',
                                            boxShadow: !int.connected ? '0 4px 12px rgba(217,0,37,0.2)' : 'none'
                                        }}>
                                            {int.connected ? 'CONFIGURE' : 'CONNECT NOW'}
                                        </button>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
