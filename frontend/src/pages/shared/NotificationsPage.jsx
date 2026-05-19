import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, X, ExternalLink, Droplets, Heart, Building2,
  AlertTriangle, Info, Award, CreditCard, Activity, Clock
} from 'lucide-react';

const TYPE_ICONS = {
  eligibility_restored: Activity, donation_recorded: Droplets, health_check_result: Heart,
  recall_request: AlertTriangle, request_approved: Check, request_fulfilled: CheckCheck,
  request_rejected: X, blood_issued: Droplets, payment_due: CreditCard, payment_confirmed: Check,
  new_request_received: Bell, emergency_request_received: AlertTriangle, stock_critical: AlertTriangle,
  stock_low: AlertTriangle, donation_received: Droplets, new_hospital_registration: Building2,
  new_blood_bank_registration: Building2, approval_granted: Check, approval_rejected: X,
  badge_earned: Award, system_alert: Info, critical_stock_statewide: AlertTriangle, default: Bell,
};

const PRIORITY_COLOR = {
  critical: { bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.2)', icon: '#D90025', dot: '#D90025' },
  high: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: '#fbbf24', dot: '#fbbf24' },
  normal: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', icon: '#60a5fa', dot: '#60a5fa' },
  low: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', icon: '#4A4A55', dot: '#4A4A55' }
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

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteOne, clearAll } = useNotifications();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.is_read === 0;
    if (filter === 'critical') return n.priority === 'critical';
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#D90025', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inbox</p>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, color: '#fff' }}>Notifications</h1>
            {unreadCount > 0 && <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9B9BA4', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9B9BA4', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <Trash2 size={14} /> Clear all
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
             { label: 'All', value: 'all', count: notifications.length },
             { label: 'Unread', value: 'unread', count: unreadCount },
             { label: 'Critical', value: 'critical', count: notifications.filter(n => n.priority === 'critical').length },
             { label: 'High Priority', value: 'high', count: notifications.filter(n => n.priority === 'high').length }
          ].map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid',
              fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === tab.value ? (tab.value === 'critical' ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.05)',
              borderColor: filter === tab.value ? (tab.value === 'critical' ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.08)',
              color: filter === tab.value ? (tab.value === 'critical' ? '#D90025' : '#fff') : '#9B9BA4'
            }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, padding: '2px 6px', borderRadius: 100,
                  background: filter === tab.value ? (tab.value === 'critical' ? 'rgba(217,0,37,0.2)' : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.05)',
                  color: filter === tab.value ? (tab.value === 'critical' ? '#D90025' : '#fff') : '#4A4A55'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          {loading && filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '96px 0', gap: 16 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4A4A55' }}>Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '96px 0', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={28} color="#4A4A55" />
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All clear!</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>{filter === 'unread' ? 'No unread notifications' : 'No notifications found'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((notif, i) => {
                const color = PRIORITY_COLOR[notif.priority] || PRIORITY_COLOR.normal;
                const IconComp = TYPE_ICONS[notif.type] || TYPE_ICONS.default;

                return (
                  <div key={notif.notification_id} onClick={() => { if (!notif.is_read) markRead(notif.notification_id); if (notif.link) navigate(notif.link); }} style={{
                    position: 'relative', borderRadius: 16, border: '1px solid', padding: 20, cursor: 'pointer', transition: 'all 0.2s',
                    background: notif.is_read === 0 ? color.bg : '#0F0F17',
                    borderColor: notif.is_read === 0 ? color.border : 'rgba(255,255,255,0.06)'
                  }}>
                    {notif.is_read === 0 && (
                      <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 2, borderRadius: 100, background: color.dot }} />
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, border: '1px solid', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: notif.is_read === 0 ? color.bg : 'rgba(255,255,255,0.05)',
                        borderColor: notif.is_read === 0 ? color.border : 'rgba(255,255,255,0.08)'
                      }}>
                        <IconComp size={16} color={notif.is_read === 0 ? color.icon : '#4A4A55'} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <p style={{ margin: 0, fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: notif.is_read === 0 ? '#fff' : '#9B9BA4' }}>
                            {notif.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {notif.is_read === 0 && notif.priority !== 'normal' && (
                              <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: 12, padding: '2px 8px', borderRadius: 100, border: '1px solid',
                                background: color.bg, borderColor: color.border, color: color.icon
                              }}>
                                {notif.priority.toUpperCase()}
                              </span>
                            )}
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4A4A55', whiteSpace: 'nowrap' }}>
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: '8px 0 0 0', fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4', lineHeight: 1.5 }}>
                          {notif.message}
                        </p>

                        {notif.link && (
                          <p style={{ margin: '12px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: color.icon }}>
                            <ExternalLink size={12} /> View details
                          </p>
                        )}
                      </div>

                      <button onClick={e => { e.stopPropagation(); deleteOne(notif.notification_id); }} style={{
                        width: 32, height: 32, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s', marginTop: 4
                      }}>
                        <Trash2 size={14} color="#4A4A55" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
