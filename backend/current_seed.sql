[dotenv@17.3.1] injecting env (20) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
-- ═══════════════════════════════════════════
-- HEM∆ Blood Management System — Current Seed Data
-- Generated on: 2026-04-10T07:20:09.857Z
-- ═══════════════════════════════════════════

USE Blood_Management_System;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `users`;
DELETE FROM `system_settings`;
DELETE FROM `payment`;
DELETE FROM `patient`;
DELETE FROM `notification`;
DELETE FROM `hospital`;
DELETE FROM `health_check`;
DELETE FROM `donor`;
DELETE FROM `donation_record`;
DELETE FROM `camp_rsvp`;
DELETE FROM `blood_stock`;
DELETE FROM `blood_request`;
DELETE FROM `blood_issue`;
DELETE FROM `blood_camp`;
DELETE FROM `blood_bank`;
DELETE FROM `audit_log`;
DELETE FROM `appointment`;

SET FOREIGN_KEY_CHECKS = 1;

-- TABLE: appointment
INSERT INTO `appointment` (`appointment_id`, `donor_id`, `bank_id`, `appointment_date`, `appointment_time`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('APT-2026-0TH0R', 'DNR-2025-00001', 'BNK-2025-KL-00002', '2026-04-16 18:30:00', '04:00 PM', 'Scheduled', 'Slot booked at 04:00 PM', '2026-04-06 12:54:49', '2026-04-06 12:54:49'),
('APT-2026-QGLTS', 'DNR-2025-00001', 'BNK-2025-KL-00001', '2026-04-03 18:30:00', '4:00 PM', 'Cancelled', 'Slot booked at 4:00 PM', '2026-04-01 15:28:51', '2026-04-01 15:39:40'),
('APT-2026-S830X', 'DNR-2025-00001', 'BNK-2025-KL-00001', '2026-04-03 18:30:00', '10:00 AM', 'Fulfilled', 'Slot booked at 10:00 AM', '2026-04-01 16:07:18', '2026-04-01 16:21:48'),
('APT-2026-UDVL6', 'DNR-2025-00001', 'BNK-2025-KL-00001', '2026-04-02 18:30:00', '9:00 AM', 'Cancelled', 'Slot booked at 9:00 AM', '2026-04-01 16:19:40', '2026-04-01 16:19:57');

-- TABLE: audit_log
INSERT INTO `audit_log` (`log_id`, `user_id`, `user_name`, `role`, `action`, `entity`, `entity_id`, `detail`, `ip_address`, `severity`, `created_at`) VALUES
('LOG-2025-00001', 'USR-2025-00001', 'admin@hema.health', 'admin', 'LOGIN', 'Auth', NULL, 'Admin login successful', '127.0.0.1', 'Info', '2026-02-24 10:29:11'),
('LOG-2025-00002', 'USR-2025-00001', 'admin@hema.health', 'admin', 'APPROVED', 'Hospital', 'HSP-2025-KL-00001', 'Approved: KIMS Hospital', '127.0.0.1', 'Info', '2026-02-25 10:29:11'),
('LOG-2025-00003', 'USR-2025-00001', 'admin@hema.health', 'admin', 'APPROVED', 'Blood_Bank', 'BNK-2025-KL-00001', 'Approved: KIMS Blood Bank', '127.0.0.1', 'Info', '2026-02-25 10:29:11'),
('LOG-2025-00004', 'USR-2025-00001', 'admin@hema.health', 'admin', 'APPROVED', 'Hospital', 'HSP-2025-KL-00002', 'Approved: Lakeshore Hospital', '127.0.0.1', 'Info', '2026-02-26 10:29:11'),
('LOG-2025-00005', 'USR-2025-00001', 'admin@hema.health', 'admin', 'APPROVED', 'Blood_Bank', 'BNK-2025-KL-00002', 'Approved: Lakeshore Blood Centre', '127.0.0.1', 'Info', '2026-02-26 10:29:11'),
('LOG-2025-00006', 'USR-2025-00015', 'arjun@gmail.com', 'donor', 'REGISTERED', 'Donor', 'DNR-2025-00001', 'New donor registered: Arjun Nair, O+', '192.168.1.10', 'Info', '2026-02-27 10:29:11'),
('LOG-2025-00007', 'USR-2025-00009', 'admin@kims.in', 'hospital', 'CREATED', 'Patient', 'PAT-2025-00001', 'Patient added: Rajan Pillai, B+, Cardiac ICU', '192.168.1.20', 'Info', '2026-03-01 10:29:11'),
('LOG-2025-00008', 'USR-2025-00009', 'admin@kims.in', 'hospital', 'CREATED', 'Blood_Request', 'REQ-2025-00001', 'Request Emergency: 2U B+ from KIMS Blood Bank', '192.168.1.20', 'Warning', '2026-03-02 10:29:11'),
('LOG-2025-00009', 'USR-2025-00003', 'admin@kimsbank.in', 'bloodbank', 'APPROVED', 'Blood_Request', 'REQ-2025-00001', 'Request approved: 2U B+ for KIMS Hospital', '192.168.1.30', 'Info', '2026-03-02 10:29:11'),
('LOG-2025-00010', 'USR-2025-00003', 'admin@kimsbank.in', 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2025-00001', 'Issued 2U B+ to KIMS Hospital. Stock: 208U', '192.168.1.30', 'Info', '2026-03-03 10:29:11'),
('LOG-2025-00011', 'USR-2025-00009', 'admin@kims.in', 'hospital', 'PAID', 'Payment', 'PAY-2025-00001', 'Payment Rs.1000 to KIMS Blood Bank marked Paid', '192.168.1.20', 'Info', '2026-03-04 10:29:11'),
('LOG-2025-00012', 'USR-2025-00001', 'admin@hema.health', 'admin', 'FAILED_LOGIN', 'Auth', NULL, 'Failed login: ad***@test.com', '10.0.0.1', 'Warning', '2026-03-04 10:29:11'),
('LOG-2025-00013', 'USR-2025-00001', 'admin@hema.health', 'admin', 'FAILED_LOGIN', 'Auth', NULL, 'Failed login: ad***@test.com', '10.0.0.1', 'Warning', '2026-03-04 10:29:11'),
('LOG-2025-00014', 'USR-2025-00001', 'admin@hema.health', 'admin', 'FAILED_LOGIN', 'Auth', NULL, '3+ failed attempts from 10.0.0.1', '10.0.0.1', 'Critical', '2026-03-04 10:29:11'),
('LOG-2025-00015', 'USR-2025-00010', 'admin@lakehosp.in', 'hospital', 'CREATED', 'Blood_Request', 'REQ-2025-00005', 'Request Emergency: 2U B- — Urgent surgery tonight', '192.168.1.40', 'Warning', '2026-03-05 10:29:11'),
('LOG-2025-00016', 'USR-2025-00003', 'admin@kimsbank.in', 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00004', 'add 10U B- (18->28). Restock', '192.168.1.30', 'Info', '2026-03-05 10:29:11'),
('LOG-2025-00017', 'USR-2025-00012', 'admin@babymemorial.in', 'hospital', 'CREATED', 'Blood_Request', 'REQ-2025-00010', 'Request Emergency: 3U AB- — Trauma patient critical', '192.168.1.50', 'Warning', '2026-03-06 10:29:11'),
('LOG-2025-00018', 'USR-2025-00001', 'admin@hema.health', 'admin', 'GENERATED', 'Report', NULL, 'Report: naco_monthly 2025-01-01 to 2025-01-31', '127.0.0.1', 'Info', '2026-03-03 10:29:11'),
('LOG-2025-00019', 'USR-2025-00001', 'admin@hema.health', 'admin', 'REJECTED', 'Blood_Bank', 'BNK-2025-KL-00005', 'Rejected Kollam District Blood Bank: Documents incomplete', '127.0.0.1', 'Warning', '2026-02-28 10:29:11'),
('LOG-2025-00020', 'USR-2025-00003', 'admin@kimsbank.in', 'bloodbank', 'RECALL', 'Donor', 'BNK-2025-KL-00001', 'Recall sent to 3 donors [O+ all cities]', '192.168.1.30', 'Info', '2026-03-01 10:29:11'),
('LOG-2026-06BDE', 'USR-2025-00014', 'Palakkad District Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00014', 'Login successful: admin@palakkadhosp.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:15:11'),
('LOG-2026-0Q0S3', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-08 16:27:00'),
('LOG-2026-19PU6', 'USR-2025-00001', NULL, 'admin', 'APPROVED', 'Hospital', 'HSP-2026-KL-XZ3FY', 'Approved Hospital: TestHos', '::1', 'Info', '2026-03-09 14:43:16'),
('LOG-2026-1D7RO', 'USR-2025-00011', NULL, 'hospital', 'PAID', 'Payment', 'PAY-2025-00007', 'Payment of ₹1000.00 to Thrissur Red Cross Blood Bank marked Paid', '::1', 'Info', '2026-04-08 12:56:16'),
('LOG-2026-1PEGL', 'USR-2025-00009', NULL, 'hospital', 'DELETED', 'Patient', 'PAT-2026-WHBXR', 'Patient deleted: Kiwi', '::ffff:127.0.0.1', 'Warning', '2026-03-06 11:32:09'),
('LOG-2026-22Z6B', 'USR-2025-00010', 'Lakeshore Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00010', 'Login successful: admin@lakehosp.in', '::ffff:127.0.0.1', 'Info', '2026-03-19 17:03:24'),
('LOG-2026-26BER', 'USR-2025-00001', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00001', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:46:37'),
('LOG-2026-2GFE6', 'USR-2025-00001', NULL, 'admin', 'UPDATED', 'Payment', 'PAY-2025-00003', 'Admin overrode payment status → Paid', '::ffff:127.0.0.1', 'Warning', '2026-03-07 10:28:15'),
('LOG-2026-2GII5', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:27:59'),
('LOG-2026-2LWBX', 'USR-2025-00006', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00006', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:21:15'),
('LOG-2026-2QS80', 'USR-2026-PFYR8', 'Mr.Max', 'hospital', 'REGISTERED', 'Hospital', 'HSP-2026-KL-YZZJ4', 'Hospital registration pending: test.hosp@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-09 02:17:08'),
('LOG-2026-2Z1PR', 'USR-2025-00004', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00012', 'add 10U B- (26→36) ', '::ffff:127.0.0.1', 'Info', '2026-04-09 11:16:26'),
('LOG-2026-32NYZ', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 08:36:14'),
('LOG-2026-38XDT', 'USR-2025-00006', NULL, 'bloodbank', 'PAID', 'Payment', 'PAY-2025-00011', 'Payment ₹500.00 received from Baby Memorial Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:44:58'),
('LOG-2026-3SW1E', 'USR-2025-00009', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00009', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:04:32'),
('LOG-2026-3VUKJ', 'USR-2025-00005', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00005', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:19:30'),
('LOG-2026-3WQZ3', 'USR-2025-00006', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-VTB2I', 'Issued 2U O+ to Baby Memorial Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:43:30'),
('LOG-2026-41ZJ8', 'USR-2025-00009', NULL, 'hospital', 'CREATED', 'Patient', 'PAT-2026-WHBXR', 'Patient added: Kiwi, AB-, General', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:30:34'),
('LOG-2026-4ABA9', 'USR-2025-00004', 'Lakeshore Blood Centre', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00004', 'Login successful: admin@lakeshore.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:57:47'),
('LOG-2026-4BPEM', 'USR-2025-00015', 'Arjun Nair', 'donor', 'LOGIN', 'Users', 'USR-2025-00015', 'Login successful: arjun@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:04:56'),
('LOG-2026-4T6S5', 'USR-2025-00017', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00017', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-06 10:46:10'),
('LOG-2026-4XT4Q', 'USR-2025-00001', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00001', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:29:03'),
('LOG-2026-4YLI6', 'USR-2025-00003', NULL, 'bloodbank', 'APPROVED', 'Blood_Request', 'REQ-2026-2MNUU', 'Request approved: 1U B+', '::ffff:127.0.0.1', 'Info', '2026-03-07 03:44:32'),
('LOG-2026-5176P', 'USR-2025-00004', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00004', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 13:02:10'),
('LOG-2026-56OD8', 'USR-2025-00009', NULL, 'hospital', 'UPDATED', 'Patient', 'PAT-2026-WHBXR', 'Patient status → Admitted', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:31:46'),
('LOG-2026-5K9WE', 'USR-2025-00006', 'Kozhikode Medical College Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00006', 'Login successful: admin@kozhikodebank.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:41:54'),
('LOG-2026-5V77W', 'USR-2025-00018', 'Deepa Pillai', 'donor', 'LOGIN', 'Users', 'USR-2025-00018', 'Login successful: deepa@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-06 10:47:45'),
('LOG-2026-6HHHG', 'USR-2025-00005', 'Thrissur Red Cross Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00005', 'Login successful: admin@thrissurredcross.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:06:26'),
('LOG-2026-6MHRO', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::1', 'Info', '2026-03-06 10:44:00'),
('LOG-2026-6MI9H', 'USR-2025-00006', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00029', 'add 6U O+ (279→285) ', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:18:32');

INSERT INTO `audit_log` (`log_id`, `user_id`, `user_name`, `role`, `action`, `entity`, `entity_id`, `detail`, `ip_address`, `severity`, `created_at`) VALUES
('LOG-2026-6TZC4', 'USR-2025-00006', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00026', 'add 1U A- (41→42) ', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:43:02'),
('LOG-2026-6YEP8', 'USR-2025-00008', NULL, 'bloodbank', 'REAPPLIED', 'bloodbank', 'BNK-2025-KL-00006', 'User cleared rejected bloodbank application to re-register', '::ffff:127.0.0.1', 'Info', '2026-03-08 17:21:08'),
('LOG-2026-7FVLZ', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:23:40'),
('LOG-2026-7L1SO', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATE_STATUS', 'Appointment', 'APT-2026-QGLTS', 'Appointment status updated to Confirmed', '::1', 'Info', '2026-04-01 15:31:13'),
('LOG-2026-7QCJ4', 'USR-2025-00016', 'Priya Menon', 'donor', 'LOGIN', 'Users', 'USR-2025-00016', 'Login successful: priya@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:55:43'),
('LOG-2026-8Q6OY', 'USR-2025-00010', 'Lakeshore Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00010', 'Login successful: admin@lakehosp.in', '::1', 'Info', '2026-03-08 15:50:22'),
('LOG-2026-8RDO8', 'USR-2025-00006', NULL, 'bloodbank', 'PAID', 'Payment', 'PAY-2025-00010', 'Payment ₹1500.00 received from Baby Memorial Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:44:50'),
('LOG-2026-9616M', 'USR-2025-00015', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00015', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-26 10:07:06'),
('LOG-2026-AEM6H', 'USR-2025-00018', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00018', 'User logged out', '::1', 'Info', '2026-03-07 13:14:46'),
('LOG-2026-AUIYU', 'USR-2025-00001', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00001', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 06:40:24'),
('LOG-2026-B5VNV', 'USR-2025-00002', NULL, 'admin', 'APPROVED', 'Hospital', 'HSP-2025-KL-00006', 'Approved Hospital: Palakkad District Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:23:15'),
('LOG-2026-B7GJY', 'USR-2025-00003', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00003', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-19 14:08:37'),
('LOG-2026-BGA9H', 'USR-2025-00002', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00002', 'Login successful: regional@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:19:55'),
('LOG-2026-BGKOY', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00008', 'add 2U AB- (8→10) ', '::1', 'Info', '2026-04-02 04:22:13'),
('LOG-2026-BJFW8', 'USR-2025-00016', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00016', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:56:59'),
('LOG-2026-BS0NF', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00004', 'add 10U B- (28→38) ', '::1', 'Info', '2026-04-02 04:21:53'),
('LOG-2026-CPSD7', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATE_STATUS', 'Appointment', 'APT-2026-S830X', 'Appointment status updated to Fulfilled', '::1', 'Info', '2026-04-01 16:21:48'),
('LOG-2026-CVBX1', 'USR-2025-00001', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00001', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 13:13:22'),
('LOG-2026-DO2W8', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATED', 'Blood_Stock', 'STK-2025-KL-00004', 'add 9U B- (19→28) ', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:51:47'),
('LOG-2026-DXJUR', 'USR-2026-JBBEL', 'Meme', 'hospital', 'REGISTERED', 'Hospital', 'HSP-2026-KL-XZ3FY', 'Hospital registration pending: TestHos', '::ffff:127.0.0.1', 'Info', '2026-03-09 14:42:48'),
('LOG-2026-E2RWP', 'USR-2025-00015', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00015', 'User logged out', '::1', 'Info', '2026-03-08 15:49:38'),
('LOG-2026-EZV6W', 'USR-2025-00009', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00009', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-06 12:11:58'),
('LOG-2026-GGW0O', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATE_STATUS', 'Appointment', 'APT-2026-UDVL6', 'Appointment status updated to Cancelled', '::1', 'Info', '2026-04-01 16:19:57'),
('LOG-2026-GIRXB', 'USR-2025-00003', NULL, 'bloodbank', 'CREATED', 'Blood_Camp', 'CMP-2026-IQJW2', 'Camp scheduled: KMS Camp on 2026-04-03', '::ffff:127.0.0.1', 'Info', '2026-04-02 05:51:47'),
('LOG-2026-GMA2Q', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATE_STATUS', 'Appointment', 'APT-2026-S830X', 'Appointment status updated to Confirmed', '::1', 'Info', '2026-04-01 16:09:51'),
('LOG-2026-GMGY0', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::1', 'Info', '2026-03-08 16:02:26'),
('LOG-2026-I8JDA', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::1', 'Info', '2026-03-07 13:20:24'),
('LOG-2026-IA42A', 'USR-2025-00003', NULL, 'bloodbank', 'APPROVED', 'Blood_Request', 'REQ-2025-00008', 'Request approved: 1U B+', '::1', 'Info', '2026-04-02 04:22:52'),
('LOG-2026-IBH33', 'USR-2025-00015', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00015', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:23:14'),
('LOG-2026-INR9J', 'USR-2025-00002', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00002', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-06 10:33:03'),
('LOG-2026-J59G3', 'USR-2025-00003', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-AJQYE', 'Issued 1U B+ to KIMS Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 03:44:41'),
('LOG-2026-J65DA', 'USR-2026-JBBEL', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2026-JBBEL', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-09 14:47:44'),
('LOG-2026-J8A19', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:22:04'),
('LOG-2026-JV409', 'USR-2025-00001', NULL, 'admin', 'APPROVED', 'Hospital', 'HSP-2025-KL-00005', 'Approved Hospital: Travancore Medical College', '::1', 'Info', '2026-03-08 16:55:48'),
('LOG-2026-JY26B', 'USR-2025-00017', 'Rahul Krishnan', 'donor', 'LOGIN', 'Users', 'USR-2025-00017', 'Login successful: rahul@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-07 06:47:10'),
('LOG-2026-JYB43', 'USR-2025-00002', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00002', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:26:12'),
('LOG-2026-JZ5MI', 'USR-2025-00003', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00003', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-08 15:51:10'),
('LOG-2026-K8PRU', 'USR-2025-00017', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00017', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 08:32:49'),
('LOG-2026-K98X9', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-07 13:02:26'),
('LOG-2026-KQSLV', 'USR-2025-00006', NULL, 'bloodbank', 'CREATED', 'Blood_Camp', 'CMP-2026-90I1V', 'Camp scheduled: Night Camps on 2026-04-10', '::ffff:127.0.0.1', 'Info', '2026-04-08 14:36:00'),
('LOG-2026-KRAM7', 'USR-2025-00003', NULL, 'bloodbank', 'UPDATE_STATUS', 'Appointment', 'APT-2026-QGLTS', 'Appointment status updated to Cancelled', '::1', 'Info', '2026-04-01 15:39:40'),
('LOG-2026-KZEZ7', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:20:36'),
('LOG-2026-LQS43', 'USR-2025-00012', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00012', 'User logged out', '::1', 'Info', '2026-04-09 12:16:39'),
('LOG-2026-M47MH', 'USR-2025-00006', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-P6KVZ', 'Issued 2U A+ to KIMS Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-26 10:17:27'),
('LOG-2026-MC44I', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:27:47'),
('LOG-2026-MPAOZ', 'USR-2025-00018', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00018', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:16:34'),
('LOG-2026-N4SI7', 'USR-2025-00003', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00003', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 03:52:50'),
('LOG-2026-NAPPT', 'USR-2025-00006', NULL, 'bloodbank', 'APPROVED', 'Blood_Request', 'REQ-2026-JBDPG', 'Request approved: 2U A+', '::ffff:127.0.0.1', 'Info', '2026-03-26 10:16:28'),
('LOG-2026-NDQY3', 'USR-2025-00010', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00010', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-19 17:06:55'),
('LOG-2026-NRID5', 'USR-2025-00003', 'KIMS Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00003', 'Login successful: admin@kimsbank.in', '::ffff:127.0.0.1', 'Info', '2026-03-08 16:03:45');

INSERT INTO `audit_log` (`log_id`, `user_id`, `user_name`, `role`, `action`, `entity`, `entity_id`, `detail`, `ip_address`, `severity`, `created_at`) VALUES
('LOG-2026-NYDJ2', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-07 03:53:25'),
('LOG-2026-O9ID1', 'USR-2025-00003', NULL, 'bloodbank', 'RECALL', 'Donor', 'BNK-2025-KL-00001', 'Recall sent to 0 donors [all Thrissur]', '::ffff:127.0.0.1', 'Info', '2026-03-19 14:08:22'),
('LOG-2026-OFP34', 'USR-2025-00009', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00009', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:22:31'),
('LOG-2026-OIRF0', 'USR-2025-00004', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-8QWD5', 'Issued 2U B- to Lakeshore Hospital', '::ffff:127.0.0.1', 'Info', '2026-04-08 17:41:29'),
('LOG-2026-ON26Q', 'USR-2025-00001', NULL, 'admin', 'REJECTED', 'Blood_Bank', 'BNK-2025-KL-00006', 'Rejected Blood_Bank: Incomplete documentation', '::1', 'Warning', '2026-03-08 16:57:42'),
('LOG-2026-OQCWV', 'USR-2025-00006', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-PJJQZ', 'Issued 1U AB- to Baby Memorial Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:43:50'),
('LOG-2026-P712B', 'USR-2025-00009', NULL, 'hospital', 'CREATED', 'Blood_Request', 'REQ-2026-JBDPG', 'Request Urgent: 2U A+ from Kozhikode Medical College Blood Bank', '::ffff:127.0.0.1', 'Info', '2026-03-26 10:09:17'),
('LOG-2026-PDHSV', 'USR-2025-00009', 'KIMS Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00009', 'Login successful: admin@kims.in', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:16:47'),
('LOG-2026-QBTUZ', 'USR-2025-00009', NULL, 'hospital', 'PAID', 'Payment', 'PAY-2026-RAPTI', 'Payment of ₹500.00 to KIMS Blood Bank marked Paid', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:33:32'),
('LOG-2026-QCSLY', 'USR-2025-00009', NULL, 'hospital', 'CREATED', 'Blood_Request', 'REQ-2026-2MNUU', 'Request Urgent: 1U B+ from KIMS Blood Bank', '::ffff:127.0.0.1', 'Info', '2026-03-06 11:29:14'),
('LOG-2026-QE5Z5', 'USR-2025-00014', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00014', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:54:54'),
('LOG-2026-QI4H9', 'USR-2025-00015', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00015', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:43:27'),
('LOG-2026-QOH9A', 'USR-2025-00015', 'Arjun Nair', 'donor', 'LOGIN', 'Users', 'USR-2025-00015', 'Login successful: arjun@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-07 11:22:59'),
('LOG-2026-R0EJE', 'USR-2025-00015', 'Arjun Nair', 'donor', 'LOGIN', 'Users', 'USR-2025-00015', 'Login successful: arjun@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:42:28'),
('LOG-2026-RFLC7', 'USR-2025-00003', NULL, 'bloodbank', 'APPROVED', 'Blood_Request', 'REQ-2025-00003', 'Request approved: 3U A+', '::ffff:127.0.0.1', 'Info', '2026-03-07 15:48:11'),
('LOG-2026-RHW1U', 'USR-2025-00003', NULL, 'bloodbank', 'CREATED', 'Blood_Camp', 'CMP-2026-12TNJ', 'Camp scheduled: BB Drive on 2026-04-09', '::1', 'Info', '2026-04-05 14:39:47'),
('LOG-2026-SP8CF', 'USR-2025-00010', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00010', 'User logged out', '::1', 'Info', '2026-03-08 15:50:49'),
('LOG-2026-T6IQX', 'USR-2025-00003', 'KIMS Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00003', 'Login successful: admin@kimsbank.in', '::ffff:127.0.0.1', 'Info', '2026-03-07 13:14:34'),
('LOG-2026-T8TD2', 'USR-2026-JBBEL', NULL, 'hospital', 'REAPPLIED', 'hospital', 'HSP-2026-KL-XZ3FY', 'User cleared rejected hospital application to re-register', '::ffff:127.0.0.1', 'Info', '2026-03-09 14:50:01'),
('LOG-2026-T9Y24', 'USR-2025-00006', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00006', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-26 11:15:04'),
('LOG-2026-TNK5R', 'USR-2025-00001', NULL, 'admin', 'LOGOUT', 'Users', 'USR-2025-00001', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 12:14:34'),
('LOG-2026-TTTJM', 'USR-2025-00003', 'KIMS Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00003', 'Login successful: admin@kimsbank.in', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:47:18'),
('LOG-2026-TUUP9', 'USR-2025-00009', NULL, 'hospital', 'PAID', 'Payment', 'PAY-2026-D7ATV', 'Payment of ₹1000.00 to Kozhikode Medical College Blood Bank marked Paid', '::ffff:127.0.0.1', 'Info', '2026-03-26 11:02:06'),
('LOG-2026-UG6L4', 'USR-2025-00018', 'Deepa Pillai', 'donor', 'LOGIN', 'Users', 'USR-2025-00018', 'Login successful: deepa@gmail.com', '::1', 'Info', '2026-03-07 12:18:38'),
('LOG-2026-UHVD1', 'USR-2025-00010', 'Lakeshore Hospital', 'hospital', 'LOGIN', 'Users', 'USR-2025-00010', 'Login successful: admin@lakehosp.in', '::ffff:127.0.0.1', 'Info', '2026-03-19 14:09:13'),
('LOG-2026-UVZ75', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-19 13:44:42'),
('LOG-2026-V32P0', 'USR-2025-00015', 'Arjun Nair', 'donor', 'LOGIN', 'Users', 'USR-2025-00015', 'Login successful: arjun@gmail.com', '::1', 'Info', '2026-03-08 15:48:03'),
('LOG-2026-W9T6F', 'USR-2025-00015', NULL, 'donor', 'LOGOUT', 'Users', 'USR-2025-00015', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-07 09:05:37'),
('LOG-2026-WOFVJ', 'USR-2026-JBBEL', 'TestHos', 'hospital', 'LOGIN', 'Users', 'USR-2026-JBBEL', 'Login successful: test-reapply@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-09 14:47:08'),
('LOG-2026-WQ60K', 'USR-2025-00003', NULL, 'bloodbank', 'RECALL', 'Donor', 'BNK-2025-KL-00001', 'Recall sent to 0 donors [A+ Palakkad]', '::ffff:127.0.0.1', 'Info', '2026-03-19 14:08:10'),
('LOG-2026-WWW2A', 'USR-2025-00009', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00009', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-04-01 15:00:56'),
('LOG-2026-WY65I', 'USR-2025-00003', 'KIMS Blood Bank', 'bloodbank', 'LOGIN', 'Users', 'USR-2025-00003', 'Login successful: admin@kimsbank.in', '::ffff:127.0.0.1', 'Info', '2026-03-06 13:00:25'),
('LOG-2026-XO4VU', 'USR-2025-00003', NULL, 'bloodbank', 'LOGOUT', 'Users', 'USR-2025-00003', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-08 16:06:55'),
('LOG-2026-Y1WZD', 'USR-2025-00017', 'Rahul Krishnan', 'donor', 'LOGIN', 'Users', 'USR-2025-00017', 'Login successful: rahul@gmail.com', '::ffff:127.0.0.1', 'Info', '2026-03-06 10:44:39'),
('LOG-2026-YIFX4', 'USR-2025-00009', NULL, 'hospital', 'LOGOUT', 'Users', 'USR-2025-00009', 'User logged out', '::ffff:127.0.0.1', 'Info', '2026-03-08 16:28:20'),
('LOG-2026-YIG6H', 'USR-2025-00006', NULL, 'bloodbank', 'PAID', 'Payment', 'PAY-2025-00012', 'Payment ₹1000.00 received from Baby Memorial Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 10:45:18'),
('LOG-2026-YTOY3', 'USR-2025-00001', 'Admin Kerala', 'admin', 'LOGIN', 'Users', 'USR-2025-00001', 'Login successful: admin@hema.health', '::ffff:127.0.0.1', 'Info', '2026-03-08 15:51:22'),
('LOG-2026-Z5Q91', 'USR-2025-00002', NULL, 'admin', 'APPROVED', 'Blood_Bank', 'BNK-2025-KL-00005', 'Approved Blood_Bank: Kollam District Blood Bank', '::1', 'Info', '2026-04-09 13:27:55'),
('LOG-2026-ZV8ON', 'USR-2025-00004', NULL, 'bloodbank', 'CREATED', 'Blood_Camp', 'CMP-2026-J9TDV', 'Camp scheduled: Life for ALL on 2026-04-15', '::ffff:127.0.0.1', 'Info', '2026-04-09 06:37:14'),
('LOG-2026-ZWBKN', 'USR-2025-00003', NULL, 'bloodbank', 'ISSUED', 'Blood_Issue', 'ISS-2026-2LGLF', 'Issued 3U A+ to KIMS Hospital', '::ffff:127.0.0.1', 'Info', '2026-03-07 15:48:21');

-- TABLE: blood_bank
INSERT INTO `blood_bank` (`bank_id`, `bank_name`, `city`, `contact_number`, `naco_number`, `license_number`, `storage_capacity`, `operating_hours`, `status`, `created_at`, `updated_at`, `rejection_reason`, `is_deleted`) VALUES
('BNK-2025-KL-00001', 'KIMS Blood Bank', 'Thiruvananthapuram', '+91 471 300 1234', 'NACO-KL-2025-00001', 'KHD-BL-2025-0001', 2000, 'Mon-Sat 8am-8pm, Sun 9am-1pm', 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('BNK-2025-KL-00002', 'Lakeshore Blood Centre', 'Ernakulam', '+91 484 270 5678', 'NACO-KL-2025-00002', 'KHD-BL-2025-0002', 2000, 'Mon-Sun 7am-9pm', 'Active', '2026-03-06 10:29:11', '2026-04-08 17:42:00', NULL, 0),
('BNK-2025-KL-00003', 'Thrissur Red Cross Blood Bank', 'Thrissur', '+91 487 233 9012', 'NACO-KL-2025-00003', 'KHD-BL-2025-0003', 1200, 'Mon-Fri 9am-5pm, Sat 9am-2pm', 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('BNK-2025-KL-00004', 'Kozhikode Medical College Blood Bank', 'Kozhikode', '+91 495 235 3456', 'NACO-KL-2025-00004', 'KHD-BL-2025-0004', 1500, 'Mon-Sun 24 Hours', 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('BNK-2025-KL-00005', 'Kollam District Blood Bank', 'Kollam', '+91 474 275 7890', 'NACO-KL-2025-00005', 'KHD-BL-2025-0005', 800, 'Mon-Sat 9am-6pm', 'Active', '2026-03-06 10:29:11', '2026-04-09 13:27:55', NULL, 0);

-- TABLE: blood_camp
INSERT INTO `blood_camp` (`camp_id`, `bank_id`, `camp_name`, `location`, `city`, `camp_date`, `start_time`, `end_time`, `contact_person`, `contact_number`, `description`, `status`, `created_at`, `updated_at`) VALUES
('CMP-2026-12TNJ', 'BNK-2025-KL-00001', 'BB Drive', 'Central Hall', 'Idukki', '2026-04-08 18:30:00', '08:00:00', '12:00:00', NULL, NULL, '', 'Scheduled', '2026-04-05 14:39:46', '2026-04-05 14:39:46'),
('CMP-2026-90I1V', 'BNK-2025-KL-00004', 'Night Camps', 'Inside L-108 Camp', 'Kasaragod', '2026-04-09 18:30:00', '19:00:00', '14:00:00', NULL, NULL, '', 'Scheduled', '2026-04-08 14:36:00', '2026-04-08 14:36:00'),
('CMP-2026-IQJW2', 'BNK-2025-KL-00001', 'KMS Camp', 'Hall 3', 'Ernakulam', '2026-04-02 18:30:00', '09:00:00', '06:00:00', NULL, NULL, '', 'Scheduled', '2026-04-02 05:51:47', '2026-04-02 05:51:47'),
('CMP-2026-J9TDV', 'BNK-2025-KL-00002', 'Life for ALL', 'Community Room', 'Palakkad', '2026-04-14 18:30:00', '11:00:00', '18:00:00', NULL, NULL, '', 'Scheduled', '2026-04-09 06:37:14', '2026-04-09 06:37:14');

-- TABLE: blood_issue
INSERT INTO `blood_issue` (`issue_id`, `request_id`, `issue_date`, `units_issued`, `notes`, `created_at`) VALUES
('ISS-2025-00001', 'REQ-2025-00001', '2026-03-02 18:30:00', 2, 'Issued for cardiac emergency', '2026-03-06 10:29:11'),
('ISS-2025-00002', 'REQ-2025-00002', '2026-03-04 18:30:00', 1, 'Post-delivery transfusion', '2026-03-06 10:29:11'),
('ISS-2025-00003', 'REQ-2025-00004', '2026-03-03 18:30:00', 2, 'Orthopaedic surgery support', '2026-03-06 10:29:11'),
('ISS-2025-00004', 'REQ-2025-00007', '2026-03-03 18:30:00', 2, 'Routine gynaecology', '2026-03-06 10:29:11'),
('ISS-2026-2LGLF', 'REQ-2025-00003', '2026-03-06 18:30:00', 3, NULL, '2026-03-07 15:48:21'),
('ISS-2026-8QWD5', 'REQ-2025-00005', '2026-04-07 18:30:00', 2, NULL, '2026-04-08 17:41:29'),
('ISS-2026-AJQYE', 'REQ-2026-2MNUU', '2026-03-06 18:30:00', 1, NULL, '2026-03-07 03:44:41'),
('ISS-2026-P6KVZ', 'REQ-2026-JBDPG', '2026-03-25 18:30:00', 2, NULL, '2026-03-26 10:17:26'),
('ISS-2026-PJJQZ', 'REQ-2025-00010', '2026-03-06 18:30:00', 1, NULL, '2026-03-07 10:43:50'),
('ISS-2026-VTB2I', 'REQ-2025-00014', '2026-03-06 18:30:00', 2, NULL, '2026-03-07 10:43:30');

-- TABLE: blood_request
INSERT INTO `blood_request` (`request_id`, `hospital_id`, `patient_id`, `bank_id`, `blood_group`, `units_required`, `request_date`, `status`, `priority`, `notes`, `created_at`, `updated_at`) VALUES
('REQ-2025-00001', 'HSP-2025-KL-00001', 'PAT-2025-00001', 'BNK-2025-KL-00001', 'B+', 2, '2026-03-01 18:30:00', 'Fulfilled', 'Emergency', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00002', 'HSP-2025-KL-00001', 'PAT-2025-00002', 'BNK-2025-KL-00002', 'O+', 1, '2026-03-03 18:30:00', 'Fulfilled', 'Routine', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00003', 'HSP-2025-KL-00001', 'PAT-2025-00003', 'BNK-2025-KL-00001', 'A+', 3, '2026-03-04 18:30:00', 'Fulfilled', 'Urgent', 'Pre-surgery requirement', '2026-03-06 10:29:11', '2026-03-07 15:48:21'),
('REQ-2025-00004', 'HSP-2025-KL-00002', 'PAT-2025-00005', 'BNK-2025-KL-00001', 'O-', 2, '2026-03-02 18:30:00', 'Fulfilled', 'Urgent', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00005', 'HSP-2025-KL-00002', 'PAT-2025-00006', 'BNK-2025-KL-00002', 'B-', 2, '2026-03-05 18:30:00', 'Fulfilled', 'Emergency', 'Urgent surgery tonight', '2026-03-06 10:29:11', '2026-04-08 17:41:29'),
('REQ-2025-00006', 'HSP-2025-KL-00002', 'PAT-2025-00007', 'BNK-2025-KL-00003', 'A+', 1, '2026-03-05 18:30:00', 'Pending', 'Routine', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00007', 'HSP-2025-KL-00003', 'PAT-2025-00008', 'BNK-2025-KL-00003', 'O+', 2, '2026-03-02 18:30:00', 'Fulfilled', 'Routine', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00008', 'HSP-2025-KL-00003', 'PAT-2025-00009', 'BNK-2025-KL-00001', 'B+', 1, '2026-03-05 18:30:00', 'Processing', 'Routine', NULL, '2026-03-06 10:29:11', '2026-04-02 04:22:52'),
('REQ-2025-00009', 'HSP-2025-KL-00003', 'PAT-2025-00010', 'BNK-2025-KL-00002', 'A-', 2, '2026-03-05 18:30:00', 'Pending', 'Emergency', 'Cardiac surgery emergency', '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00010', 'HSP-2025-KL-00004', 'PAT-2025-00011', 'BNK-2025-KL-00004', 'AB-', 3, '2026-03-05 18:30:00', 'Fulfilled', 'Emergency', 'Trauma patient — critical', '2026-03-06 10:29:11', '2026-03-07 10:43:50'),
('REQ-2025-00011', 'HSP-2025-KL-00004', 'PAT-2025-00012', 'BNK-2025-KL-00004', 'O+', 1, '2026-03-05 18:30:00', 'Pending', 'Routine', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00012', 'HSP-2025-KL-00001', 'PAT-2025-00001', 'BNK-2025-KL-00003', 'O+', 1, '2026-02-23 18:30:00', 'Cancelled', 'Routine', 'Cancelled: found elsewhere', '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00013', 'HSP-2025-KL-00002', 'PAT-2025-00005', 'BNK-2025-KL-00003', 'A+', 1, '2026-02-25 18:30:00', 'Cancelled', 'Routine', 'Duplicate request', '2026-03-06 10:29:11', '2026-03-06 10:29:11'),
('REQ-2025-00014', 'HSP-2025-KL-00004', 'PAT-2025-00011', 'BNK-2025-KL-00004', 'O+', 2, '2026-02-28 18:30:00', 'Fulfilled', 'Urgent', NULL, '2026-03-06 10:29:11', '2026-03-07 10:43:30'),
('REQ-2026-2MNUU', 'HSP-2025-KL-00001', 'PAT-2025-00001', 'BNK-2025-KL-00001', 'B+', 1, '2026-03-05 18:30:00', 'Fulfilled', 'Urgent', NULL, '2026-03-06 11:29:14', '2026-03-07 03:44:41'),
('REQ-2026-JBDPG', 'HSP-2025-KL-00001', 'PAT-2025-00003', 'BNK-2025-KL-00004', 'A+', 2, '2026-03-25 18:30:00', 'Fulfilled', 'Urgent', NULL, '2026-03-26 10:09:17', '2026-03-26 10:17:26');

-- TABLE: blood_stock
INSERT INTO `blood_stock` (`stock_id`, `bank_id`, `blood_group`, `available_units`, `capacity`, `last_updated`) VALUES
('STK-2025-KL-00001', 'BNK-2025-KL-00001', 'A+', 177, 300, '2026-03-07 15:48:21'),
('STK-2025-KL-00002', 'BNK-2025-KL-00001', 'A-', 22, 100, '2026-03-06 10:29:11'),
('STK-2025-KL-00003', 'BNK-2025-KL-00001', 'B+', 208, 300, '2026-03-07 03:44:41'),
('STK-2025-KL-00004', 'BNK-2025-KL-00001', 'B-', 38, 80, '2026-04-02 04:21:53'),
('STK-2025-KL-00005', 'BNK-2025-KL-00001', 'O+', 242, 400, '2026-03-06 10:29:11'),
('STK-2025-KL-00006', 'BNK-2025-KL-00001', 'O-', 10, 100, '2026-03-06 10:29:11'),
('STK-2025-KL-00007', 'BNK-2025-KL-00001', 'AB+', 95, 150, '2026-03-06 10:29:11'),
('STK-2025-KL-00008', 'BNK-2025-KL-00001', 'AB-', 10, 60, '2026-04-02 04:22:13'),
('STK-2025-KL-00009', 'BNK-2025-KL-00002', 'A+', 155, 250, '2026-03-06 10:29:11'),
('STK-2025-KL-00010', 'BNK-2025-KL-00002', 'A-', 36, 100, '2026-03-06 10:29:11'),
('STK-2025-KL-00011', 'BNK-2025-KL-00002', 'B+', 190, 300, '2026-03-06 10:29:11'),
('STK-2025-KL-00012', 'BNK-2025-KL-00002', 'B-', 36, 80, '2026-04-09 11:16:26'),
('STK-2025-KL-00013', 'BNK-2025-KL-00002', 'O+', 310, 400, '2026-03-06 10:29:11'),
('STK-2025-KL-00014', 'BNK-2025-KL-00002', 'O-', 45, 120, '2026-03-06 10:29:11'),
('STK-2025-KL-00015', 'BNK-2025-KL-00002', 'AB+', 73, 150, '2026-03-06 10:29:11'),
('STK-2025-KL-00016', 'BNK-2025-KL-00002', 'AB-', 11, 60, '2026-03-06 10:29:11'),
('STK-2025-KL-00017', 'BNK-2025-KL-00003', 'A+', 89, 200, '2026-03-06 10:29:11'),
('STK-2025-KL-00018', 'BNK-2025-KL-00003', 'A-', 9, 80, '2026-03-06 10:29:11'),
('STK-2025-KL-00019', 'BNK-2025-KL-00003', 'B+', 121, 200, '2026-03-06 10:29:11'),
('STK-2025-KL-00020', 'BNK-2025-KL-00003', 'B-', 7, 60, '2026-03-06 10:29:11'),
('STK-2025-KL-00021', 'BNK-2025-KL-00003', 'O+', 143, 250, '2026-03-06 10:29:11'),
('STK-2025-KL-00022', 'BNK-2025-KL-00003', 'O-', 7, 80, '2026-03-06 10:29:11'),
('STK-2025-KL-00023', 'BNK-2025-KL-00003', 'AB+', 44, 100, '2026-03-06 10:29:11'),
('STK-2025-KL-00024', 'BNK-2025-KL-00003', 'AB-', 3, 40, '2026-03-06 10:29:11'),
('STK-2025-KL-00025', 'BNK-2025-KL-00004', 'A+', 198, 250, '2026-03-26 10:17:26'),
('STK-2025-KL-00026', 'BNK-2025-KL-00004', 'A-', 42, 100, '2026-03-07 10:43:02'),
('STK-2025-KL-00027', 'BNK-2025-KL-00004', 'B+', 175, 250, '2026-03-06 10:29:11'),
('STK-2025-KL-00028', 'BNK-2025-KL-00004', 'B-', 22, 80, '2026-03-06 10:29:11'),
('STK-2025-KL-00029', 'BNK-2025-KL-00004', 'O+', 285, 350, '2026-03-07 11:18:32'),
('STK-2025-KL-00030', 'BNK-2025-KL-00004', 'O-', 34, 100, '2026-03-06 10:29:11'),
('STK-2025-KL-00031', 'BNK-2025-KL-00004', 'AB+', 88, 120, '2026-03-06 10:29:11'),
('STK-2025-KL-00032', 'BNK-2025-KL-00004', 'AB-', 13, 50, '2026-03-07 10:43:50');

-- TABLE: camp_rsvp
INSERT INTO `camp_rsvp` (`rsvp_id`, `camp_id`, `donor_id`, `status`, `created_at`, `updated_at`) VALUES
('RSV-2026-G59IV', 'CMP-2026-IQJW2', 'DNR-2025-00001', 'Going', '2026-04-02 05:58:21', '2026-04-02 05:58:21'),
('RSV-2026-OS13S', 'CMP-2026-12TNJ', 'DNR-2025-00001', 'Going', '2026-04-06 12:54:24', '2026-04-06 12:54:24');

-- TABLE: donation_record
INSERT INTO `donation_record` (`donation_id`, `donor_id`, `bank_id`, `check_id`, `donation_date`, `quantity_ml`, `blood_group`, `created_at`) VALUES
('DON-2025-00001', 'DNR-2025-00001', 'BNK-2025-KL-00001', 'HC-2025-00001', '2024-03-09 18:30:00', 450, 'O+', '2026-03-06 10:29:11'),
('DON-2025-00002', 'DNR-2025-00001', 'BNK-2025-KL-00002', 'HC-2025-00002', '2024-06-19 18:30:00', 450, 'O+', '2026-03-06 10:29:11'),
('DON-2025-00003', 'DNR-2025-00001', 'BNK-2025-KL-00001', 'HC-2025-00003', '2024-09-19 18:30:00', 450, 'O+', '2026-03-06 10:29:11'),
('DON-2025-00004', 'DNR-2025-00003', 'BNK-2025-KL-00003', 'HC-2025-00005', '2024-10-31 18:30:00', 450, 'B+', '2026-03-06 10:29:11'),
('DON-2025-00005', 'DNR-2025-00003', 'BNK-2025-KL-00001', 'HC-2025-00006', '2026-01-19 18:30:00', 450, 'B+', '2026-03-06 10:29:11'),
('DON-2025-00006', 'DNR-2025-00004', 'BNK-2025-KL-00002', 'HC-2025-00008', '2025-11-30 18:30:00', 350, 'AB+', '2026-03-06 10:29:11'),
('DON-2025-00007', 'DNR-2025-00005', 'BNK-2025-KL-00004', 'HC-2025-00009', '2026-02-03 18:30:00', 450, 'O-', '2026-03-06 10:29:11'),
('DON-2025-00008', 'DNR-2025-00006', 'BNK-2025-KL-00003', 'HC-2025-00010', '2024-08-09 18:30:00', 300, 'B-', '2026-03-06 10:29:11'),
('DON-2025-00009', 'DNR-2025-00006', 'BNK-2025-KL-00001', 'HC-2025-00011', '2025-12-04 18:30:00', 350, 'B-', '2026-03-06 10:29:11'),
('DON-2025-00010', 'DNR-2025-00007', 'BNK-2025-KL-00002', 'HC-2025-00012', '2025-11-05 18:30:00', 450, 'A-', '2026-03-06 10:29:11'),
('DON-2025-00011', 'DNR-2025-00009', 'BNK-2025-KL-00004', 'HC-2025-00013', '2026-01-04 18:30:00', 450, 'O+', '2026-03-06 10:29:11'),
('DON-2025-00012', 'DNR-2025-00010', 'BNK-2025-KL-00003', 'HC-2025-00015', '2025-09-06 18:30:00', 450, 'A+', '2026-03-06 10:29:11');

-- TABLE: donor
INSERT INTO `donor` (`donor_id`, `name`, `age`, `gender`, `blood_group`, `phone`, `city`, `last_donation_date`, `created_at`, `updated_at`, `is_deleted`) VALUES
('DNR-2025-00001', 'Arjun Nair', 28, 'Male', 'O+', '+91 94471 11111', 'Ernakulam', '2024-09-19 18:30:00', '2026-03-06 10:29:11', '2026-04-02 04:32:20', 0),
('DNR-2025-00002', 'Priya Menon', 23, 'Female', 'A+', '+91 94471 22222', 'Thiruvananthapuram', NULL, '2026-03-06 10:29:11', '2026-03-07 12:56:05', 0),
('DNR-2025-00003', 'Rahul Krishnan', 32, 'Male', 'B+', '+91 94471 33333', 'Thrissur', '2026-01-19 18:30:00', '2026-03-06 10:29:11', '2026-03-07 06:55:17', 0),
('DNR-2025-00004', 'Deepa Pillai', 27, 'Female', 'AB+', '+91 94471 44445', 'Kozhikode', '2025-11-30 18:30:00', '2026-03-06 10:29:11', '2026-03-07 12:40:26', 0),
('DNR-2025-00005', 'Vishnu Kumar', 35, 'Male', 'O-', '+91 94471 55555', 'Ernakulam', '2026-02-03 18:30:00', '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0),
('DNR-2025-00006', 'Anjali Thomas', 22, 'Female', 'B-', '+91 94471 66666', 'Thiruvananthapuram', '2025-12-04 18:30:00', '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0),
('DNR-2025-00007', 'Sreekanth Varma', 40, 'Male', 'A-', '+91 94471 77777', 'Thrissur', '2025-11-05 18:30:00', '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0),
('DNR-2025-00008', 'Meera Suresh', 29, 'Female', 'AB-', '+91 94471 88888', 'Kozhikode', NULL, '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0),
('DNR-2025-00009', 'Arun Babu', 38, 'Male', 'O+', '+91 94471 99999', 'Kollam', '2026-01-04 18:30:00', '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0),
('DNR-2025-00010', 'Neethu George', 26, 'Female', 'A+', '+91 94471 10101', 'Palakkad', '2025-09-06 18:30:00', '2026-03-06 10:29:11', '2026-03-06 10:29:11', 0);

-- TABLE: health_check
INSERT INTO `health_check` (`check_id`, `donor_id`, `check_date`, `weight`, `hemoglobin`, `blood_pressure`, `pulse`, `temperature`, `eligibility_status`, `deferred_reason`, `medical_notes`, `created_at`) VALUES
('HC-2025-00001', 'DNR-2025-00001', '2024-03-09 18:30:00', '74.00', '15.10', '122/80', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00002', 'DNR-2025-00001', '2024-06-19 18:30:00', '73.50', '14.80', '118/78', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00003', 'DNR-2025-00001', '2024-09-19 18:30:00', '75.00', '15.20', '120/80', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00004', 'DNR-2025-00002', '2025-01-04 18:30:00', '58.00', '13.20', '110/70', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00005', 'DNR-2025-00003', '2024-10-31 18:30:00', '82.00', '16.00', '124/82', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00006', 'DNR-2025-00003', '2026-01-19 18:30:00', '80.00', '15.80', '122/80', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00007', 'DNR-2025-00004', '2024-07-14 18:30:00', '55.00', '12.10', '108/68', 72, '36.6', 'Deferred', 'Low hemoglobin levels', NULL, '2026-03-06 10:29:11'),
('HC-2025-00008', 'DNR-2025-00004', '2025-11-30 18:30:00', '57.00', '13.00', '112/72', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00009', 'DNR-2025-00005', '2026-02-03 18:30:00', '88.00', '16.50', '128/84', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00010', 'DNR-2025-00006', '2024-08-09 18:30:00', '52.00', '12.80', '110/70', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00011', 'DNR-2025-00006', '2025-12-04 18:30:00', '53.00', '13.10', '112/72', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00012', 'DNR-2025-00007', '2025-11-05 18:30:00', '78.00', '14.90', '126/82', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00013', 'DNR-2025-00009', '2026-01-04 18:30:00', '85.00', '15.50', '120/78', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00014', 'DNR-2025-00010', '2024-05-31 18:30:00', '62.00', '13.80', '114/74', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11'),
('HC-2025-00015', 'DNR-2025-00010', '2025-09-06 18:30:00', '63.00', '14.00', '116/76', 72, '36.6', 'Eligible', NULL, NULL, '2026-03-06 10:29:11');

-- TABLE: hospital
INSERT INTO `hospital` (`hospital_id`, `hospital_name`, `city`, `contact_number`, `beds`, `status`, `created_at`, `updated_at`, `rejection_reason`, `is_deleted`) VALUES
('HSP-2025-KL-00001', 'KIMS Hospital', 'Thiruvananthapuram', '+91 471 340 1000', 649, 'Active', '2026-03-06 10:29:11', '2026-03-06 11:28:32', NULL, 0),
('HSP-2025-KL-00002', 'Lakeshore Hospital', 'Ernakulam', '+91 484 270 2000', 480, 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('HSP-2025-KL-00003', 'Jubilee Mission Hospital', 'Thrissur', '+91 487 242 3000', 350, 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('HSP-2025-KL-00004', 'Baby Memorial Hospital', 'Kozhikode', '+91 495 276 4000', 300, 'Active', '2026-03-06 10:29:11', '2026-03-06 10:29:11', NULL, 0),
('HSP-2025-KL-00005', 'Travancore Medical College', 'Kollam', '+91 474 274 5000', 200, 'Active', '2026-03-06 10:29:11', '2026-03-08 16:55:48', NULL, 0),
('HSP-2025-KL-00006', 'Palakkad District Hospital', 'Palakkad', '+91 491 505 6000', 180, 'Active', '2026-03-06 10:29:11', '2026-03-07 12:49:33', NULL, 0),
('HSP-2026-KL-YZZJ4', 'test.hosp@hema.health', 'Idukki', '9187044320', 105, 'Rejected', '2026-03-09 02:17:08', '2026-03-09 02:19:53', NULL, 0);

-- TABLE: notification
INSERT INTO `notification` (`notification_id`, `user_id`, `role`, `type`, `title`, `message`, `link`, `is_read`, `priority`, `created_at`, `read_at`) VALUES
('NOTIF-2025-001', 'USR-2025-00015', 'donor', 'eligibility_restored', 'You are eligible to donate!', 'Your 90-day cooling period is over. You can now save lives again.', '/donor/schedule', 0, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-002', 'USR-2025-00015', 'donor', 'donation_recorded', 'Donation successful', 'Thank you for donating 450ml of O+ blood at KIMS Blood Bank.', '/donor/donations', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-003', 'USR-2025-00015', 'donor', 'health_check_result', 'Health check recorded', 'Your recent health check shows you are in good condition.', '/donor/health-check', 0, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-004', 'USR-2025-00015', 'donor', 'recall_request', 'O+ Blood urgently needed', 'A critical shortage of O+ has been reported near your location.', '/donor/find-bank', 0, 'critical', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-005', 'USR-2025-00015', 'donor', 'badge_earned', 'New Badge Unlocked!', 'Congratulations! You earned the Bronze Donor badge.', '/donor/profile', 1, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-006', 'USR-2025-00009', 'hospital', 'request_processing', 'Request processing', 'Your request for 2U of B+ is being processed by KIMS Blood Bank.', '/hospital/requests', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-007', 'USR-2025-00009', 'hospital', 'request_approved', 'Request Approved', 'Your request for 2U of B+ has been approved.', '/hospital/requests', 0, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-008', 'USR-2025-00009', 'hospital', 'blood_issued', 'Blood Units Issued', 'KIMS Blood Bank has issued 2 units of B+ blood for your patient.', '/hospital/requests', 0, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-009', 'USR-2025-00009', 'hospital', 'payment_due', 'Payment pending', 'Payment of ₹1500 is pending for recent blood issues.', '/hospital/payments', 0, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-010', 'USR-2025-00009', 'hospital', 'payment_confirmed', 'Payment received', 'Thank you! Your payment of ₹1000 was successful.', '/hospital/payments', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-011', 'USR-2025-00003', 'bloodbank', 'emergency_request_received', 'EMERGENCY REQUEST', 'KIMS Hospital has raised an emergency request for 2U B+.', '/bloodbank/requests', 0, 'critical', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-012', 'USR-2025-00003', 'bloodbank', 'stock_critical', 'Low Stock Alert for B-', 'Your stock of B- is critically low (18 units).', '/bloodbank/inventory', 0, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-013', 'USR-2025-00003', 'bloodbank', 'new_request_received', 'New Routine Request', 'Lakeshore Hospital requested 1U O+.', '/bloodbank/requests', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-014', 'USR-2025-00003', 'bloodbank', 'donation_received', 'Donation Completed', 'Arjun Nair completed a 450ml O+ donation.', '/bloodbank/donations', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-015', 'USR-2025-00003', 'bloodbank', 'payment_received', 'Payment Processed', 'Received ₹1000 from KIMS Hospital.', '/bloodbank/payments', 0, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-016', 'USR-2025-00001', 'admin', 'new_hospital_registration', 'New Hospital Registration', 'Travancore Medical College is pending your approval.', '/admin/approvals', 0, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-017', 'USR-2025-00001', 'admin', 'new_blood_bank_registration', 'New Blood Bank Registration', 'Palakkad Blood Services is pending your approval.', '/admin/approvals', 0, 'high', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-018', 'USR-2025-00001', 'admin', 'critical_stock_statewide', 'Critical Shortage: O-', 'Statewide O- stock has dropped below 10%.', '/admin/inventory', 0, 'critical', '2026-03-07 11:12:59', NULL),
('NOTIF-2025-019', 'USR-2025-00001', 'admin', 'system_alert', 'System Maintenance Scheduled', 'Scheduled DB maintenance this Sunday at 2 AM.', '/admin/settings', 1, 'normal', '2026-03-07 11:12:59', NULL),
('NOTIF-MMGHZJBL-RUT4', 'USR-2025-00009', 'hospital', 'request_approved', 'Request Approved', 'Your request for 3U A+ has been approved by the blood bank.', '/hospital/requests', 0, 'high', '2026-03-07 15:48:11', NULL),
('NOTIF-MMGHZR0C-XZ80', 'USR-2025-00009', 'hospital', 'blood_issued', 'Blood Units Issued', '3 units of A+ blood have been issued for your patient.', '/hospital/requests', 0, 'normal', '2026-03-07 15:48:21', NULL),
('NOTIF-MMGHZR0K-2209', 'USR-2025-00009', 'hospital', 'payment_due', 'Payment Pending', 'Please complete the payment for the recently issued A+ blood.', '/hospital/payments', 0, 'high', '2026-03-07 15:48:21', NULL),
('NOTIF-MN7B8WAC-6ONX', 'USR-2025-00006', 'bloodbank', 'new_request_received', 'New Routine Request', 'You have received a request for 2U A+ from a registered hospital.', '/bloodbank/requests', 0, 'normal', '2026-03-26 10:09:17', NULL),
('NOTIF-MN7BI4G0-424S', 'USR-2025-00009', 'hospital', 'request_approved', 'Request Approved', 'Your request for 2U A+ has been approved by the blood bank.', '/hospital/requests', 0, 'high', '2026-03-26 10:16:28', NULL),
('NOTIF-MN7BJDO1-JLE5', 'USR-2025-00009', 'hospital', 'blood_issued', 'Blood Units Issued', '2 units of A+ blood have been issued for your patient.', '/hospital/requests', 0, 'normal', '2026-03-26 10:17:27', NULL),
('NOTIF-MN7BJDOC-R2Y6', 'USR-2025-00009', 'hospital', 'payment_due', 'Payment Pending', 'Please complete the payment for the recently issued A+ blood.', '/hospital/payments', 0, 'high', '2026-03-26 10:17:27', NULL),
('NOTIF-MNG972DZ-9WGM', 'USR-2025-00015', 'donor', 'appointment_update', 'Appointment Updated', 'Your appointment on Sat Apr 04 2026 00:00:00 GMT+0530 (India Standard Time) has been fulfilled.', '/donor/schedule', 0, 'normal', '2026-04-01 16:21:48', NULL),
('NOTIF-MNGYYD60-6DXQ', 'USR-2025-00011', 'hospital', 'request_approved', 'Request Approved', 'Your request for 1U B+ has been approved by the blood bank.', '/hospital/requests', 0, 'high', '2026-04-02 04:22:52', NULL),
('NOTIF-MNH2D58I-1E6N', 'USR-2025-00015', 'donor', 'camp_rsvp', 'RSVP Confirmed', 'You''ve joined KMS Camp on Fri Apr 03 2026 00:00:00 GMT+0530 (India Standard Time). See you there!', '/donor/camps', 0, 'normal', '2026-04-02 05:58:21', NULL),
('NOTIF-MNN6ZLAE-XBO0', 'USR-2025-00015', 'donor', 'camp_rsvp', 'RSVP Confirmed', 'You''ve joined BB Drive on Thu Apr 09 2026 00:00:00 GMT+0530 (India Standard Time). See you there!', '/donor/camps', 0, 'normal', '2026-04-06 12:54:24', NULL),
('NOTIF-MNQC4HKJ-DPMP', 'USR-2025-00010', 'hospital', 'blood_issued', 'Blood Units Issued', '2 units of B- blood have been issued for your patient.', '/hospital/requests', 0, 'normal', '2026-04-08 17:41:29', NULL),
('NOTIF-MNQC4HKV-H0XJ', 'USR-2025-00010', 'hospital', 'payment_due', 'Payment Pending', 'Please complete the payment for the recently issued B- blood.', '/hospital/payments', 0, 'high', '2026-04-08 17:41:29', NULL),
('NTF-1775739807167', 'USR-2025-00015', 'donor', 'Reminder', 'Donation Reminder', 'Hello Arjun Nair, your help is needed! You are currently eligible to donate. Please visit your nearest blood bank.', NULL, 0, 'normal', '2026-04-09 13:03:27', NULL),
('NTF-1775742248362', 'USR-2025-00018', 'donor', 'Reminder', 'Donation Reminder', 'Hello Deepa Pillai, your help is needed! You are currently eligible to donate. Please visit your nearest blood bank.', NULL, 0, 'normal', '2026-04-09 13:44:08', NULL);

-- TABLE: patient
INSERT INTO `patient` (`patient_id`, `hospital_id`, `name`, `age`, `gender`, `blood_group`, `ward`, `admitted_on`, `status`, `created_at`) VALUES
('PAT-2025-00001', 'HSP-2025-KL-00001', 'Rajan Pillai', 58, 'Male', 'B+', 'Cardiac ICU', '2026-02-28 18:30:00', 'Critical', '2026-03-06 10:29:11'),
('PAT-2025-00002', 'HSP-2025-KL-00001', 'Suma Krishnan', 34, 'Female', 'O+', 'Maternity', '2026-03-03 18:30:00', 'Stable', '2026-03-06 10:29:11'),
('PAT-2025-00003', 'HSP-2025-KL-00001', 'Manoj Thomas', 45, 'Male', 'A+', 'Surgery', '2026-02-25 18:30:00', 'Admitted', '2026-03-06 10:29:11'),
('PAT-2025-00004', 'HSP-2025-KL-00001', 'Lekha Nair', 62, 'Female', 'AB+', 'General Ward', '2026-02-18 18:30:00', 'Discharged', '2026-03-06 10:29:11'),
('PAT-2025-00005', 'HSP-2025-KL-00002', 'Suresh Babu', 41, 'Male', 'O-', 'Orthopaedics', '2026-03-02 18:30:00', 'Admitted', '2026-03-06 10:29:11'),
('PAT-2025-00006', 'HSP-2025-KL-00002', 'Asha Varma', 28, 'Female', 'B-', 'Surgery', '2026-03-04 18:30:00', 'Critical', '2026-03-06 10:29:11'),
('PAT-2025-00007', 'HSP-2025-KL-00002', 'Binu Mathew', 55, 'Male', 'A+', 'Neurology', '2026-02-26 18:30:00', 'Stable', '2026-03-06 10:29:11'),
('PAT-2025-00008', 'HSP-2025-KL-00003', 'Geetha Menon', 48, 'Female', 'O+', 'Gynaecology', '2026-03-01 18:30:00', 'Admitted', '2026-03-06 10:29:11'),
('PAT-2025-00009', 'HSP-2025-KL-00003', 'Saji Kurian', 37, 'Male', 'B+', 'General Ward', '2026-02-23 18:30:00', 'Stable', '2026-03-06 10:29:11'),
('PAT-2025-00010', 'HSP-2025-KL-00003', 'Moly Abraham', 67, 'Female', 'A-', 'Cardiac ICU', '2026-03-03 18:30:00', 'Critical', '2026-03-06 10:29:11'),
('PAT-2025-00011', 'HSP-2025-KL-00004', 'Anoop Nambiar', 30, 'Male', 'AB-', 'Trauma', '2026-03-05 18:30:00', 'Critical', '2026-03-06 10:29:11'),
('PAT-2025-00012', 'HSP-2025-KL-00004', 'Preethi Raj', 25, 'Female', 'O+', 'Maternity', '2026-03-02 18:30:00', 'Stable', '2026-03-06 10:29:11');

-- TABLE: payment
INSERT INTO `payment` (`payment_id`, `hospital_id`, `bank_id`, `request_id`, `amount`, `payment_date`, `payment_status`, `created_at`) VALUES
('PAY-2025-00001', 'HSP-2025-KL-00001', 'BNK-2025-KL-00001', 'REQ-2025-00001', '1000.00', '2026-03-03 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00002', 'HSP-2025-KL-00001', 'BNK-2025-KL-00002', 'REQ-2025-00002', '500.00', '2026-03-05 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00003', 'HSP-2025-KL-00001', 'BNK-2025-KL-00001', 'REQ-2025-00003', '1500.00', '2026-03-06 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00004', 'HSP-2025-KL-00002', 'BNK-2025-KL-00001', 'REQ-2025-00004', '1000.00', '2026-03-04 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00005', 'HSP-2025-KL-00002', 'BNK-2025-KL-00002', 'REQ-2025-00005', '1000.00', NULL, 'Pending', '2026-03-06 10:29:11'),
('PAY-2025-00006', 'HSP-2025-KL-00002', 'BNK-2025-KL-00003', 'REQ-2025-00006', '500.00', NULL, 'Pending', '2026-03-06 10:29:11'),
('PAY-2025-00007', 'HSP-2025-KL-00003', 'BNK-2025-KL-00003', 'REQ-2025-00007', '1000.00', '2026-04-07 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00008', 'HSP-2025-KL-00003', 'BNK-2025-KL-00001', 'REQ-2025-00008', '500.00', NULL, 'Pending', '2026-03-06 10:29:11'),
('PAY-2025-00009', 'HSP-2025-KL-00003', 'BNK-2025-KL-00002', 'REQ-2025-00009', '1000.00', NULL, 'Pending', '2026-03-06 10:29:11'),
('PAY-2025-00010', 'HSP-2025-KL-00004', 'BNK-2025-KL-00004', 'REQ-2025-00010', '1500.00', '2026-03-06 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00011', 'HSP-2025-KL-00004', 'BNK-2025-KL-00004', 'REQ-2025-00011', '500.00', '2026-03-06 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2025-00012', 'HSP-2025-KL-00004', 'BNK-2025-KL-00004', 'REQ-2025-00014', '1000.00', '2026-03-06 18:30:00', 'Paid', '2026-03-06 10:29:11'),
('PAY-2026-D7ATV', 'HSP-2025-KL-00001', 'BNK-2025-KL-00004', 'REQ-2026-JBDPG', '1000.00', '2026-03-25 18:30:00', 'Paid', '2026-03-26 10:09:17'),
('PAY-2026-RAPTI', 'HSP-2025-KL-00001', 'BNK-2025-KL-00001', 'REQ-2026-2MNUU', '500.00', '2026-03-05 18:30:00', 'Paid', '2026-03-06 11:29:14');

-- TABLE: system_settings
INSERT INTO `system_settings` (`key`, `value`, `updated_at`) VALUES
('critical_sms', 'false', '2026-04-09 15:24:23'),
('daily_reports', 'true', '2026-04-09 15:24:23'),
('data_retention_days', '365', '2026-04-09 15:24:23'),
('email_alerts', 'true', '2026-04-09 15:24:23'),
('ip_whitelist', '127.0.0.1, 10.0.0.1', '2026-04-09 15:24:23'),
('maintenance_mode', 'false', '2026-04-09 15:24:23'),
('max_login_attempts', '5', '2026-04-09 15:24:23'),
('registration_open', 'true', '2026-04-09 15:24:23'),
('require_2fa', 'false', '2026-04-09 15:24:23'),
('session_timeout', '30', '2026-04-09 15:24:23'),
('stock_warnings', 'true', '2026-04-09 15:24:23'),
('system_name', 'HEM∆ Blood Management System', '2026-04-09 15:24:23');

-- TABLE: users
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `phone`, `role`, `entity_id`, `is_active`, `is_approved`, `otp`, `otp_expires`, `created_at`, `last_login`, `login_attempts`, `lock_until`) VALUES
('USR-2025-00001', 'admin@hema.health', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00001', 'admin', NULL, 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 14:31:44', 0, NULL),
('USR-2025-00002', 'regional@hema.health', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00002', 'admin', NULL, 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-09 12:17:12', 0, NULL),
('USR-2025-00003', 'admin@kimsbank.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00003', 'bloodbank', 'BNK-2025-KL-00001', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-01 15:23:34', 0, NULL),
('USR-2025-00004', 'admin@lakeshore.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00004', 'bloodbank', 'BNK-2025-KL-00002', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 15:20:54', 0, NULL),
('USR-2025-00005', 'admin@thrissurredcross.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00005', 'bloodbank', 'BNK-2025-KL-00003', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 14:59:52', 0, NULL),
('USR-2025-00006', 'admin@kozhikodebank.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00006', 'bloodbank', 'BNK-2025-KL-00004', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 14:31:00', 0, NULL),
('USR-2025-00007', 'admin@kollambank.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00007', 'bloodbank', 'BNK-2025-KL-00005', 1, 1, NULL, NULL, '2026-03-06 10:29:11', NULL, 0, NULL),
('USR-2025-00009', 'admin@kims.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00009', 'hospital', 'HSP-2025-KL-00001', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-03-26 10:08:31', 0, NULL),
('USR-2025-00010', 'admin@lakehosp.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00010', 'hospital', 'HSP-2025-KL-00002', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 12:06:39', 0, NULL),
('USR-2025-00011', 'admin@jubilee.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00011', 'hospital', 'HSP-2025-KL-00003', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 12:08:57', 0, NULL),
('USR-2025-00012', 'admin@babymemorial.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00012', 'hospital', 'HSP-2025-KL-00004', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 15:35:39', 0, NULL),
('USR-2025-00013', 'admin@travmed.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00013', 'hospital', 'HSP-2025-KL-00005', 1, 1, NULL, NULL, '2026-03-06 10:29:11', NULL, 0, NULL),
('USR-2025-00014', 'admin@palakkadhosp.in', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 98001 00014', 'hospital', 'HSP-2025-KL-00006', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-03-07 12:15:11', 0, NULL),
('USR-2025-00015', 'arjun@gmail.com', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 94471 11111', 'donor', 'DNR-2025-00001', 1, 1, '417416', '2026-04-08 11:21:11', '2026-03-06 10:29:11', '2026-04-06 13:21:51', 0, NULL),
('USR-2025-00016', 'priya@gmail.com', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 94471 22222', 'donor', 'DNR-2025-00002', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-03-07 12:55:43', 0, NULL),
('USR-2025-00017', 'rahul@gmail.com', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 94471 33333', 'donor', 'DNR-2025-00003', 1, 1, '510622', '2026-04-08 11:50:00', '2026-03-06 10:29:11', '2026-04-08 11:38:47', 0, NULL),
('USR-2025-00018', 'deepa@gmail.com', '$2b$10$e8ja.hJQJrXkZeNdEhGQJ.8TUMCN.DvmHIYWPrK58lOTCiB/FQe0C', '+91 94471 44445', 'donor', 'DNR-2025-00004', 1, 1, NULL, NULL, '2026-03-06 10:29:11', '2026-04-08 11:19:13', 0, NULL),
('USR-2026-PFYR8', 'maxy@gmail.com', '$2b$10$UY/D64pvyOjt9t8ZxFGoD.zzsCswiadPT0F7OohZBOnRu54kzuRg2', '+91 97845 61230', 'hospital', 'HSP-2026-KL-YZZJ4', 0, 0, NULL, NULL, '2026-03-09 02:17:08', NULL, 0, NULL);


-- Table structure for table `blood_bank_donor`
INSERT IGNORE INTO `blood_bank_donor` (bank_id, donor_id, created_at)
SELECT bank_id, donor_id, MIN(created_at) FROM donation_record GROUP BY bank_id, donor_id;

INSERT IGNORE INTO `blood_bank_donor` (bank_id, donor_id, created_at)
SELECT bank_id, donor_id, MIN(created_at) FROM appointment GROUP BY bank_id, donor_id;
