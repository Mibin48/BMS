import { Stethoscope, FlaskConical, Building2, Droplets, Users, Eye } from 'lucide-react';

const ROLES = [
    { id: 'medical_officer', label: 'Medical Officer', desc: 'Clinical oversight & approvals', icon: Stethoscope },
    { id: 'lab_tech', label: 'Lab Technician', desc: 'Testing & quality control', icon: FlaskConical },
    { id: 'hospital_admin', label: 'Hospital Admin', desc: 'Facility management', icon: Building2 },
    { id: 'blood_bank_mgr', label: 'Blood Bank Manager', desc: 'Inventory & dispatch', icon: Droplets },
    { id: 'data_entry', label: 'Data Entry Operator', desc: 'Record entry & updates', icon: Users },
    { id: 'auditor', label: 'Auditor / Viewer', desc: 'Read-only access & audit', icon: Eye },
];

export default function RoleSelector({ value, onChange }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {ROLES.map(({ id, label, desc, icon: Icon }) => {
                const selected = value === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        style={{
                            padding: '18px 16px', textAlign: 'center',
                            background: selected ? 'rgba(217,0,37,0.1)' : '#0F0F17',
                            border: `1px solid ${selected ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: 14, cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        }}
                        onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                        onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                        <Icon size={22} color={selected ? 'var(--red)' : 'var(--text3)'} />
                        <div style={{
                            fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13,
                            color: selected ? '#fff' : 'var(--text2)',
                        }}>{label}</div>
                        <div style={{
                            fontFamily: 'var(--font-body)', fontSize: 11,
                            color: 'var(--text3)', lineHeight: 1.4,
                        }}>{desc}</div>
                    </button>
                );
            })}
        </div>
    );
}
