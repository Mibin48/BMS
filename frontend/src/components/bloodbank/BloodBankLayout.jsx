import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BloodBankSidebar from './BloodBankSidebar';
import BloodBankTopBar from './BloodBankTopBar';
import { Outlet, useLocation } from 'react-router-dom';

export default function BloodBankLayout() {
    const location = useLocation();

    // Map paths to titles/pages
    const pathMap = {
        '/bloodbank/dashboard': { title: 'Dashboard', page: 'DASHBOARD' },
        '/bloodbank/inventory': { title: 'Blood Inventory', page: 'INVENTORY' },
        '/bloodbank/donations': { title: 'Donations', page: 'DONATIONS' },
        '/bloodbank/donors': { title: 'Donors', page: 'DONORS' },
        '/bloodbank/health-checks': { title: 'Health Checks', page: 'HEALTH' },
        '/bloodbank/requests': { title: 'Blood Requests', page: 'REQUESTS' },
        '/bloodbank/issues': { title: 'Blood Issues', page: 'ISSUES' },
        '/bloodbank/payments': { title: 'Payments', page: 'PAYMENTS' },
        '/bloodbank/profile': { title: 'Settings & Profile', page: 'PROFILE' },
        '/bloodbank/notifications': { title: 'Notifications', page: 'NOTIFICATIONS' },
    };

    const current = pathMap[location.pathname] || { title: 'HEM∆', page: 'DASHBOARD' };

    useEffect(() => {
        document.title = `HEM∆ · ${current.title}`;
    }, [current.title]);

    return (
        <div style={{ minHeight: '100vh', background: '#07070B', display: 'flex' }}>
            <BloodBankSidebar />
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }}>
                <BloodBankTopBar title={current.title} page={current.page} />
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
