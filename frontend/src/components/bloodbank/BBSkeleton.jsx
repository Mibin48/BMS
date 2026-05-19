import React from 'react';
import { motion } from 'framer-motion';

const BBSkeleton = ({ 
    width = '100%', 
    height = '1rem', 
    borderRadius = '8px', 
    className = '', 
    style = {},
    circle = false,
    delay = 0
}) => {
    const skeletonStyle = {
        width: circle ? height : width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
        background: 'linear-gradient(90deg, #14141E 25%, #1C1C28 37%, #14141E 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 2s ease infinite',
        display: 'block',
        ...style
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`bb-skeleton ${className}`} 
            style={skeletonStyle}
        >

            <style>
                {`
                    @keyframes skeleton-shimmer {
                        0% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                `}
            </style>
        </motion.div>
    );
};

export const BBCardSkeleton = ({ height = 160 }) => (
    <div style={{ 
        background: '#0F0F17', 
        border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: 16, 
        padding: 24,
        height
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <BBSkeleton width="40%" height="24px" />
            <BBSkeleton width="20%" height="20px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {Array.from({ length: 4 }).map((_, i) => (
                <BBSkeleton key={i} height="120px" borderRadius="12px" delay={i * 0.05} />
            ))}
        </div>
    </div>
);

export const BBListSkeleton = ({ rows = 5, height = 72 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
            <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{ 
                    background: '#0F0F17', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: 16, 
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}
            >
                <BBSkeleton width="40px" height="40px" circle />
                <div style={{ flex: 1 }}>
                    <BBSkeleton width="60%" height="16px" style={{ marginBottom: 8 }} />
                    <BBSkeleton width="40%" height="12px" />
                </div>
                <BBSkeleton width="60px" height="24px" borderRadius="100px" />
            </motion.div>
        ))}
    </div>
);

export const BBStatSkeleton = ({ delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        style={{ 
            background: '#0F0F17', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: 16, 
            padding: 24,
            height: 120, // default if not specified elsewhere
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}
    >
        <BBSkeleton width="30%" height="12px" style={{ marginBottom: 16 }} />
        <BBSkeleton width="60%" height="32px" />
    </motion.div>
);

export default BBSkeleton;

