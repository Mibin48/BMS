import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── FadeUp wrapper ───────────────────────────────────────── */
export function FadeUp({ children, delay = 0, className = '', style = {} }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/* ─── Animated counter ─────────────────────────────────────── */
export function Counter({ to, suffix = '', decimals = 0 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const dur = 2200;
        const start = performance.now();
        const tick = now => {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(parseFloat((to * ease).toFixed(decimals)));
            if (p < 1) requestAnimationFrame(tick);
            else setVal(to);
        };
        requestAnimationFrame(tick);
    }, [inView, to, decimals]);
    return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

/* ─── Mono label tag ───────────────────────────────────────── */
export function MonoLabel({ children, style = {} }) {
    return (
        <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--red)',
            marginBottom: 16, ...style,
        }}>
            {children}
        </div>
    );
}

/* ─── Section hero headline (Bebas Neue) ───────────────────── */
export function HeroHeadline({ lines = [], size = 'clamp(64px,9vw,108px)' }) {
    // lines: array of { text, variant: 'solid'|'outline'|'red' }
    return (
        <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: size,
            lineHeight: 0.92, letterSpacing: '0.02em', fontWeight: 900
        }}>
            {lines.map(({ text, variant = 'solid' }, i) => (
                <span key={i} style={{
                    display: 'block',
                    color: variant === 'outline' ? 'transparent'
                        : variant === 'red' ? 'var(--red)'
                            : '#fff',
                    WebkitTextStroke: variant === 'outline' ? '2px var(--red)' : 'none',
                }}>
                    {text}
                </span>
            ))}
        </h1>
    );
}

/* ─── Red CTA Banner (reusable across pages) ───────────────── */
export function CTABanner({ headline, subtext, btn1 = 'Get Started', btn2 = 'Book a Demo' }) {
    return (
        <section style={{ padding: '0 5% var(--section-pad)', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <FadeUp>
                    <div style={{
                        borderRadius: 32,
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 'clamp(80px,12vw,140px) 5%',
                        background: '#0D0D14',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
                    }}>
                        {/* Background Image - Themed */}
                        <img
                            src="/cta_bg.png"
                            alt="Themed background"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.25,
                                filter: 'saturate(0) brightness(1.2)',
                                pointerEvents: 'none',
                                zIndex: 0
                            }}
                        />

                        {/* Creative Background Elements */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1
                        }}>
                            {/* Main Glow */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '120%', height: '140%',
                                background: 'radial-gradient(circle at center, rgba(217,0,37,0.08) 0%, transparent 60%)',
                                filter: 'blur(60px)'
                            }} />

                            {/* Floating Orbs */}
                            <motion.div
                                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', top: '-10%', right: '10%',
                                    width: 300, height: 300,
                                    background: 'radial-gradient(circle, rgba(217,0,37,0.1) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }}
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', bottom: '-10%', left: '5%',
                                    width: 400, height: 400,
                                    background: 'radial-gradient(circle, rgba(217,0,37,0.05) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            {/* Live Badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)',
                                padding: '6px 16px', borderRadius: 100, marginBottom: 32
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite' }} />
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)',
                                    letterSpacing: '0.15em', fontWeight: 700
                                }}>READY TO SCALE</span>
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-head)',
                                fontSize: 'clamp(48px,7vw,84px)',
                                letterSpacing: '0.02em',
                                lineHeight: 0.95,
                                marginBottom: 32,
                                fontWeight: 400,
                                color: '#fff'
                            }}>
                                {headline}
                            </h2>

                            <p style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 300,
                                fontSize: 19,
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: 1.6,
                                marginBottom: 48,
                                maxWidth: 640,
                                margin: '0 auto 48px'
                            }}>
                                {subtext}
                            </p>

                            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                                <motion.button
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary"
                                    style={{
                                        padding: '18px 40px',
                                        fontSize: 16,
                                        borderRadius: 14,
                                        boxShadow: '0 20px 40px rgba(217,0,37,0.3)'
                                    }}
                                >
                                    {btn1}
                                </motion.button>

                                <motion.button
                                    whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.3)', y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-ghost"
                                    style={{
                                        padding: '18px 40px',
                                        fontSize: 16,
                                        borderRadius: 14
                                    }}
                                >
                                    {btn2}
                                </motion.button>
                            </div>
                        </div>

                        {/* Decorative Grid or Noise */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                            zIndex: 0
                        }} />
                    </div>
                </FadeUp>
            </div>
        </section>
    );
}

/* ─── Compliance badge ─────────────────────────────────────── */
export function ComplianceBadge({ icon, title, subtitle }) {
    return (
        <div className="hema-card" style={{ padding: '28px 24px' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{subtitle}</div>
        </div>
    );
}

/* ─── Custom cursor ────────────────────────────────────────── */
export function CustomCursor() {
    const dot = useRef(null);
    const ring = useRef(null);
    useEffect(() => {
        const move = e => {
            if (dot.current) { dot.current.style.left = e.clientX + 'px'; dot.current.style.top = e.clientY + 'px'; }
            if (ring.current) { ring.current.style.left = e.clientX + 'px'; ring.current.style.top = e.clientY + 'px'; }
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return (
        <>
            <div ref={dot} className="cursor-dot" />
            <div ref={ring} className="cursor-ring" />
        </>
    );
}
