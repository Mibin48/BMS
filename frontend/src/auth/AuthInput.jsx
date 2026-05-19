import { useState, useRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthInput({
    label, type = 'text', placeholder, value, onChange,
    error, icon: Icon, required, hint, disabled, success,
    id,
}) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef();

    const isPassword = type === 'password';
    const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

    const borderColor = error
        ? 'rgba(217,0,37,0.6)'
        : success
            ? 'rgba(34,197,94,0.4)'
            : focused
                ? 'rgba(217,0,37,0.5)'
                : 'rgba(255,255,255,0.08)';

    const boxShadow = error
        ? '0 0 0 3px rgba(217,0,37,0.08)'
        : success
            ? '0 0 0 3px rgba(34,197,94,0.06)'
            : focused
                ? '0 0 0 3px rgba(217,0,37,0.08)'
                : 'none';

    return (
        <div style={{ marginBottom: 20 }}>
            {label && (
                <label htmlFor={id} style={{
                    display: 'block', marginBottom: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                    {label}
                    {required && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                </label>
            )}
            <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: '#0F0F17', border: `1px solid ${borderColor}`,
                borderRadius: 12, transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow, opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'auto',
            }}>
                {Icon && (
                    <div style={{ position: 'absolute', left: 14, color: 'var(--text3)', pointerEvents: 'none', display: 'flex' }}>
                        <Icon size={15} />
                    </div>
                )}
                <input
                    ref={inputRef}
                    id={id}
                    type={resolvedType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none', outline: 'none',
                        fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff',
                        padding: `14px 16px 14px ${Icon ? '40px' : '16px'}`,
                        paddingRight: (isPassword || error || success) ? '44px' : '16px',
                        cursor: disabled ? 'not-allowed' : 'auto',
                        width: '100%',
                    }}
                />
                {/* Right icons */}
                <div style={{ position: 'absolute', right: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isPassword && (
                        <button type="button" onClick={() => setShow(s => !s)}
                            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                            {show ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    )}
                    {error && !isPassword && <AlertCircle size={15} color="var(--red)" />}
                    {success && !isPassword && <CheckCircle size={15} color="#22c55e" />}
                </div>
            </div>
            {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{error}</p>
            )}
            {hint && !error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{hint}</p>
            )}
        </div>
    );
}
