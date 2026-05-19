import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, subtitle, action, actionLabel }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
        }}
    >
        <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
        }}>
            <Icon size={32} color="rgba(217,0,37,0.4)" />
        </div>
        <p style={{
            fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18,
            color: '#fff', marginBottom: 8,
        }}>
            {title}
        </p>
        <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)',
            maxWidth: 280, marginBottom: action ? 24 : 0,
        }}>
            {subtitle}
        </p>
        {action && (
            <button
                onClick={action}
                style={{
                    padding: '8px 16px', background: 'rgba(217,0,37,0.1)',
                    border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)',
                    cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,0,37,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,0,37,0.1)'}
            >
                {actionLabel}
            </button>
        )}
    </motion.div>
);

export default EmptyState;
