/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel, HeroHeadline, CTABanner } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Users,
    ShieldCheck,
    BarChart3,
    AlertTriangle,
    Network,
    AlertCircle,
    Link,
    MessageCircle,
    Landmark,
    Package,
    FlaskConical,
    Monitor,
    Brain,
    Shuffle,
    Shield,
    Bot,
    Radio,
    Truck,
    CheckCircle2,
    Activity,
    Target,
    TrendingUp,
    Zap,
    Thermometer,
    Calendar,
    FileText,
    History,
    Dna,
    Cpu,
    Globe
} from 'lucide-react';

const TABS = [
    { name: 'Inventory', icon: <Box size={16} /> },
    { name: 'Donors', icon: <Users size={16} /> },
    { name: 'Compliance', icon: <ShieldCheck size={16} /> },
    { name: 'Analytics', icon: <BarChart3 size={16} /> },
    { name: 'Emergency', icon: <AlertTriangle size={16} /> },
    { name: 'Integrations', icon: <Network size={16} /> }
];

const bloodTypes = [
    { type: 'A+', units: 1240, pct: 78, status: 'Healthy', color: '#22c55e' },
    { type: 'B+', units: 890, pct: 65, status: 'Healthy', color: '#22c55e' },
    { type: 'O+', units: 1100, pct: 75, status: 'Healthy', color: '#22c55e' },
    { type: 'O-', units: 340, pct: 40, status: 'Low', icon: <AlertCircle size={10} />, color: '#f59e0b' },
    { type: 'AB+', units: 420, pct: 50, status: 'Moderate', color: '#f59e0b' },
    { type: 'AB-', units: 87, pct: 18, status: 'Critical', icon: <AlertCircle size={10} color="#D90025" />, color: '#D90025' },
];

const integrations = [
    { name: 'HL7/FHIR API', icon: <Link size={24} />, status: 'Available', desc: 'Hospital standard integration for seamless data exchange.' },
    { name: 'WhatsApp Business', icon: <MessageCircle size={24} />, status: 'Available', desc: 'Donor recall campaigns and emergency notifications.' },
    { name: 'Government NHP', icon: <Landmark size={24} />, status: 'Available', desc: 'National Health Portal direct integration.' },
    { name: 'RFID/Barcode', icon: <Package size={24} />, status: 'Available', desc: 'Unit-level tracking across all facilities.' },
    { name: 'Lab Management', icon: <FlaskConical size={24} />, status: 'Available', desc: 'Test result sync and cross-match automation.' },
    { name: 'EMR Systems', icon: <Monitor size={24} />, status: 'Available', desc: 'Patient record integration for transfusion history.' },
];

const aiCards = [
    { icon: <Brain size={32} />, title: 'Demand Forecasting', desc: 'AI predicts shortages 2–3 weeks in advance based on historical patterns, seasonal trends, and district-level demand.' },
    { icon: <Shuffle size={32} />, title: 'Auto-routing', desc: 'When a facility has surplus expiring stock, AI automatically routes it to the nearest facility with that shortage.' },
    { icon: <Shield size={32} />, title: 'Anomaly Detection', desc: 'Real-time detection of unusual patterns — sudden spikes, temperature deviations, or compliance gaps.' },
];

const analyticsStats = [
    { label: 'AI PREDICTION ACCURACY', value: '98.4%', trend: '+2.1%', icon: <Target size={18} /> },
    { label: 'WASTE REDUCTION', value: '42%', trend: 'Last 12mo', icon: <Package size={18} /> },
    { label: 'AVG. TRANSFER TIME', value: '14m', trend: '-4m', icon: <Truck size={18} /> },
    { label: 'SYSTEM HEALTH', value: '99.9%', trend: 'Stable', icon: <Activity size={18} /> },
];

const recentInsights = [
    { time: '02:14 PM', type: 'PREDICTION', text: 'O- demand spike expected in Ernakulam (48h horizon).' },
    { time: '01:45 PM', type: 'ROUTING', text: 'Auto-routed 12 units of AB- from Malappuram to Kozhikode.' },
    { time: '11:12 AM', type: 'ALERT', text: 'Zone B inventory levels recovered to safety threshold.' },
];

const emergencySteps = [
    { num: '01', icon: <AlertCircle size={28} color="var(--red)" />, title: 'Alert Triggered', desc: 'Hospital submits critical requisition' },
    { num: '02', icon: <Bot size={28} />, title: 'AI Matching', desc: 'Cross-references 6 compatibility parameters' },
    { num: '03', icon: <Radio size={28} />, title: 'Unit Allocated', desc: 'Nearest compatible unit is instantly reserved' },
    { num: '04', icon: <CheckCircle2 size={28} />, title: 'Ready for Pickup', desc: 'Facility team alerted for immediate handover' },
];

const inventoryFeatures = [
    '✤ Real-time unit location across all facilities',
    '✤ Automated temperature deviation alerts',
    '✤ Smart expiry prediction with 7/3/1 day alerts',
    '✤ Blood type stockout prevention',
    '✤ RFID and QR code unit tracking',
    '✤ Multi-location storage management',
];

const donorFeatures = [
    '✤ Complete donor lifecycle management',
    '✤ Automated eligibility tracking & cooling periods',
    '✤ SMS & WhatsApp donor recall campaigns',
    '✤ Multilingual support (English + Malayalam)',
    '✤ Health screening & deferral records',
];

const complianceFeatures = [
    '✤ Auto-generated NACO monthly reports',
    '✤ Kerala Health Dept. quarterly submissions',
    '✤ Digital audit trail for every unit',
    '✤ FDA & WHO guidelines checklist',
    '✤ Blood bank license renewal packages',
    '✤ Real-time compliance health score',
];

const complianceChecks = [
    { ok: true, text: 'NACO Report — Submitted Jan 2025' },
    { ok: true, text: 'Donor Testing Records — Complete' },
    { ok: true, text: 'Storage Temperature Logs — Within Range' },
    { ok: false, text: 'Staff Training Certificates — 2 Expiring' },
    { ok: true, text: 'Cross-match Records — Up to Date' },
];



const storageStats = [
    { label: 'Main Refrigerator A', temp: '4.2°C', status: 'Optimal', color: '#22c55e' },
    { label: 'Platelet Agitator', temp: '22.1°C', status: 'Optimal', color: '#22c55e' },
    { label: 'Plasma Freezer', temp: '-32.4°C', status: 'Optimal', color: '#22c55e' },
];

const donorCampaigns = [
    { name: 'O- Negative Emergency Recall', reach: 450, rsvp: 82, status: 'Active' },
    { name: 'World Blood Donor Day 2025', reach: 1200, rsvp: 340, status: 'Scheduled' },
];

const auditTrail = [
    { time: '14:22', action: 'Unit #4421-B Cross-matched', user: 'Staff Nurse Arjun' },
    { time: '13:05', action: 'Temp alert resolved (Fridge A)', user: 'System' },
    { time: '11:45', action: 'Monthly NACO XML Exported', user: 'Admin' },
];

function Feat({ children }) {
    return (
        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: 'var(--text2)', marginBottom: 10 }}>
            {children}
        </div>
    );
}



function TabInventory() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <MonoLabel>01 · SMART INVENTORY</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20, letterSpacing: '0.02em', color: '#fff' }}>
                        Knowing what you have <br /> In <span style={{ color: 'var(--red)' }}>real-time</span>.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Keep a close eye on every unit from the moment it's collected until it reaches a patient. Our smart storage dashboard monitors temperature, expiry, and demand and auto-routes surplus stock.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                        {inventoryFeatures.map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                                <CheckCircle2 size={14} color="var(--red)" />
                                {f.replace('✤ ', '')}
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                        Launch Inventory Hub →
                    </button>
                </FadeUp>
                <FadeUp delay={0.15}>
                    <div className="hema-card" style={{ padding: 32, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                LIVE STORAGE · MAIN WING
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div className="hero-badge-dot" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>CONNECTED</span>
                            </div>
                        </div>

                        {/* Top Storage Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                            {storageStats.map(s => (
                                <div key={s.label} style={{ padding: '12px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Thermometer size={12} color={s.color} />
                                        <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 13 }}>{s.temp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Inventory Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {bloodTypes.map(({ type, units, pct, status, color, icon }) => (
                                <div key={type} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px', gap: 12, alignItems: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, letterSpacing: '0.04em' }}>{type}</div>
                                    <div style={{ position: 'relative', height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            style={{ height: '100%', background: color, borderRadius: 4 }}
                                        />
                                        {/* Glass shine on the bar */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'rgba(255,255,255,0.1)' }} />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>{units} Units</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase' }}>{status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scanner Effect */}
                        <div className="scan-line" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animationDuration: '6s' }} />
                    </div>
                </FadeUp>
            </div>

        </div>
    );
}

function TabDonors() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <div className="hema-card" style={{ padding: 40, borderRadius: 24, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 24, right: 24 }}>
                            <Zap size={20} color="var(--red)" />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24 }}>AJ</span>
                                <div style={{ position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, background: '#22c55e', borderRadius: '50%', border: '4px solid var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={10} color="#fff" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 22, color: '#fff' }}>Arjun Jayakumar</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                    <span style={{ background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 6, padding: '2px 10px', fontFamily: 'var(--font-head)', fontSize: 18, color: 'var(--red)' }}>A+</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>ELITE DONOR #9942</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                            {[
                                { l: 'Donations', v: '23', i: <DropIcon size={16} /> },
                                { l: 'Impact', v: '69', i: <Users size={16} /> },
                                { l: 'Yrs Active', v: '8', i: <Calendar size={16} /> }
                            ].map(({ l, v, i }) => (
                                <div key={l} style={{ textAlign: 'center', padding: '16px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                                    <div style={{ color: 'var(--text3)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{i}</div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24, color: '#fff' }}>{v}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(217,0,37,0.05)', borderRadius: 16, border: '1px solid rgba(217,0,37,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <History size={16} color="var(--red)" />
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>ENROLLMENT DATE</div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14 }}>Oct 12, 2017</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e' }}>ELIGIBILITY</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14, color: '#22c55e' }}>ACTIVE NOW</div>
                            </div>
                        </div>
                    </div>
                </FadeUp>
                <FadeUp delay={0.15}>
                    <MonoLabel>02 · DONOR EXPERIENCE</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20, letterSpacing: '0.02em', color: '#fff' }}>
                        Your community, <br /> <span style={{ color: 'var(--red)' }}>Superpowered</span>.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Donors are the lifeblood of our system. HEM∆ provides them with a high-fidelity donor portal, automated reminder campaigns, and a gamified impact tracker that keeps them returning.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                        {donorFeatures.map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text2)', fontSize: 14 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
                                {f.replace('✤ ', '')}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button className="btn-primary" style={{ padding: '12px 28px' }}>Launch Recalls</button>
                        <button className="btn-ghost" style={{ padding: '12px 28px' }}>View CRM</button>
                    </div>
                </FadeUp>
            </div>

        </div>
    );
}

// Helper for Drop Icon
function DropIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 21.5C8.41015 21.5 5.5 18.5899 5.5 15C5.5 11.4101 12 3.5 12 3.5C12 3.5 18.5 11.4101 18.5 15C18.5 18.5899 15.5899 21.5 12 21.5Z" />
        </svg>
    );
}

function TabCompliance() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid">
                <FadeUp>
                    <MonoLabel>03 · COMPLIANCE</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 20, letterSpacing: '0.02em', color: '#fff' }}>
                        Audit-ready. <br /><span style={{ color: 'var(--red)' }}>Every Single Day.</span>
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
                        Say goodbye to manual logbooks and spreadsheet stress. HEM∆ automates NACO/State Health Dept reporting and creates an immutable digital audit trail for every single unit.
                    </p>
                    <div className="hema-card" style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <History size={18} color="var(--red)" />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>LIVE AUDIT TRAIL</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {auditTrail.map((log, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: i !== 2 ? '1px solid var(--border)' : 'none', paddingBottom: 10 }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600 }}>{log.action}</div>
                                        <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 4 }}>Auth: {log.user}</div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{log.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeUp>
                <FadeUp delay={0.15}>
                    <div className="hema-card" style={{ padding: 40, borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 32 }}>
                            <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                                <motion.circle
                                    cx="60" cy="60" r="54"
                                    fill="none"
                                    stroke="var(--red)"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 54}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - 0.94) }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 48, lineHeight: 1 }}>94%</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em' }}>SCORE</div>
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {complianceChecks.map(({ ok, text }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {ok ? <CheckCircle2 size={14} color="#22c55e" /> : <AlertTriangle size={14} color="#f59e0b" />}
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-sub)', fontSize: 13, color: ok ? 'var(--text2)' : '#f59e0b' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeUp>
            </div>

        </div>
    );
}

function TabAnalytics() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Tab Header Section to match others */}
            <div style={{ marginBottom: 64 }}>
                <FadeUp>
                    <MonoLabel>04 · REAL-TIME ANALYTICS</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 16, letterSpacing: '0.02em', color: '#fff' }}>
                        Insight that <span style={{ color: 'var(--red)' }}>empowers</span> life-saving care.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 720, lineHeight: 1.7 }}>
                        HEM∆ turns static records into a living intelligence layer. Predict shortages, track district-wide trends, and optimize every unit's journey with data-driven precision.
                    </p>
                </FadeUp>
            </div>

            {/* 1. TOP STATS ROW */}
            <div className="four-col" style={{ marginBottom: 32 }}>
                {analyticsStats.map((stat, i) => (
                    <FadeUp key={stat.label} delay={i * 0.05}>
                        <div className="hema-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'var(--red)', opacity: 0.8 }}>{stat.icon}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <TrendingUp size={10} /> {stat.trend}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 28, fontFamily: 'var(--font-head)', letterSpacing: '0.04em' }}>{stat.value}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{stat.label}</div>
                            </div>
                            {/* Decorative background glow */}
                            <div style={{ position: 'absolute', bottom: -10, right: -10, width: 60, height: 60, background: 'var(--red)', filter: 'blur(40px)', opacity: 0.05 }} />
                        </div>
                    </FadeUp>
                ))}
            </div>

            {/* 2. MAIN DASHBOARD CONTENT */}
            <div className="two-col-55" style={{ marginBottom: 32 }}>
                {/* Large Forecasting Chart */}
                <FadeUp delay={0.2}>
                    <div className="hema-card" style={{ padding: 32, height: '100%', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                            <div>
                                <MonoLabel>REGIONAL FORECASTING</MonoLabel>
                                <h3 style={{ fontSize: 24, marginTop: 8 }}>Demand vs Supply Projection</h3>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {['Supply', 'Demand'].map((l, i) => (
                                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: i === 0 ? 'var(--red)' : 'rgba(255,255,255,0.2)' }} />
                                        {l}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Chart Mockup */}
                        <div style={{ height: 260, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2%' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '100%', height: 1, borderTop: '1px dashed rgba(255,255,255,0.05)' }} />)}
                            </div>

                            {[45, 62, 58, 85, 72, 92, 88, 75, 68, 82, 95, 78].map((h, i) => (
                                <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                    {/* Demand Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative' }}
                                    />
                                    {/* Supply Line (mocked with small dots/line segments) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 1 + i * 0.05 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: `${h * 0.85}%`,
                                            left: '10%',
                                            width: '80%',
                                            height: 2,
                                            background: 'var(--red)',
                                            boxShadow: '0 0 10px var(--red)',
                                            borderRadius: 2
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => <span key={m}>{m}</span>)}
                        </div>
                    </div>
                </FadeUp>

                {/* AI Intelligence Feed */}
                <FadeUp delay={0.3}>
                    <div className="hema-card" style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(217,0,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 20 }}>Live Intelligence</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <div className="hero-badge-dot" />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase' }}>AI Processing Live</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {recentInsights.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 + i * 0.1 }}
                                    style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>{item.type}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{item.time}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{item.text}</p>
                                </motion.div>
                            ))}
                        </div>

                        <button style={{ marginTop: 24, width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontSize: 12, fontFamily: 'var(--font-sub)', fontWeight: 600, cursor: 'pointer' }}>
                            View Full Analysis Terminal
                        </button>
                    </div>
                </FadeUp>
            </div>

            {/* 3. AI CAPABILITIES GRID */}
            <div className="three-col">
                {aiCards.map(({ icon, title, desc }, i) => (
                    <FadeUp key={title} delay={i * 0.12}>
                        <div className="hema-card" style={{ padding: '32px 28px', height: '100%', position: 'relative' }}>
                            <div style={{ color: 'var(--red)', marginBottom: 20 }}>{icon}</div>
                            <h3 style={{ fontSize: 20, marginBottom: 12 }}>{title}</h3>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>

                            <motion.div
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--red), transparent)', opacity: 0 }}
                                whileHover={{ opacity: 0.5, top: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

function TabEmergency() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Tab Header Section to match others */}
            <div style={{ marginBottom: 48 }}>
                <FadeUp>
                    <MonoLabel>05 · EMERGENCY ALLOCATION</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 16, letterSpacing: '0.02em', color: '#fff' }}>
                        Response time <span style={{ color: 'var(--red)' }}>redefined</span> for crisis.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 720, lineHeight: 1.7 }}>
                        In a crisis, every second counts. HEM∆'s emergency protocols bypass standard logistics to find, reserve, and route blood units across the entire state network instantly.
                    </p>
                </FadeUp>
            </div>

            <div className="two-col-45" style={{ alignItems: 'center', marginBottom: 64 }}>
                <FadeUp>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--red)', letterSpacing: '0.2em', marginBottom: 32 }}>LATENCY PERFORMANCE</div>
                        <h3 style={{
                            fontFamily: 'var(--font-head)',
                            fontSize: 'clamp(64px,10vw,140px)',
                            color: 'var(--red)',
                            lineHeight: 0.95,
                            letterSpacing: '0.01em',
                            margin: 0,
                        }}>
                            {'< 1\nSEC'}
                        </h3>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 18, color: 'var(--text2)', maxWidth: 420, lineHeight: 1.7 }}>
                        Instantaneous cross-facility unit matching. Our AI engine scans every storage unit in Kerala to find and reserve compatibility-perfect units within a second.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
                        <div className="hero-badge-dot" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text3)' }}>LIVE ALLOCATION: KERALA NETWORK</span>
                    </div>
                </FadeUp>
                <div style={{ position: 'relative' }}>
                    <FadeUp delay={0.2}>
                        <div className="hema-card" style={{ height: 480, width: '100%', borderRadius: 32, position: 'relative', overflow: 'hidden', padding: 0, background: 'rgba(255,255,255,0.01)' }}>
                            {/* Official Kerala Map Image */}
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <img
                                    src="/kerala-map.png"
                                    alt="Kerala Network Map"
                                    style={{
                                        height: '90%',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        filter: 'brightness(0.7) contrast(1.2) drop-shadow(0 0 30px rgba(217,0,37,0.2))'
                                    }}
                                />
                            </div>

                            {/* Overlay Animation Layer */}
                            <div style={{ position: 'absolute', inset: 0 }}>
                                <svg width="100%" height="100%" viewBox="0 0 400 480" fill="none" style={{ position: 'absolute', inset: 0 }}>
                                    {/* Pulse Dots - Approximate positions for common districts on a center-aligned map */}
                                    {/* Kasaragod */}
                                    {/* <circle cx="160" cy="80" r="3" fill="var(--red)" /> */}
                                    {/* Kozhikode */}
                                    <motion.circle cx="185" cy="180" r="3" fill="var(--red)" animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
                                    {/* Kochi */}
                                    <circle cx="215" cy="300" r="3" fill="var(--red)" />
                                    {/* Trivandrum */}
                                    <circle cx="270" cy="420" r="4" fill="var(--red)" className="hero-badge-dot" />

                                    {/* Allocation Link */}
                                    <motion.path
                                        d="M185,180 Q 200,240, 215,300"
                                        stroke="var(--red)"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeDasharray="4 4"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    />
                                </svg>
                            </div>

                            <div style={{ position: 'absolute', top: 32, left: 32 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Matching Sequence #2204</div>
                                <div style={{ fontSize: 18, color: '#fff', marginTop: 4 }}>O- Request Assignment</div>
                            </div>

                            <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32, padding: 20, background: 'rgba(7,7,11,0.85)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ padding: 10, background: 'rgba(217,0,37,0.1)', borderRadius: 12, color: 'var(--red)' }}>
                                            <Package size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15 }}>Allocated From: GMC Kozhikode</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e' }}>UNIT #4421-B RESERVED</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>ASSIGNMENT</div>
                                        <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, color: '#22c55e' }}>COMPLETE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </div>
            <div className="four-col">
                {emergencySteps.map(({ num, icon, title, desc }, i) => (
                    <FadeUp key={num} delay={i * 0.1}>
                        <div className="hema-card" style={{ padding: '32px 24px', borderTop: '3px solid var(--red)', height: '100%' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 12, fontWeight: 700 }}>STEP {num}</div>
                            <div style={{ color: '#fff', marginBottom: 20 }}>{icon}</div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{title}</div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

function TabIntegrations() {
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div className="responsive-grid" style={{ marginBottom: 64 }}>
                <FadeUp>
                    <MonoLabel>06 · INTEROPERABILITY</MonoLabel>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 400, fontSize: 'clamp(32px,4.5vw,48px)', marginBottom: 16, letterSpacing: '0.02em' }}>
                        The Hub of your <br /> <span style={{ color: 'var(--red)' }}>Digital Ecosystem</span>.
                    </h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', lineHeight: 1.8 }}>
                        HEM∆ doesn't work in isolation. We've built robust connectors for HL7/FHIR, WhatsApp Business, and National Health Portals to ensure data flows where it saves lives. No friction, just connection.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 32 }}>
                        {[
                            { l: 'API UPTIME', v: '99.99%', i: <Cpu size={14} />, trend: 'Healthy' },
                            { l: 'GLOBAL NODES', v: '14+', i: <Globe size={14} />, trend: '+2/month' },
                        ].map(s => (
                            <div key={s.l} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    {s.i}
                                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{s.l}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: 24, fontFamily: 'var(--font-head)', color: '#fff' }}>{s.v}</div>
                                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#22c55e' }}>● {s.trend}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeUp>

                {/* Developer Terminal Hub */}
                <FadeUp delay={0.2}>
                    <div className="hema-card" style={{ height: '100%', borderRadius: 24, background: '#0a0a0f', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                        </div>
                        <div style={{ padding: 24, flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, color: 'var(--text2)' }}>
                            <div style={{ color: 'var(--red)', marginBottom: 12 }}>// HEM∆ Developer Portal v2</div>
                            <div><span style={{ color: 'var(--text3)' }}>$</span> curl -X POST https://api.hema.org/v1/units/transfer \</div>
                            <div style={{ paddingLeft: 16 }}>-H "Authorization: Bearer <span style={{ color: 'var(--red)' }}>SECRET_KEY</span>" \</div>
                            <div style={{ paddingLeft: 16 }}>-d "{'{'}"facility_id": "KIMS-001", "type": "O-" {'}'}"</div>
                            <br />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--red)', marginLeft: 4 }}
                            />

                            {/* Live latency sparkline */}
                            <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 12 }}>API LATENCY (MS)</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                                    {[24, 18, 32, 28, 45, 12, 18, 22, 19, 25, 30, 22].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            style={{ flex: 1, background: 'var(--red)', opacity: 0.4, borderRadius: 2 }}
                                            animate={{ height: [`${h}px`, `${h * 1.2}px`, `${h}px`] }}
                                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>

            <div className="three-col">
                {integrations.map(({ name, icon, status, desc }, i) => (
                    <FadeUp key={name} delay={i * 0.08}>
                        <div className="hema-card" style={{ padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(217,0,37,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', marginBottom: 24 }}>
                                {icon}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <h3 style={{ fontSize: 18, fontFamily: 'var(--font-head)', letterSpacing: '0.04em' }}>{name}</h3>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 8, padding: '3px 8px', borderRadius: 4,
                                    background: status === 'Available' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: status === 'Available' ? '#22c55e' : '#f59e0b',
                                    fontWeight: 700, letterSpacing: '0.05em'
                                }}>{status}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, flex: 1, marginBottom: 24 }}>{desc}</p>
                            <a href="#" className="btn-ghost" style={{ padding: '8px 16px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 8, width: 'fit-content' }}>
                                View API Docs
                            </a>
                        </div>
                    </FadeUp>
                ))}
            </div>
        </div>
    );
}

const tabContent = [TabInventory, TabDonors, TabCompliance, TabAnalytics, TabEmergency, TabIntegrations];

function getDirection(next, prev) {
    return next > prev ? 1 : -1;
}

const contentVariants = {
    initial: (dir) => ({
        opacity: 0,
        x: dir * 48,
        scale: 0.97,
        filter: 'blur(4px)',
    }),
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
        opacity: 0,
        x: dir * -32,
        scale: 0.97,
        filter: 'blur(4px)',
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
    }),
};

export default function FeaturesPage() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const tabsScrollRef = useRef(null);
    const tabRefs = useRef([]);
    const ActiveTab = tabContent[active];

    // Auto-scroll active tab button into view on narrow screens
    useEffect(() => {
        const container = tabsScrollRef.current;
        const btn = tabRefs.current[active];
        if (!container || !btn) return;
        const cRect = container.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        const offset = bRect.left - cRect.left - cRect.width / 2 + bRect.width / 2;
        container.scrollBy({ left: offset, behavior: 'smooth' });
    }, [active]);

    function handleTabClick(i) {
        setDirection(getDirection(i, active));
        setActive(i);
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* HERO */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                padding: '140px 5% 100px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg)'
            }}>
                {/* AI Generated Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(/features_hero_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 1,
                    filter: 'grayscale(1) brightness(1.2)'
                }} />

                {/* Advanced Overlays */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 20%, transparent 80%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 10%, transparent 50%)' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-r" />
                <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.1 }} />

                <div style={{ maxWidth: 880, position: 'relative', zIndex: 10 }}>
                    <FadeUp><MonoLabel>PLATFORM CAPABILITIES</MonoLabel></FadeUp>
                    <FadeUp delay={0.1}>
                        <HeroHeadline size="clamp(64px,9vw,100px)" lines={[
                            { text: 'EVERY FEATURE.', variant: 'solid' },
                            { text: 'PURPOSE-BUILT', variant: 'outline' },
                            { text: 'FOR BLOOD.', variant: 'red' },
                        ]} />
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 500, lineHeight: 1.75, marginTop: 28 }}>
                            We didn't just build another piece of hospital software. We spent time in Kerala's labs and blood banks to build exactly what you need to care for our community.
                        </p>
                    </FadeUp>
                </div>
            </section>

            {/* ─── STICKY TABS — centered ─── */}
            <div style={{
                position: 'sticky',
                top: 62,
                zIndex: 400,
                background: 'rgba(7,7,11,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid var(--border)',
            }}>
                {/* Progress bar */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 2,
                        background: 'var(--red)',
                        boxShadow: '0 0 14px rgba(217,0,37,0.8)',
                    }}
                    animate={{ width: `${((active + 1) / TABS.length) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 36 }}
                />

                {/* Tab row — justify-content: center centers tabs on desktop */}
                <div
                    ref={tabsScrollRef}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',   // ← centered
                        alignItems: 'center',
                        gap: 4,
                        padding: '10px 5%',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        flexWrap: 'nowrap',
                    }}
                >
                    {TABS.map((tab, i) => {
                        const isActive = active === i;
                        return (
                            <motion.button
                                key={tab.name}
                                ref={el => tabRefs.current[i] = el}
                                onClick={() => handleTabClick(i)}
                                whileHover={{ scale: isActive ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                style={{
                                    position: 'relative',
                                    fontFamily: 'var(--font-sub)',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textTransform: 'uppercase',
                                    padding: '10px 22px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isActive ? '#fff' : 'var(--text2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    whiteSpace: 'nowrap',
                                    borderRadius: 100,
                                    letterSpacing: '0.04em',
                                    outline: 'none',
                                    flexShrink: 0,
                                }}
                            >
                                {/* Sliding pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-pill"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'var(--red)',
                                            borderRadius: 100,
                                            zIndex: -1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.9 }}
                                    />
                                )}

                                {/* Hover ghost ring */}
                                {!isActive && (
                                    <motion.div
                                        style={{
                                            position: 'absolute', inset: 0,
                                            borderRadius: 100,
                                            border: '1px solid transparent',
                                            zIndex: -1,
                                        }}
                                        whileHover={{
                                            borderColor: 'rgba(217,0,37,0.35)',
                                            background: 'rgba(217,0,37,0.07)',
                                        }}
                                        transition={{ duration: 0.18 }}
                                    />
                                )}

                                {/* Icon bounce on activate */}
                                <motion.span
                                    animate={{
                                        rotate: isActive ? [0, -12, 8, 0] : 0,
                                        scale: isActive ? [1, 1.3, 1] : 1,
                                    }}
                                    transition={{ duration: 0.42, ease: 'easeOut' }}
                                    style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.55 }}
                                >
                                    {tab.icon}
                                </motion.span>

                                {/* Label slide-up */}
                                <motion.span
                                    animate={{ y: isActive ? [4, 0] : 0, opacity: isActive ? 1 : 0.7 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {tab.name}
                                </motion.span>

                                {/* Active dot */}
                                {isActive && (
                                    <motion.span
                                        layoutId="tab-dot"
                                        style={{
                                            position: 'absolute',
                                            bottom: 3,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 3,
                                            height: 3,
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.8)',
                                        }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 25 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ─── TAB CONTENT ─── */}
            <section style={{
                padding: 'var(--section-pad) 5%',
                background: 'var(--bg)',
                minHeight: 600,
                overflow: 'hidden',
            }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={active}
                        custom={direction}
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <ActiveTab />
                    </motion.div>
                </AnimatePresence>
            </section>

            <CTABanner
                headline="SEE IT ALL IN ACTION"
                subtext="Book a 30-minute live demo with our Kerala team"
                btn1="Book Demo"
                btn2="View Pricing"
            />
            <Footer />
        </div>
    );
}