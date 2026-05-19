import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Building2, CreditCard, AlertTriangle, Award, BarChart2, X, Download, Check, Sparkles } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const REPORTS = [
    { id: 'naco_monthly', name: 'Monthly Compliance Report', desc: 'Monthly report for health authorities.', freq: 'Monthly', icon: FileText, color: '#D90025' },
    { id: 'state_health', name: 'State Health Quarterly Report', desc: 'Quarterly report for the state health department.', freq: 'Every 3 Months', icon: FileText, color: '#3b82f6' },
    { id: 'inventory_district', name: 'Daily Stock Report', desc: 'View how much blood is available in each district.', freq: 'Weekly', icon: BarChart2, color: '#22c55e' },
    { id: 'donor_activity', name: 'Donor Activity Report', desc: 'Report on people signing up and giving blood.', freq: 'Monthly', icon: Users, color: '#f59e0b' },
    { id: 'hospital_requests', name: 'Hospital Request Report', desc: 'See how many blood packets hospitals are asking for.', freq: 'Monthly', icon: Building2, color: '#3b82f6' },
    { id: 'revenue', name: 'Money and Payments Report', desc: 'A full record of all money coming in.', freq: 'Monthly', icon: CreditCard, color: '#22c55e' },
    { id: 'wastage', name: 'Blood Wastage Report', desc: 'Report on blood that could not be used.', freq: 'Monthly', icon: AlertTriangle, color: '#f59e0b' },
    { id: 'emergency_times', name: 'Emergency Request Report', desc: 'See how quickly emergency blood was delivered.', freq: 'Monthly', icon: AlertTriangle, color: '#D90025' },
    { id: 'annual_summary', name: 'Yearly Summary Report', desc: 'Full summary of everything that happened this year.', freq: 'Once a Year', icon: Award, color: '#f59e0b' },
];

export default function AdminReports() {
    const [genModal, setGenModal] = useState(null);
    const [format, setFormat] = useState('PDF');
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [done, setDone] = useState(false);

    const generateApi = useApi(adminService.generateReport, {
        onSuccess: (data) => {
            setDone(true);
            toast.success('Report is ready!');
            setTimeout(() => {
                setDone(false);
                setGenModal(null);
            }, 3000);
        },
        onError: () => toast.error('Failed to generate report')
    });

    const handleGenerate = () => {
        if (!genModal) return;
        generateApi.execute({
            report_type: genModal.id,
            start_date: startDate,
            end_date: endDate,
            format: format.toLowerCase()
        });
    };

    const isGenerating = generateApi.loading;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AnimatePresence>
                {genModal !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget && !isGenerating) setGenModal(null); }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

                            {!isGenerating && !done && (
                                <button onClick={() => setGenModal(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                                    <X size={20} color="#9B9BA4" />
                                </button>
                            )}

                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>
                                {genModal.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', marginBottom: 32 }}>
                                File type: {format}
                            </div>

                            {!isGenerating && !done && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.08em' }}>DATE FROM</div>
                                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.08em' }}>DATE TO</div>
                                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                                        </div>
                                    </div>

                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.08em' }}>CHOOSE FILE TYPE</div>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                                        {['PDF', 'XLSX', 'CSV'].map(f => {
                                            const isActive = format === f;
                                            return (
                                                <button key={f} onClick={() => setFormat(f)} style={{ flex: 1, background: isActive ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500, color: isActive ? '#D90025' : '#fff', transition: 'all 0.2s' }}>
                                                    {f}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div style={{ background: 'rgba(217,0,37,0.03)', border: '1px solid rgba(217,0,37,0.1)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Sparkles size={16} color="#D90025" />
                                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: '#fff' }}>System Data</div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>
                                            We will collect the latest data for your report.
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        style={{ width: '100%', background: '#D90025', border: 'none', borderRadius: 12, padding: '16px 0', cursor: 'pointer', fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff', boxShadow: '0 8px 24px rgba(217,0,37,0.2)' }}
                                    >
                                        Create Report →
                                    </button>
                                </motion.div>
                            )}

                            {isGenerating && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: '#CACACE', marginBottom: 24 }}>Preparing your data...</div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                        <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ height: '100%', width: '60%', background: '#D90025', borderRadius: 3 }} />
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4', marginTop: 16 }}>This won't take long.</div>
                                </motion.div>
                            )}

                            {done && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <Download size={32} color="#22c55e" />
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>File Ready</div>
                                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>{genModal.name} is now saved to your device.</div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SectionHeader title="Compliance & Reports" subtitle="Generate regulatory compliance artifacts and analytical summaries from live ledger data" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {REPORTS.map((r, i) => {
                    const Icon = r.icon;
                    return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => setGenModal(r)}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: 28, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.background = '#0F0F17'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}15`, border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={r.color} />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '4px 10px', fontFamily: 'var(--font-space)', fontSize: 9, color: '#9B9BA4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {r.freq}
                                </div>
                            </div>

                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>{r.name}</div>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4', lineHeight: 1.5, flex: 1, minHeight: 40 }}>{r.desc}</div>

                            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 600, color: r.color }}>
                                Get Report <span style={{ transition: 'transform 0.2s', display: 'inline-block' }}>→</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
