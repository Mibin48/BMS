import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, UserPlus, Search, Command, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import IconBtn from '../IconBtn';
import NotificationBell from '../NotificationBell';

export default function AdminTopBar({ title, page }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.name || 'Admin';
    const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('');
    const isUsersPage = location.pathname === '/admin/users';

    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    }).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 240, right: 0, height: 72,
            background: 'rgba(7,7,11,0.8)', backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', zIndex: 30,
        }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }} />

            {/* Left: Title + Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>{title || 'Dashboard'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>HEM∆</span>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>ADMIN</span>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#7C3AED', fontWeight: 600, letterSpacing: '0.05em' }}>{(page || title || 'DASHBOARD').toUpperCase()}</span>
                    </div>
                </div>

                {/* Search Bar (Mocked) */}
                <div style={{ position: 'relative', marginLeft: 12 }} className="hidden xl:block">
                    <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 48px 10px 38px', width: 280,
                            fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff', outline: 'none',
                        }}
                    />
                    <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Command size={10} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>K</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* System Healthy Badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(34,197,94,0.05)', padding: '6px 14px',
                        borderRadius: 100, border: '1px solid rgba(34,197,94,0.15)'
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: '#22c55e', fontWeight: 800, letterSpacing: '0.05em' }}>SYSTEM NORMAL</span>
                    </div>

                    {isUsersPage && (
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'var(--red)', border: 'none', borderRadius: 12,
                            padding: '10px 20px', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff',
                            transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(217,0,37,0.25)'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <UserPlus size={16} /> Create User
                        </button>
                    )}
                </div>

                <div style={{ height: 32, width: 1, background: 'rgba(255,255,255,0.08)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }} ref={dropdownRef}>
                    <NotificationBell />
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hidden md:flex">
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name || 'Admin'}</span>
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{dateStr}</span>
                        </div>
                        <div style={{
                            width: 40, height: 40, borderRadius: 14,
                            background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--red)',
                            fontWeight: 700, letterSpacing: 1
                        }}>
                            {initials}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: 12,
                                    width: 220, background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                                    padding: 8, zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                }}
                            >
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 4 }}>
                                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff' }}>{user?.name || 'Administrator'}</div>
                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email || 'admin@hema.com'}</div>
                                </div>

                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.7)' }}
                                    onClick={() => { navigate('/admin/settings'); setIsOpen(false); }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Settings size={16} />
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>Settings & Profile</span>
                                </div>

                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: '#ef4444', marginTop: 4 }}
                                    onClick={handleLogout}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>Log Out</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
