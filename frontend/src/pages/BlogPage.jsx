/* eslint-disable no-unused-vars */
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel } from '../components/UI';
import { Search, ArrowRight, Clock, Calendar, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Blood Banking', 'Compliance', 'Technology', 'Kerala Health', 'Case Studies', 'Guides'];

const catColors = {
    'Blood Banking': { bg: 'rgba(217,0,37,0.15)', color: 'var(--red)', border: 'rgba(217,0,37,0.3)' },
    'Compliance': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    'Technology': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    'Kerala Health': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'Case Studies': { bg: 'rgba(217,0,37,0.08)', color: 'var(--red)', border: 'rgba(217,0,37,0.2)' },
    'Guides': { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
};

// Unsplash images mapped per category — dark, dramatic, medical
const catImages = {
    'Blood Banking': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=75&fit=crop',
    'Compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75&fit=crop',
    'Technology': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&fit=crop',
    'Kerala Health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=75&fit=crop',
    'Case Studies': 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=75&fit=crop',
    'Guides': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=75&fit=crop',
};

const posts = [
    { title: "When Blood is Rare: The Story of O-Negative in Kerala", cat: 'Blood Banking', date: 'Jan 12, 2025', read: '6 min', excerpt: "How one rare blood type unites our community—and how we're making sure it reaches the patients who need it most." },
    { title: 'Staying Safe: A Simple Guide to New Compliance Rules', cat: 'Compliance', date: 'Jan 8, 2025', read: '12 min', excerpt: "Meeting standards doesn't have to be complicated. Here's a clear look at what the latest guidelines mean for your facility." },
    { title: 'The Crystal Ball: Predicting Blood Demand with AI', cat: 'Technology', date: 'Jan 5, 2025', read: '9 min', excerpt: "How we're using technology to look into the future and prevent shortages before they even happen in our hometowns." },
    { title: 'Monsoon Readiness: Keeping Our Community Safe', cat: 'Kerala Health', date: 'Dec 28, 2024', read: '7 min', excerpt: "The rains bring challenges, but we can be ready. Here's how to make sure your blood bank is prepared for the season." },
    { title: 'Putting Down the Pen: My First Month with Digital Records', cat: 'Guides', date: 'Dec 20, 2024', read: '11 min', excerpt: "A Medical Officer shares their honest journey of moving from paper registers to a digital-first approach." },
    { title: 'The Tech Behind the Scenes: Implementing RFID', cat: 'Technology', date: 'Dec 15, 2024', read: '8 min', excerpt: "A friendly look at how RFID tracking works and why it's a game-changer for hospital safety." },
    { title: '90 Days in Thrissur: A Story of Faster Care', cat: 'Case Studies', date: 'Dec 10, 2024', read: '10 min', excerpt: "How a local hospital team worked together to cut wait times and save more lives than ever before." },
    { title: "Kerala's Blood Supply: What 3 Years of Data Taught Us", cat: 'Blood Banking', date: 'Dec 5, 2024', read: '14 min', excerpt: "Finding the patterns in our history to build a stronger and more reliable future for our healthcare system." },
    { title: 'Building a Great Team: Training Your Blood Bank Staff', cat: 'Guides', date: 'Nov 28, 2024', read: '16 min', excerpt: "It's all about the people. How to help your team feel confident and empowered with modern tools." },
    { title: "Empowering Rural Kerala: The Mobile Donation Unit Journey", cat: 'Kerala Health', date: 'Nov 22, 2024', read: '9 min', excerpt: "How taking the donor experience to the doorstep is changing the landscape of rural healthcare in our state." },
    { title: "The Future of Rare Blood Registries: A Statewide Approach", cat: 'Blood Banking', date: 'Nov 15, 2024', read: '13 min', excerpt: "Connecting small districts to a central rare blood database so no patient is left waiting for a compatible match." },
    { title: "Security First: Protecting Patient Privacy in a Digital Age", cat: 'Compliance', date: 'Nov 8, 2024', read: '10 min', excerpt: "Behind the scenes of how we keep every piece of sensitive health data safe and compliant with global standards." },
];

function CatBadge({ cat }) {
    const s = catColors[cat] || catColors['Blood Banking'];
    return (
        <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px', borderRadius: 100,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block',
            flexShrink: 0,
        }}>{cat}</span>
    );
}

function PostCard({ post, index }) {
    const [hovered, setHovered] = useState(false);
    const img = catImages[post.cat] || catImages['Blood Banking'];
    const accentColor = (catColors[post.cat] || catColors['Blood Banking']).color;

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                cursor: 'pointer',
                borderRadius: 20,
                overflow: 'hidden',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                borderColor: hovered ? accentColor.replace('var(--red)', 'rgba(217,0,37,0.5)') : 'var(--border)',
                boxShadow: hovered ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor === 'var(--red)' ? 'rgba(217,0,37,0.2)' : accentColor + '33'}` : 'none',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
                <motion.img
                    src={img}
                    alt={post.title}
                    loading="lazy"
                    animate={{ scale: hovered ? 1.06 : 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        filter: 'grayscale(20%) brightness(0.5)',
                        display: 'block',
                    }}
                />
                {/* Red tint overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, rgba(217,0,37,0.12) 0%, rgba(7,7,11,0.65) 100%)',
                }} />
                {/* Bottom fade */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                    background: 'linear-gradient(to top, var(--card) 0%, transparent 100%)',
                }} />
                {/* Badge sits on the image */}
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <CatBadge cat={post.cat} />
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <h3 style={{
                    fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 20, lineHeight: 1.35,
                    transition: 'color 0.2s',
                    color: hovered ? '#fff' : 'var(--text)',
                    letterSpacing: '0.02em'
                }}>
                    {post.title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
                    color: 'var(--text2)', lineHeight: 1.7, flex: 1,
                }}>
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            <Calendar size={10} />{post.date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            <Clock size={10} />{post.read} read
                        </span>
                    </div>
                    <motion.div
                        animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRight size={15} color="var(--red)" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// Stat ticker shown in the hero
function StatPill({ value, label }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '14px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            backdropFilter: 'blur(8px)',
        }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--red)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</span>
        </div>
    );
}

export default function BlogPage() {
    const [activeCat, setActiveCat] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = posts.filter(p =>
        (activeCat === 'All' || p.cat === activeCat) &&
        (search === '' || p.title.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* ─── HERO ─── */}
            <section className="grid-bg" style={{ padding: '140px 5% 90px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-tl" />

                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                    {/* Left — headline */}
                    <div>
                        <FadeUp><MonoLabel>KNOWLEDGE BASE · HEMA INSIGHTS</MonoLabel></FadeUp>
                        <FadeUp delay={0.1}>
                            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(52px,8vw,82px)', lineHeight: 1.1, letterSpacing: '0.04em', margin: '20px 0 24px' }}>
                                <span style={{ display: 'block', color: '#fff' }}>STORIES</span>
                                <span style={{ display: 'block', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.35)' }}>FROM OUR</span>
                                <span style={{ display: 'block', color: 'var(--red)' }}>COMMUNITY.</span>
                            </h1>
                        </FadeUp>
                        <FadeUp delay={0.18}>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.8, marginBottom: 36 }}>
                                Real stories, research, and helpful guides built for the people keeping Kerala's blood supply safe every day.
                            </p>
                        </FadeUp>

                        {/* Search bar */}
                        <FadeUp delay={0.24}>
                            <div style={{ position: 'relative', maxWidth: 520 }}>
                                <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search articles, case studies, guides…"
                                    style={{
                                        width: '100%', background: 'var(--card)',
                                        border: '1px solid var(--border)', borderRadius: 12,
                                        padding: '14px 20px 14px 46px',
                                        fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff',
                                        outline: 'none', transition: 'border-color 0.25s, box-shadow 0.25s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,0,37,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </FadeUp>

                        {/* Stats row */}
                        <FadeUp delay={0.32}>
                            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                                <StatPill value="9+" label="Articles" />
                                <StatPill value="340+" label="Facilities" />
                                <StatPill value="2.4K" label="Subscribers" />
                            </div>
                        </FadeUp>
                    </div>

                    {/* Right — featured visual */}
                    <FadeUp delay={0.14}>
                        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', height: 420 }}>
                            <img
                                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=900&q=80&fit=crop"
                                alt="Medical laboratory"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(25%) brightness(0.45)', display: 'block' }}
                            />
                            {/* Overlays */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(217,0,37,0.22) 0%, rgba(7,7,11,0.7) 100%)' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' }} />
                            {/* Scan lines */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)', pointerEvents: 'none' }} />

                            {/* Floating stat card */}
                            <div style={{
                                position: 'absolute', bottom: 32, left: 28,
                                background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(217,0,37,0.25)', borderRadius: 16,
                                padding: '18px 24px',
                            }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 42, color: 'var(--red)', lineHeight: 1 }}>67%</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff', marginTop: 4 }}>Less Blood Wastage</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>ERNAKULAM · 90 DAYS</div>
                            </div>

                            {/* Live badge */}
                            <div style={{
                                position: 'absolute', top: 24, right: 24,
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(10,10,18,0.8)', backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border)', borderRadius: 100,
                                padding: '6px 14px',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.4s infinite', display: 'inline-block' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Data</span>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ─── FEATURED POST ─── */}
            <section style={{ padding: '0 5% 72px' }}>
                <FadeUp>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 3, height: 18, background: 'var(--red)', borderRadius: 2 }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured Case Study</span>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 420px', gap: 0,
                            borderRadius: 24, overflow: 'hidden',
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        }}>
                            {/* Left content */}
                            <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <CatBadge cat="Case Studies" />
                                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(22px,3vw,34px)', lineHeight: 1.22, margin: '20px 0 18px', maxWidth: 520, letterSpacing: '0.02em' }}>
                                        How Ernakulam Cut Blood Wastage by 67% in Just 90 Days
                                    </h2>
                                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 500, marginBottom: 28 }}>
                                        Learn how three local hospital teams worked together to change their inventory habits—saving blood, saving time, and most importantly, saving more lives.
                                    </p>
                                </div>

                                <div>
                                    {/* Author */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>AK</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14 }}>Dr. Anitha Krishnan</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Jan 15, 2025 · 8 min read</div>
                                        </div>
                                    </div>

                                    {/* Metrics row */}
                                    <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                                        {[['67%', 'Wastage Reduced'], ['74%', 'Faster Response'], ['94%', 'Compliance Score']].map(([v, l]) => (
                                            <div key={l}>
                                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--red)', lineHeight: 1 }}>{v}</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <a href="#" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10,
                                        color: '#fff', background: 'var(--red)',
                                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14,
                                        padding: '12px 24px', borderRadius: 100, textDecoration: 'none',
                                        transition: 'opacity 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        Read Full Case Study <ArrowRight size={15} />
                                    </a>
                                </div>
                            </div>

                            {/* Right image panel */}
                            <div style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=700&q=80&fit=crop"
                                    alt="Ernakulam hospital case study"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) brightness(0.45)', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, transparent 50%, var(--card) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(217,0,37,0.18) 0%, rgba(7,7,11,0.5) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </section>

            {/* ─── CATEGORY FILTERS ─── */}
            <section style={{ padding: '0 5% 48px' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>Filter:</span>
                        {CATEGORIES.map(cat => {
                            const isActive = activeCat === cat;
                            const s = catColors[cat];
                            return (
                                <motion.button
                                    key={cat}
                                    onClick={() => setActiveCat(cat)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12,
                                        padding: '7px 16px', borderRadius: 100, cursor: 'pointer',
                                        border: isActive
                                            ? (s ? `1px solid ${s.border}` : '1px solid rgba(217,0,37,0.4)')
                                            : '1px solid var(--border)',
                                        background: isActive
                                            ? (s ? s.bg : 'rgba(217,0,37,0.12)')
                                            : 'transparent',
                                        color: isActive
                                            ? (s ? s.color : 'var(--red)')
                                            : 'var(--text2)',
                                        transition: 'all 0.2s',
                                        letterSpacing: '0.03em',
                                        textTransform: 'uppercase',
                                        position: 'relative',
                                    }}
                                >
                                    {cat}
                                    {isActive && cat !== 'All' && (
                                        <motion.span
                                            layoutId="cat-indicator"
                                            style={{
                                                position: 'absolute', inset: 0,
                                                borderRadius: 100,
                                                border: `1px solid ${s ? s.color : 'var(--red)'}`,
                                                opacity: 0.4,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* Article count */}
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── POST GRID ─── */}
            <section style={{ padding: '0 5% var(--section-pad)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
                            >
                                No articles found. Try a different search or category.
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeCat + search}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                    gap: 24,
                                }}
                            >
                                {filtered.map((post, i) => (
                                    <PostCard key={post.title} post={post} index={i} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ─── NEWSLETTER ─── */}
            <section style={{ padding: '120px 5% 140px', background: '#0D0D14', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                {/* Background Image - Themed specifically for Blog */}
                <img
                    src="/blog_cta_bg.png"
                    alt="Blog background"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.3,
                        filter: 'saturate(0) brightness(1.1)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                />

                {/* Decorative Background Elements */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                    <motion.div
                        animate={{ y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 7, repeat: Infinity }}
                        style={{ position: 'absolute', top: '10%', right: '15%' }}
                    >
                        <Droplets size={120} color="var(--red)" strokeWidth={0.5} />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 40, 0], opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 9, repeat: Infinity }}
                        style={{ position: 'absolute', bottom: '15%', left: '10%' }}
                    >
                        <Droplets size={160} color="var(--red)" strokeWidth={0.5} />
                    </motion.div>
                </div>

                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(217,0,37,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <FadeUp>
                    <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <MonoLabel style={{ justifyContent: 'center', display: 'flex', marginBottom: 20 }}>WEEKLY NEWSLETTER</MonoLabel>
                        <h2 style={{
                            fontFamily: 'var(--font-head)',
                            fontWeight: 400,
                            fontSize: 'clamp(32px,5vw,52px)',
                            marginBottom: 20,
                            letterSpacing: '0.02em',
                            color: '#fff'
                        }}>
                            Stay in <span style={{ color: 'var(--red)' }}>the loop.</span>
                        </h2>
                        <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 300,
                            fontSize: 17,
                            color: 'var(--text2)',
                            lineHeight: 1.7,
                            marginBottom: 44,
                            maxWidth: 480,
                            margin: '0 auto 44px'
                        }}>
                            Weekly updates on blood banking technology, local health alerts, and real stories from our community.
                        </p>

                        {/* Email input + CTA */}
                        <div style={{
                            display: 'flex', gap: 12, borderRadius: 20,
                            padding: '8px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border)',
                            maxWidth: 540, margin: '0 auto',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}>
                            <input
                                placeholder="Email address"
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    padding: '12px 20px',
                                    fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#fff', outline: 'none',
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                                style={{
                                    padding: '12px 32px',
                                    fontSize: 15,
                                    borderRadius: 14,
                                    boxShadow: '0 10px 20px rgba(217,0,37,0.2)'
                                }}
                            >
                                Subscribe
                            </motion.button>
                        </div>

                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'var(--text3)',
                            marginTop: 32,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 24,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            letterSpacing: '0.05em'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--red)' }} /> 2,400+ Healthcare professionals</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--red)' }} /> Sent every Friday</span>
                        </div>
                    </div>
                </FadeUp>
            </section>

            <Footer />
        </div>
    );
}