import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A premium, smooth skeleton loading component for the HEM∆ management system.
 * Replaces basic Tailwind skeletons with high-fidelity, layered animations.
 */
export const SkeletonLine = ({ 
    width = '100%', 
    height = '1rem', 
    borderRadius = '8px', 
    className = '', 
    style = {},
    circle = false,
    delay = 0,
    pulse = false
}) => {
    const skeletonStyle = {
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
        background: 'linear-gradient(90deg, #13131D 20%, #1D1D2B 40%, #13131D 70%)',
        backgroundSize: '200% 100%',
        animation: pulse ? 'skeleton-pulse 2s infinite ease-in-out' : 'skeleton-shimmer 2.5s infinite linear',
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        ...style
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`hema-skeleton ${className}`} 
            style={skeletonStyle}
        >
            <style>
                {`
                    @keyframes skeleton-shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    @keyframes skeleton-pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                `}
            </style>
        </motion.div>
    );
};

export const SkeletonCard = ({ height = '160px', delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        style={{ 
            background: '#0F0F17', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: 20, 
            padding: 24,
            height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 12
        }}
    >
        <SkeletonLine width="30%" height="12px" />
        <SkeletonLine width="60%" height="32px" />
        <SkeletonLine width="45%" height="12px" />
    </motion.div>
);

export const SkeletonStats = ({ count = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 0.08} />
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
        {/* Header line */}
        <div style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {Array.from({ length: cols }).map((_, j) => (
                <SkeletonLine key={j} height="10px" width={`${100/cols}%`} />
            ))}
        </div>
        {/* Row lines */}
        {Array.from({ length: rows }).map((_, i) => (
            <div
                key={i}
                style={{ 
                    display: 'flex', 
                    gap: 12, 
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: i < rows - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none'
                }}
            >
                {Array.from({ length: cols }).map((_, j) => (
                    <SkeletonLine key={j} height="16px" width={`${100/cols}%`} delay={0.1 + (i * 0.04)} />
                ))}
            </div>
        ))}
    </motion.div>
);

export const SkeletonList = ({ count = 3, delay = 0 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
            <div 
                key={i}
                style={{ 
                    background: '#0F0F17', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: 16, 
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                }}
            >
                <SkeletonLine width="36px" height="36px" circle delay={delay + (i * 0.05)} />
                <div style={{ flex: 1 }}>
                    <SkeletonLine width="40%" height="16px" style={{ marginBottom: 8 }} delay={delay + (i * 0.05)} />
                    <SkeletonLine width="25%" height="12px" delay={delay + (i * 0.05)} />
                </div>
                <SkeletonLine width="60px" height="24px" borderRadius="100px" delay={delay + (i * 0.05)} />
            </div>
        ))}
    </div>
);
