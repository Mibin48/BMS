import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Building2, Droplets, Info, Globe, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import { hospitalService } from '../../services/hospitalService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext.jsx';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function HospitalBloodBanks() {
    const { showExpiryModal } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [bloodType, setBloodType] = useState('');

    const { data, loading, error, refetch } = useFetch(hospitalService.getBloodBanks);

    const banks = data?.banks || [];

    const filtered = banks.filter(b => {
        const mq = !search || b.bank_name?.toLowerCase().includes(search.toLowerCase()) || b.city?.toLowerCase().includes(search.toLowerCase());
        const mt = !bloodType || (b.stock && (b.stock[bloodType] || 0) > 0);
        return mq && mt;
    });

    const getStockHealth = (units) => {
        const MAX_CAPACITY = 250;
        const pct = units / MAX_CAPACITY;
        if (pct > 0.6) return { color: '#22c55e', label: 'OPTIMAL', glow: 'rgba(34, 197, 94, 0.4)', gradient: 'linear-gradient(90deg, #22c55e, #4ade80)' };
        if (pct > 0.3) return { color: '#f59e0b', label: 'STABLE', glow: 'rgba(245, 158, 11, 0.3)', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' };
        return { color: '#D90025', label: 'LOW STOCK', glow: 'rgba(217, 0, 37, 0.4)', gradient: 'linear-gradient(90deg, #D90025, #FF0030)' };
    };

    if (error && !showExpiryModal) return <ErrorCard message={error} onRetry={refetch} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: -100, right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(217,0,37,0.05), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: 'rgba(217,0,37,0.1)', 
                        border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(217,0,37,0.05)'
                    }}>
                        <Globe size={32} color="var(--red)" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>Nearby Blood Banks</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8, letterSpacing: '0.05em' }}>
                            FOUND <span style={{ color: '#fff', fontWeight: 700 }}>{banks.length}</span> PLACES TO GET BLOOD
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 16px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>LIVE CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* ── Search + Context Filters ── */}
            <motion.div 
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} 
                style={{ 
                    display: 'flex', gap: 20, padding: '12px 24px', 
                    background: 'rgba(15, 15, 23, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, 
                    alignItems: 'center', backdropFilter: 'blur(10px)', zIndex: 1
                }}
            >
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} color="var(--red)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH BY NAME, CITY OR ADDRESS..."
                        style={{ 
                            width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', 
                            borderRadius: 12, padding: '10px 16px 10px 42px', 
                            fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box',
                            letterSpacing: '0.05em'
                        }} 
                    />
                </div>
                <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>CHECK BLOOD GROUP:</div>
                    <select value={bloodType} onChange={e => setBloodType(e.target.value)}
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: 10, padding: '8px 14px', fontFamily: 'var(--font-mono)', 
                            fontSize: 11, color: '#fff', outline: 'none', cursor: 'pointer',
                            fontWeight: 700
                        }}>
                        <option value="" style={{ background: '#0F0F17' }}>ANY GROUP</option>
                        {BLOOD_TYPES.map(t => <option key={t} value={t} style={{ background: '#0F0F17' }}>{t}</option>)}
                    </select>
                </div>
            </motion.div>

            {/* ── Bank Grid ── */}
            <div style={{ minHeight: 400 }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading-banks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <motion.div key="empty-banks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EmptyState icon={Building2} title="No nodes detected" subtitle="Clear your filters to scan the full partner network" />
                        </motion.div>
                    ) : (
                        <motion.div key="banks-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {filtered.map((bank, i) => {
                                    const stockVals = bank.stock ? Object.values(bank.stock) : [];
                                    const maxStock = Math.max(...(stockVals.length ? stockVals : [1]));
                                    return (
                                        <motion.div key={bank.bank_id} 
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
                                            whileHover={{ y: -6, borderColor: 'rgba(217,0,37,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
                                            style={{ 
                                                background: 'rgba(15, 15, 23, 0.6)', backdropFilter: 'blur(16px)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)', 
                                                borderRadius: 28, padding: 32, transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                                position: 'relative', overflow: 'hidden'
                                            }}>
                                            {/* Top Strip */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s infinite' }} />
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.15em', fontWeight: 800 }}>LIVE NOW</div>
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '-0.02em' }}>{bank.bank_name}</div>
                                                </div>
                                                {bank.has_requested && (
                                                    <div style={{ 
                                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', 
                                                        borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
                                                        boxShadow: '0 0 15px rgba(34,197,94,0.1)'
                                                    }}>
                                                        <ShieldCheck size={14} color="#22c55e" />
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22c55e', fontWeight: 800 }}>CONNECTED</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details Strip */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 32 }}>
                                                <div style={{ 
                                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', 
                                                    borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <MapPin size={14} color="var(--red)" />
                                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{bank.city}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <Phone size={14} color="var(--red)" />
                                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{bank.contact_number}</span>
                                                    </div>
                                                </div>
                                                <div style={{ 
                                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', 
                                                    borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                                }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>BLOOD UNITS</div>
                                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{bank.total_units ?? '--'} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>TOTAL</span></div>
                                                </div>
                                            </div>

                                            {/* Stock Visuals */}
                                            {bank.stock && (
                                                <div style={{ marginBottom: 32 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: 800 }}>STOCK DETAILS</div>
                                                        <Info size={12} color="rgba(255,255,255,0.3)" />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                        {BLOOD_TYPES.map(t => {
                                                            const health = getStockHealth(bank.stock[t] || 0);
                                                            return (
                                                                <div key={t} style={{ 
                                                                    display: 'flex', alignItems: 'center', gap: 10, 
                                                                    background: 'rgba(255,255,255,0.02)', padding: '6px 12px', 
                                                                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' 
                                                                }}>
                                                                    <div style={{ minWidth: 28 }}><BloodGroupBadge group={t} small /></div>
                                                                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                                                                        <motion.div 
                                                                            initial={{ width: 0 }} 
                                                                            animate={{ width: `${Math.min(((bank.stock[t] || 0) / 250) * 100, 100)}%` }}
                                                                            style={{ 
                                                                                height: '100%', 
                                                                                background: health.gradient, 
                                                                                borderRadius: 2, 
                                                                                boxShadow: `0 0 12px ${health.glow}`
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', minWidth: 24, textAlign: 'right', fontWeight: 800 }}>{bank.stock[t] || 0}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <motion.button 
                                                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(217,0,37,0.3)' }} whileTap={{ scale: 0.98 }}
                                                    onClick={() => navigate('/hospital/requests')} 
                                                    style={{ 
                                                        flex: 1, background: 'linear-gradient(135deg, var(--red), var(--red-h))', 
                                                        border: 'none', borderRadius: 16, padding: '16px 0', cursor: 'pointer', 
                                                        fontFamily: 'var(--font-sub)', fontSize: 15, fontWeight: 700, color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                                        boxShadow: '0 10px 40px rgba(217,0,37,0.2)'
                                                    }}
                                                >
                                                    <Zap size={18} fill="#fff" /> Request Blood
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                                    onClick={() => window.open(`tel:${bank.contact_number}`)}
                                                    style={{ 
                                                        width: 56, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', 
                                                        borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                    }}
                                                >
                                                    <Phone size={20} color="#fff" />
                                                </motion.button>
                                            </div>

                                            {/* Holographic Leak */}
                                            <div style={{ 
                                                position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, 
                                                background: 'radial-gradient(circle, rgba(217,0,37,0.04), transparent 70%)', 
                                                pointerEvents: 'none' 
                                            }} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

