import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OTPInput({ value, onChange, error, success }) {
    const inputs = useRef([]);
    const digits = (value || '      ').split('').slice(0, 6);

    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[i] = char;
        onChange(newDigits.join('').replace(/ /g, ''));
        if (char && i < 5) inputs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace') {
            if (!digits[i] || digits[i] === ' ') {
                if (i > 0) inputs.current[i - 1]?.focus();
            } else {
                const newDigits = [...digits];
                newDigits[i] = '';
                onChange(newDigits.join('').replace(/ /g, ''));
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted);
        inputs.current[Math.min(pasted.length, 5)]?.focus();
    };

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    const borderColor = error
        ? 'rgba(217,0,37,0.6)'
        : success
            ? 'rgba(34,197,94,0.5)'
            : 'rgba(255,255,255,0.08)';

    return (
        <motion.div
            style={{ display: 'flex', gap: 12 }}
            animate={error ? { x: [0, -6, 6, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {[0, 1, 2, 3, 4, 5].map(i => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] === ' ' ? '' : (digits[i] || '')}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    style={{
                        width: 52, height: 60, textAlign: 'center',
                        background: '#0F0F17',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 10,
                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 22, color: '#fff',
                        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                        caretColor: 'var(--red)',
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = 'rgba(217,0,37,0.6)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(217,0,37,0.1)';
                    }}
                    onBlur={e => {
                        if (!error && !success) e.target.style.borderColor = borderColor;
                        e.target.style.boxShadow = 'none';
                    }}
                />
            ))}
        </motion.div>
    );
}
