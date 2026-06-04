import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, Building2, X, Droplets } from 'lucide-react';
import { donorService } from '../../services/donorService.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useApi } from '../../hooks/useApi.js';
import { SkeletonCard, SkeletonLine } from '../../components/SkeletonCard';
import ErrorCard from '../../components/ErrorCard';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext.jsx';

const KERALA_DISTRICTS = ['All Districts', 'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
const BLOOD_GROUPS = ['All Groups', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function DonorFindBank() {
    const { showExpiryModal } = useAuth();
    const [search, setSearch] = useState('');
    const [district, setDistrict] = useState('All Districts');
    const [bloodGroup, setBloodGroup] = useState('All Groups');
    const [selectedBank, setSelectedBank] = useState(null);

    // Build query params
    const queryParams = {};
    if (district !== 'All Districts') queryParams.city = district;
    if (bloodGroup !== 'All Groups') queryParams.blood_group = bloodGroup;

    const { data: result, loading, error, refetch } = useFetch(
        donorService.getBloodBanks, queryParams, [district, bloodGroup]
    );

    const { execute: fetchStock, data: stockData, loading: stockLoading } = useApi(donorService.getBankStock);

    const allBanks = result?.banks || [];

    // Apply client-side search filter
    const filtered = allBanks.filter(b => {
        if (!search) return true;
        const q = search.toLowerCase();
        return b.bank_name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
    });

    const stockColor = s => s === 'Healthy' ? '#22c55e' : s === 'Low' ? '#f59e0b' : '#D90025';

    const handleViewStock = async (bank) => {
        setSelectedBank(bank);
        try {
            await fetchStock(bank.bank_id);
        } catch (err) {
            // handled by useApi
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Search + Filters */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                        <Search size={16} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search blood banks..."
                            style={{
                                width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '11px 14px 11px 42px',
                                fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <select
                        value={district} onChange={e => setDistrict(e.target.value)}
                        style={{
                            width: 200, background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)',
                            fontSize: 14, color: '#fff', outline: 'none', cursor: 'pointer',
                        }}
                    >
                        {KERALA_DISTRICTS.map(d => <option key={d} value={d} style={{ background: '#0F0F17' }}>{d}</option>)}
                    </select>
                    <select
                        value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                        style={{
                            width: 140, background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)',
                            fontSize: 14, color: '#fff', outline: 'none', cursor: 'pointer',
                        }}
                    >
                        {BLOOD_GROUPS.map(g => <option key={g} value={g} style={{ background: '#0F0F17' }}>{g}</option>)}
                    </select>
                </motion.div>

                {error && !showExpiryModal && <ErrorCard message={error} onRetry={refetch} />}

                {/* Bank Count + Results */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>
                            {loading ? 'Searching...' : `${filtered.length} Blood Banks Found`}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                            Filtered by: {district}{bloodGroup !== 'All Groups' ? ` · ${bloodGroup}` : ''}{search ? ` · "${search}"` : ''}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
                            <EmptyState
                                icon={MapPin}
                                title="No blood banks found"
                                subtitle="Try adjusting your filters or search term"
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {filtered.map((bank, i) => (
                                <motion.div key={bank.bank_id}
                                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
                                    whileHover={{ borderColor: 'rgba(217,0,37,0.35)', boxShadow: '0 0 20px rgba(217,0,37,0.08)' }}
                                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{bank.bank_name}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                            <span style={{ background: bank.open ? 'rgba(34,197,94,0.1)' : 'rgba(217,0,37,0.1)', border: `1px solid ${bank.open ? 'rgba(34,197,94,0.25)' : 'rgba(217,0,37,0.25)'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: bank.open ? '#22c55e' : 'var(--red)' }}>
                                                {bank.open ? 'OPEN' : 'CLOSED'}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                                                {bank.total_units} units
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                                            <MapPin size={13} color="var(--text3)" /> {bank.city}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                                            <Phone size={13} color="var(--text3)" /> {bank.contact_number}
                                        </div>
                                    </div>

                                    {/* Stock pills */}
                                    {bank.stock && Object.keys(bank.stock).length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                                            {Object.entries(bank.stock).map(([group, units]) => (
                                                <span key={group} style={{
                                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: 6, padding: '3px 8px',
                                                    fontFamily: 'var(--font-mono)', fontSize: 9, color: units > 0 ? '#fff' : 'var(--text3)',
                                                }}>
                                                    {group}: {units}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleViewStock(bank)}
                                        style={{
                                            width: '100%', background: 'none',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                            padding: '8px 0', cursor: 'pointer',
                                            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,0,37,0.4)'; e.currentTarget.style.color = 'var(--red)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text2)'; }}
                                    >
                                        View Detailed Stock →
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>


            {/* Stock Detail Modal */}
            <AnimatePresence>
                {selectedBank && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBank(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)',
                                borderRadius: 20, padding: 32, width: 520, maxHeight: '80vh', overflowY: 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 22, color: '#fff' }}>
                                        {selectedBank.bank_name}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                                        {selectedBank.city} · {selectedBank.contact_number}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedBank(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {stockLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                                            borderRadius: 12, padding: '14px 18px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                                                <SkeletonLine width="38px" height="26px" borderRadius="8px" delay={i * 0.05} />
                                                <div style={{ flex: 1 }}>
                                                    <SkeletonLine width="40%" height="14px" style={{ marginBottom: 6 }} delay={i * 0.05} />
                                                    <SkeletonLine width="20%" height="10px" delay={i * 0.05} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : stockData?.stock?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {stockData.stock.map(s => (
                                        <div key={s.stock_id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: 12, padding: '14px 18px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)',
                                                    borderRadius: 8, padding: '4px 10px',
                                                    fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)',
                                                    fontWeight: 700,
                                                }}>{s.blood_group}</span>
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: '#fff' }}>
                                                        {s.available_units} / {s.capacity} units
                                                    </div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                                                        {s.percentage}% capacity
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: stockColor(s.stock_status) }} />
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: stockColor(s.stock_status) }}>
                                                    {s.stock_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
                                        Total: {stockData.total_units} units · Last updated: {stockData.last_updated ? new Date(stockData.last_updated).toLocaleDateString('en-IN') : '--'}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Droplets}
                                    title="No stock data"
                                    subtitle="Stock data is not available for this blood bank"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
