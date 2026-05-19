import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, Mail, Lock, Building2, Hash, FileText,
    Droplets, Database, BedDouble, Clock, ChevronRight, Edit2, Microscope, ShieldCheck, Heart, ArrowRight
} from 'lucide-react';
import AuthLayout from '../auth/AuthLayout';
import AuthInput from '../auth/AuthInput';
import AuthButton from '../auth/AuthButton';
import CheckboxField from '../auth/CheckboxField';
import FormSection from '../auth/FormSection';
import ProgressSteps from '../auth/ProgressSteps';
import RoleSelector from '../auth/RoleSelector';
import DistrictSelector from '../auth/DistrictSelector';
import BloodTypeSelector from '../auth/BloodTypeSelector';
import NumberStepper from '../components/NumberStepper';

// ─── Shared constants ─────────────────────────────────────────────────────────

const REGISTER_ROLES = [
    { 
        id: 'donor', 
        label: 'Donor', 
        icon: Droplets, 
        desc: 'Donate blood and save lives', 
        color: 'var(--red)',
        tagline: ['SAVE', 'LIVES', 'TODAY']
    },
    { 
        id: 'hospital', 
        label: 'Hospital', 
        icon: Building2, 
        desc: 'Request blood for your patients', 
        color: '#4F46E5',
        tagline: ['HOSPITAL', 'REGISTRATION', '']
    },
    { 
        id: 'blood_bank', 
        label: 'Blood Bank', 
        icon: Microscope, 
        desc: 'Sign up to manage your blood bank stock', 
        color: '#F59E0B',
        tagline: ['JOIN', 'BLOOD', 'BANK']
    },
];

const ensurePlus91 = (val) => {
    if (!val) return '+91 ';
    const trimmed = val.trim();
    if (trimmed.startsWith('+91 ')) return trimmed;
    if (trimmed.startsWith('+91')) return '+91 ' + trimmed.substring(3).trim();
    return '+91 ' + trimmed;
};

const handlePhoneChange = (e, setter) => {
    let val = e.target.value;
    if (!val.startsWith('+91 ')) {
        setter('+91 ');
        return;
    }
    
    // Get only digits after prefix
    let digits = val.substring(4).replace(/\D/g, '').slice(0, 10);
    
    // Format: +91 XXXXX XXXXX
    let formatted = '+91 ';
    if (digits.length > 5) {
        formatted += digits.substring(0, 5) + ' ' + digits.substring(5);
    } else {
        formatted += digits;
    }
    
    setter(formatted);
};

// ─── Slide animation helpers ──────────────────────────────────────────────────

const slide = (dir) => ({
    initial: { opacity: 0, x: dir * 40, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: dir * -40, filter: 'blur(10px)' },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
});

// ─── Shared sub-components ────────────────────────────────────────────────────

function RoleCard({ role, selected, onClick }) {
    const Icon = role.icon;
    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                position: 'relative', width: '100%',
                background: selected ? 'rgba(217, 0, 37, 0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selected ? 'var(--red)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 24, padding: '28px 32px', textAlign: 'left',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                boxShadow: selected ? '0 20px 40px rgba(217, 0, 37, 0.15)' : 'none',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: selected ? 'var(--red)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: selected ? '0 0 25px rgba(217, 0, 37, 0.4)' : 'none',
                flexShrink: 0
            }}>
                <Icon size={28} color={selected ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={selected ? 2.5 : 1.5} />
            </div>
            
            <div style={{ flex: 1 }}>
                <h3 style={{ 
                    fontFamily: 'var(--font-head)', fontSize: 26, 
                    color: selected ? '#fff' : 'rgba(255,255,255,0.8)', 
                    marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase',
                    transition: 'all 0.3s ease' 
                }}>
                    {role.label}
                </h3>
                <p style={{ 
                    fontFamily: 'var(--font-body)', fontSize: 14, 
                    color: selected ? 'rgba(255,255,255,0.6)' : 'var(--text3)', 
                    lineHeight: 1.4, margin: 0, fontWeight: 300 
                }}>
                    {role.desc}
                </p>
            </div>

            <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                <AnimatePresence mode="wait">
                    {selected ? (
                        <motion.div 
                            key="check"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            style={{ 
                                width: '100%', height: '100%', borderRadius: '50%', 
                                background: 'rgba(217, 0, 37, 0.1)', border: '1px solid var(--red)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <ShieldCheck size={20} color="var(--red)" />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="arrow"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 10, opacity: 0 }}
                            style={{ opacity: 0.1 }}
                        >
                            <ArrowRight size={24} color="#fff" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ambient Background Glow */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.12, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: 'absolute', right: '-10%', top: '-20%',
                            width: '40%', height: '140%',
                            background: `radial-gradient(circle, var(--red) 0%, transparent 70%)`,
                            filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none'
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
}

function PasswordStrength({ password }) {
    const strength = (() => {
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();
    const labels = ['', 'WEAK STATUS', 'PASSABLE', 'RELIABLE', 'MAXIMUM SECURITY'];
    const colors = ['', 'var(--red)', '#f59e0b', '#eab308', '#22c55e'];
    if (!password) return null;
    return (
        <div style={{ marginTop: 10, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.06)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }} />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em' }}>STRENGTH</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: colors[strength], letterSpacing: '0.1em', fontWeight: 700 }}>{labels[strength]}</span>
            </div>
        </div>
    );
}

function ReviewCard({ title, data, onEdit }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 16, padding: '24px', marginBottom: 16, position: 'relative',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{title}</span>
                </div>
                <button onClick={onEdit} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    cursor: 'pointer', color: 'var(--text2)', borderRadius: 100,
                    fontFamily: 'var(--font-mono)', fontSize: 9, padding: '6px 12px',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text2)'; }}
                >
                    <Edit2 size={10} /> EDIT
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12 }}>
                {data.filter(d => d.val).map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', minWidth: 100, letterSpacing: '0.05em' }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', flex: 1, opacity: 0.9 }}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SuccessState({ role }) {
    const isPending = role === 'hospital' || role === 'blood_bank';
    const navigate = useNavigate();
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '40px 0' }}
        >
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 32px' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ShieldCheck size={60} color="#22c55e" strokeWidth={1.5} />
                </motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: '1px solid #22c55e', opacity: 0 }}
                />
            </div>

            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 42, marginBottom: 12, color: '#fff' }}>
                {isPending ? 'REQUEST RECEIVED' : 'REGISTRATION COMPLETE'}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 32px', fontSize: 16 }}>
                {isPending
                    ? 'We have received your application. Our team will verify your details and get back to you within 24 hours.'
                    : 'Your account is ready. Welcome to HEM∆! You can now log in to your dashboard.'}
            </p>

            {isPending && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 12,
                    padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32
                }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em' }}>REF ID:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>HEM/KL/${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
                <AuthButton variant="primary" fullWidth onClick={() => navigate('/login')}>
                    GO TO LOGIN <ChevronRight size={16} />
                </AuthButton>
                {isPending && (
                    <AuthButton variant="ghost" fullWidth onClick={() => navigate('/pending-approval')}>
                        CHECK STATUS
                    </AuthButton>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Register Component (Role Selection) ──────────────────────────────────

export default function Register() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [email, setEmail] = useState('');
    const location = useLocation();
    
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const role = query.get('role');
        const mail = query.get('email');
        if (role) {
            const found = REGISTER_ROLES.find(r => r.id === role);
            if (found) setSelectedRole(found);
        }
        if (mail) setEmail(mail);
    }, [location]);

    if (!selectedRole) {
        return (
            <AuthLayout 
                tagline={['SAVE', 'LIVES', 'TODAY']} 
                subtitle="Join the HEM∆ network of life-savers and healthcare partners."
                badge="JOIN THE COMMUNITY"
            >
                <motion.div {...fadeUp(0)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 10px var(--red)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.15em' }}>REGISTRATION</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 44, color: '#fff', marginBottom: 8, lineHeight: 1 }}>CREATE ACCOUNT</h1>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', fontSize: 16, marginBottom: 32 }}>Choose how you want to join the HEM∆ community.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, marginBottom: 40 }}>
                    {REGISTER_ROLES.map((role, idx) => (
                        <motion.div key={role.id} {...fadeUp(0.1 + idx * 0.1)}>
                            <RoleCard 
                                role={role} 
                                selected={false} 
                                onClick={() => setSelectedRole(role)} 
                            />
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    {...fadeUp(0.4)}
                    style={{ 
                        textAlign: 'center', padding: '24px 0', 
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', flexDirection: 'column', gap: 8
                    }}
                >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>Already have an account?</span>
                    <Link to="/login" style={{ fontFamily: 'var(--font-head)', fontSize: 20, color: 'var(--red)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                        LOG IN HERE →
                    </Link>
                </motion.div>
            </AuthLayout>
        );
    }

    const onBack = () => setSelectedRole(null);

    return (
        <AuthLayout 
            tagline={selectedRole.tagline} 
            subtitle={selectedRole.desc}
            badge={`JOINING AS ${selectedRole.label.toUpperCase()}`}
        >
            {selectedRole.id === 'donor' && <DonorRegister onBack={onBack} initialEmail={email} />}
            {selectedRole.id === 'hospital' && <HospitalRegister onBack={onBack} initialEmail={email} />}
            {selectedRole.id === 'blood_bank' && <BloodBankRegister onBack={onBack} initialEmail={email} />}
        </AuthLayout>
    );
}

// ─── DONOR FLOW (3 steps) ─────────────────────────────────────────────────────

function DonorRegister({ onBack, initialEmail = '' }) {
    const STEPS = ['Personal Info', 'Health Details', 'Confirm & Submit'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });
    const { register } = useAuth();
    const navigate = useNavigate();

    // Step 1
    const [name, setName] = useState('');
    const [age, setAge] = useState('18');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [phone, setPhone] = useState('+91 ');
    const [district, setDistrict] = useState('');
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');

    // Step 2
    const [weight, setWeight] = useState('50');
    const [hemoglobin, setHemoglobin] = useState('12.5');
    const [bp, setBp] = useState('');
    const [conditions, setConditions] = useState('');

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await register('donor', {
                name,
                age: parseInt(age),
                gender,
                blood_group: bloodGroup,
                phone,
                city: district,
                email,
                password,
                weight: parseInt(weight),
                hemoglobin: parseFloat(hemoglobin),
                blood_pressure: bp,
                medical_conditions: conditions
            });
            toast.success('Registration successful!');
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) return <SuccessState role="donor" />;

    return (
        <div style={{ position: 'relative' }}>
            <ProgressSteps current={step} steps={STEPS} />
            
            <AnimatePresence mode="wait" custom={dir}>
                {step === 0 && (
                    <motion.div key="d0" {...slide(dir)}>
                        <FormSection label="BASIC INFORMATION">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="FULL NAME" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} icon={User} required />
                                <NumberStepper label="AGE" value={parseInt(age)} onChange={v => setAge(String(v))} min={18} max={65} />
                            </div>
                            
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    GENDER <span style={{ color: 'var(--red)' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button key={g} type="button" onClick={() => setGender(g)} style={{
                                            flex: 1, padding: '12px 0', cursor: 'pointer',
                                            background: gender === g ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${gender === g ? 'var(--red)' : 'rgba(255,255,255,0.06)'}`,
                                            borderRadius: 12, fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13,
                                            color: gender === g ? '#fff' : 'var(--text3)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}>{g}</button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    BLOOD GROUP <span style={{ color: 'var(--red)' }}>*</span>
                                </label>
                                <BloodTypeSelector value={bloodGroup} onChange={setBloodGroup} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="PHONE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => handlePhoneChange(e, setPhone)} icon={Phone} required />
                                <DistrictSelector label="CITY / DISTRICT" value={district} onChange={setDistrict} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL ADDRESS" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <div style={{ position: 'relative' }}>
                                    <AuthInput label="PASSWORD" type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
                                    <PasswordStrength password={password} />
                                </div>
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={onBack} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(1)} fullWidth>NEXT STEP →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="d1" {...slide(dir)}>
                        <FormSection label="HEALTH INFORMATION">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
                                <NumberStepper label="WEIGHT (KG)" value={parseInt(weight)} onChange={v => setWeight(String(v))} min={45} max={150} />
                                <NumberStepper label="HEMOGLOBIN (g/dL)" value={parseFloat(hemoglobin)} onChange={v => setHemoglobin(String(v))} min={5} max={20} step={0.1} />
                            </div>
                            
                            <AuthInput label="BLOOD PRESSURE" placeholder="Example: 120/80" value={bp} onChange={e => setBp(e.target.value)} hint="Systolic/Diastolic" />
                            <AuthInput label="MEDICAL CONDITIONS" placeholder="List any illnesses or medications" value={conditions} onChange={e => setConditions(e.target.value)} hint="Leave blank if none" />

                            <div style={{
                                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)',
                                borderRadius: 16, padding: '20px', marginTop: 20
                            }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldCheck size={20} color="#22c55e" />
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                                        Your health metrics are used solely to determine donation eligibility and are protected by system-wide encryption.
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(2)} fullWidth>REVIEW & SUBMIT →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="d2" {...slide(dir)}>
                        <FormSection label="CONFIRM DETAILS">
                            <ReviewCard title="PERSONAL INFO" onEdit={() => goTo(0)} data={[
                                { label: 'Full Name', val: name },
                                { label: 'Age', val: `${age} Years` },
                                { label: 'Gender', val: gender },
                                { label: 'Category', val: bloodGroup },
                                { label: 'Phone', val: phone },
                                { label: 'Region', val: district },
                                { label: 'Email', val: email },
                            ]} />
                            
                            <ReviewCard title="VITALITY" onEdit={() => goTo(1)} data={[
                                { label: 'Weight', val: `${weight} kg` },
                                { label: 'Hemoglobin', val: `${hemoglobin} g/dL` },
                                { label: 'Pressure', val: bp },
                                { label: 'Medical History', val: conditions || 'None Declared' },
                            ]} />

                            <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <CheckboxField required label={<span>I agree to the <span style={{ color: 'var(--red)' }}>Terms and Conditions</span></span>} checked={agreements.terms} onChange={() => setAgreements(a => ({ ...a, terms: !a.terms }))} />
                                <CheckboxField required label="I confirm that my health information is correct" checked={agreements.accuracy} onChange={() => setAgreements(a => ({ ...a, accuracy: !a.accuracy }))} />
                                <CheckboxField required label="I want to receive alerts for blood requests" checked={agreements.naco} onChange={() => setAgreements(a => ({ ...a, naco: !a.naco }))} />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)} fullWidth>← BACK</AuthButton>
                            <AuthButton 
                                variant="primary" 
                                fullWidth 
                                loading={loading} 
                                disabled={!agreements.terms || !agreements.accuracy || !agreements.naco}
                                onClick={handleSubmit}
                            >
                                FINISH REGISTRATION <ChevronRight size={16} />
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── HOSPITAL FLOW (4 steps) ──────────────────────────────────────────────────

function HospitalRegister({ onBack, initialEmail = '' }) {
    const STEPS = ['Organization Info', 'Contact Person', 'Capacity', 'Review & Submit'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });
    const { register } = useAuth();
    const navigate = useNavigate();

    // Step 1: Org
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('hospital');
    const [district, setDistrict] = useState('');
    const [contact, setContact] = useState('+91 ');
    const [regNumber, setRegNumber] = useState('');
    const [license, setLicense] = useState('');

    // Step 2: Admin
    const [adminName, setAdminName] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState(initialEmail);
    const [phone, setPhone] = useState('+91 ');
    const [password, setPassword] = useState('');

    // Step 3: Facility
    const [beds, setBeds] = useState('100');
    const [departments, setDepartments] = useState('');
    const [monthlyVol, setMonthlyVol] = useState('500');

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await register('hospital', {
                hospital_name: orgName,
                city: district,
                contact_number: contact,
                registration_number: regNumber,
                license_number: license,
                type: orgType,
                beds: parseInt(beds),
                admin_name: adminName,
                designation,
                email,
                phone,
                password,
                departments,
                monthly_volume: parseInt(monthlyVol)
            });
            toast.success('Onboarding initiated!');
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Onboarding failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) return <SuccessState role="hospital" />;

    return (
        <div style={{ position: 'relative' }}>
            <ProgressSteps current={step} steps={STEPS} />
            
            <AnimatePresence mode="wait" custom={dir}>
                {step === 0 && (
                    <motion.div key="h0" {...slide(dir)}>
                        <FormSection label="HOSPITAL DETAILS">
                            <AuthInput label="HOSPITAL NAME" placeholder="Enter hospital name" value={orgName} onChange={e => setOrgName(e.target.value)} icon={Building2} required />
                            
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    HOSPITAL TYPE <span style={{ color: 'var(--red)' }}>*</span>
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                    {[
                                        { id: 'hospital', label: 'General Hospital' },
                                        { id: 'govt', label: 'Government Medical' },
                                        { id: 'specialty', label: 'Specialty Center' },
                                        { id: 'clinic', label: 'Clinical Lab' }
                                    ].map(t => (
                                        <button key={t.id} type="button" onClick={() => setOrgType(t.id)} style={{
                                            padding: '14px 10px', cursor: 'pointer',
                                            background: orgType === t.id ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${orgType === t.id ? '#4F46E5' : 'rgba(255,255,255,0.06)'}`,
                                            borderRadius: 12, fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13,
                                            color: orgType === t.id ? '#fff' : 'var(--text3)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}>{t.label}</button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <DistrictSelector label="DISTRICT" value={district} onChange={setDistrict} required />
                                <AuthInput label="OFFICE PHONE" type="tel" placeholder="+91 XXXXX XXXXX" value={contact} onChange={e => handlePhoneChange(e, setContact)} icon={Phone} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="REGISTRATION ID" placeholder="KL-HOS-XXXX" value={regNumber} onChange={e => setRegNumber(e.target.value)} icon={Hash} required />
                                <AuthInput label="MEDICAL LICENSE" placeholder="LIC-XXXX-XX" value={license} onChange={e => setLicense(e.target.value)} icon={FileText} required />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={onBack} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(1)} fullWidth>NEXT STEP →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="h1" {...slide(dir)}>
                        <FormSection label="CONTACT PERSON DETAILS">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="CONTACT PERSON NAME" placeholder="Full name" value={adminName} onChange={e => setAdminName(e.target.value)} icon={User} required />
                                <AuthInput label="DESIGNATION" placeholder="e.g. Medical Superintendent" value={designation} onChange={e => setDesignation(e.target.value)} required />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL" type="email" placeholder="hospital@mail.com" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <AuthInput label="MOBILE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => handlePhoneChange(e, setPhone)} icon={Phone} required />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <AuthInput label="SET PASSWORD" type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
                                <PasswordStrength password={password} />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(2)} fullWidth>NEXT STEP →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="h2" {...slide(dir)}>
                        <FormSection label="HOSPITAL CAPACITY">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
                                <NumberStepper label="TOTAL BEDS" value={parseInt(beds)} onChange={v => setBeds(String(v))} min={5} max={5000} />
                                <NumberStepper label="BLOOD UNITS NEEDED PER MONTH" value={parseInt(monthlyVol)} onChange={v => setMonthlyVol(String(v))} min={0} max={10000} step={10} />
                            </div>
                            
                            <AuthInput label="DEPARTMENTS" placeholder="example: ICU, Emergency, Surgery" value={departments} onChange={e => setDepartments(e.target.value)} hint="Separate with commas" />

                            <div style={{
                                background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.1)',
                                borderRadius: 16, padding: '20px', marginTop: 20
                            }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Database size={20} color="#818cf8" />
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                                        Registered hospitals gain priority access to the HEM∆ central inventory and emergency fast-track distribution.
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(3)} fullWidth>REVIEW DETAILS →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="h3" {...slide(dir)}>
                        <FormSection label="FINAL CONFIRMATION">
                            <ReviewCard title="HOSPITAL" onEdit={() => goTo(0)} data={[
                                { label: 'Facility Name', val: orgName },
                                { label: 'Category', val: orgType.toUpperCase() },
                                { label: 'Region', val: district },
                                { label: 'Registration', val: regNumber },
                                { label: 'License ID', val: license },
                            ]} />
                            
                            <ReviewCard title="CONTACT PERSON" onEdit={() => goTo(1)} data={[
                                { label: 'Name', val: adminName },
                                { label: 'Designation', val: designation },
                                { label: 'Email', val: email },
                            ]} />

                            <ReviewCard title="CAPACITY" onEdit={() => goTo(2)} data={[
                                { label: 'Bed Count', val: beds },
                                { label: 'Monthly Units', val: monthlyVol },
                                { label: 'Departments', val: departments },
                            ]} />

                            <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <CheckboxField required label="I confirm that this hospital is legally registered" checked={agreements.terms} onChange={() => setAgreements(a => ({ ...a, terms: !a.terms }))} />
                                <CheckboxField required label="We agree to the blood sharing rules" checked={agreements.accuracy} onChange={() => setAgreements(a => ({ ...a, accuracy: !a.accuracy }))} />
                                <CheckboxField required label="We will keep our blood request records updated" checked={agreements.naco} onChange={() => setAgreements(a => ({ ...a, naco: !a.naco }))} />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(2)} fullWidth>← BACK</AuthButton>
                            <AuthButton 
                                variant="primary" 
                                fullWidth 
                                loading={loading} 
                                disabled={!agreements.terms || !agreements.accuracy || !agreements.naco}
                                onClick={handleSubmit}
                            >
                                SUBMIT REGISTRATION <ChevronRight size={16} />
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── BLOOD BANK FLOW (4 steps) ────────────────────────────────────────────────

function BloodBankRegister({ onBack, initialEmail = '' }) {
    const STEPS = ['Bank Details', 'Contact Info', 'Capacity', 'Review & Confirm'];
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [agreements, setAgreements] = useState({ terms: false, naco: false, accuracy: false });
    const { register } = useAuth();
    const navigate = useNavigate();

    // Step 1: Identity
    const [bankName, setBankName] = useState('');
    const [district, setDistrict] = useState('');
    const [contact, setContact] = useState('+91 ');
    const [bankLicense, setBankLicense] = useState('');
    const [nacoNumber, setNacoNumber] = useState('');

    // Step 2: Command
    const [adminName, setAdminName] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState(initialEmail);
    const [phone, setPhone] = useState('+91 ');
    const [password, setPassword] = useState('');

    // Step 3: Infra
    const [storageCapacity, setStorageCapacity] = useState('1000');
    const [operatingHours, setOperatingHours] = useState('24/7');
    const [equipment, setEquipment] = useState('');

    const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await register('bloodbank', {
                bank_name: bankName,
                city: district,
                contact_number: contact,
                naco_number: nacoNumber,
                license_number: bankLicense,
                storage_capacity: parseInt(storageCapacity),
                operating_hours: operatingHours,
                admin_name: adminName,
                designation,
                email,
                phone,
                password,
                key_equipment: equipment
            });
            toast.success('System integration request sent.');
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Integration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) return <SuccessState role="blood_bank" />;

    return (
        <div style={{ position: 'relative' }}>
            <ProgressSteps current={step} steps={STEPS} />
            
            <AnimatePresence mode="wait" custom={dir}>
                {step === 0 && (
                    <motion.div key="bb0" {...slide(dir)}>
                        <FormSection label="BLOOD BANK DETAILS">
                            <AuthInput label="BLOOD BANK NAME" placeholder="e.g. Government Blood Bank, Ernakulam" value={bankName} onChange={e => setBankName(e.target.value)} icon={Building2} required />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <DistrictSelector label="DISTRICT" value={district} onChange={setDistrict} required />
                                <AuthInput label="PHONE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX" value={contact} onChange={e => handlePhoneChange(e, setContact)} icon={Phone} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="LICENSE NUMBER" placeholder="LIC-BB-XX-XXXX" value={bankLicense} onChange={e => setBankLicense(e.target.value)} icon={FileText} required />
                                <AuthInput label="NACO REGISTRATION" placeholder="NACO-XXXX-XX" value={nacoNumber} onChange={e => setNacoNumber(e.target.value)} icon={Hash} required />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={onBack} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(1)} fullWidth>NEXT STEP →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="bb1" {...slide(dir)}>
                        <FormSection label="CONTACT PERSON">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="FULL NAME" placeholder="Contact person name" value={adminName} onChange={e => setAdminName(e.target.value)} icon={User} required />
                                <AuthInput label="DESIGNATION" placeholder="Example: Manager" value={designation} onChange={e => setDesignation(e.target.value)} required />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <AuthInput label="EMAIL ADDRESS" type="email" placeholder="bank@mail.com" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
                                <AuthInput label="MOBILE NUMBER" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => handlePhoneChange(e, setPhone)} icon={Phone} required />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <AuthInput label="SET PASSWORD" type="password" placeholder="At least 12 characters" value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
                                <PasswordStrength password={password} />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(0)} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(2)} fullWidth>NEXT STEP →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="bb2" {...slide(dir)}>
                        <FormSection label="CAPACITY & EQUIPMENT">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
                                <NumberStepper label="STORAGE CAPACITY (UNITS)" value={parseInt(storageCapacity)} onChange={v => setStorageCapacity(String(v))} min={100} max={20000} step={50} />
                                <AuthInput label="WORKING HOURS" placeholder="Example: 24/7" value={operatingHours} onChange={e => setOperatingHours(e.target.value)} icon={Clock} required />
                            </div>
                            
                            <AuthInput label="EQUIPMENT LIST" placeholder="List your key medical equipment" value={equipment} onChange={e => setEquipment(e.target.value)} hint="Example: Centrifuges, Freezers" />

                            <div style={{
                                background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)',
                                borderRadius: 16, padding: '20px', marginTop: 20
                            }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Microscope size={20} color="#F59E0B" />
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                                        Registered Blood Banks serve as the core nodes of the statewide distribution grid, enabling real-time stock synchronization.
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(1)} fullWidth>← BACK</AuthButton>
                            <AuthButton variant="primary" onClick={() => goTo(3)} fullWidth>REVIEW DETAILS →</AuthButton>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="bb3" {...slide(dir)}>
                        <FormSection label="CONFIRM REGISTRATION">
                            <ReviewCard title="BANK DETAILS" onEdit={() => goTo(0)} data={[
                                { label: 'Bank Name', val: bankName },
                                { label: 'Region', val: district },
                                { label: 'License', val: bankLicense },
                                { label: 'NACO ID', val: nacoNumber },
                            ]} />
                            
                            <ReviewCard title="CONTACT PERSON" onEdit={() => goTo(1)} data={[
                                { label: 'Name', val: adminName },
                                { label: 'Designation', val: designation },
                                { label: 'Email', val: email },
                            ]} />

                            <ReviewCard title="CAPACITY" onEdit={() => goTo(2)} data={[
                                { label: 'Storage Units', val: storageCapacity },
                                { label: 'Working Hours', val: operatingHours },
                                { label: 'Equipment', val: equipment },
                            ]} />

                            <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <CheckboxField required label="I confirm that this blood bank is licensed" checked={agreements.terms} onChange={() => setAgreements(a => ({ ...a, terms: !a.terms }))} />
                                <CheckboxField required label="We agree to share our stock levels with the network" checked={agreements.accuracy} onChange={() => setAgreements(a => ({ ...a, accuracy: !a.accuracy }))} />
                                <CheckboxField required label="Facility will follow quality and testing rules" checked={agreements.naco} onChange={() => setAgreements(a => ({ ...a, naco: !a.naco }))} />
                            </div>
                        </FormSection>

                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                            <AuthButton variant="ghost" onClick={() => goTo(2)} fullWidth>← BACK</AuthButton>
                            <AuthButton 
                                variant="primary" 
                                fullWidth 
                                loading={loading} 
                                disabled={!agreements.terms || !agreements.accuracy || !agreements.naco}
                                onClick={handleSubmit}
                            >
                                FINISH REGISTRATION <ChevronRight size={16} />
                            </AuthButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
