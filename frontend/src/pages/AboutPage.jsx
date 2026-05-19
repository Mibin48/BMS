import { useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel, HeroHeadline, CTABanner, Counter } from '../components/UI';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Linkedin, MapPin, Shield, Building2, Droplets, Landmark, Zap, Target, Network, Check, Minus } from 'lucide-react';

/* ─── Timeline ─────────────────────────────────────────────── */
const timeline = [
    {
        year: '2022', title: 'A NIGHT TO REMEMBER', side: 'left',
        body: 'Two doctors in Thiruvananthapuram saw a patient lose their life waiting for rare blood that was sitting in a fridge just 3km away. No one knew. HEM∆ was born that night to make sure it never happens again.'
    },
    {
        year: 'Early 2023', title: 'PROVING THE IDEA', side: 'right',
        body: 'We started small with 3 hospitals in Ernakulam. In just three months, we saw emergency wait times drop from nearly an hour to under 11 minutes. We knew we were onto something.'
    },
    {
        year: 'Mid 2023', title: 'JOINING FORCES', side: 'left',
        body: "The Kerala Health Department saw our results and brought us on board officially. We weren't just a startup anymore; we became part of the state's plan for a healthier future."
    },
    {
        year: 'Late 2023', title: 'A GROWING NETWORK', side: 'right',
        body: 'We hit 100 hospitals. For the first time, a hospital in one district could see a surplus in another and request it instantly. Moving blood across district lines became a reality.'
    },
    {
        year: '2024', title: 'LOOKING AHEAD', side: 'left',
        body: 'We launched our prediction engine. It actually worked—predicting a major shortage weeks before the monsoon rush, giving hospital teams time to stock up and save lives.'
    },
    {
        year: '2025', title: 'FOR EVERY MALAYALI', side: 'right',
        body: 'Today, HEM∆ is active in all 14 districts. With over 340 hospitals and 12,000 donors, we are one big community looking out for each other.'
    },
];

const team = [
    { name: 'Dr. Rajesh Kumar', role: 'Chief Medical Officer', location: 'Thiruvananthapuram', bio: 'I spent 15 years in emergency rooms seeing the struggle first-hand. Now, I make sure our tech works for doctors.', initials: 'RK' },
    { name: 'Priya Menon', role: 'CTO & Co-Founder', location: 'Kochi', bio: "Used to build systems for ISRO. Now, I'm using that same precision to build a safety net for our state.", initials: 'PM' },
    { name: 'Arun Krishnan', role: 'Head of Operations', location: 'Kozhikode', bio: "I handle the logistics so that blood doesn't just sit in a fridge—it gets where it's needed.", initials: 'AK' },
    { name: 'Dr. Anitha Nair', role: 'Compliance Director', location: 'Thrissur', bio: "I make sure every unit is tracked and every hospital follows the highest safety standards.", initials: 'AN' },
];

const partners = ['Kerala Health Dept.', 'NACO', 'NHP', 'WHO India', 'KIMS', 'Amrita Hospital'];

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* ── SECTION 1: HERO ──────────────────────────────── */}
            <section className="grid-bg" style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                padding: '140px 5% 100px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Animated dot grid */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle, rgba(217,0,37,0.15) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.4,
                    maskImage: `radial-gradient(ellipse 80% 80% at 0% 50%, black 0%, transparent 70%)`,
                    WebkitMaskImage: `radial-gradient(ellipse 80% 80% at 0% 50%, black 0%, transparent 70%)`,
                    pointerEvents: 'none'
                }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-l" />
                <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }} className="responsive-grid">
                    <div>
                        <FadeUp>
                            <MonoLabel> ABOUT HEM∆ · KERALA'S BLOOD INTELLIGENCE PLATFORM</MonoLabel>
                        </FadeUp>
                        <FadeUp delay={0.1}>
                            <HeroHeadline size="clamp(52px,7vw,84px)" lines={[
                                { text: 'BUILT FOR KERALA.', variant: 'solid' },
                                { text: 'BUILT TO', variant: 'solid' },
                                { text: 'SAVE LIVES.', variant: 'outline' },
                            ]} />
                        </FadeUp>
                        <FadeUp delay={0.2}>
                            <p style={{
                                fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 18,
                                color: 'var(--text2)', maxWidth: 520, lineHeight: 1.75, margin: '28px 0 56px',
                            }}>
                                HEM∆ was born in a Kerala hospital on a night when tragedy could have been avoided. We realized that in our hometowns, the difference between life and death is often just a matter of connection.
                            </p>
                        </FadeUp>
                        {/* Floating stat cards */}
                        <FadeUp delay={0.3}>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Founded', value: '2022' },
                                    { label: 'Serving', value: '14 Districts' },
                                    { label: 'Donors', value: '12,000+' },
                                    { label: 'Response', value: '< 11 min' },
                                ].map(({ label, value }) => (
                                    <motion.div key={label} whileHover={{ y: -3, borderColor: 'rgba(217,0,37,0.4)' }} style={{
                                        background: 'var(--card)', border: '1px solid var(--border)',
                                        borderLeft: '3px solid var(--red)', borderRadius: 14, padding: '20px 24px',
                                        transition: 'all 0.2s', flex: 1, minWidth: 140
                                    }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff' }}>{value}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>

                    {/* Right side Image */}
                    <FadeUp delay={0.4} className="hidden md:flex justify-center items-center">
                        <div style={{ position: 'relative', width: '100%', maxWidth: 540, marginLeft: 'auto' }}>
                            <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(217,0,37,0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                            <img
                                src="/blood_intel_hero.png"
                                alt="Neural Health Intelligence"
                                style={{
                                    width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover',
                                    borderRadius: 24, border: '1px solid var(--border)', position: 'relative', zIndex: 1,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                }}
                            />
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', bottom: -24, left: -24, background: 'var(--card)',
                                    border: '1px solid var(--border)', padding: '16px 24px', borderRadius: 16, zIndex: 2,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 12
                                }}
                            >
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse 2s infinite' }} />
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>14 Districts Active</div>
                            </motion.div>
                        </div>
                    </FadeUp>
                </div>
                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}
                >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
                    <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, rgba(217,0,37,0.6), transparent)` }} />
                </motion.div>
            </section>

            {/* ── SECTION 2: MISSION ───────────────────────────── */}
            <section style={{ padding: '100px 5%', background: '#0A0A12', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    fontFamily: 'var(--font-head)', fontSize: 'clamp(80px,20vw,240px)',
                    color: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap', pointerEvents: 'none',
                    letterSpacing: '0.05em',
                }}>MISSION</div>
                <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
                    <FadeUp>
                        <MonoLabel style={{ justifyContent: 'center', display: 'flex' }}>OUR PURPOSE</MonoLabel>
                        <blockquote style={{
                            fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(28px,4vw,44px)',
                            lineHeight: 1.1, marginBottom: 28, letterSpacing: '0.02em', color: '#fff'
                        }}>
                            "To ensure no patient in Kerala waits for blood. Ever."
                        </blockquote>
                        <div style={{ width: 80, height: 3, background: 'var(--red)', margin: '0 auto 32px' }} />
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 18, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 780, margin: '0 auto' }}>
                            We believe that technology only matters when it serves people. HEM∆ is our way of making sure that every hospital in Kerala, from the biggest cities to the quietest villages, can get the blood they need to save a neighbor, a friend, or a family member.
                        </p>
                    </FadeUp>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 56, textAlign: 'left' }} className="three-col">
                        {[
                            { icon: <Zap size={28} color="var(--red)" />, title: 'Speed', desc: 'Blood where it\'s needed in under 11 minutes average response time' },
                            { icon: <Target size={28} color="var(--red)" />, title: 'Precision', desc: '99.98% match accuracy across all 14 Kerala districts' },
                            { icon: <Network size={28} color="var(--red)" />, title: 'Network', desc: '340+ hospitals connected in one unified blood intelligence platform' }
                        ].map(({ icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -3 }}
                                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 22px', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,0,37,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <div style={{ marginBottom: 16 }}>{icon}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#fff' }}>{title}</div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 3: THE PROBLEM ───────────────────────── */}
            <section style={{ padding: 'var(--section-pad) 5%', background: '#07070B' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }} className="responsive-grid">
                    <FadeUp>
                        <MonoLabel>THE KERALA REALITY</MonoLabel>
                        <div style={{ borderLeft: '3px solid var(--red)', paddingLeft: 24 }}>
                            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(36px,5vw,52px)', lineHeight: 1, marginBottom: 20, letterSpacing: '0.02em', color: '#fff' }}>
                                The Numbers<br />Don't Lie.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8 }}>
                                Before HEM∆, Kerala's blood supply chain relied on phone calls, paper registers, and disconnected spreadsheets. Critical shortages went undetected until it was too late.
                            </p>
                        </div>
                    </FadeUp>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <FadeUp delay={0.0}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red)', borderRadius: 14, padding: '24px 28px' }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(48px,8vw,80px)', color: 'var(--red)', lineHeight: 1 }}>
                                    <Counter to={67} suffix="%" />
                                </div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff', marginTop: 8 }}>of blood banks in Kerala had no real-time inventory system</p>
                            </div>
                        </FadeUp>
                        <FadeUp delay={0.12}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red)', borderRadius: 14, padding: '24px 28px' }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(48px,8vw,80px)', color: 'var(--red)', lineHeight: 1 }}>
                                    ₹4.2CR
                                </div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff', marginTop: 8 }}>worth of blood units wasted annually due to expiry mismanagement</p>
                            </div>
                        </FadeUp>
                        <FadeUp delay={0.24}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red)', borderRadius: 14, padding: '24px 28px' }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(48px,8vw,80px)', color: 'var(--red)', lineHeight: 1 }}>
                                    <Counter to={48} suffix=" MIN" />
                                </div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff', marginTop: 8 }}>average emergency blood request response time before HEM∆</p>
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.3}>
                            <div style={{
                                marginTop: 14,
                                background: 'rgba(217,0,37,0.05)',
                                border: '1px solid rgba(217,0,37,0.15)',
                                borderRadius: 14,
                                padding: '20px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', flexShrink: 0, animation: 'pulse 2s infinite' }} />
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
                                    <span style={{ color: '#22c55e', fontWeight: 700 }}>After HEM∆:</span>
                                    {' '}Average response time dropped from 48 minutes to{' '}
                                    <span style={{ color: '#fff', fontWeight: 700 }}>under 11 minutes.</span>
                                    {' '}Zero cross-district blood wastage incidents in 2024.
                                </p>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* ── NEW SECTION: IMPACT ────────────────────────── */}
            <section style={{ padding: 'var(--section-pad) 5%', background: '#0D0D14', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <FadeUp>
                        <MonoLabel style={{ textAlign: 'center', justifyContent: 'center', display: 'flex', marginBottom: 56 }}>
                            IMPACT IN NUMBERS
                        </MonoLabel>
                    </FadeUp>

                    <div className="impact-grid" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)'
                    }}>
                        {[
                            { value: 4.2, suffix: 'M+', decimals: 1, label: 'Units Tracked', sub: 'Annually across Kerala' },
                            { value: 340, suffix: '+', decimals: 0, label: 'Hospitals', sub: 'Connected statewide' },
                            { value: 12, suffix: 'K+', decimals: 0, label: 'Donors', sub: 'Registered on platform' },
                            { value: 78, suffix: '%', decimals: 0, label: 'Waste Reduced', sub: 'Since deployment' },
                        ].map(({ value, suffix, decimals, label, sub }, i) => (
                            <FadeUp key={label} delay={i * 0.08}>
                                <div style={{
                                    background: 'var(--card)', padding: '48px 32px', textAlign: 'center',
                                    borderRight: i < 3 ? '1px solid var(--border)' : 'none', position: 'relative', overflow: 'hidden', height: '100%'
                                }}>
                                    <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', background: 'rgba(217,0,37,0.08)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                                    <div style={{
                                        fontFamily: 'var(--font-head)', fontSize: 'clamp(44px,5vw,64px)', fontWeight: 900,
                                        letterSpacing: '-2px', background: `linear-gradient(135deg, #fff 40%, var(--red))`,
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1
                                    }}>
                                        <Counter to={value} suffix={suffix} decimals={decimals} />
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginTop: 14, marginBottom: 6 }}>{label}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.05em' }}>{sub}</div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 4: THE EXACT AUGUST-SITE STICKY PROCESS TIMELINE ───────── */}
            <section ref={containerRef} className="relative bg-[#000000] py-32 font-[var(--font-inter)] overflow-hidden">
                {/* Vibrant Background Grid */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle, rgba(222, 7, 43, 0.6) 2px, transparent 2px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.9,
                    maskImage: `linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)`,
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
                {/* Vibrant red ambient glow */}
                <div className="absolute inset-0 pointer-events-none z-0" style={{
                    background: `linear-gradient(to bottom, transparent 0%, rgba(217,0,37,0.12) 15%, rgba(217,0,37,0.12) 85%, transparent 100%),
                                 radial-gradient(ellipse 60% 100% at 50% 50%, rgba(217,0,37,0.1) 0%, transparent 80%)`
                }} />

                <div className="text-center mb-4 relative z-30 pt-10">
                    <h2 className="font-[var(--font-head)] font-normal text-6xl md:text-8xl leading-none text-white tracking-tighter">
                        our <br /> <span className="text-[var(--red)] italic">journey.</span>
                    </h2>
                </div>

                {/* The Absolute Timeline Canvas */}
                <div className="relative w-full h-[400vh] mt-20">
                    {/* SVG Continuous Path Container */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* Faint Background Track */}
                        <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1000 4000" preserveAspectRatio="none">
                            <path
                                d="M 500 0 C 850 150, 850 250, 850 400 C 850 650, 150 800, 150 1040 C 150 1300, 850 1450, 850 1680 C 850 1950, 150 2100, 150 2320 C 150 2600, 850 2750, 850 2960 C 850 3250, 150 3400, 150 3600 C 150 3850, 500 3950, 500 4000"
                                stroke="#ffffff" strokeWidth="6" fill="none"
                            />
                        </svg>

                        {/* The Liquid SVG Path */}
                        <svg className="absolute w-full h-full" viewBox="0 0 1000 4000" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 0 12px rgba(217,0,37,0.6))' }}>
                            <motion.path
                                d="M 500 0 C 850 150, 850 250, 850 400 C 850 650, 150 800, 150 1040 C 150 1300, 850 1450, 850 1680 C 850 1950, 150 2100, 150 2320 C 150 2600, 850 2750, 850 2960 C 850 3250, 150 3400, 150 3600 C 150 3850, 500 3950, 500 4000"
                                stroke="var(--red)" strokeWidth="12" fill="none" style={{ pathLength }} strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Absolutely Positioned Nodes and Text */}
                    <div className="absolute inset-0 z-20">
                        {timeline.map((item, idx) => {
                            const nodes = [
                                { top: 10, left: 85 },
                                { top: 26, left: 15 },
                                { top: 42, left: 85 },
                                { top: 58, left: 15 },
                                { top: 74, left: 85 },
                                { top: 90, left: 15 },
                            ];
                            const node = nodes[idx];
                            const dotOnRight = node.left > 50;

                            return (
                                <div key={idx} className="absolute" style={{ top: `${node.top}%`, left: `${node.left}%` }}>
                                    {/* The interactive hollow node */}
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-[3px] border-[#D90025] shadow-[0_0_15px_rgba(217,0,37,0.5)] z-30"
                                        initial={{ backgroundColor: '#000000' }}
                                        whileInView={{ backgroundColor: '#D90025' }}
                                        viewport={{ margin: "-50% 0px -50% 0px" }}
                                        transition={{ duration: 0.15 }}
                                    />

                                    {/* Text Block & Pointer System */}
                                    <motion.div
                                        className={`absolute top-1/2 -translate-y-1/2 flex items-center ${dotOnRight ? 'right-full' : 'left-full'}`}
                                        initial={{ opacity: 0, x: dotOnRight ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ margin: "-40% 0px -40% 0px" }}
                                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
                                    >
                                        {/* Outward Pointer for Left-sided dots */}
                                        {!dotOnRight && (
                                            <div className="h-[1px] w-[15vw] md:w-[25vw] bg-gradient-to-r from-[var(--red)] to-transparent opacity-60 shrink-0" />
                                        )}

                                        <div className={`w-[60vw] md:w-[40vw] flex flex-col justify-center ${dotOnRight ? 'pr-6 md:pr-12 items-end text-right' : 'pl-6 md:pl-12 items-start text-left'}`}>
                                            <div className="font-[var(--font-mono)] text-[var(--red)] text-xs md:text-sm tracking-[0.3em] font-semibold mb-3">
                                                {item.year}
                                            </div>
                                            <h3 className="font-[var(--font-head)] text-[2rem] md:text-5xl text-white mb-5 uppercase tracking-tighter leading-none drop-shadow-md">
                                                {item.title}
                                            </h3>
                                            <p className="text-zinc-300 text-[15px] md:text-lg font-light leading-relaxed max-w-[420px]">
                                                {item.body}
                                            </p>
                                        </div>

                                        {/* Outward Pointer for Right-sided dots */}
                                        {dotOnRight && (
                                            <div className="h-[1px] w-[15vw] md:w-[25vw] bg-gradient-to-l from-[var(--red)] to-transparent opacity-60 shrink-0" />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SECTION 5: TEAM ──────────────────────────────── */}
            <section style={{ padding: 'var(--section-pad) 5%', background: '#07070B', textAlign: 'center' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <FadeUp>
                        <MonoLabel>THE PEOPLE</MonoLabel>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,5vw,48px)', marginBottom: 12, letterSpacing: '0.04em', color: '#fff' }}>Meet the Team</h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', marginBottom: 64 }}>The minds building Kerala's blood intelligence platform.</p>
                    </FadeUp>
                    <div className="four-col">
                        {team.map(({ name, role, location, bio, initials }, i) => {
                            const ROLE_COLORS = {
                                'Chief Medical Officer': '#D90025',
                                'CTO & Co-Founder': '#3b82f6',
                                'Head of Operations': '#f59e0b',
                                'Compliance Director': '#22c55e',
                            };
                            return (
                                <FadeUp key={name} delay={i * 0.1}>
                                    <motion.div whileHover={{ y: -6, borderColor: 'rgba(217,0,37,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }} transition={{ duration: 0.25 }} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', position: 'relative', textAlign: 'left', transition: 'all 0.2s', height: '100%' }}>
                                        <div style={{ position: 'relative', marginBottom: 20 }}>
                                            {/* Avatar circle with glow */}
                                            <div style={{
                                                width: 72, height: 72, borderRadius: '50%',
                                                background: `linear-gradient(135deg, rgba(217,0,37,0.3), rgba(217,0,37,0.05))`,
                                                border: '1px solid rgba(217,0,37,0.25)', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 800,
                                                fontSize: 22, color: '#fff', position: 'relative', marginBottom: 16
                                            }}>
                                                {initials}
                                                {/* Glow behind avatar */}
                                                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'rgba(217,0,37,0.1)', filter: 'blur(8px)', zIndex: -1 }} />
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{name}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: ROLE_COLORS[role] || 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{role}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                                            <MapPin size={11} color="var(--text3)" />
                                            {location}
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.6 }}>"{bio}"</p>
                                        <a href="#" style={{ position: 'absolute', top: 28, right: 24, color: 'var(--text3)', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                                        >
                                            <Linkedin size={15} />
                                        </a>
                                    </motion.div>
                                </FadeUp>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SECTION 6: PARTNERS ──────────────────────────── */}
            <section style={{ padding: 'var(--section-pad) 5%', background: '#0A0A12', textAlign: 'center' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <FadeUp>
                        <MonoLabel>CERTIFICATIONS & PARTNERSHIPS</MonoLabel>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(28px,4.5vw,44px)', marginBottom: 56, letterSpacing: '0.04em', color: '#fff' }}>Trusted by the System That Matters</h2>
                    </FadeUp>
                    {/* Partner logos */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 56 }}>
                        {partners.map(p => (
                            <div key={p} style={{
                                padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border)',
                                fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: 'var(--text3)',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >{p}</div>
                        ))}
                    </div>
                    {/* Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }} className="four-col">
                        {[
                            { icon: <Shield size={22} color="#D90025" />, title: 'ISO 27001', sub: 'Certified' },
                            { icon: <Building2 size={22} color="#3b82f6" />, title: 'HIPAA', sub: 'Compliant' },
                            { icon: <Droplets size={22} color="#D90025" />, title: 'NACO', sub: 'Registered' },
                            { icon: <Landmark size={22} color="#22c55e" />, title: 'Kerala Govt.', sub: 'Approved' },
                        ].map(({ icon, title, sub }) => (
                            <FadeUp key={title}>
                                <motion.div whileHover={{ y: -4 }} style={{
                                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
                                    padding: '28px 24px', textAlign: 'center', cursor: 'default'
                                }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14, background: 'rgba(217,0,37,0.08)',
                                        border: '1px solid rgba(217,0,37,0.15)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', margin: '0 auto 16px'
                                    }}>
                                        {icon}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>{title}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{sub}</div>
                                </motion.div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── NEW SECTION: PRESS ─────────────────────────── */}
            <section style={{ padding: 'var(--section-pad) 5%', background: 'var(--bg)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <FadeUp>
                        <MonoLabel>AS SEEN IN</MonoLabel>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(28px,4vw,40px)', marginBottom: 52, letterSpacing: '0.03em' }}>
                            In The Press
                        </h2>
                    </FadeUp>

                    <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                        {[
                            { outlet: 'The Hindu', quote: 'HEM∆ is redefining how Kerala manages its blood supply — a model for all of India.', date: 'March 2024' },
                            { outlet: 'Mathrubhumi', quote: 'The platform that prevented a blood crisis during the 2024 monsoon floods.', date: 'August 2024' },
                            { outlet: 'Kerala IT Mission', quote: 'Selected as a flagship digital health initiative under Kerala\'s health-tech roadmap.', date: 'January 2025' },
                        ].map(({ outlet, quote, date }, i) => (
                            <motion.div key={outlet} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -4 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '2px solid var(--red)', borderRadius: 14, padding: '28px 24px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>{outlet}</div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#fff', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20 }}>"{quote}"</p>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', paddingTop: 16, borderTop: '1px solid var(--border)' }}>{date}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 6: CTA ───────────────────────────────── */}
            <CTABanner
                headline="Join the Data-Driven Era of Blood Banking"
                sub="Whether you donate or run a hospital, your contribution builds a safer Kerala."
                btn1="Hospital Portal"
                btn2="Contact Us"
            />

            <Footer />
        </div>
    );
}

