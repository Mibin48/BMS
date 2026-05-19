import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Clock, Users, Building2, Droplets,
    Package, FileText, Heart, ArrowUpRight,
    CreditCard, UserCog, BarChart2, ScrollText, Settings,
    Shield, LogOut, Map, Bell, ShieldAlert, Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import toast from 'react-hot-toast';

const NAV = [
    {
        section: 'OVERVIEW', accent: 'red', items: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
        ]
    },
    {
        section: 'APPROVALS', accent: 'amber', items: [
            { to: '/admin/approvals', icon: Clock, label: 'Approvals' },
        ]
    },
    {
        section: 'ENTITIES', accent: 'blue', items: [
            { to: '/admin/donors', icon: Users, label: 'Donors' },
            { to: '/admin/hospitals', icon: Building2, label: 'Hospitals' },
            { to: '/admin/blood-banks', icon: Droplets, label: 'Blood Banks' },
        ]
    },
    {
        section: 'OPERATIONS', accent: 'white', items: [
            { to: '/admin/inventory', icon: Package, label: 'Inventory' },
            { to: '/admin/requests', icon: FileText, label: 'Requests' },
            { to: '/admin/donations', icon: Heart, label: 'Donations' },
            { to: '/admin/health-checks', icon: Stethoscope, label: 'Health Checks' },
            { to: '/admin/issues', icon: ArrowUpRight, label: 'Issues' },
            { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
        ]
    },
    {
        section: 'SYSTEM', accent: 'purple', items: [
            { to: '/admin/users', icon: UserCog, label: 'Users' },
            { to: '/admin/audit', icon: ScrollText, label: 'Audit Log' },
            { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
            { to: '/admin/settings', icon: Settings, label: 'Settings & Profile' },
        ]
    },
];

const sectionLabelColor = {
    red: '#D90025', amber: '#f59e0b', blue: '#3b82f6', white: '#9B9BA4', purple: 'var(--red)',
};

export default function AdminSidebar() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { unreadCount } = useNotifications();

    const handleLogout = async () => {
        try { await logout(); toast.success('Logged out'); navigate('/login', { replace: true }); }
        catch (_) { navigate('/login', { replace: true }); }
    };

    return (
        <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: '#0A0A12', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto' }}
        >
            {/* Logo */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <NavLink to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                    <img
                        src="/logo/hema_full_icon.svg"
                        alt="HEM∆"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                    />
                </NavLink>
            </div>

            {/* Admin Profile */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Shield size={18} color="var(--red)" />
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{user?.name || 'Administrator'}</div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'var(--red)', marginBottom: 4, letterSpacing: '0.08em' }}>SUPER ADMIN</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '2px 8px' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 8, color: '#22c55e' }}>ONLINE</span>
                </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
                {NAV.map(({ section, accent, items }) => (
                    <div key={section} style={{ marginBottom: 18 }}>
                        <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: sectionLabelColor[accent] || '#4A4A55', letterSpacing: '0.12em', padding: '0 12px', marginBottom: 6 }}>{section}</div>
                        {items.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to} end style={{ textDecoration: 'none' }}>
                                {({ isActive }) => {
                                    const isSystem = accent === 'purple';
                                    const activeColor = 'var(--red)';
                                    const activeBg = 'rgba(217,0,37,0.10)';
                                    return (
                                        <div
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '9px 12px', borderRadius: 10, marginBottom: 1, cursor: 'pointer',
                                                background: isActive ? activeBg : 'transparent',
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Icon size={15} color={isActive ? activeColor : 'rgba(255,255,255,0.35)'} />
                                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: isActive ? '#fff' : '#9B9BA4', flex: 1 }}>{label}</span>
                                            {label === 'Notifications' && unreadCount > 0 && (
                                                <span style={{ background: '#D90025', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 100, fontWeight: 'bold' }}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#4A4A55', marginBottom: 3, letterSpacing: '0.1em' }}>HEM∆ SYSTEM</div>
                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#fff', marginBottom: 3 }}>v2.5.1 · Production</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#22c55e' }}>All services online</span>
                    </div>
                </div>
                <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D90025'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9B9BA4'}
                >
                    <LogOut size={14} /> Log Out
                </button>
            </div>
        </motion.aside>
    );
}
