import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

/**
 * Premium Number Stepper Component
 * @param {number} value - Current value
 * @param {function} onChange - Callback for value changes
 * @param {number} min - Minimum value (default 1)
 * @param {number} max - Maximum value (default 100)
 * @param {string} label - Optional label for the input
 * @param {boolean} disabled - Whether the stepper is disabled
 */
export default function NumberStepper({ value, onChange, min = 1, max = 100, step = 1, label, disabled = false }) {

    const handleIncrement = () => {
        if (!disabled && value + step <= max) {
            onChange(value + step);
        } else if (!disabled && value < max) {
            onChange(max);
        }
    };

    const handleDecrement = () => {
        if (!disabled && value - step >= min) {
            onChange(value - step);
        } else if (!disabled && value > min) {
            onChange(min);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        // Only allow numbers and decimal point
        if (val !== '' && !/^-?\d*\.?\d*$/.test(val)) return;

        if (val === '') {
            onChange('');
            return;
        }

        const num = step % 1 === 0 ? parseInt(val) : parseFloat(val);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        let num = parseFloat(value);
        if (isNaN(num) || num < min) {
            onChange(min);
        } else if (num > max) {
            onChange(max);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginBottom: 0 }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 500
                }}>
                    {label}
                </label>
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#0F0F17',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '4px',
                width: '100%',
                gap: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'default',
                height: 44,
            }}>
                {/* Decrement Button */}
                <motion.button
                    type="button"
                    whileHover={!disabled && value > min ? { scale: 1.02, background: 'rgba(217,0,37,0.1)' } : {}}
                    whileTap={!disabled && value > min ? { scale: 0.98 } : {}}
                    onClick={handleDecrement}
                    disabled={disabled || value <= min}
                    style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: value <= min ? 'rgba(255,255,255,0.1)' : 'var(--text2)',
                        cursor: value <= min ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <Minus size={14} strokeWidth={2.5} />
                </motion.button>

                {/* Editable Value Input */}
                <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'var(--font-sub)',
                        fontSize: 16,
                        color: '#fff',
                        fontWeight: 700,
                        width: '100%',
                    }}
                />

                {/* Increment Button */}
                <motion.button
                    type="button"
                    whileHover={!disabled && value < max ? { scale: 1.02, background: 'rgba(34,197,94,0.1)' } : {}}
                    whileTap={!disabled && value < max ? { scale: 0.98 } : {}}
                    onClick={handleIncrement}
                    disabled={disabled || value >= max}
                    style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: value >= max ? 'rgba(255,255,255,0.1)' : 'var(--text2)',
                        cursor: value >= max ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <Plus size={14} strokeWidth={2.5} />
                </motion.button>
            </div>
        </div>
    );
}
