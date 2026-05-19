import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity, Droplets } from 'lucide-react';
import { accentFor } from './bb-ui';

export default function BBStockCard({ stock: s, onUpdate, large = false }) {
    const pct = s.capacity > 0 ? Math.round(s.available_units / s.capacity * 100) : 0;
    const a = accentFor(pct);
    const [hovered, setHovered] = useState(false);

    return (
        <div 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative', height: '100%' }}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                    opacity: 1, 
                    y: hovered ? -6 : 0 
                }}
                onClick={onUpdate ? () => onUpdate(s) : undefined}
                style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'rgba(15, 15, 23, 0.4)', 
                    borderRadius: 20, 
                    border: `1px solid ${hovered ? a.color : a.border}`,
                    padding: large ? 24 : 18,
                    cursor: onUpdate ? 'pointer' : 'default',
                    boxShadow: hovered ? `0 20px 40px -10px ${a.bg}` : 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    transform: 'translateZ(0)', // Force GPU
                    willChange: 'transform'
                }}
            >
                {/* Subtle Scanning Beam - Slow & Rhythmic */}
                <motion.div 
                    animate={{ top: ['-100%', '200%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{ 
                        position: 'absolute', left: 0, right: 0, height: 60, 
                        background: `linear-gradient(to bottom, transparent, ${a.color}08, transparent)`, 
                        pointerEvents: 'none', zIndex: 1 
                    }} 
                />

                {/* Content Container */}
                <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
                    {/* Header: Blood Group & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: large ? 20 : 16 }}>
                        <div>
                            <h3 style={{ 
                                fontFamily: 'var(--font-syne)', fontWeight: 800, 
                                fontSize: large ? 42 : 32, color: '#fff', 
                                lineHeight: 1, letterSpacing: '-0.04em'
                            }}>{s.blood_group}</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <Droplets size={12} color={a.color} />
                                <p style={{ fontFamily: 'var(--font-space)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                                    {s.available_units} <span style={{ color: '#4A4A55', fontWeight: 400 }}>/ {s.capacity}</span>
                                </p>
                            </div>
                        </div>

                        <div style={{
                            fontFamily: 'var(--font-space)', fontSize: 9, fontWeight: 800,
                            padding: '4px 10px', borderRadius: 6,
                            color: a.color, background: `${a.color}10`,
                            border: `1px solid ${a.border}`, textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                        }}>
                            {a.label}
                        </div>
                    </div>

                    {/* Streamlined Progress Section */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: '#9B9BA4', fontWeight: 600 }}>UTILIZATION</p>
                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 800, color: a.color }}>{pct}%</p>
                        </div>
                        
                        <div style={{ 
                            height: 6, background: 'rgba(255,255,255,0.03)', 
                            borderRadius: 100, overflow: 'hidden', position: 'relative',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                style={{ 
                                    height: '100%', borderRadius: 100, background: a.color, 
                                    boxShadow: `0 0 10px ${a.color}40`, position: 'relative'
                                }}
                            >
                                <motion.div 
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                    style={{ 
                                        position: 'absolute', top: 0, bottom: 0, width: '40%', 
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' 
                                    }} 
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Secondary Data / Simple Labels */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Activity size={10} color={a.color} opacity={0.6} />
                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: a.color, fontWeight: 700, opacity: 0.8, letterSpacing: '0.05em' }}>
                                {a.label?.toUpperCase() === 'HEALTHY' ? 'STOCK STABLE' : a.label?.toUpperCase() === 'LOW' ? 'LOW STOCK' : 'CRITICAL'}
                            </span>
                        </div>
                        {large && (
                            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 9, color: '#4A4A55', fontWeight: 600 }}>
                                {a.label?.toUpperCase() === 'HEALTHY' ? 'STORAGE OK' : a.label?.toUpperCase() === 'LOW' ? 'REFILL SOON' : 'ACTION NEEDED'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Subtle Interactive Overlay */}
                {onUpdate && (
                    <motion.div 
                        animate={{ opacity: hovered ? 1 : 0 }}
                        style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(15, 15, 23, 0.4)', backdropFilter: hovered ? 'blur(4px)' : 'none',
                            zIndex: 10, pointerEvents: hovered ? 'auto' : 'none', transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ 
                            padding: '10px 20px', borderRadius: 12,
                            background: '#fff', color: '#000',
                            fontFamily: 'var(--font-space)', fontWeight: 800, fontSize: 11,
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: `0 10px 25px -5px ${a.bg}`
                        }}>
                            <RefreshCw size={14} /> UPDATE {s.blood_group}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
