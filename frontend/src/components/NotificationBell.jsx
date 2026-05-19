import { useState, useRef, useEffect } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, X, ExternalLink, Droplets, Heart, Building2,
  AlertTriangle, Info, Award, CreditCard, Activity, Clock
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = {
  eligibility_restored: Activity,
  donation_recorded: Droplets,
  health_check_result: Heart,
  recall_request: AlertTriangle,
  request_approved: Check,
  request_fulfilled: CheckCheck,
  request_rejected: X,
  blood_issued: Droplets,
  payment_due: CreditCard,
  payment_confirmed: Check,
  new_request_received: Bell,
  emergency_request_received: AlertTriangle,
  stock_critical: AlertTriangle,
  stock_low: AlertTriangle,
  donation_received: Droplets,
  new_hospital_registration: Building2,
  new_blood_bank_registration: Building2,
  approval_granted: Check,
  approval_rejected: X,
  badge_earned: Award,
  system_alert: Info,
  critical_stock_statewide: AlertTriangle,
  default: Bell,
};

const PRIORITY_COLOR = {
  critical: {
    dot: 'bg-[#D90025]', icon: 'text-[#D90025]', bg: 'bg-[#D90025]/10', border: 'border-[#D90025]/20'
  },
  high: {
    dot: 'bg-amber-400', icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20'
  },
  normal: {
    dot: 'bg-blue-400', icon: 'text-blue-400', bg: 'bg-white/5', border: 'border-white/10'
  },
  low: {
    dot: 'bg-[#4A4A55]', icon: 'text-[#4A4A55]', bg: 'bg-white/5', border: 'border-white/10'
  }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteOne, clearAll } = useNotifications();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const displayed = filter === 'unread' ? notifications.filter(n => n.is_read === 0) : notifications;

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await markRead(notif.notification_id);
    }
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          background: open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', cursor: 'pointer'
        }}
      >
        <Bell size={16} color={unreadCount > 0 ? '#ffffff' : '#9B9BA4'} style={{ transition: 'color 0.2s' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, background: '#D90025',
            border: '2px solid #07070B', borderRadius: '50%', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 400, background: '#0F0F17',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 0 60px rgba(0,0,0,0.8)',
          overflow: 'hidden', zIndex: 50, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-syne)', fontWeight: 700, color: '#fff', fontSize: 16 }}>Notifications</h3>
              {unreadCount > 0 && <p style={{ margin: '2px 0 0 0', fontFamily: 'var(--font-mono)', color: '#9B9BA4', fontSize: 12 }}>{unreadCount} unread</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all as read" style={{
                  width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s'
                }}>
                  <CheckCheck size={14} color="#9B9BA4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} title="Clear all" style={{
                  width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s'
                }}>
                  <Trash2 size={12} color="#9B9BA4" />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px 0' }}>
            {[{ label: 'All', value: 'all', count: notifications.length }, { label: 'Unread', value: 'unread', count: unreadCount }].map(tab => (
              <button key={tab.value} onClick={() => setFilter(tab.value)} style={{
                padding: '6px 12px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', border: 'none',
                background: filter === tab.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === tab.value ? '#fff' : '#9B9BA4'
              }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    padding: '2px 6px', borderRadius: 100, fontSize: 12, lineHeight: 1,
                    background: filter === tab.value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    color: filter === tab.value ? '#fff' : '#4A4A55'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading && displayed.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-mono)', color: '#4A4A55', fontSize: 12 }}>Loading...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={20} color="#4A4A55" />
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-dm)', color: '#9B9BA4', fontSize: 14 }}>
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
              </div>
            ) : displayed.map(notif => {
              const color = PRIORITY_COLOR[notif.priority] || PRIORITY_COLOR.normal;
              const IconComp = TYPE_ICONS[notif.type] || TYPE_ICONS.default;

              return (
                <div key={notif.notification_id} onClick={() => handleClick(notif)} style={{
                  position: 'relative', borderRadius: 12, border: '1px solid', padding: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: notif.is_read === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  borderColor: notif.is_read === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'
                }}>
                  {notif.is_read === 0 && (
                    <span style={{ position: 'absolute', top: 14, left: 14, width: 6, height: 6, borderRadius: '50%', background: color.dot === 'bg-[#D90025]' ? '#D90025' : color.dot === 'bg-amber-400' ? '#fbbf24' : '#60a5fa' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: notif.is_read === 0 ? 16 : 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                      background: notif.is_read === 0 ? (color.dot === 'bg-[#D90025]' ? 'rgba(217,0,37,0.1)' : color.dot === 'bg-amber-400' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)') : 'rgba(255,255,255,0.05)',
                      borderColor: notif.is_read === 0 ? (color.dot === 'bg-[#D90025]' ? 'rgba(217,0,37,0.2)' : color.dot === 'bg-amber-400' ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.08)'
                    }}>
                      <IconComp size={14} color={notif.is_read === 0 ? (color.dot === 'bg-[#D90025]' ? '#D90025' : color.dot === 'bg-amber-400' ? '#fbbf24' : '#60a5fa') : '#4A4A55'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 500, lineHeight: 1.2, color: notif.is_read === 0 ? '#fff' : '#9B9BA4' }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: 0, fontFamily: 'var(--font-dm)', color: '#4A4A55', fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {notif.message}
                      </p>
                      <p style={{ margin: '8px 0 0 0', fontFamily: 'var(--font-mono)', color: '#4A4A55', fontSize: 12 }}>
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {notif.link && (
                        <div title="Go to page" style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ExternalLink size={12} color="#9B9BA4" />
                        </div>
                      )}
                      <div onClick={(e) => { e.stopPropagation(); deleteOne(notif.notification_id); }} title="Delete" style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} color="#4A4A55" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {notifications.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => { navigate(`/${user?.role}/notifications`); setOpen(false); }} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9B9BA4', textAlign: 'center', padding: '4px 0', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
