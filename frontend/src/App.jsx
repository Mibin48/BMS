import { Routes, Route, Outlet } from 'react-router-dom';
import HospitalLayout from './components/hospital/HospitalLayout.jsx';
import DonorLayout from './components/donor/DonorLayout.jsx';
import BloodBankLayout from './components/bloodbank/BloodBankLayout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';


// Route guards
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';

// Landing pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import PendingApproval from './pages/PendingApproval';

// Donor portal
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorDonations from './pages/donor/DonorDonations';
import DonorHealthCheck from './pages/donor/DonorHealthCheck';
import DonorSchedule from './pages/donor/DonorSchedule';
import DonorFindBank from './pages/donor/DonorFindBank';
import DonorProfile from './pages/donor/DonorProfile';
import DonorNotifications from './pages/donor/DonorNotifications';

// Hospital portal
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalRequests from './pages/hospital/HospitalRequests';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalPayments from './pages/hospital/HospitalPayments';
import HospitalBloodBanks from './pages/hospital/HospitalBloodBanks';
import HospitalProfile from './pages/hospital/HospitalProfile';
import HospitalNotifications from './pages/hospital/HospitalNotifications';

// Blood Bank portal
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import BloodBankInventory from './pages/bloodbank/BloodBankInventory';
import BloodBankDonations from './pages/bloodbank/BloodBankDonations';
import BloodBankDonors from './pages/bloodbank/BloodBankDonors';
import BloodBankHealthChecks from './pages/bloodbank/BloodBankHealthChecks';
import BloodBankRequests from './pages/bloodbank/BloodBankRequests';
import BloodBankIssues from './pages/bloodbank/BloodBankIssues';
import BloodBankPayments from './pages/bloodbank/BloodBankPayments';
import BloodBankProfile from './pages/bloodbank/BloodBankProfile';
import BloodBankNotifications from './pages/bloodbank/BloodBankNotifications';
import BloodBankAppointments from './pages/bloodbank/BloodBankAppointments';
import BloodBankCamps from './pages/bloodbank/BloodBankCamps';

// Admin portal
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminDonors from './pages/admin/AdminDonors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminBloodBanks from './pages/admin/AdminBloodBanks';
import AdminInventory from './pages/admin/AdminInventory';
import AdminRequests from './pages/admin/AdminRequests';
import AdminDonations from './pages/admin/AdminDonations';
import AdminHealthChecks from './pages/admin/AdminHealthChecks';
import AdminIssues from './pages/admin/AdminIssues';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
    return (
        <Routes>
            {/* ── Landing (public, no guard) ────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ── Auth (redirect if already logged in) ──── */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/register/hospital" element={<PublicRoute><Register role="hospital" /></PublicRoute>} />
            <Route path="/register/bloodbank" element={<PublicRoute><Register role="blood_bank" /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* ── Donor Portal ──────────────────────────── */}
            <Route path="/donor" element={<ProtectedRoute role="donor"><DonorLayout /></ProtectedRoute>}>
                <Route index element={<DonorDashboard />} />
                <Route path="dashboard" element={<DonorDashboard />} />
                <Route path="donations" element={<DonorDonations />} />
                <Route path="health-check" element={<DonorHealthCheck />} />
                <Route path="schedule" element={<DonorSchedule />} />
                <Route path="find-bank" element={<DonorFindBank />} />
                <Route path="profile" element={<DonorProfile />} />
                <Route path="notifications" element={<DonorNotifications />} />
            </Route>

            {/* ── Hospital Portal ───────────────────────── */}
            <Route path="/hospital" element={<ProtectedRoute role="hospital"><HospitalLayout /></ProtectedRoute>}>
                <Route index element={<HospitalDashboard />} />
                <Route path="dashboard" element={<HospitalDashboard />} />
                <Route path="requests" element={<HospitalRequests />} />
                <Route path="patients" element={<HospitalPatients />} />
                <Route path="payments" element={<HospitalPayments />} />
                <Route path="blood-banks" element={<HospitalBloodBanks />} />
                <Route path="profile" element={<HospitalProfile />} />
                <Route path="notifications" element={<HospitalNotifications />} />
            </Route>

            {/* ── Blood Bank Portal ─────────────────────── */}
            <Route path="/bloodbank" element={<ProtectedRoute role="bloodbank"><BloodBankLayout /></ProtectedRoute>}>
                <Route index element={<BloodBankDashboard />} />
                <Route path="dashboard" element={<BloodBankDashboard />} />
                <Route path="inventory" element={<BloodBankInventory />} />
                <Route path="donations" element={<BloodBankDonations />} />
                <Route path="donors" element={<BloodBankDonors />} />
                <Route path="health-checks" element={<BloodBankHealthChecks />} />
                <Route path="requests" element={<BloodBankRequests />} />
                <Route path="issues" element={<BloodBankIssues />} />
                <Route path="payments" element={<BloodBankPayments />} />
                <Route path="appointments" element={<BloodBankAppointments />} />
                <Route path="camps" element={<BloodBankCamps />} />
                <Route path="profile" element={<BloodBankProfile />} />
                <Route path="notifications" element={<BloodBankNotifications />} />
            </Route>

            {/* ── Admin Portal ──────────────────────────── */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="approvals" element={<AdminApprovals />} />
                <Route path="donors" element={<AdminDonors />} />
                <Route path="hospitals" element={<AdminHospitals />} />
                <Route path="blood-banks" element={<AdminBloodBanks />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="donations" element={<AdminDonations />} />
                <Route path="health-checks" element={<AdminHealthChecks />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>
        </Routes>

    );
}
