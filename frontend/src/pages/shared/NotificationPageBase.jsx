import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, Trash2, Inbox, Search, Trash, CheckCircle, Clock, RefreshCw, ArrowRight, AlertCircle, AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';

const NotificationPageBase = ({ title = "NOTIFICATIONS", subtitle = "System alerts & activity" }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
    fetchNotifs
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notifications.filter(n => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'unread' && !n.is_read) ||
      (activeFilter === 'read' && n.is_read) ||
      (activeFilter === 'important' && (n.priority === 'urgent' || n.priority === 'high' || n.priority === 'emergency'));

    const matchesSearch =
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 24, color: '#fff', margin: 0, textTransform: 'uppercase' }}>
              {title}
            </h1>
            <span style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '100px', padding: '8px 12px', fontFamily: 'var(--font-space)',
              fontSize: 12, color: '#CACACE', fontWeight: 700
            }}>
              {unreadCount} NEW
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 15, color: '#9B9BA4', marginTop: 8, marginBottom: 0 }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => fetchNotifs()}
            disabled={loading}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm)', fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={markAllRead}
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 16px', borderRadius: 8, color: '#3b82f6', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm)', fontWeight: 700 }}
          >
            <CheckCircle size={14} />
            <span className="hidden sm:inline">Mark All Read</span>
          </button>
          <button
            onClick={clearAll}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: 8, color: '#ef4444', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm)', fontWeight: 700 }}
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Dynamic Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '16px 24px' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={18} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            style={{ width: '100%', background: 'transparent', border: 'none', paddingLeft: 52, color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 14, outline: 'none' }}
          />
        </div>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.05)' }} className="hidden sm:block" />

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'unread', 'read', 'important'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
                background: activeFilter === f ? 'rgba(217,0,37,0.15)' : 'transparent',
                color: activeFilter === f ? '#D90025' : '#9B9BA4',
                border: activeFilter === f ? '1px solid rgba(217,0,37,0.3)' : '1px solid transparent',
                fontWeight: activeFilter === f ? 700 : 400
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <GlassCard noPad style={{ background: 'rgba(15, 15, 23, 0.4)', backdropFilter: 'blur(12px)' }}>
        <div style={{ padding: '24px 32px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Inbox size={28} color="rgba(255,255,255,0.2)" />
              </div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>No notifications found</div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: '#9B9BA4' }}>You're all caught up!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {filtered.map((item) => {
                  const isImportant = item.priority === 'high' || item.priority === 'urgent' || item.priority === 'emergency';
                  return (
                    <motion.div
                      key={item.notification_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{
                        padding: 20,
                        background: item.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${!item.is_read ? (isImportant ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)') : 'rgba(255,255,255,0.05)'}`,
                        borderLeft: !item.is_read ? `3px solid ${isImportant ? '#ef4444' : '#3b82f6'}` : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 16,
                        display: 'flex',
                        gap: 20,
                        alignItems: 'flex-start',
                        transition: 'all 0.2s',
                        opacity: item.is_read ? 0.7 : 1
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, display: 'flex', shrink: 0, alignItems: 'center', justifyContent: 'center',
                        background: isImportant ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                        color: isImportant ? '#ef4444' : '#3b82f6'
                      }}>
                        {isImportant ? <AlertTriangle size={18} /> : <Bell size={18} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: item.is_read ? '#9B9BA4' : '#fff' }}>
                            {item.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-space)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                            <Clock size={12} /> {getTimeAgo(item.created_at)}
                          </div>
                        </div>

                        <div style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: item.is_read ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 12 }}>
                          {item.message}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {item.link ? (
                              <a href={item.link} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#D90025', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700 }}>
                                View Details <ArrowRight size={12} />
                              </a>
                            ) : <span />}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            {!item.is_read && (
                              <button onClick={() => markRead(item.notification_id)} title="Mark as Read" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9B9BA4', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#9B9BA4'}>
                                <Check size={14} />
                              </button>
                            )}
                            <button onClick={() => deleteOne(item.notification_id)} title="Delete" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9B9BA4', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }} onMouseOut={e => { e.currentTarget.style.color = '#9B9BA4'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default NotificationPageBase;
