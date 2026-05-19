import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HospitalSidebar from './HospitalSidebar';
import HospitalTopBar from './HospitalTopBar';
import { Outlet, useLocation } from 'react-router-dom';


export default function HospitalLayout() {
    const location = useLocation();
    
    // Map paths to titles/pages
    const pathMap = {
        '/hospital/dashboard': { title: 'Dashboard', page: 'DASHBOARD' },
        '/hospital/requests': { title: 'Blood Requests', page: 'REQUESTS' },
        '/hospital/patients': { title: 'Patients', page: 'PATIENTS' },
        '/hospital/payments': { title: 'Payments', page: 'PAYMENTS' },
        '/hospital/blood-banks': { title: 'Blood Banks', page: 'BLOOD-BANKS' },
        '/hospital/profile': { title: 'Settings & Profile', page: 'PROFILE' },
        '/hospital/notifications': { title: 'Notifications', page: 'NOTIFICATIONS' },
    };

    const current = pathMap[location.pathname] || { title: 'HEM∆', page: 'DASHBOARD' };

    useEffect(() => {
        document.title = `HEM∆ · ${current.title}`;
    }, [current.title]);

    return (
        <div style={{ minHeight: '100vh', background: '#07070B', display: 'flex' }}>
            <HospitalSidebar />
            <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }}>
                <HospitalTopBar title={current.title} page={current.page} />
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

