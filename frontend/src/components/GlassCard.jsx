const GlassCard = ({ children, className = '', glow = false, noPad = false, style = {} }) => (
    <div style={{
        background: '#0F0F17',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: noPad ? 0 : 24,
        boxShadow: glow ? '0 0 40px rgba(217,0,37,0.06)' : 'none',
        ...style,
    }} className={className}>
        {children}
    </div>
);

export default GlassCard;
