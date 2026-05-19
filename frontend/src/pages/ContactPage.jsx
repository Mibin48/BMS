/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel, CTABanner } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, ChevronDown, CheckCircle, Zap, Clock, Shield, Radio, ArrowRight, Droplets, Check } from 'lucide-react';

const roles = ['Medical Officer', 'Hospital Administrator', 'Blood Bank Director', 'IT Manager', 'Government Official', 'Other'];
const interests = ['Request a Demo', 'Pricing Information', 'Technical Integration', 'Partnership', 'Press / Media', 'Support'];

const faqItems = [
    { q: 'How quickly can we get started?', a: "We can have the basics ready for you in about 2–3 hours. Typically, we'll have your team trained and the whole system live within 3 to 5 business days." },
    { q: 'Do you offer training in Malayalam?', a: "Absolutely. Our team is based right here in Kerala, and we'll come to your hospital to train your staff in both Malayalam and English." },
    { q: 'Can the government buy through GEM?', a: "Yes, HEM∆ is available on the Government e-Marketplace (GEM) and is fully approved for Kerala state procurement." },
    { q: 'What happens to our old data?', a: "We'll handle the move for you. Whether you use Excel or another software, our team provides free migration to make the switch as smooth as possible." },
    { q: 'What kind of support will we have?', a: "We're here whenever you need us. All our partners get email support, and our hospital partners have a direct line to our 24/7 priority team." },
];

const responseTimeFeatures = [
    { icon: <Zap size={14} />, label: '4hr response', sub: 'Business hours' },
    { icon: <Clock size={14} />, label: '24/7 emergency', sub: 'Critical line' },
    { icon: <Shield size={14} />, label: 'SSL encrypted', sub: 'End-to-end' },
    { icon: <Radio size={14} />, label: 'Kerala-based', sub: 'Local team' },
];



// ─── Status Ticker ───
function StatusTicker() {
    const messages = [
        'SYSTEM ONLINE · 340+ FACILITIES ACTIVE',
        'RESPONSE TIME: 3.2 HRS AVG',
        '14 DISTRICTS · ALL NODES CONNECTED',
        'ENCRYPTED CHANNEL · END-TO-END SECURE',
    ];
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setCurrent(c => (c + 1) % messages.length), 3200);
        return () => clearInterval(t);
    }, []);
    return (
        <div style={{
            background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.18)',
            borderRadius: 8, padding: '8px 16px', overflow: 'hidden', marginBottom: 28,
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.4s infinite', display: 'inline-block' }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em' }}>
                        {messages[current]}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─── Form helpers ───
const inputBase = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    padding: '13px 16px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: '#fff', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
};

function Field({ label, required, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6 }}>
                {required && <ArrowRight size={10} color="var(--red)" />}
                {label}{required && ' *'}
            </label>
            {children}
        </div>
    );
}

function SmartInput({ type = 'text', placeholder }) {
    const [focused, setFocused] = useState(false);
    return (
        <input type={type} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: focused ? 'rgba(217,0,37,0.03)' : 'rgba(255,255,255,0.03)' }}
        />
    );
}

function SmartTextarea({ placeholder, rows = 5 }) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea rows={rows} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, resize: 'vertical', lineHeight: 1.7, borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: focused ? 'rgba(217,0,37,0.03)' : 'rgba(255,255,255,0.03)' }}
        />
    );
}

function SmartSelect({ options }) {
    const [focused, setFocused] = useState(false);
    return (
        <select onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, cursor: 'pointer', borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: '#0a0a14', appearance: 'none', WebkitAppearance: 'none' }}
        >
            <option value="" style={{ background: '#0a0a14' }}>Select your role</option>
            {options.map(r => <option key={r} value={r} style={{ background: '#0a0a14' }}>{r}</option>)}
        </select>
    );
}

function FAQItem({ q, a, index }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${open ? 'rgba(217,0,37,0.3)' : 'var(--border)'}`, background: open ? 'rgba(217,0,37,0.04)' : 'var(--card)', transition: 'border-color 0.25s, background 0.25s', cursor: 'pointer' }}
            onClick={() => setOpen(o => !o)}
        >
            <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', flexShrink: 0 }}>{String(index + 1).padStart(2, '0')}</span>
                    <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15 }}>{q}</span>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ color: open ? 'var(--red)' : 'var(--text3)', flexShrink: 0 }}>
                    <ChevronDown size={16} />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 20px 52px' }}>
                            <div style={{ width: '100%', height: 1, background: 'rgba(217,0,37,0.15)', marginBottom: 14 }} />
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Page ───
export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [checked, setChecked] = useState([]);
    const [formProgress, setFormProgress] = useState(0);
    const [refNumber] = useState(() => Math.floor(Math.random() * 9000 + 1000));

    const toggleInterest = i => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
    useEffect(() => { setFormProgress(Math.min(100, checked.length * 17)); }, [checked]);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* ─── HERO ─── */}
            <section className="grid-bg" style={{ padding: '140px 5% 60px', position: 'relative', overflow: 'hidden', minHeight: '58vh', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-l" />
                {/* Concentric radar rings */}
                <div style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.13 }}>
                    {[160, 240, 320, 400].map((r, i) => (
                        <div key={r} style={{ position: 'absolute', width: r, height: r, borderRadius: '50%', border: '1px solid var(--red)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `pulse ${2.5 + i * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
                    ))}
                    <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 20px rgba(217,0,37,0.8)' }} />
                </div>

                <div style={{ maxWidth: 720, position: 'relative', zIndex: 2, paddingRight: '5%' }}>
                    <FadeUp><StatusTicker /><MonoLabel>WE'RE HERE TO HELP</MonoLabel></FadeUp>
                    <FadeUp delay={0.1}>
                        <h1 style={{
                            fontFamily: 'var(--font-head)',
                            fontWeight: 400,
                            fontSize: 'clamp(52px, 7vw, 84px)',
                            lineHeight: 0.95,
                            letterSpacing: '0.04em',
                            margin: '24px 0 32px'
                        }}>
                            <span style={{ display: 'block', color: '#fff' }}>WE'D LOVE TO</span>
                            <span style={{
                                display: 'block',
                                background: 'linear-gradient(135deg, var(--red) 0%, rgba(217,0,37,0.6) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                HEAR FROM YOU.
                            </span>
                        </h1>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.8 }}>
                            Whether you're a hospital administrator, blood bank director, or Kerala Health Department official — our team is standing by.
                        </p>
                    </FadeUp>
                </div>

                {/* Decorative background logo */}
                <FadeUp delay={0.3} style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', zIndex: 0, pointerEvents: 'none' }} className="hidden lg:flex">
                    <img
                        src="/logo/hema_full_icon.svg"
                        alt="HEM∆"
                        style={{ height: 'max(300px, 35vh)', width: 'auto', objectFit: 'contain', opacity: 0.55, filter: 'drop-shadow(0 0 40px rgba(217,0,37,0.25))' }}
                    />
                </FadeUp>
            </section>

            {/* ─── MAIN: FORM + INFO ─── */}
            <section style={{ padding: '64px 5% var(--section-pad)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>

                    {/* LEFT — FORM */}
                    <FadeUp>
                        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--card)' }}>
                            {/* Terminal top bar */}
                            <div style={{ background: 'rgba(217,0,37,0.06)', borderBottom: '1px solid rgba(217,0,37,0.15)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        HEM∆ · REACH OUT TO OUR TEAM
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 72, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                        <motion.div style={{ height: '100%', background: 'var(--red)', borderRadius: 2 }} animate={{ width: `${formProgress}%` }} transition={{ duration: 0.4 }} />
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{formProgress}% DONE</span>
                                </div>
                            </div>

                            <div style={{ padding: '40px 40px 44px' }}>
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                                            <div style={{ marginBottom: 28 }}>
                                                <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 32, marginBottom: 6, letterSpacing: '0.02em' }}>Send a Message</h2>
                                                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    Fields marked <ArrowRight size={12} color="var(--red)" /> are required. We respond within 4 hours.
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <Field label="Full Name" required><SmartInput placeholder="Dr. / Mr. / Ms." /></Field>
                                                    <Field label="Email Address" required><SmartInput type="email" placeholder="you@hospital.com" /></Field>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <Field label="Phone Number"><SmartInput type="tel" placeholder="+91" /></Field>
                                                    <Field label="Organization" required><SmartInput placeholder="Hospital / Clinic" /></Field>
                                                </div>
                                                <Field label="Your Role"><SmartSelect options={roles} /></Field>
                                                <Field label="I'm interested in">
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                                                        {interests.map(i => {
                                                            const active = checked.includes(i);
                                                            return (
                                                                <motion.label key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: active ? '#fff' : 'var(--text2)', background: active ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '8px 14px', transition: 'all 0.2s' }}
                                                                    onClick={() => toggleInterest(i)}
                                                                >
                                                                    {active && <Check size={10} color="var(--red)" />}
                                                                    {i}
                                                                </motion.label>
                                                            );
                                                        })}
                                                    </div>
                                                </Field>
                                                <Field label="Message" required>
                                                    <SmartTextarea placeholder="Describe your facility and how we can help…" />
                                                </Field>
                                                <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSubmitted(true)}
                                                    style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '15px', borderRadius: 12, letterSpacing: '0.04em' }}
                                                >
                                                    Send Message →
                                                </motion.button>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', letterSpacing: '0.06em', display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={10} color="var(--red)" /> ENCRYPTED</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={10} color="var(--red)" /> GDPR COMPLIANT</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={10} color="var(--red)" /> RESPONSE IN 4 HRS</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
                                                {[80, 104, 128].map((s, i) => (
                                                    <motion.div key={s} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.3)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }} />
                                                ))}
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CheckCircle size={48} color="#22c55e" />
                                                </motion.div>
                                            </div>
                                            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 32, marginBottom: 12, letterSpacing: '0.02em' }}>Message Received</h3>
                                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 24 }}>Thanks for reaching out! Our Kerala team will get back to you within 4 hours.</p>
                                            <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 8, padding: '8px 18px', letterSpacing: '0.06em' }}>
                                                REF: #HEM-2025-{refNumber}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </FadeUp>

                    {/* RIGHT — INFO STACK */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Quick stats 2×2 */}
                        <FadeUp delay={0.08}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {responseTimeFeatures.map(({ icon, label, sub }) => (
                                    <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                                        <span style={{ color: 'var(--red)', flexShrink: 0 }}>{icon}</span>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13 }}>{label}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* Emergency line */}
                        <FadeUp delay={0.12}>
                            <div style={{ position: 'relative', padding: '24px', borderRadius: 18, background: 'rgba(217,0,37,0.07)', border: '1px solid rgba(217,0,37,0.3)', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,0,37,0.18) 0%, transparent 70%)' }} />
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(217,0,37,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginRight: 8, animation: 'pulse 1.2s infinite', verticalAlign: 'middle' }} />
                                    24/7 EMERGENCY LINE
                                </div>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, color: 'var(--red)', lineHeight: 1, letterSpacing: '0.04em', marginBottom: 6 }}>1800-XXX-BLOOD</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--text2)' }}>Critical blood supply emergencies only</div>
                            </div>
                        </FadeUp>

                        {/* Office + contacts */}
                        <FadeUp delay={0.16}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
                                <div style={{ borderBottom: '1px solid var(--border)', padding: '13px 20px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HEADQUARTERS</span>
                                </div>
                                <div style={{ padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', gap: 11, marginBottom: 18 }}>
                                        <MapPin size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Thiruvananthapuram</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                                                HEM∆ Technologies Pvt. Ltd.<br />Technopark Campus, Phase III<br />Kerala — 695581
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                        {[
                                            { Icon: Phone, val: '+91 471 XXX XXXX', sub: 'Mon–Sat · 9am–6pm IST' },
                                            { Icon: Mail, val: 'hello@hema.health', sub: 'Replies within 4 hours' },
                                        ].map(({ Icon, val, sub }) => (
                                            <div key={val} style={{ display: 'flex', gap: 10 }}>
                                                <Icon size={13} color="var(--red)" style={{ flexShrink: 0, marginTop: 3 }} />
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14 }}>{val}</div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeUp>


                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section style={{ padding: '80px 5% 96px', background: '#0A0A12', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(217,0,37,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,0,37,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }} />
                <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
                    <FadeUp>
                        <div style={{ textAlign: 'center', marginBottom: 52 }}>
                            <MonoLabel>DIAGNOSTIC READOUT</MonoLabel>
                            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(28px,4vw,42px)', marginTop: 10, letterSpacing: '0.02em' }}>Quick Answers</h2>
                        </div>
                    </FadeUp>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {faqItems.map((f, i) => <FAQItem key={f.q} {...f} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <CTABanner
                headline="READY TO GET STARTED?"
                subtext="Skip the forms and book a 30-minute live demo with our Kerala team to see how HEM∆ can transform your facility."
                btn1="Book a Demo"
                btn2="View Pricing"
            />

            <Footer />
        </div>
    );
}