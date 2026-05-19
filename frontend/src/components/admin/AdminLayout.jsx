import { useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
    const location = useLocation();

    // Map paths to titles/pages
    const pathMap = {
        '/admin/dashboard': { title: 'Admin Overview', page: 'DASHBOARD' },
        '/admin/notifications': { title: 'Notifications', page: 'NOTIFICATIONS' },
        '/admin/approvals': { title: 'Pending Approvals', page: 'APPROVALS' },
        '/admin/donors': { title: 'Manage Donors', page: 'DONORS' },
        '/admin/hospitals': { title: 'Manage Hospitals', page: 'HOSPITALS' },
        '/admin/blood-banks': { title: 'Manage Blood Banks', page: 'BANKS' },
        '/admin/inventory': { title: 'System Inventory', page: 'INVENTORY' },
        '/admin/requests': { title: 'Blood Requests', page: 'REQUESTS' },
        '/admin/donations': { title: 'Donation Logs', page: 'DONATIONS' },
        '/admin/health-checks': { title: 'Health Logs', page: 'HEALTH' },
        '/admin/issues': { title: 'Issue Logs', page: 'ISSUES' },
        '/admin/payments': { title: 'Payments & Revenue', page: 'PAYMENTS' },
        '/admin/users': { title: 'User Management', page: 'USERS' },
        '/admin/reports': { title: 'Reports & Analytics', page: 'REPORTS' },
        '/admin/audit': { title: 'Audit Logs', page: 'AUDIT' },
        '/admin/settings': { title: 'System Settings', page: 'SETTINGS' },
    };

    const current = pathMap[location.pathname] || { title: 'Admin', page: 'DASHBOARD' };

    useEffect(() => {
        document.title = `HEM∆ · ${current.title}`;
    }, [current.title]);

    return (
        <div style={{ minHeight: '100vh', background: '#07070B', display: 'flex' }}>
            <AdminSidebar />
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }}>
                <AdminTopBar title={current.title} page={current.page} />
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginTop: 72, padding: 32, flex: 1, minHeight: 'calc(100vh - 72px)' }}
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}
