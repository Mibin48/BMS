import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressSteps({ current, steps }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 40, gap: 0 }}>
            {steps.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : 'none' }}>
                        {/* Node + label */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: done ? 'var(--red)' : active ? 'var(--red)' : 'transparent',
                                border: `2px solid ${done || active ? 'var(--red)' : 'rgba(255,255,255,0.15)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: active ? '0 0 12px rgba(217,0,37,0.4)' : 'none',
                                animation: active ? 'pulse 2s infinite' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {done && <Check size={13} color="#fff" strokeWidth={2.5} />}
                                {active && !done && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                                )}
                            </div>
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: 9,
                                color: done || active ? '#fff' : 'var(--text3)',
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                whiteSpace: 'nowrap', textAlign: 'center',
                            }}>{label}</span>
                        </div>
                        {/* Connector */}
                        {i < steps.length - 1 && (
                            <div style={{
                                flex: 1, height: 1, marginTop: 14, marginBottom: 0,
                                background: done ? 'var(--red)' : 'transparent',
                                borderTop: done ? 'none' : '1px dashed rgba(255,255,255,0.1)',
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
