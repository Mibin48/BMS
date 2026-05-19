import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel, CTABanner } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, ShieldCheck, Building2, Droplets, Landmark, Zap, Heart, Globe } from 'lucide-react';

const plans = [
    {
        id: 'clinic',
        label: 'CLINIC CORE',
        monthly: 2490,
        annual: 1990,
        popular: false,
        desc: 'Perfect for local clinics and private labs.',
        features: [
            'Single facility inventory tracking',
            'Up to 250 units/month throughput',
            'Essential stock level alerts',
            'Simple donor appointment booking',
            'Standard NACO digital reporting',
            'Advanced inventory forecasting',
            'Live expiry monitoring',
            'Cross-facility matching',
            'Donor tiering & badges',
        ],
        cta: 'Start Free Trial',
        ctaStyle: 'gh',
        icon: <Heart size={20} className="text-red" />
    },
    {
        id: 'hospital',
        label: 'HOSPITAL MAX',
        monthly: 8900,
        annual: 6900,
        popular: true,
        desc: 'Built for high-volume surgical hospitals.',
        features: [
            'Network management (up to 15 nodes)',
            '10,000+ units monthly throughput',
            'Advanced automated inventory hub',
            'Full donor relationship management',
            'Automated referral & recall campaigns',
            'Cross-facility unit reservation',
            'Custom system integration support',
            'Inter-district emergency transfers',
            '24/7 Priority Emergency Support',
            'Donor rewards & gamification',
        ],
        cta: 'Get Started Now',
        ctaStyle: 'pr',
        icon: <Zap size={20} className="text-red" />
    },
    {
        id: 'enterprise',
        label: 'REGIONAL NETWORK',
        monthly: null,
        annual: null,
        popular: false,
        desc: 'Comprehensive state-wide coordination.',
        features: [
            'Unlimited facilities across Kerala',
            'Unified State-wide visibility layers',
            'Predictive crisis & disaster modeling',
            'White-labeling for health department',
            'Full HL7/FHIR & API integrations',
            '99.99% Guaranteed uptime SLA',
            'On-site training for network leads',
            'Custom integration support',
            'State-wide disaster response coordination',
            'Dedicated account manager',
        ],
        cta: 'Contact Sales',
        ctaStyle: 'gh',
        icon: <Globe size={20} className="text-red" />
    },
];

const tableRows = [
    {
        section: 'INVENTORY & BLOOD ASSETS', rows: [
            { feat: 'Real-time stock tracking', vals: [true, true, true] },
            { feat: 'Units/month volume', vals: ['500', '10,000', 'Unlimited'] },
            { feat: 'Cross-facility matching', vals: [false, true, true] },
            { feat: 'RFID & Barcode support', vals: [false, true, true] },
            { feat: 'Expiry predictive alerts', vals: [true, true, true] },
            { feat: 'Temp-sensitive logs', vals: [true, true, true] },
        ]
    },
    {
        section: 'ANALYTICS & INTELLIGENCE', rows: [
            { feat: 'Basic daily dashboard', vals: [true, true, true] },
            { feat: 'Demand forecasting AI', vals: [false, '3-Month', '12-Month'] },
            { feat: 'Crisis & Shortage modeling', vals: [false, false, true] },
            { feat: 'Regional trend analysis', vals: [false, true, true] },
            { feat: 'Custom KPI builder', vals: [false, false, true] },
        ]
    },
    {
        section: 'SYSTEM & LOGISTICS', rows: [
            { feat: 'Dedicated instance', vals: [true, true, true] },
            { feat: 'Inter-district transfers', vals: [false, true, true] },
            { feat: 'Emergency bypass route', vals: [false, true, true] },
            { feat: 'Route optimization (BMS)', vals: [false, false, true] },
            { feat: 'Multi-node sync (Offline)', vals: [true, true, true] },
        ]
    },
    {
        section: 'ADMIN & COMPLIANCE', rows: [
            { feat: 'NACO Monthly reports', vals: [true, true, true] },
            { feat: 'Immutable audit logs', vals: [true, true, true] },
            { feat: 'Full state-level auditing', vals: [false, true, true] },
            { feat: 'Malayalam/English export', vals: [true, true, true] },
            { feat: 'White-labeling (Custom)', vals: [false, false, true] },
        ]
    },
    {
        section: 'DONORS & OUTREACH', rows: [
            { feat: 'Basic registration', vals: [true, true, true] },
            { feat: 'WhatsApp automation', vals: [false, true, true] },
            { feat: 'Donor tiering & badges', vals: [true, true, true] },
            { feat: 'Camp RSVP management', vals: [false, true, true] },
            { feat: 'Regional recall alerts', vals: [false, true, true] },
        ]
    },
];

const faqs = [
    {
        q: 'Is it official for NACO compliance?',
        a: "Yes, absolutely. HEM∆ is built from the ground up to follow all NACO guidelines, including automated generation of mandatory monthly reports and immutable unit logs for state audits."
    },
    {
        q: 'How does emergency matching work?',
        a: "In an 'Emergency' state, the platform bypasses standard filters to match the patient with the closest compatible unit across any hospital in our Kerala network, providing life-saving speed in under a second."
    },
    {
        q: 'Will it integrate with our HMS?',
        a: "Yes. Our Hospital Max and Regional Network plans include full HL7/FHIR support and API access, allowing us to 'talk' to most major Hospital Management Systems currently in use in India."
    },
    {
        q: 'Can we migrate data from our existing registers?',
        a: "Of course. We provide specialized data ingestion tools to migrate your legacy paper registers or digital Excel sheets into HEM∆. Our team typically handles the validation to ensure 100% record accuracy during the transition."
    },
    {
        q: 'What happens if the local internet goes down?',
        a: "HEM∆ is built with offline-first resilience. Critical inventory and request logic is cached locally. Your staff can continue to record transfers and collections, and the system automatically syncs every record as soon as connectivity is restored."
    },
    {
        q: 'Does it support multi-language alerts?',
        a: "Yes. From donor reminders to staff dashboards, we provide full support for Malayalam and English to ensure there are no communication barriers during critical operations in regional centers."
    },
    {
        q: 'How secure is the patient and donor data?',
        a: "We employ banking-grade AES-256 encryption for all Personal Identifiable Information (PII). Our platform is ISO 27001 certified and fully compliant with the latest Indian Healthcare Data Privacy and Protection laws."
    },
    {
        q: 'What is the setup time for a regional network?',
        a: "A single hospital can be live in 24 hours. For large regional networks requiring historical data migration and state-wide node mapping, we typically complete the rollout within 7 to 10 working days."
    },
    {
        q: 'Is there training provided for our staff?',
        a: "Yes. Every plan includes comprehensive digital training modules. Our 'Regional Network' plan also includes on-site workshops and a dedicated Technical Lead to train your department heads."
    }
];

function PricingCard({ plan, annual, index }) {
    const price = annual ? plan.annual : plan.monthly;

    return (
        <FadeUp delay={index * 0.1}>
            <motion.div
                whileHover={{ y: -8 }}
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 28,
                    padding: '12px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* TOP HEADER BLOCK (Greyish in image, elevated dark here) */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 24,
                    padding: '40px 24px',
                    marginBottom: 12,
                    textAlign: 'left'
                }}>
                    <div style={{
                        display: 'inline-block',
                        background: plan.popular ? 'var(--red)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        padding: '5px 16px',
                        borderRadius: 100,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        marginBottom: 32,
                        textTransform: 'uppercase'
                    }}>
                        {plan.label}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                        {price ? (
                            <>
                                <span style={{ fontFamily: 'var(--font-sub)', fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>₹{price.toLocaleString()}</span>
                                <span style={{ color: 'var(--text3)', fontSize: 16 }}>/month</span>
                            </>
                        ) : (
                            <span style={{ fontFamily: 'var(--font-sub)', fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Custom</span>
                        )}
                    </div>

                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        color: 'var(--text2)',
                        fontWeight: 400,
                        lineHeight: 1.4
                    }}>
                        {plan.desc}
                    </p>
                </div>

                {/* ACTION BUTTON (Floating between sections) */}
                <div style={{ padding: '0 12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={plan.ctaStyle === 'pr' ? 'btn-red' : 'btn-ghost'}
                        style={{
                            width: '100%',
                            padding: '16px',
                            justifyContent: 'center',
                            marginBottom: 32,
                            borderRadius: 14,
                            fontSize: 15,
                            fontWeight: 700,
                            background: plan.ctaStyle === 'pr' ? 'var(--red)' : '#1a1a1a',
                            border: 'none',
                            color: '#fff',
                            boxShadow: plan.ctaStyle === 'pr'
                                ? '0 10px 30px rgba(217,0,37,0.3)'
                                : '0 10px 20px rgba(0,0,0,0.4)',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.3s'
                        }}
                    >
                        {plan.cta}
                    </motion.button>
                </div>

                {/* FEATURES MODULE */}
                <div style={{ padding: '0 24px 28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {plan.features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <Check size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 3 }} />
                                <span style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 14,
                                    color: 'var(--text2)',
                                    fontWeight: 400,
                                    lineHeight: 1.4
                                }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </FadeUp>
    );
}

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="hema-card"
            style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.3s', border: open ? '1px solid var(--red)' : '1px solid var(--border)' }}
            onClick={() => setOpen(!open)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 17, color: open ? '#fff' : 'var(--text2)' }}>{q}</span>
                <div style={{ color: 'var(--red)' }}>{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)', marginTop: 16, lineHeight: 1.7, fontSize: 15, fontWeight: 300 }}>{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* HERO */}
            <section className="grid-bg" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 5% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 800 }}>
                    <FadeUp><MonoLabel style={{ justifyContent: 'center' }}>PRICING PLANS</MonoLabel></FadeUp>
                    <FadeUp delay={0.1}>
                        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(48px, 8vw, 84px)', lineHeight: 1, letterSpacing: '0.04em', margin: '24px 0' }}>
                            CHOOSE THE RIGHT PLAN <span className="text-red">FOR YOUR NEEDS.</span>
                        </h1>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        {/* Toggle Container */}
                        <div style={{
                            display: 'inline-flex',
                            background: 'rgba(255,255,255,0.03)',
                            padding: 6,
                            borderRadius: 100,
                            border: '1px solid var(--border)',
                            marginTop: 20
                        }}>
                            <button
                                onClick={() => setAnnual(false)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: 100,
                                    border: 'none',
                                    fontSize: 13,
                                    fontFamily: 'var(--font-sub)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: !annual ? 'var(--red)' : 'transparent',
                                    color: !annual ? '#fff' : 'var(--text3)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: 100,
                                    border: 'none',
                                    fontSize: 13,
                                    fontFamily: 'var(--font-sub)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: annual ? 'var(--red)' : 'transparent',
                                    color: annual ? '#fff' : 'var(--text3)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Annual <span style={{ marginLeft: 4, opacity: 0.8, fontSize: 10 }}>(-20%)</span>
                            </button>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* CARDS GRID */}
            <section style={{ padding: '40px 5% 100px' }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 32
                }}>
                    {plans.map((p, i) => (
                        <PricingCard key={p.id} plan={p} annual={annual} index={i} />
                    ))}
                </div>
            </section>

            {/* COMPARISON QUICK-LOOK */}
            <section style={{ padding: '80px 5%', background: 'linear-gradient(to bottom, var(--bg2), var(--bg))' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <FadeUp>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 42, textAlign: 'center', marginBottom: 60 }}>FEATURE COMPARISON</h2>
                    </FadeUp>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>FEATURES</th>
                                    <th style={{ padding: '20px', fontFamily: 'var(--font-sub)', fontSize: 15 }}>Clinic Core</th>
                                    <th style={{ padding: '20px', fontFamily: 'var(--font-sub)', fontSize: 15, color: 'var(--red)' }}>Hospital Max</th>
                                    <th style={{ padding: '20px', fontFamily: 'var(--font-sub)', fontSize: 15 }}>Regional</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows[0].rows.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '18px 20px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>{r.feat}</td>
                                        {r.vals.map((v, vi) => (
                                            <td key={vi} style={{ textAlign: 'center', padding: '18px 20px', fontSize: 14 }}>
                                                {typeof v === 'boolean' ? (v ? <Check size={18} color="var(--red)" style={{ margin: '0 auto' }} /> : '—') : v}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQS */}
            <section style={{ padding: '100px 5% 140px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <FadeUp>
                        <MonoLabel style={{ justifyContent: 'center' }}>HAVE QUESTIONS?</MonoLabel>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 42, textAlign: 'center', marginBottom: 48, marginTop: 12 }}>FREQUENTLY ASKED</h2>
                    </FadeUp>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {faqs.map((faq, i) => (
                            <FadeUp key={i} delay={i * 0.05}>
                                <FAQItem {...faq} />
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST BADGES */}
            <section style={{ borderTop: '1px solid var(--border)', background: '#08080C', padding: '60px 5%' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ShieldCheck color="var(--red)" size={24} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>ISO 27001 RECOGNIZED</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Building2 color="var(--red)" size={24} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>HIPAA COMPLIANT STACK</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Droplets color="var(--red)" size={24} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>NACO DIGITAL PARTNER</span>
                    </div>
                </div>
            </section>

            <CTABanner
                headline="READY TO MODERNIZE YOUR NETWORK?"
                subtext="Deploy HEM∆ in under 24 hours. Join 340+ elite hospitals across the state."
                btn1="Start Free Trial"
                btn2="Contact Support"
            />
            <Footer />
        </div>
    );
}
