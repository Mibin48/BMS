import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

const stats = [
    { value: '4.2M+', label: 'Units Tracked', icon: Droplets },
    { value: '340+', label: 'Verified Partners', icon: ShieldCheck },
    { value: '14/14', label: 'Districts Active', icon: Zap },
];

export default function AuthLayout({
    children,
    tagline = ['HEM∆', 'BLOOD', 'NETWORK'],
    subtitle = 'Kerala blood management platform',
    backTo = '/',
    backLabel = 'Back to home',
    badge,
}) {
    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            fontFamily: 'var(--font-body)',
            background: 'var(--bg)',
            overflow: 'hidden'
        }}>            {/* ── LEFT PANEL (Mission Control Style) ── */}
            <div style={{
                width: '45%', minWidth: 460,
                background: '#050508',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column',
                padding: '64px',
                position: 'relative', overflow: 'hidden',
                flexShrink: 0,
            }} className="auth-left-panel">

                {/* Background Layer: Kinetic Grid */}
                <motion.div
                    animate={{
                        backgroundPosition: ['0px 0px', '40px 40px'],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'radial-gradient(rgba(217, 0, 37, 0.05) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        opacity: 0.4
                    }}
                />

                {/* Atmospheric Glows */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(circle at 0% 0%, rgba(217, 0, 37, 0.15) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(79, 70, 229, 0.1) 0%, transparent 40%)'
                }} />

                {/* Scanline Effect */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    zIndex: 2, backgroundSize: '100% 2px, 3px 100%', opacity: 0.1
                }} />

                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    style={{ position: 'relative', zIndex: 5, marginBottom: 80, display: 'flex', alignItems: 'center', gap: 20 }}
                >
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(217, 0, 37, 0.2)',
                                    '0 0 40px rgba(217, 0, 37, 0.5)',
                                    '0 0 20px rgba(217, 0, 37, 0.2)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                width: 64, height: 64, borderRadius: 18,
                                background: 'rgba(217, 0, 37, 0.08)',
                                border: '1px solid var(--red)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', zIndex: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <img src="/logo/hema_icon.svg" alt="HEM∆" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />

                            {/* Scanning Light Effect */}
                            <motion.div
                                animate={{ top: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{
                                    position: 'absolute', left: 0, width: '100%', height: '40%',
                                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)',
                                    pointerEvents: 'none'
                                }}
                            />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{ position: 'absolute', inset: -10, borderRadius: 24, border: '1px solid rgba(217, 0, 37, 0.3)', zIndex: 1 }}
                        />
                    </div>
                    <div>
                        <motion.div
                            initial={{ letterSpacing: '0.5em', opacity: 0 }}
                            animate={{ letterSpacing: '0.15em', opacity: 1 }}
                            transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                            style={{
                                fontFamily: 'var(--font-head)', fontSize: 42, fontWeight: 900,
                                color: '#fff', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 1
                            }}
                        >
                            HEM<span style={{ color: 'var(--red)', fontSize: 40, textShadow: '0 0 15px var(--red)', marginLeft: 2 }}>∆</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div style={{ flex: 1, position: 'relative', zIndex: 5 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {badge && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '6px 16px', borderRadius: '100px',
                                background: 'rgba(217,0,37,0.05)', border: '1px solid rgba(217,0,37,0.15)',
                                marginBottom: 24,
                                boxShadow: '0 0 20px rgba(217,0,37,0.1)'
                            }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.12em', fontWeight: 600 }}>{badge}</span>
                            </div>
                        )}

                        <h1 style={{
                            fontFamily: 'var(--font-head)', fontSize: 'clamp(52px, 5.5vw, 88px)',
                            lineHeight: 0.9, letterSpacing: '-0.02em', color: '#fff', marginBottom: 24
                        }}>
                            {tagline[0]}<br />
                            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.3)' }}>{tagline[1]}</span><br />
                            <span style={{ color: 'var(--red)' }}>{tagline[2]}</span>
                        </h1>

                        <p style={{
                            fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--text2)',
                            lineHeight: 1.6, maxWidth: 360, fontWeight: 300
                        }}>
                            {subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Dashboard Stats Nodes */}
                <div style={{ position: 'relative', zIndex: 5, display: 'grid', gap: 12 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.2em', marginBottom: 8 }}>PLATFORM ANALYTICS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {stats.map(({ value, label, icon: Icon }, idx) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 16, padding: '16px',
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: idx === 0 ? 'var(--red)' : 'rgba(255,255,255,0.05)' }} />
                                <div style={{ color: 'var(--text3)', marginBottom: 12 }}><Icon size={16} /></div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Interactive Decoration */}
                <motion.div
                    animate={{ height: ['20%', '60%', '20%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', right: 0, top: '20%', width: '2px',
                        background: 'linear-gradient(to bottom, transparent, var(--red), transparent)',
                        opacity: 0.5
                    }}
                />
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{
                flex: 1, background: '#07070B',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
                position: 'relative',
            }}>
                {/* Back nav */}
                <div style={{ padding: '32px 52px 0', flexShrink: 0 }}>
                    <Link to={backTo} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)',
                        textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        textTransform: 'uppercase', letterSpacing: '0.1em'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.transform = 'translateX(-4px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text3)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={16} color="var(--red)" />
                        {backLabel}
                    </Link>
                </div>

                {/* Form area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 64px' }}>
                    <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '0 52px 32px', flexShrink: 0, textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 12,
                        padding: '10px 24px', borderRadius: 100,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', WebkitBoxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            SECURE · NACO VERIFIED · KERALA HEALTH DEPT.
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(217, 0, 37, 0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--red); }
                
                @media (max-width: 1024px) {
                    .auth-left-panel { display: none !important; }
                }
            `}</style>
        </div>
    );
}
