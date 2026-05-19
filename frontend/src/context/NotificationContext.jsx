import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotifCtx = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifs] = useState([]);
  const [unreadCount, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const fetchNotifs = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const data = await notificationService.getAll({ limit: 50 });
      setNotifs(data.data.notifications);
      setUnread(data.data.unread_count);
    } catch (_) {
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  // ── REAL-TIME WEB-SOCKET ──────────────────────────
  useEffect(() => {
    if (!user || !user.user_id) {
      console.warn('[Socket] No user_id found in user object, deferring connection');
      return;
    }

    // Connect to Socket.io
    const socket = io(SOCKET_URL, {
      query: { user_id: user.user_id },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    socket.on('notification', (notif) => {
      console.log('[Socket] New notification:', notif);
      
      // Update state
      setNotifs(prev => [notif, ...prev]);
      setUnread(c => c + 1);

      // Trigger modern toast
      toast.custom((t) => (
        <div style={{
          background: '#0F0F17',
          border: '1px solid rgba(217,0,37,0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          maxWidth: 320,
          animation: t.visible ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.2s ease-in'
        }}>
          <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, color: 'var(--red)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {notif.priority === 'emergency' ? '🚨 EMERGENCY' : 'NEW NOTIFICATION'}
          </div>
          <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, color: '#fff', fontSize: 15 }}>{notif.title}</div>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text3)', fontSize: 13, lineHeight: 1.4 }}>{notif.message}</div>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    // Initial fetch
    fetchNotifs(true);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchNotifs]);


  const markRead = async (id) => {
    try {
      console.log('markRead clicked for id:', id);
      const res = await notificationService.markRead(id);
      console.log('API markRead response:', res);
      
      setNotifs(prev => {
        const nextState = prev.map(n =>
          n.notification_id === id
            ? { ...n, is_read: 1, read_at: new Date().toISOString() }
            : n
        );
        console.log('UI state updated, match found?', nextState.some(n => n.notification_id === id && n.is_read === 1));
        return nextState;
      });
      setUnread(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Failed to mark as read: ' + (err.response?.data?.message || err.message));
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all read');
    }
  };

  const deleteOne = async (id) => {
    try {
      const wasUnread = notifications.find(n => n.notification_id === id)?.is_read === 0;
      await notificationService.deleteOne(id);
      setNotifs(prev => prev.filter(n => n.notification_id !== id));
      if (wasUnread) {
        setUnread(c => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete');
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifs([]);
      setUnread(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      toast.error('Failed to clear');
    }
  };

  return (
    <NotifCtx.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifs, markRead, markAllRead,
      deleteOne, clearAll,
      socket: socketRef.current
    }}>
      {children}
    </NotifCtx.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotifCtx);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};
