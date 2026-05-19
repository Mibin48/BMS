import { useEffect } from 'react';
import { motion } from 'framer-motion';
import DonorSidebar from './DonorSidebar';
import DonorTopBar from './DonorTopBar';
import { Outlet, useLocation } from 'react-router-dom';

export default function DonorLayout() {
    const location = useLocation();

    // Map paths to titles/pages
    const pathMap = {
        '/donor/dashboard': { title: 'Dashboard', page: 'DASHBOARD' },
        '/donor/donations': { title: 'My Donations', page: 'DONATIONS' },
        '/donor/health-check': { title: 'Health Status', page: 'HEALTH' },
        '/donor/schedule': { title: 'Schedule Donation', page: 'SCHEDULE' },
        '/donor/find-bank': { title: 'Find Blood Bank', page: 'FIND-BANK' },
        '/donor/profile': { title: 'My Profile', page: 'PROFILE' },
        '/donor/notifications': { title: 'Notifications', page: 'NOTIFICATIONS' },
    };

    const current = pathMap[location.pathname] || { title: 'HEM∆', page: 'DASHBOARD' };

    useEffect(() => {
        document.title = `HEM∆ · ${current.title}`;
    }, [current.title]);

    return (
        <div style={{ minHeight: '100vh', background: '#07070B', display: 'flex' }}>
            <DonorSidebar />
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }}>
                <DonorTopBar title={current.title} page={current.page} />
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
