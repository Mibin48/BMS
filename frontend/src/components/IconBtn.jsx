const IconBtn = ({ icon: Icon, onClick, title, danger = false, disabled = false }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        style={{
            width: 32, height: 32, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            background: danger ? 'rgba(217,0,37,0.05)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${danger ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.08)'}`,
            color: danger ? 'rgba(217,0,37,0.60)' : '#9B9BA4',
            transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
            if (disabled) return;
            e.currentTarget.style.background = danger ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.10)';
            e.currentTarget.style.color = danger ? '#D90025' : '#fff';
            e.currentTarget.style.borderColor = danger ? 'rgba(217,0,37,0.30)' : 'rgba(255,255,255,0.15)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = danger ? 'rgba(217,0,37,0.05)' : 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = danger ? 'rgba(217,0,37,0.60)' : '#9B9BA4';
            e.currentTarget.style.borderColor = danger ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.08)';
        }}
    >
        <Icon size={14} />
    </button>
);

export default IconBtn;
