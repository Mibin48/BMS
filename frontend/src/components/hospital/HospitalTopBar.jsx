import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, AlertTriangle, Search, Command, Settings, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { mockHospital, mockBloodRequests } from '../../data/hospitalMockData';
import EmergencyRequestModal from './EmergencyRequestModal';
import NotificationBell from '../NotificationBell';

const emergencyCount = mockBloodRequests.filter(r => r.priority === 'Emergency' && r.status === 'Pending').length;

export default function HospitalTopBar({ title, page }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.name || mockHospital.admin_name;
    const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('');

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
        <>
            <div style={{
                position: 'fixed', top: 0, left: 240, right: 0, height: 72,
                background: 'rgba(7,7,11,0.8)', backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px', zIndex: 30,
            }}>
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(217,0,37,0.3), transparent)' }} />

                {/* Left: Title + Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>{title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>HEM∆</span>
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>HOSPITAL</span>
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>/</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', fontWeight: 600, letterSpacing: '0.05em' }}>{(page || title).toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Search Bar (Mocked) */}
                    <div style={{ position: 'relative', marginLeft: 12 }} className="hidden xl:block">
                        <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Find blood bank or patient..." 
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

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Emergency Button */}
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'var(--red)', border: 'none', cursor: 'pointer',
                                padding: '10px 20px', borderRadius: 12,
                                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff',
                                boxShadow: '0 8px 16px rgba(217,0,37,0.25)', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <AlertTriangle size={16} /> Emergency Request
                        </button>

                        <div style={{ height: 32, width: 1, background: 'rgba(255,255,255,0.08)' }} />

                        {/* Status Label (Mocked) */}
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(34,197,94,0.05)', padding: '6px 14px',
                            borderRadius: 100, border: '1px solid rgba(34,197,94,0.15)'
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e', fontWeight: 800, letterSpacing: '0.05em' }}>VERIFIED FACILITY</span>
                        </div>
                    </div>

                    <div style={{ height: 32, width: 1, background: 'rgba(255,255,255,0.08)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }} ref={dropdownRef}>
                        <NotificationBell />
                        
                        {/* Avatar */}
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hidden md:flex">
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{mockHospital.city.toUpperCase()}</span>
                            </div>
                            <div style={{
                                width: 40, height: 40, borderRadius: 14,
                                background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--red)', letterSpacing: 1,
                                fontWeight: 700
                            }}>
                                {initials}
                            </div>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                            </motion.div>
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
                                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff' }}>{displayName}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.email || 'hospital@hema.com'}</div>
                                    </div>

                                    <div 
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.7)' }}
                                        onClick={() => { navigate('/hospital/profile'); setIsOpen(false); }}
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

            <AnimatePresence>
                {showModal && <EmergencyRequestModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </>
    );
}
