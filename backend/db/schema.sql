-- ═══════════════════════════════════════════
-- HEM∆ Blood Management System — Modernized Schema
-- Database: Blood_Management_System
-- ═══════════════════════════════════════════

-- CREATE DATABASE IF NOT EXISTS Blood_Management_System;
-- USE Blood_Management_System;
use bms;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────
-- TABLE: appointment
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `appointment`;
CREATE TABLE `appointment` (
  `appointment_id` varchar(25) NOT NULL,
  `donor_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(20) NOT NULL,
  `status` enum('Scheduled','Confirmed','Fulfilled','Cancelled','No-show') DEFAULT 'Scheduled',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `donor_id` (`donor_id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donor` (`donor_id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: audit_log
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log` (
  `log_id` varchar(25) NOT NULL,
  `user_id` varchar(25) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `action` varchar(30) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` varchar(25) DEFAULT NULL,
  `detail` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `severity` enum('Info','Warning','Critical') DEFAULT 'Info',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_severity` (`severity`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_bank
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_bank`;
CREATE TABLE `blood_bank` (
  `bank_id` varchar(25) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `naco_number` varchar(30) DEFAULT NULL,
  `license_number` varchar(30) DEFAULT NULL,
  `storage_capacity` int DEFAULT '1000',
  `operating_hours` varchar(50) DEFAULT NULL,
  `status` enum('Active','Pending','Suspended','Rejected','Deleted') DEFAULT 'Pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rejection_reason` text,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `naco_number` (`naco_number`),
  UNIQUE KEY `license_number` (`license_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_camp
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_camp`;
CREATE TABLE `blood_camp` (
  `camp_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `camp_name` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `city` varchar(50) NOT NULL,
  `camp_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `description` text,
  `status` enum('Scheduled','Active','Completed','Cancelled') DEFAULT 'Scheduled',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`camp_id`),
  KEY `fk_camp_bank` (`bank_id`),
  CONSTRAINT `fk_camp_bank` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_issue
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_issue`;
CREATE TABLE `blood_issue` (
  `issue_id` varchar(25) NOT NULL,
  `request_id` varchar(25) NOT NULL,
  `issue_date` date NOT NULL,
  `units_issued` int NOT NULL,
  `status` varchar(20) DEFAULT 'Dispatched',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `blood_issue_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `blood_request` (`request_id`),
  CONSTRAINT `blood_issue_chk_1` CHECK ((`units_issued` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_request
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_request`;
CREATE TABLE `blood_request` (
  `request_id` varchar(25) NOT NULL,
  `hospital_id` varchar(25) NOT NULL,
  `patient_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
  `units_required` int NOT NULL,
  `request_date` date NOT NULL,
  `status` enum('Pending','Processing','Fulfilled','Cancelled') DEFAULT 'Pending',
  `priority` enum('Emergency','Urgent','Routine') DEFAULT 'Routine',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `patient_id` (`patient_id`),
  KEY `idx_request_status` (`status`,`priority`),
  KEY `idx_request_hospital` (`hospital_id`),
  KEY `idx_request_bank` (`bank_id`),
  CONSTRAINT `blood_request_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`hospital_id`),
  CONSTRAINT `blood_request_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `blood_request_ibfk_3` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`),
  CONSTRAINT `blood_request_chk_1` CHECK ((`units_required` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_stock
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_stock`;
CREATE TABLE `blood_stock` (
  `stock_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
  `available_units` int NOT NULL DEFAULT '0',
  `capacity` int NOT NULL DEFAULT '200',
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `unique_bank_group` (`bank_id`,`blood_group`),
  KEY `idx_stock_bank_group` (`bank_id`,`blood_group`),
  CONSTRAINT `blood_stock_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: camp_rsvp
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `camp_rsvp`;
CREATE TABLE `camp_rsvp` (
  `rsvp_id` varchar(30) NOT NULL,
  `camp_id` varchar(25) NOT NULL,
  `donor_id` varchar(25) NOT NULL,
  `status` enum('Interested','Going','Attended','Cancelled') DEFAULT 'Going',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rsvp_id`),
  UNIQUE KEY `unique_donor_camp` (`camp_id`,`donor_id`),
  KEY `fk_rsvp_donor` (`donor_id`),
  CONSTRAINT `fk_rsvp_camp` FOREIGN KEY (`camp_id`) REFERENCES `blood_camp` (`camp_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rsvp_donor` FOREIGN KEY (`donor_id`) REFERENCES `donor` (`donor_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: donation_record
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `donation_record`;
CREATE TABLE `donation_record` (
  `donation_id` varchar(25) NOT NULL,
  `donor_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `check_id` varchar(25) NOT NULL,
  `donation_date` date NOT NULL,
  `quantity_ml` int NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`donation_id`),
  UNIQUE KEY `check_id` (`check_id`),
  KEY `bank_id` (`bank_id`),
  KEY `idx_donation_donor` (`donor_id`),
  CONSTRAINT `donation_record_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donor` (`donor_id`),
  CONSTRAINT `donation_record_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`),
  CONSTRAINT `donation_record_ibfk_3` FOREIGN KEY (`check_id`) REFERENCES `health_check` (`check_id`),
  CONSTRAINT `donation_record_chk_1` CHECK (((`quantity_ml` >= 100) and (`quantity_ml` <= 450)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: donor
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `donor`;
CREATE TABLE `donor` (
  `donor_id` varchar(25) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
  `phone` varchar(20) NOT NULL,
  `city` varchar(50) NOT NULL,
  `last_donation_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`donor_id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_donor_blood_group` (`blood_group`),
  KEY `idx_donor_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: health_check
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `health_check`;
CREATE TABLE `health_check` (
  `check_id` varchar(25) NOT NULL,
  `donor_id` varchar(25) NOT NULL,
  `check_date` date NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `hemoglobin` decimal(4,2) NOT NULL,
  `blood_pressure` varchar(10) NOT NULL,
  `pulse` int DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `eligibility_status` enum('Eligible','Deferred','Cooling') NOT NULL,
  `deferred_reason` varchar(255) DEFAULT NULL,
  `medical_notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`check_id`),
  KEY `idx_healthcheck_donor` (`donor_id`),
  CONSTRAINT `health_check_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donor` (`donor_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: hospital
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `hospital`;
CREATE TABLE `hospital` (
  `hospital_id` varchar(25) NOT NULL,
  `hospital_name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `beds` int DEFAULT '0',
  `status` enum('Active','Pending','Suspended','Rejected','Deleted') DEFAULT 'Pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rejection_reason` text,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`hospital_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: notification
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `notification_id` varchar(50) NOT NULL,
  `user_id` varchar(30) NOT NULL,
  `role` enum('donor','hospital','bloodbank','admin') NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(200) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `priority` enum('low','normal','high','critical') DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_unread` (`user_id`,`is_read`,`created_at`),
  KEY `idx_role_type` (`role`,`type`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: patient
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `patient`;
CREATE TABLE `patient` (
  `patient_id` varchar(25) NOT NULL,
  `hospital_id` varchar(25) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` enum('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
  `ward` varchar(50) DEFAULT NULL,
  `admitted_on` date DEFAULT (curdate()),
  `status` enum('Admitted','Stable','Critical','Discharged') DEFAULT 'Admitted',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  KEY `hospital_id` (`hospital_id`),
  CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`hospital_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: payment
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `payment_id` varchar(25) NOT NULL,
  `hospital_id` varchar(25) NOT NULL,
  `bank_id` varchar(25) NOT NULL,
  `request_id` varchar(25) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_status` enum('Paid','Pending','Overdue') DEFAULT 'Pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `request_id` (`request_id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `bank_id` (`bank_id`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`hospital_id`),
  CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`),
  CONSTRAINT `payment_ibfk_3` FOREIGN KEY (`request_id`) REFERENCES `blood_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: system_settings
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` varchar(25) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('donor','hospital','bloodbank','admin') NOT NULL,
  `entity_id` varchar(25) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '0',
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `lock_until` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────
-- TABLE: blood_bank_donor
-- ─────────────────────────────────────
DROP TABLE IF EXISTS `blood_bank_donor`;
CREATE TABLE `blood_bank_donor` (
  `bank_id` varchar(25) NOT NULL,
  `donor_id` varchar(25) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bank_id`, `donor_id`),
  CONSTRAINT `fk_bb_donor_bank` FOREIGN KEY (`bank_id`) REFERENCES `blood_bank` (`bank_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bb_donor_donor` FOREIGN KEY (`donor_id`) REFERENCES `donor` (`donor_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════

DELIMITER $$

DROP TRIGGER IF EXISTS `after_blood_issue_insert`$$
CREATE TRIGGER `after_blood_issue_insert` AFTER INSERT ON `blood_issue` FOR EACH ROW BEGIN
  DECLARE v_bank_id     VARCHAR(25);
  DECLARE v_blood_group VARCHAR(5);

  SELECT bank_id, blood_group
    INTO v_bank_id, v_blood_group
    FROM blood_request
   WHERE request_id = NEW.request_id;

  UPDATE blood_stock
     SET available_units = GREATEST(
           available_units - NEW.units_issued, 0
         ),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id    = v_bank_id
     AND blood_group = v_blood_group;

  UPDATE blood_request
     SET status     = 'Fulfilled',
         updated_at = CURRENT_TIMESTAMP
   WHERE request_id = NEW.request_id;
END$$

DROP TRIGGER IF EXISTS `after_donation_insert`$$
CREATE TRIGGER `after_donation_insert` AFTER INSERT ON `donation_record` FOR EACH ROW BEGIN
  DECLARE v_units INT;

  SET v_units = FLOOR(NEW.quantity_ml / 450);
  IF v_units < 1 THEN SET v_units = 1; END IF;

  UPDATE blood_stock
     SET available_units = LEAST(
           available_units + v_units,
           capacity
         ),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id    = NEW.bank_id
     AND blood_group = NEW.blood_group;

  UPDATE donor
     SET last_donation_date = NEW.donation_date,
         updated_at         = CURRENT_TIMESTAMP
   WHERE donor_id = NEW.donor_id;

  INSERT IGNORE INTO `blood_bank_donor` (bank_id, donor_id, created_at)
  VALUES (NEW.bank_id, NEW.donor_id, CURRENT_TIMESTAMP);
END$$

DELIMITER ;
