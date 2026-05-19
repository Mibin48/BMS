import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Menu, X, Home, Info, Zap, CreditCard, BookOpen, MessageSquare, LogIn, ChevronDown, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
    { to: '/', label: 'HOME', icon: <Home size={14} /> },
    { to: '/about', label: 'ABOUT', icon: <Info size={14} /> },
    { to: '/features', label: 'FEATURES', icon: <Zap size={14} /> },
    { to: '/pricing', label: 'PRICING', icon: <CreditCard size={14} /> },
    { to: '/blog', label: 'BLOG', icon: <BookOpen size={14} /> },
    { to: '/contact', label: 'CONTACT', icon: <MessageSquare size={14} /> },
];

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showNav, setShowNav] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [open, setOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    const displayName = user?.name || 'User';
    const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 40);

            // Constant Navbar for Features page
            if (location.pathname === '/features') {
                setShowNav(true);
                setLastScrollY(currentScrollY);
                return;
            }

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => { setOpen(false); setIsProfileOpen(false); }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
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
        <>
            <motion.nav 
                initial={{ y: 0 }}
                animate={{ y: showNav ? 0 : -100 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 5%',
                    height: scrolled ? 72 : 100,
                    background: scrolled ? 'rgba(7,7,11,0.92)' : 'rgba(7,7,11,0.6)',
                    backdropFilter: 'blur(24px)',
                    borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
                    transition: 'height 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s ease',
                }}>
                {/* Logo */}
                <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <img
                        src="/logo/hema_full_icon.svg"
                        alt="HEM∆"
                        style={{ height: 64, width: 'auto', display: 'block', objectFit: 'contain' }}
                    />
                </NavLink>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="md:flex hidden">
                    {links.map(({ to, label, icon }) => (
                        <NavLink key={to} to={to} style={({ isActive }) => ({
                            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                            padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
                            color: isActive ? '#fff' : 'var(--text2)',
                            transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', gap: 8,
                            position: 'relative'
                        })}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'none'; }}
                        >
                            <span style={{ opacity: 0.7 }}>{icon}</span>
                            {label}
                            {useLocation().pathname === to && (
                                <motion.div layoutId="nav-indicator" style={{
                                    position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, background: 'var(--red)'
                                }} />
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }} ref={dropdownRef}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hidden md:flex">
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.05em' }}>VERIFIED</span>
                                </div>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 12,
                                    background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--red)',
                                    fontWeight: 700
                                }}>
                                    {initials}
                                </div>
                                <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        style={{
                                            position: 'absolute', top: '100%', right: 0, marginTop: 12,
                                            width: 220, background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                                            padding: 8, zIndex: 600, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                        }}
                                    >
                                        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 4 }}>
                                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff' }}>{displayName}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email || 'user@hema.com'}</div>
                                        </div>

                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.7)' }}
                                            onClick={() => { navigate(`/${user?.role}/dashboard`); setIsProfileOpen(false); }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LayoutDashboard size={15} />
                                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>Dashboard</span>
                                        </div>

                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.7)' }}
                                            onClick={() => { navigate(`/${user?.role}/profile`); setIsProfileOpen(false); }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Settings size={15} />
                                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>Settings & Profile</span>
                                        </div>

                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: '#ef4444', marginTop: 4 }}
                                            onClick={handleLogout}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={15} />
                                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500 }}>Log Out</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost hidden md:flex" style={{ padding: '9px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                                <LogIn size={14} /> Sign In
                            </Link>
                            <Link to="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                                Get Started
                            </Link>
                        </>
                    )}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(o => !o)}
                        style={{ background: 'none', border: 'none', color: '#fff', padding: 6 }}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        style={{
                            position: 'fixed', top: scrolled ? 72 : 100, left: 0, right: 0, bottom: 0,
                            background: 'var(--bg)', zIndex: 499,
                            borderTop: '1px solid var(--border)',
                            padding: '24px 5%', display: 'flex', flexDirection: 'column', gap: 8,
                        }}
                    >
                        {links.map(({ to, label, icon }) => (
                            <NavLink key={to} to={to} style={({ isActive }) => ({
                                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 18,
                                padding: '16px 20px', background: isActive ? 'rgba(217,0,37,0.08)' : 'var(--bg2)',
                                borderRadius: 12, color: isActive ? 'var(--red)' : '#fff',
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
                                borderLeft: isActive ? '3px solid var(--red)' : '3px solid transparent',
                            })}>
                                <span style={{ opacity: 0.8 }}>{icon}</span>
                                {label}
                            </NavLink>
                        ))}
                        <div style={{ marginTop: 'auto', paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {isAuthenticated ? (
                                <>
                                    <div style={{
                                        padding: '16px 20px', background: 'rgba(255,255,255,0.04)',
                                        borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: 'var(--red)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 700, fontSize: 16
                                        }}>
                                            {initials}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{displayName}</div>
                                            <div style={{ color: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{user?.email}</div>
                                        </div>
                                    </div>
                                    <Link to={`/${user?.role}/dashboard`} className="btn-ghost" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <LayoutDashboard size={15} /> Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="btn-primary" style={{ justifyContent: 'center' }}>Log Out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-ghost" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <LogIn size={15} /> Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary" style={{ justifyContent: 'center' }}>Get Started →</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

