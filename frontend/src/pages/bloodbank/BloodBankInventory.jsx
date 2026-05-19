import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Minus, Droplets, Clock } from 'lucide-react';
import BBStockCard from '../../components/bloodbank/BBStockCard';
import BBStatCard from '../../components/bloodbank/BBStatCard';
import BBEmptyState from '../../components/bloodbank/BBEmptyState';
import BBModal, { BBModalFooter } from '../../components/bloodbank/BBModal';
import { cardBase, inputStyle, labelStyle, accentFor } from '../../components/bloodbank/bb-ui';
import { bloodBankService } from '../../services/bloodBankService.js';
import { useFetch } from '../../hooks/useFetch.js';
import ErrorCard from '../../components/ErrorCard';
import { InlineLoader } from '../../components/LoadingSpinner';
import { timeAgo } from '../../utils/formatters.js';
import NumberStepper from '../../components/NumberStepper';
import toast from 'react-hot-toast';
import BBSkeleton, { BBStatSkeleton } from '../../components/bloodbank/BBSkeleton';
import { useAuth } from '../../context/AuthContext.jsx';


export default function BloodBankInventory() {
    const { showExpiryModal } = useAuth();
    const { data: result, loading, error, refetch } = useFetch(bloodBankService.getInventory);
    const [updateTarget, setUpdateTarget] = useState(null);
    const [updateForm, setUpdateForm] = useState({ action: 'add', units: 10, notes: '' });
    const [updating, setUpdating] = useState(false);

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const stockItems = result?.stock || [];
    const summary = result?.summary || {};

    // Merge actual stock with base groups to ensure all show up
    const displayItems = BLOOD_GROUPS.map(bg => {
        const existing = stockItems.find(s => s.blood_group === bg);
        return existing || { blood_group: bg, available_units: 0, capacity: 100, isNew: true };
    });

    const openModal = (stock) => { setUpdateTarget(stock); setUpdateForm({ action: 'add', units: 10, notes: '' }); };

    const handleUpdate = async () => {
        if (!updateForm.units || updateForm.units < 1) { toast.error('Units must be ≥ 1'); return; }
        setUpdating(true);
        try {
            // Use stock_id if exists, otherwise use blood_group (upsert logic in backend)
            const targetId = updateTarget.stock_id || updateTarget.blood_group;
            const res = await bloodBankService.updateStock(targetId, {
                action: updateForm.action,
                units: parseInt(updateForm.units),
                notes: updateForm.notes
            });
            const d = res.data?.data || res.data;
            toast.success(`${d.blood_group} updated! ${d.previous_units}U → ${d.new_units}U`);
            if (d.stock_status === 'Critical') toast(`⚠ ${d.blood_group} stock is CRITICAL`, { icon: '🩸' });
            setUpdateTarget(null); refetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setUpdating(false); }
    };

    const preview = updateTarget ? (updateForm.action === 'add'
        ? Math.min((updateTarget.available_units || 0) + parseInt(updateForm.units || 0), updateTarget.capacity || 999)
        : Math.max((updateTarget.available_units || 0) - parseInt(updateForm.units || 0), 0)) : 0;
    const previewPct = updateTarget ? Math.min(Math.round(preview / updateTarget.capacity * 100), 100) : 0;
    const previewAccent = accentFor(previewPct);
    const currentAccent = updateTarget ? accentFor(updateTarget.capacity > 0 ? Math.round(updateTarget.available_units / updateTarget.capacity * 100) : 0) : null;

    if (error && !showExpiryModal) return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}><ErrorCard message={error} onRetry={refetch} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 28, color: '#fff' }}>Blood Inventory</h1>
                        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', marginTop: 4 }}>Manage stock levels across all blood groups</p>
                    </div>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, 
                        background: 'rgba(34, 197, 94, 0.05)', 
                        border: '1px solid rgba(34, 197, 94, 0.2)', 
                        borderRadius: 12, padding: '10px 18px' 
                    }}>
                        <motion.div 
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} 
                        />
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em' }}>LIVE STOCK DATA</p>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { icon: Package, label: 'TOTAL UNITS', val: String(summary.total_units ?? '--'), color: 'white' },
                        { icon: Package, label: 'CRITICAL', val: String(summary.critical ?? 0), color: 'red' },
                        { icon: Package, label: 'LOW STOCK', val: String(summary.low ?? 0), color: 'amber' },
                        { icon: Package, label: 'HEALTHY', val: String(summary.healthy ?? 0), color: 'green' },
                    ].map((c, i) => (
                        <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            {loading ? <BBStatSkeleton delay={i * 0.1} /> : <BBStatCard {...c} value={c.val} />}
                        </motion.div>

                    ))}

                </div>

                {/* Stock Grid */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ ...cardBase, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Blood Stock Management</h2>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#4A4A55' }}>Click any card to update stock</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <BBSkeleton key={i} height="180px" borderRadius="16px" delay={i * 0.08} />)
                            : displayItems.map(s => <BBStockCard key={s.blood_group} stock={s} onUpdate={openModal} large />)
                        }
                    </div>

                </motion.div>


            {/* ── UPDATE STOCK MODAL ──────────────────────── */}
            <AnimatePresence>
                {updateTarget && (
                    <BBModal onClose={() => setUpdateTarget(null)} title="Update Stock" subtitle={`${updateTarget.blood_group} — currently ${updateTarget.available_units}U`} icon={Droplets} maxWidth={460}>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Current stock visual */}
                            <div style={{ background: '#14141E', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: '#9B9BA4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Current</span>
                                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, color: currentAccent?.color, background: currentAccent?.bg, padding: '2px 10px', borderRadius: 100, boxShadow: `inset 0 0 0 1px ${currentAccent?.border}` }}>{currentAccent?.label}</span>
                                </div>
                                <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                                    <div style={{ height: '100%', borderRadius: 100, width: `${updateTarget.capacity > 0 ? Math.round(updateTarget.available_units / updateTarget.capacity * 100) : 0}%`, background: currentAccent?.color, transition: 'width 0.5s' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{updateTarget.available_units}U</span>
                                    <span style={{ fontFamily: 'var(--font-space)', fontSize: 13, color: '#9B9BA4' }}>of {updateTarget.capacity}U</span>
                                </div>
                            </div>

                            {/* Action toggle */}
                            <div>
                                <label style={labelStyle}>Action</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { key: 'add', label: 'Add Units', icon: Plus, active: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.30)', color: '#22c55e' },
                                        { key: 'remove', label: 'Remove', icon: Minus, active: 'rgba(217,0,37,0.15)', border: 'rgba(217,0,37,0.30)', color: '#D90025' },
                                    ].map(({ key, label, icon: Ic, active, border, color }) => (
                                        <button key={key} onClick={() => setUpdateForm(f => ({ ...f, action: key }))}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                padding: '12px 0', borderRadius: 12, fontFamily: 'var(--font-space)', fontSize: 13, fontWeight: 500,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                background: updateForm.action === key ? active : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${updateForm.action === key ? border : 'rgba(255,255,255,0.08)'}`,
                                                color: updateForm.action === key ? color : '#9B9BA4',
                                            }}>
                                            <Ic size={16} /> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Units input with NumberStepper */}
                            <NumberStepper
                                label="Units"
                                value={updateForm.units}
                                onChange={v => setUpdateForm(f => ({ ...f, units: v }))}
                                min={1}
                                max={updateForm.action === 'add' ? (updateTarget.capacity - updateTarget.available_units) : updateTarget.available_units}
                            />

                            {/* Preview */}
                            <div style={{ background: previewAccent.bg, border: `1px solid ${previewAccent.border}`, borderRadius: 12, padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: '#9B9BA4' }}>New total will be:</p>
                                    <p style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 24, color: previewAccent.color }}>{preview}U</p>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 100, width: `${previewPct}%`, background: previewAccent.color, transition: 'all 0.5s' }} />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={labelStyle}>Notes <span style={{ color: '#4A4A55' }}>(optional)</span></label>
                                <textarea value={updateForm.notes} onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reason for update..."
                                    style={{ ...inputStyle, resize: 'none', minHeight: 60 }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(217,0,37,0.50)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }} />
                            </div>
                        </div>

                        <BBModalFooter>
                            <button onClick={() => setUpdateTarget(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', fontFamily: 'var(--font-space)', fontSize: 12, color: '#9B9BA4', cursor: 'pointer', transition: 'all 0.2s' }}>CANCEL</button>
                            <button onClick={handleUpdate} disabled={updating}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12,
                                    fontFamily: 'var(--font-space)', fontSize: 12, color: '#fff', fontWeight: 500, cursor: 'pointer',
                                    transition: 'all 0.2s', border: 'none', opacity: updating ? 0.5 : 1,
                                    background: updateForm.action === 'add' ? '#22c55e' : '#D90025',
                                }}>
                                {updating ? <InlineLoader /> : updateForm.action === 'add' ? <Plus size={14} /> : <Minus size={14} />}
                                {updating ? 'UPDATING...' : updateForm.action === 'add' ? `ADD ${updateForm.units}U` : `REMOVE ${updateForm.units}U`}
                            </button>
                        </BBModalFooter>
                    </BBModal>
                )}
            </AnimatePresence>
        </div>
    );
}
