import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Droplets, Plus, ChevronDown, CheckCircle, Hospital, User, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import BBStatusBadge from '../../components/bloodbank/BBStatusBadge';
import BBBloodBadge from '../../components/bloodbank/BBBloodBadge';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import BBModal, { BBModalFooter } from '../../components/bloodbank/BBModal';
import { cardBase, inputStyle, selectStyle, labelStyle, primaryBtn, ghostBtn } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import Pagination from '../../components/Pagination';
import { InlineLoader } from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import BBStatCard from '../../components/bloodbank/BBStatCard';

// Sub-component: Expandable Row
function IssueRow({ issue }) {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleOpen = async () => {
        if (!open && !detail) {
            setLoading(true);
            try {
                const res = await bloodBankService.getIssueById(issue.issue_id);
                setDetail(res.data?.data || res.data);
            } catch (err) { console.error('Failed to fetch issue details'); }
            setLoading(false);
        }
        setOpen(!open);
    };

    const d = detail || issue;
    const accentColor = 
        issue.priority === 'Emergency' ? '#dc2626' : 
        issue.payment_status === 'Paid' ? '#22c55e' : 
        '#f59e0b';

    return (
        <div style={{ borderRadius: 16, marginBottom: 4 }}>
            <motion.div 
                whileHover="hover"
                onClick={toggleOpen}
                style={{
                    position: 'relative',
                    background: `${accentColor}05`, 
                    borderRadius: 16,
                    border: `1px solid ${accentColor}4D`, // 30% opacity
                    boxShadow: `inset 0 0 20px ${accentColor}08`,
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.3s ease', cursor: 'pointer',
                    overflow: 'hidden'
                }}
            >
                {/* Animated Beam */}
                <motion.div
                    variants={{
                        hover: { x: ['-100%', '200%'], opacity: [0, 1, 0] }
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', inset: '1px',
                        background: `linear-gradient(90deg, transparent, ${accentColor}15, transparent)`,
                        pointerEvents: 'none', zIndex: 0
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ flexShrink: 0, textAlign: 'center', width: 45 }}>
                        <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>{new Date(issue.issue_date).getDate()}</p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase' }}>{new Date(issue.issue_date).toLocaleString('en-IN', { month: 'short' })}</p>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.01em' }}>{issue.hospital_name}</p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{issue.patient_name}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <BBStatusBadge status={issue.priority} />
                        <BBBloodBadge group={issue.blood_group} size="sm" />
                    </div>

                    <div style={{ textAlign: 'center', flexShrink: 0, width: 60 }}>
                        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1 }}>{issue.units_issued}U</p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2, textTransform: 'uppercase' }}>issued</p>
                    </div>

                    <BBStatusBadge status={issue.payment_status || 'Pending'} />

                    <motion.div animate={{ rotate: open ? 180 : 0 }}>
                        <ChevronDown size={14} color="var(--text3)" />
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '24px 32px', borderLeft: `3px solid ${accentColor}`, margin: '4px 20px 20px', borderRadius: '0 0 16px 16px' }}>
                            {loading ? <InlineLoader /> : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accentColor }}>
                                            <Hospital size={14} />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>HOSPITAL ENDPOINT</span>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{d.hospital_name}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{d.hospital_city}</p>
                                            <p style={{ fontFamily: 'var(--font-space)', fontSize: 12, color: accentColor, marginTop: 2 }}>{d.hospital_phone}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accentColor }}>
                                            <User size={14} />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>CLINICAL RECIPIENT</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>PATIENT NAME</label>
                                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{d.patient_name}</p>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>DEMOGRAPHICS</label>
                                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#fff' }}>{d.patient_age}Y · {d.patient_ward || 'General'}</p>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>BLOOD PROFILE</label>
                                                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: accentColor, fontWeight: 700 }}>{d.blood_group} (REQ: {d.units_required}U)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accentColor }}>
                                            <Clock size={14} />
                                            <span style={{ fontFamily: 'var(--font-space)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>LOGISTICAL AUDIT</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>ISSUE ID</label>
                                                <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{d.issue_id}</p>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>REQUEST DATE</label>
                                                <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#fff' }}>{formatDate(d.request_date)}</p>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: 9 }}>PAYMENT STATUS</label>
                                                <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: d.payment_status === 'Paid' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                                                    {d.payment_status?.toUpperCase() || 'AWAIT'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-component: Creation Modal
function IssueBloodModal({ preselected, onClose, onCreated }) {
    const { data: requestsResult } = useFetch(bloodBankService.getRequests, { status: 'Processing', limit: 50 });
    const processingRequests = requestsResult?.requests || [];

    const [form, setForm] = useState({ request_id: preselected?.request_id || '', units_issued: '', notes: '', issue_date: new Date().toISOString().split('T')[0] });
    const [issuing, setIssuing] = useState(false);

    const selectedRequest = processingRequests.find(r => r.request_id === form.request_id);

    const handleIssue = async () => {
        if (!form.request_id || !form.units_issued) { toast.error('Fill required fields'); return; }
        setIssuing(true);
        try {
            await bloodBankService.createIssue({ 
                request_id: form.request_id, 
                units_issued: parseInt(form.units_issued), 
                notes: form.notes, 
                issue_date: form.issue_date 
            });
            toast.success('Blood issued successfully');
            onCreated();
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Issue failed'); 
        } finally { 
            setIssuing(false); 
        }
    };

    return (
        <BBModal onClose={onClose} title="Issue Blood" subtitle="Process clinical blood issuance" icon={Droplets} maxWidth={480}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={labelStyle}>Select Request *</label>
                    <select value={form.request_id} onChange={e => setForm(f => ({ ...f, request_id: e.target.value }))} style={selectStyle}>
                        <option value="">Select approved request...</option>
                        {processingRequests.map(r => (
                            <option key={r.request_id} value={r.request_id}>
                                {r.hospital_name} — {r.units_required}U {r.blood_group} ({r.patient_name})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedRequest && (
                    <div style={{ background: '#14141E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Hospital: <span style={{ color: '#fff' }}>{selectedRequest.hospital_name}</span></p>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Patient: <span style={{ color: '#fff' }}>{selectedRequest.patient_name}</span></p>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: '#9B9BA4' }}>Required: <span style={{ color: '#fff' }}>{selectedRequest.units_required}U {selectedRequest.blood_group}</span></p>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: selectedRequest.stock_check === 'Sufficient' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                            Stock: {selectedRequest.stock_available ?? '?'}U
                        </p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: 12, alignItems: 'end' }}>
                    <NumberStepper
                        label="Units to Issue *"
                        value={parseInt(form.units_issued) || 0}
                        onChange={v => setForm(f => ({ ...f, units_issued: String(v) }))}
                        min={1}
                        max={selectedRequest?.units_required || 20}
                    />
                    <div>
                        <label style={labelStyle}>Issue Date</label>
                        <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} style={inputStyle} />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: 'none', minHeight: 60 }} placeholder="Clinical notes..." />
                </div>
            </div>
            <BBModalFooter>
                <button onClick={onClose} style={ghostBtn}>CANCEL</button>
                <button onClick={handleIssue} disabled={issuing} style={{ ...primaryBtn, opacity: issuing ? 0.5 : 1 }}>
                    {issuing ? <><InlineLoader /> ISSUING...</> : <><Droplets size={14} /> ISSUE BLOOD</>}
                </button>
            </BBModalFooter>
        </BBModal>
    );
}

// Main Page Component
export default function BloodBankIssues() {
    const location = useLocation();
    const preselectedRequest = location.state?.request || null;
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
    const limit = 10;
    const [showIssue, setShowIssue] = useState(!!preselectedRequest);

    const fetchParams = { limit, offset };
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getIssues, fetchParams, [offset]);

    const issues = result?.issues || [];
    const summary = result?.summary || {};
    const total = result?.total || 0;

    const filteredIssues = issues.filter(i => 
        i.hospital_name?.toLowerCase().includes(search.toLowerCase()) || 
        i.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.issue_id?.toLowerCase().includes(search.toLowerCase())
    );

    if (error) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <BBStatCard 
                        label="TOTAL ISSUES" 
                        value={summary.total ?? '--'} 
                        icon={CheckCircle} 
                        color="white" 
                    />
                    <BBStatCard 
                        label="TOTAL UNITS ISSUED" 
                        value={`${summary.total_units_issued ?? 0}U`} 
                        icon={Droplets} 
                        color="red" 
                        sub="Clinical distribution"
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                        <input 
                            placeholder="Find issues by hospital, patient or ID..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ 
                                ...inputStyle, paddingLeft: 42, 
                                background: 'rgba(15,15,23,0.4)', borderColor: 'rgba(255,255,255,0.06)',
                                fontFamily: 'var(--font-space)', fontSize: 12
                            }} 
                        />
                    </div>
                    <button onClick={() => setShowIssue(true)} style={primaryBtn}><Plus size={14} /> ISSUE BLOOD</button>
                </div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        background: 'rgba(15,15,23,0.3)', border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: 24, padding: 12 
                    }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{ background: '#14141E', borderRadius: 16, height: 70, animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    ) : filteredIssues.length === 0 ? (
                        <div style={{ padding: 40 }}>
                            <BBEmptyState 
                                icon={Droplets} 
                                title="No blood issues" 
                                subtitle="Issue blood against approved requests" 
                                action={() => setShowIssue(true)} 
                                actionLabel="+ ISSUE BLOOD" 
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {filteredIssues.map(issue => (
                                <IssueRow key={issue.issue_id} issue={issue} />
                            ))}
                        </div>
                    )}
                </motion.div>
                <Pagination total={total} limit={limit} offset={offset} onChange={setOffset} />

            <AnimatePresence>
                {showIssue && (
                    <IssueBloodModal 
                        preselected={preselectedRequest} 
                        onClose={() => setShowIssue(false)} 
                        onCreated={() => { setShowIssue(false); refetch(); }} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
