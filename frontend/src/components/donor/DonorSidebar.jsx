import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bell, Droplets, HeartPulse,
    Calendar, MapPin, Users, User, Settings, LogOut, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import toast from 'react-hot-toast';
import { mockDonor } from '../../data/mockData';

const initials = mockDonor.name.split(' ').map(n => n[0]).join('');

function EligibilityBadge({ status, small }) {
    const cfg = {
        Eligible: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'ELIGIBLE' },
        Deferred: { bg: 'rgba(217,0,37,0.12)', color: '#ef4444', border: 'rgba(217,0,37,0.3)', label: 'DEFERRED' },
        Cooling: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: 'COOLING PERIOD' },
    };
    const c = cfg[status] || cfg.Eligible;
    return (
        <span style={{
            display: 'inline-block',
            background: c.bg, color: c.color,
            border: `1px solid ${c.border}`,
            borderRadius: 100, padding: small ? '2px 8px' : '3px 10px',
            fontFamily: 'var(--font-mono)', fontSize: small ? 9 : 10,
            letterSpacing: '0.08em', fontWeight: 600,
        }}>
            {c.label}
        </span>
    );
}

const NAV_SECTIONS = [
    {
        label: 'OVERVIEW', items: [
            { to: '/donor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/donor/notifications', icon: Bell, label: 'Notifications' },
        ],
    },
    {
        label: 'MY ACTIVITY', items: [
            { to: '/donor/donations', icon: Droplets, label: 'My Donations' },
            { to: '/donor/health-check', icon: HeartPulse, label: 'Health Checks' },
            { to: '/donor/schedule', icon: Calendar, label: 'Schedule' },
        ],
    },
    {
        label: 'DISCOVER', items: [
            { to: '/donor/find-bank', icon: MapPin, label: 'Find Blood Bank' },
            { to: '/donor/schedule', icon: Users, label: 'Blood Camps' },
        ],
    },
    {
        label: 'ACCOUNT', items: [
            { to: '/donor/profile', icon: Settings, label: 'Settings & Profile' },
        ],
    },
];

export { EligibilityBadge };

export default function DonorSidebar() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { unreadCount } = useNotifications();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/login', { replace: true });
        } catch (_) {
            navigate('/login', { replace: true });
        }
    };
    return (
        <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 240, background: '#0A0A12',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', zIndex: 40,
                overflowY: 'auto',
            }}
        >
            {/* Logo */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <NavLink to="/donor/dashboard" style={{ textDecoration: 'none' }}>
                    <img
                        src="/logo/hema_full_icon.svg"
                        alt="HEM∆"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                    />
                </NavLink>
            </div>

            {/* Donor Profile Mini Card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'radial-gradient(circle, #D90025, #8B0010)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff',
                    marginBottom: 12, letterSpacing: 2,
                }}>
                    {initials}
                </div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 3 }}>
                    {user?.name || mockDonor.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.05em' }}>
                    {mockDonor.blood_group} · DONOR
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                    {mockDonor.city}, Kerala
                </div>
                <EligibilityBadge status={mockDonor.status} small />
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {NAV_SECTIONS.map(section => (
                    <div key={section.label} style={{ marginBottom: 20 }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
                            textTransform: 'uppercase', letterSpacing: '0.15em',
                            padding: '0 12px', marginBottom: 8,
                        }}>
                            {section.label}
                        </div>
                        {section.items.map(({ to, icon: Icon, label, badge }) => (
                            <NavLink key={label} to={to} end style={{ textDecoration: 'none' }}>
                                {({ isActive }) => (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 12px', borderRadius: 10,
                                        marginBottom: 2, cursor: 'pointer',
                                        background: isActive ? 'rgba(217,0,37,0.1)' : 'transparent',
                                        borderLeft: isActive ? '3px solid #D90025' : '3px solid transparent',
                                        transition: 'all 0.15s',
                                        position: 'relative',
                                    }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={16} color={isActive ? 'var(--red)' : 'rgba(255,255,255,0.4)'} />
                                        <span style={{
                                            fontFamily: 'var(--font-body)', fontSize: 14,
                                            color: isActive ? '#fff' : 'var(--text2)',
                                            fontWeight: isActive ? 500 : 400, flex: 1,
                                        }}>
                                            {label}
                                        </span>
                                        {label === 'Notifications' && unreadCount > 0 && (
                                            <span style={{
                                                background: 'var(--red)', color: '#fff',
                                                borderRadius: 100, padding: '1px 6px',
                                                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                                            }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                        {badge && label !== 'Notifications' && (
                                            <span style={{
                                                background: 'var(--red)', color: '#fff',
                                                borderRadius: 100, padding: '1px 6px',
                                                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                                            }}>
                                                {badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{
                    background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, padding: 12, marginBottom: 12,
                }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Donor ID
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>
                        {mockDonor.donor_id}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)',
                        padding: 0, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                    <LogOut size={14} /> Log Out
                </button>
            </div>
        </motion.aside>
    );
}
