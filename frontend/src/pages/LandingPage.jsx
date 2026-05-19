/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp as FadeUpUI, Counter as CounterUI, CTABanner } from '../components/UI';
import {
  Droplets, LayoutDashboard, BarChart2, Package,
  CalendarDays, ClipboardCheck, Plug, Radio,
  Zap, Rocket, Bell, Bot, Users, Twitter,
  Linkedin, Github, Play, ChevronRight, Building2, Activity, Clock,
  Link, Heart, School, FlaskConical, ClipboardList,
  ChevronLeft
} from 'lucide-react';
import { StaggerTestimonials } from '../components/ui/StaggerTestimonials';

/* ─── Reusable fade-up wrapper ─────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─────────────────────────────────────────── */
function Counter({ to, suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const dur = 2000;
    const start = performance.now();
    const tick = (now) => {
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

/* ─── Rich Background Elements ─────────────────────────────────── */
function RichBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* 1. Primary Grid with Crosses */}
      <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          opacity: 0.8
      }} />
      
      {/* Decorative Crosses at Grid Junctions */}
      <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0V20M0 10H20' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
          backgroundPosition: '-10px -10px'
      }} />

      {/* 2. Ambient Parallax Blooms */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: '10%', left: '-5%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(217,0,37,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }} 
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 0], 
          y: [100, 150, 100],
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(217,0,37,0.03) 0%, transparent 70%)',
          filter: 'blur(120px)'
        }} 
      />

      {/* 3. Floating Micro-Icons */}
      {[...Array(8)].map((_, i) => (
        <motion.div
           key={i}
           animate={{ 
             y: [0, -60, 0],
             opacity: [0.05, 0.12, 0.05],
             rotate: [0, 360]
           }}
           transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
           style={{
             position: 'absolute',
             top: `${10 + i * 12}%`,
             left: `${5 + (i * 22) % 90}%`,
             color: 'var(--red)',
             opacity: 0.1
           }}
        >
          {i % 2 === 0 ? <Droplets size={24} /> : <Heart size={20} />}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Hero Section ───────────────────────────────────────────────── */
const floatAnim = (yOffset = 10, duration = 3) => ({
  y: [0, -yOffset, 0],
  transition: { duration, repeat: Infinity, ease: 'easeInOut' }
});

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '140px 5% clamp(100px, 15vw, 160px)', position: 'relative', overflow: 'hidden',
      background: 'var(--bg)'
    }}>
      {/* Background glow & subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(217,0,37,0.03) 0%, transparent 50%),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 41px)
        `,
        zIndex: 1
      }} />

      <div className="responsive-grid" style={{ maxWidth: 1440, margin: '0 auto', width: '100%', alignItems: 'center', gap: 'clamp(40px, 6vw, 80px)', position: 'relative', zIndex: 10 }}>

        {/* === LEFT SIDE === */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Top Badge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="var(--bg)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
              14+ Districts <span style={{ color: 'var(--text2)', fontWeight: 400 }}>Connected to HEM∆</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: 'clamp(80px, 11vw, 220px)',
              color: 'var(--text)',
              marginBottom: 30,
              gap: 0
            }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 400, lineHeight: 0.8, letterSpacing: '-0.04em' }}>
              HEM
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1em',
              fontWeight: 300,
              marginLeft: '5px',
              position: 'relative',
              top: '0px'
            }}>
              ∆
            </span>
            <sup style={{
              fontSize: '0.4em',
              top: '-0.6em',
              color: 'var(--red)',
              fontFamily: 'var(--font-sub)',
              fontWeight: 800,
              marginLeft: '2px'
            }}>
              +
            </sup>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 1.6vw, 19px)', color: 'var(--text2)',
              marginTop: 0, marginBottom: 40, maxWidth: 540, lineHeight: 1.6
            }}>
            Connect Kerala's blood banks, hospitals, and generous donors into one fast, reliable network. No more frantic calls — <span style={{ color: 'var(--text)' }}>just one smart system saving lives.</span>
          </motion.p>

          {/* Social Proof & Stars */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--border)', maxWidth: 500 }}>
            <div style={{ display: 'flex' }}>
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--bg)', objectFit: 'cover' }} alt="Doctor" />
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -12, fontSize: 11, fontWeight: 700 }}>
                4.2M+
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                Trusted by hospitals &nbsp; <span style={{ color: 'var(--text3)' }}>/</span> &nbsp; <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={13} fill="var(--red)" color="var(--red)" /> 99.9%</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>System Uptime & Reliability</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/register')}
              style={{
                background: 'var(--red)', color: '#fff', borderRadius: 100,
                padding: '16px 36px', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(217,0,37,0.3)'
              }}>
              Get Started Free
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent', color: 'var(--text)', border: 'none',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
              }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={12} fill="var(--text)" color="var(--text)" style={{ marginLeft: 2 }} />
              </div>
              Watch Video
            </motion.button>
          </motion.div>
        </div>

        {/* === RIGHT SIDE === */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'relative', height: '100%', minHeight: 'clamp(400px, 70vh, 600px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>

          {/* Main Background Shape */}
          <div style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: '90%', height: '100%', maxHeight: 700,
            background: 'var(--card2)',
            border: '1px solid var(--border)',
            borderRadius: 32, zIndex: 1, overflow: 'hidden'
          }}>
            <img src="/hero-ai.png"
              alt="HEMA+ AI Neural Network"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.8 }} />

            {/* Glossy overlay for depth */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,12,0.6) 0%, transparent 100%)',
              zIndex: 2
            }} />
          </div>

          {/* Floating UI Elements */}

          {/* Chat bubble 1 */}
          <motion.div animate={floatAnim(15, 4)} style={{
            position: 'absolute', top: '25%', left: '0%', zIndex: 10,
            background: 'rgba(255,255,255,0.92)', padding: '12px 20px', borderRadius: 100,
            display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            color: '#111', fontSize: 13, fontWeight: 700
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={11} color="#fff" fill="#fff" />
            </div>
            Critical Match?
          </motion.div>

          {/* Chat bubble 2 */}
          <motion.div animate={floatAnim(12, 3.5)} style={{
            position: 'absolute', top: '40%', left: '-10%', zIndex: 10,
            background: 'var(--bg)', padding: '12px 20px', borderRadius: 100, border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            color: 'var(--text)', fontSize: 13, fontWeight: 700
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={11} color="#fff" />
            </div>
            Success: 0.8s Match
          </motion.div>

          {/* Top Right Box */}
          <motion.div animate={floatAnim(8, 5)} style={{
            position: 'absolute', top: '10%', right: '-5%', zIndex: 10,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '24px',
            width: 180, color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, opacity: 0.8, color: 'var(--red)' }}>LIVE NETWORK</div>
            <div style={{ fontSize: 48, fontFamily: 'var(--font-head)', fontWeight: 400, lineHeight: 1, marginBottom: 8 }}>50x</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>Faster response in emergencies</div>
          </motion.div>

          {/* Bottom Right Glass Card */}
          <motion.div animate={floatAnim(12, 4.5)} style={{
            position: 'absolute', bottom: '2%', right: '-4%', zIndex: 10,
            background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '20px',
            display: 'flex', alignItems: 'center', gap: 16, width: 300,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/hero_cells.png" alt="O Negative" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 600, marginBottom: 4 }}>O- Negative Blood</div>
              <div style={{ fontSize: 24, color: '#fff', fontFamily: 'var(--font-head)', lineHeight: 1, marginBottom: 8 }}>14 Units</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,0,37,0.15)', color: 'var(--red)', padding: '5px 12px', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>
                CRITICAL STOCK
              </div>
            </div>
          </motion.div>


        </motion.div>

      </div>
    </section>
  );
}

/* ─── Trusted By ────────────────────────────────────────────────── */
function TrustedBy() {
  const logos = [
    { icon: <Zap size={16} />, name: 'RapidResponse' },
    { icon: <Droplets size={16} />, name: 'VitalBlood' },
    { icon: <Link size={16} />, name: 'LifeLink' },
    { icon: <Building2 size={16} />, name: 'City General' },
    { icon: <Heart size={16} />, name: 'HeartInstitute' },
  ];
  return (
    <div style={{ padding: '60px 5%', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text3)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: 24 }}>
          Partners in Kerala's Healthcare
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {['KIMS Hospital', 'Amrita Medical', 'Lakeshore Centre', 'Medical College', 'Aster Medcity', 'VPS Lakeshore'].map(name => (
            <div key={name} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
              letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 20px',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, transition: 'all 0.2s', cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(217,0,37,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Crisis Section ────────────────────────────────────────────── */
function CrisisSection() {
  const problems = [
    {
      icon: <FlaskConical size={22} />,
      title: 'Waste in the System',
      desc: "Too often, perfectly good units are thrown away because they weren't used in time. We help track inventory so every drop count."
    },
    {
      icon: <ClipboardList size={22} />,
      title: 'Hidden Bottlenecks',
      desc: 'Doing things by hand leads to mistakes and delays. We automate the boring stuff so doctors can focus on patients.'
    },
    {
      icon: <Link size={22} />,
      title: 'Lack of Connection',
      desc: "One hospital might have what another needs, but they just don't know it yet. We bridge that gap instantly."
    },
  ];

  return (
    <section id="crisis" style={{ padding: 'clamp(100px, 15vw, 160px) 5%', background: 'var(--bg)' }}>
      <div className="responsive-grid" style={{ maxWidth: 1440, margin: '0 auto', alignItems: 'start' }}>
        {/* Left */}
        <FadeUp>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: 20 }}>The Problem</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.02em' }}>
            Why the old way<br />doesn't work.
          </h2>
          <p style={{ marginTop: 22, fontSize: 17, color: 'var(--text2)', lineHeight: 1.8 }}>
            For years, Kerala hospitals had to rely on phone calls and spreadsheets. It was slow, stressful, and sometimes, it cost lives. We're changing that.
          </p>
          <div style={{ marginTop: 40, background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden' }}>
            {/* Background medical image */}
            <img
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80"
              alt="Medical facility"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.06, filter: 'saturate(0)' }}
            />
            {/* Content on top */}
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 84, fontWeight: 400, letterSpacing: '0.02em', color: 'var(--red)', lineHeight: 1 }}>1 in 3</div>
              <div style={{ marginTop: 14, fontSize: 15, color: 'var(--text2)', lineHeight: 1.8 }}>
                of blood units were going to waste before we started. That's thousands of lives that could have been changed. We knew we had to fix it.
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Right */}
        <FadeUp delay={0.15} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {problems.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -2, borderColor: 'rgba(232,25,44,0.3)' }}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}
              >
                <div style={{ width: 44, height: 44, background: 'var(--red-dim)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Stats Bar ─────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: 4.2, suffix: 'M+', decimals: 1, label: 'Units tracked annually', icon: <Droplets size={20} color="#D90025" /> },
    { value: 340, suffix: '+', decimals: 0, label: 'Partner hospitals', icon: <Building2 size={20} color="#D90025" /> },
    { value: 99.98, suffix: '%', decimals: 2, label: 'Accuracy rate', icon: <Activity size={20} color="#D90025" /> },
    { value: null, label: 'Response time', raw: '<2min', icon: <Clock size={20} color="#D90025" /> },
  ];

  return (
    <div id="stats" style={{ padding: '80px 5%', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="stats-grid" style={{ maxWidth: 1440, margin: '0 auto' }}>
        {stats.map(({ value, suffix, decimals, label, raw, icon }, i) => (
          <FadeUp key={label} delay={i * 0.1}>
            <div style={{
              textAlign: 'center',
              borderTop: '2px solid rgba(217,0,37,0.4)',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              paddingTop: 32,
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ marginBottom: 16 }}>{icon}</div>
              <div style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(38px,5vw,56px)', fontWeight: 400, letterSpacing: '0.02em',
                background: 'linear-gradient(135deg,#fff 40%, var(--red))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1
              }}>
                {raw ? raw : <Counter to={value} suffix={suffix} decimals={decimals} />}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 14, fontWeight: 500 }}>{label}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

/* ─── Bento Features Section ─────────────────────────────────────────── */
function FeaturesSection() {
  const containerRef = useRef(null);

  const features = [
    {
      id: 'inventory',
      size: 'hero',
      label: 'Core System',
      title: 'Smart Inventory Hub',
      desc: 'Real-time unit tracking across all facilities with automated temperature alerts and stockout prevention.',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      tag: 'RFID-READY',
      accent: 'var(--red)'
    },
    {
      id: 'donors',
      size: 'wide',
      label: 'Engagement',
      title: 'Active Donor Ecosystem',
      desc: 'Smart WhatsApp/SMS recall campaigns and gamified impact tracking to keep your donors returning.',
      img: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=1200&q=80',
      tag: 'OMNI-RECALL',
      accent: 'var(--red)'
    },
    {
      id: 'forecast',
      size: 'hero',
      label: 'Intelligence',
      title: 'AI Demand Forecaster',
      desc: '98.4% accurate predictive models for regional demand spikes, seasonal rushes, and monsoon readiness.',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=80',
      tag: 'PREDICTIVE-V2',
      accent: '#fff'
    },
    {
      id: 'interop',
      size: 'small',
      label: 'Connectivity',
      title: 'HL7 / FHIR API',
      desc: 'Seamless EMR & hospital system integration.',
      img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
      tag: 'INTEROP-G',
      accent: 'var(--red)'
    },
    {
      id: 'compliance',
      size: 'small',
      label: 'Legal',
      title: 'Automated NACO',
      desc: 'Instant state-level monthly report exports.',
      img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
      tag: 'AUDIT-READY',
      accent: '#22c55e'
    },
    {
      id: 'logistics',
      size: 'small',
      label: 'Cold-Chain',
      title: 'Temp-Track Bio',
      desc: 'Unit-level cold chain digital audit trails.',
      img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80',
      tag: 'BIO-SAFE',
      accent: 'var(--red)'
    },
    {
      id: 'emergency',
      size: 'wide',
      label: 'Critical',
      title: 'State-wide Auto Routing',
      desc: 'Zero-latency unit matching across the entire Kerala network for critical O-Negative emergencies.',
      img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80',
      tag: 'ROUTING-OS',
      accent: 'var(--red)'
    },
    {
      id: 'gamify',
      size: 'small',
      label: 'Loyalty',
      title: 'Hero Tiers',
      desc: 'Advanced donor loyalty & badge system.',
      img: '/hero_tier_badge.png',
      tag: 'TIER-ELITE',
      accent: 'var(--red)'
    }
  ];

  return (
    <section id="features" ref={containerRef} style={{
      padding: 'clamp(120px, 18vw, 200px) 5%',
      background: 'var(--bg)',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ marginBottom: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="var(--red)" fill="var(--red)" />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', fontWeight: 800, letterSpacing: '4px' }}>POWERED BY HEMA OS</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(60px, 12vw, 150px)',
                lineHeight: 0.8,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase'
              }}>
                Redefining the <br />
                <span style={{ color: 'var(--text2)', opacity: 0.2 }}>Stock Standard.</span>
              </h2>
            </div>
            <p style={{ maxWidth: 440, fontSize: 18, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 15 }}>
              We've engineered a bento-style core architecture that handles the complexities of blood management with absolute surgical precision.
            </p>
          </div>
        </FadeUp>

        {/* High-Fidelity Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(340px, auto)',
          gap: 24
        }}>
          {
            features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -10, borderColor: 'rgba(217,0,37,0.35)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
                style={{
                  gridColumn: f.size === 'hero' ? 'span 2' : f.size === 'wide' ? 'span 2' : 'span 1',
                  gridRow: f.size === 'hero' ? 'span 2' : 'span 1',
                  position: 'relative',
                  borderRadius: 40,
                  overflow: 'hidden',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Background Shadow/Glow */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.95) 100%)', zIndex: 2 }} />
                {/* Visual Imagery or Custom UI Component */}
                {f.img && f.id !== 'gamify' ? (
                  <img src={f.img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, zIndex: 1, transition: 'scale 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }} className='card-bg-img' />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: f.id === 'gamify' ? 0.8 : 0.4 }}>
                    {f.id === 'gamify' && (
                      <div style={{ position: 'relative', width: 200, height: 200 }}>
                        {/* Orbit rings */}
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: 0, border: '1px dashed rgba(217,0,37,0.3)', borderRadius: '50%' }} />
                        <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: 30, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }} />

                        {/* The Actual Badge Image (Smaller, centered) */}
                        <div style={{ position: 'absolute', inset: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <motion.img
                            src={f.img}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                              width: '100%', height: '100%', objectFit: 'contain',
                              filter: 'drop-shadow(0 0 20px rgba(217,0,37,0.4))'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 3, flexGrow: 1, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', gap: 10 }}>
                    <div style={{ padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>{f.tag}</div>
                    {(f.id === 'inventory' || f.id === 'gamify') && <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', marginTop: 8 }} />}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: f.size === 'hero' ? 'clamp(40px, 4vw, 56px)' : '28px', lineHeight: 0.9, marginBottom: 16, textTransform: 'uppercase', color: f.accent === '#fff' ? '#fff' : 'inherit' }}>{f.title}</h3>
                    <p style={{ fontSize: f.size === 'hero' ? 18 : 15, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 420 }}>{f.desc}</p>
                    {f.id === 'inventory' && (
                      <div style={{ marginTop: 24, display: 'flex', gap: 6, height: 40, alignItems: 'flex-end' }}>
                        {[...Array(12)].map((_, j) => <motion.div key={j} animate={{ height: [20, 40, 15, 30] }} transition={{ duration: 2, repeat: Infinity, delay: j * 0.1 }} style={{ flex: 1, background: 'var(--red)', borderRadius: 2, opacity: 0.4 + (j * 0.05) }} />)}
                      </div>
                    )}
                    {f.id === 'forecast' && (
                      <div style={{ marginTop: 24, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 10 }}><span>PREDICTIVE ACCURACY</span><span style={{ color: '#22c55e' }}>98.4%</span></div>
                        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}><motion.div initial={{ width: 0 }} whileInView={{ width: '98%' }} style={{ height: '100%', background: '#22c55e', borderRadius: 2 }} /></div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ──────────────────────────────────────────────── */
function HowSection() {
  const steps = [
    {
      num: '01',
      title: 'Seamless Integration',
      desc: 'Connect your existing hospital management system to HEM∆ is quick and painless. Usually, we are up and running in a few days.',
      img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80'
    },
    {
      num: '02',
      title: 'Real-time Oversight',
      desc: 'No more guessing. You can see your whole inventory and every donor right from your dashboard, live and synchronized.',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80'
    },
    {
      num: '03',
      title: 'Smart Decisions',
      desc: 'Use our AI-driven tools to see where you have too much or too little, and fix it before it becomes a critical issue.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'
    },
    {
      num: '04',
      title: 'Emergency Ready',
      desc: 'When an emergency hits, you are ready. The right blood, for the right person, within seconds, without the panic.',
      img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80'
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: 'clamp(100px, 15vw, 160px) 5%',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Technical Background */}
      <RichBackground />
      <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 50%, rgba(217,0,37,0.02) 0%, transparent 70%)',
          zIndex: 0
      }} />
      
      {/* Vertical Life-Line (Connecting Logic) */}
      <div style={{
          position: 'absolute', top: '15%', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 1, borderLeft: '1.5px dashed rgba(255,255,255,0.06)', zIndex: 1
      }} className="hidden md:block">
          <motion.div 
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: 4, height: 100, background: 'linear-gradient(to bottom, transparent, var(--red), transparent)', marginLeft: -2 }}
          />
      </div>

      {/* Scattered Tech Dots */}
      {[...Array(6)].map((_, i) => (
          <div key={i} style={{
              position: 'absolute',
              top: `${20 + (i * 15)}%`,
              left: i % 2 === 0 ? '10%' : '85%',
              width: 4, height: 4, borderRadius: '50%',
              background: 'var(--red)',
              opacity: 0.15,
              boxShadow: '0 0 15px var(--red)'
          }} />
      ))}

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 5 }}>

        <FadeUp>
          <div style={{ marginBottom: 120, textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(40px, 6vw, 100px)',
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              marginBottom: 20
            }}>
              How it works.
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 600, margin: '0 auto' }}>
              We've refined the process into four simple phases of transformation.
            </p>
          </div>
        </FadeUp>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(100px, 15vw, 200px)' }}>
          {steps.map((step, i) => {
            const isEven = i % 2 === 1;
            return (
              <div key={step.num} style={{
                display: 'grid',
                gridTemplateColumns: isEven ? '1.2fr 1fr' : '1fr 1.2fr',
                alignItems: 'center',
                gap: 'clamp(40px, 8vw, 120px)',
                minHeight: '400px'
              }}>
                {/* Text Content - Always stays on its side based on column order */}
                <div style={{ order: isEven ? 2 : 1 }}>
                  <FadeUp delay={0.1}>
                    <div style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'clamp(40px, 5vw, 72px)',
                      lineHeight: 0.9,
                      marginBottom: 28,
                      color: 'var(--text)',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.03em'
                    }}>
                      <span style={{ color: 'var(--red)', marginRight: 12 }}>{step.num}<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>.</span></span>
                      {step.title}
                    </div>
                    <p style={{
                      fontSize: 'clamp(17px, 1.3vw, 20px)',
                      color: 'var(--text2)',
                      lineHeight: 1.7,
                      marginBottom: 48,
                      maxWidth: 520,
                      opacity: 0.8
                    }}>
                      {step.desc}
                    </p>

                    {/* Improved Premium View Details UI */}
                    <motion.button
                      whileHover="hover"
                      initial="initial"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 12
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', background: 'var(--red)',
                          boxShadow: '0 0 15px var(--red)'
                        }} />
                        <span style={{
                          fontWeight: 800,
                          fontSize: 14,
                          letterSpacing: '2.5px',
                          textTransform: 'uppercase'
                        }}>
                          View Details
                        </span>
                      </div>
                      <motion.div
                        variants={{
                          initial: { width: 40, opacity: 0.3 },
                          hover: { width: 140, opacity: 1 }
                        }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          height: 2,
                          background: 'linear-gradient(90deg, var(--red), transparent)',
                          borderRadius: 4
                        }}
                      />
                    </motion.button>
                  </FadeUp>
                </div>

                {/* Big Image Masked Number - Always stays on the other side */}
                <div style={{
                  order: isEven ? 1 : 2,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: 'clamp(300px, 40vw, 600px)',
                  overflow: 'visible'
                }}>
                  <FadeUp delay={0.2}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -10 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(280px, 40vw, 550px)',
                        fontFamily: 'var(--font-head)',
                        fontWeight: 900,
                        lineHeight: 1,
                        textAlign: 'center',
                        position: 'relative',

                        /* Forced Background Coverage - The "Super Fill" Strategy */
                        backgroundImage: `url(${step.img})`,
                        backgroundSize: '150% 150%',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',

                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',

                        /* Fix for top-edge clipping */
                        paddingTop: '20px',
                        marginTop: '-20px',

                        /* High-fidelity detail */
                        WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                        filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.6))',

                        cursor: 'default',
                        userSelect: 'none',
                        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 2
                      }}>
                      {step.num}
                    </motion.div>
                  </FadeUp>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ───────────────────────────────────────────────── */
function CTASection() {
  return (
    <div id="cta">
      <CTABanner
        headline="Together, we save more lives."
        subtext="Join hundreds of Kerala's hospitals and blood banks. Let's make sure no one has to wait for blood when it matters most."
        btn1="Get Started Now"
        btn2="Book a Demo"
      />
    </div>
  );
}


/* ─── Testimonial Section ─────────────────────────────────────────── */
function TestimonialSection() {
  return (
    <section id="testimonials" style={{ padding: 'clamp(100px, 15vw, 160px) 5%', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 5%' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: 16 }}>
              Testimonials
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 400, letterSpacing: '0.02em', marginBottom: 24 }}>
              Trusted by the medical<br />community in Kerala.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
              From district hospitals to private clinics, doctors rely on HEMA for speed, safety, and inventory intelligence.
            </p>
          </div>
        </FadeUp>
      </div>

      <div style={{ position: 'relative', marginTop: 40 }}>
        {/* Animated background glow behind the stagger cards */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '50%', background: 'radial-gradient(ellipse at center, rgba(217,0,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <FadeUp delay={0.2}>
          <StaggerTestimonials />
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Main Page Export ──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <div className="noise-overlay" />
      <Navbar />
      <HeroSection />
      <TrustedBy />
      <CrisisSection />
      <StatsBar />
      <FeaturesSection />
      <HowSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
}




