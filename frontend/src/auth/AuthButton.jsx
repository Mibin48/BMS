import { motion } from 'framer-motion';

const SPINNER = (
    <div style={{
        width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    }} />
);

export default function AuthButton({
    variant = 'primary',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon: Icon,
    onClick,
    children,
    type = 'button',
}) {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '14px 24px', borderRadius: 12,
        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14,
        border: 'none', cursor: loading || disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease', width: fullWidth ? '100%' : 'auto',
        opacity: disabled && !loading ? 0.5 : 1,
        position: 'relative', overflow: 'hidden',
        userSelect: 'none',
    };

    const styles = {
        primary: {
            background: 'var(--red)', color: '#fff',
        },
        ghost: {
            background: 'transparent', color: 'var(--text2)',
            border: '1px solid rgba(255,255,255,0.08)',
        },
        danger: {
            background: 'rgba(217,0,37,0.1)', color: 'var(--red)',
            border: '1px solid rgba(217,0,37,0.3)',
        },
    };

    const hoverStyles = {
        primary: { background: 'var(--red-h)', boxShadow: '0 8px 30px rgba(217,0,37,0.45)', transform: 'translateY(-1px)' },
        ghost: { borderColor: 'rgba(217,0,37,0.4)', color: '#fff' },
        danger: { background: 'rgba(217,0,37,0.2)' },
    };

    return (
        <motion.button
            type={type}
            onClick={!loading && !disabled ? onClick : undefined}
            style={{ ...base, ...styles[variant] }}
            whileHover={!loading && !disabled ? hoverStyles[variant] : {}}
            whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
        >
            {loading ? SPINNER : (
                <>
                    {Icon && <Icon size={16} />}
                    {children}
                </>
            )}
        </motion.button>
    );
}
