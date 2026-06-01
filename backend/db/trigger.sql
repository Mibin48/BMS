-- ═══════════════════════════════════════════
-- HEM∆ Blood Management System — Advanced Triggers
-- ═══════════════════════════════════════════

USE bms;

DELIMITER $$

-- ─────────────────────────────────────
-- TRIGGER: after_blood_issue_insert
-- 1. Decrements Blood_Stock
-- 2. Updates Blood_Request status to 'Fulfilled'
-- 3. Automatically generates a Pending Payment
-- 4. Sends Notification to Hospital
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_blood_issue_insert`$$
CREATE TRIGGER `after_blood_issue_insert` 
AFTER INSERT ON `blood_issue` 
FOR EACH ROW 
BEGIN
  DECLARE v_bank_id     VARCHAR(25);
  DECLARE v_hosp_id     VARCHAR(25);
  DECLARE v_blood_group VARCHAR(5);
  DECLARE v_user_id     VARCHAR(25);

  -- Get Request metadata
  SELECT bank_id, hospital_id, blood_group
    INTO v_bank_id, v_hosp_id, v_blood_group
    FROM blood_request
   WHERE request_id = NEW.request_id;

  -- 1. Update Inventory
  UPDATE blood_stock
     SET available_units = GREATEST(available_units - NEW.units_issued, 0),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id = v_bank_id
     AND blood_group = v_blood_group;

  -- 2. Complete Request
  UPDATE blood_request
     SET status = 'Fulfilled',
         updated_at = CURRENT_TIMESTAMP
   WHERE request_id = NEW.request_id;

  -- 3. Generate Payment (₹500 Base Price per Unit)
  INSERT IGNORE INTO payment (payment_id, hospital_id, bank_id, request_id, amount, payment_status, created_at)
  VALUES (
    CONCAT('PAY-TRG-', LEFT(REPLACE(UUID(), '-', ''), 17)),
    v_hosp_id,
    v_bank_id,
    NEW.request_id,
    NEW.units_issued * 500.00,
    'Pending',
    CURRENT_TIMESTAMP
  );

  -- 4. Notify Hospital User
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = v_hosp_id AND role = 'hospital' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'hospital',
      'blood_issued',
      'Blood Units Issued',
      CONCAT(NEW.units_issued, ' units of ', v_blood_group, ' blood have been issued. Payment is pending.'),
      '/hospital/requests',
      'high',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_donation_insert
-- 1. Increments Blood_Stock
-- 2. Updates Donor's last donation date
-- 3. Automatically fulfills any scheduled appointment for that day
-- 4. Sends Notification to Donor
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_donation_insert`$$
CREATE TRIGGER `after_donation_insert` 
AFTER INSERT ON `donation_record` 
FOR EACH ROW 
BEGIN
  DECLARE v_units   INT;
  DECLARE v_user_id VARCHAR(25);

  -- Standard unit conversion (approx 450ml = 1 unit)
  SET v_units = FLOOR(NEW.quantity_ml / 400);
  IF v_units < 1 THEN SET v_units = 1; END IF;

  -- 1. Update Stock
  UPDATE blood_stock
     SET available_units = LEAST(available_units + v_units, capacity),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id = NEW.bank_id
     AND blood_group = NEW.blood_group;

  -- 2. Update Donor Profile
  UPDATE donor
     SET last_donation_date = NEW.donation_date,
         updated_at = CURRENT_TIMESTAMP
   WHERE donor_id = NEW.donor_id;

  -- Link donor to the blood bank
  INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id, created_at)
  VALUES (NEW.bank_id, NEW.donor_id, CURRENT_TIMESTAMP);

  -- 3. Fulfill matched appointment
  UPDATE appointment
     SET status = 'Fulfilled',
         updated_at = CURRENT_TIMESTAMP
   WHERE donor_id = NEW.donor_id
     AND bank_id  = NEW.bank_id
     AND status IN ('Scheduled', 'Confirmed')
     AND appointment_date = NEW.donation_date;

  -- 4. Notify Donor
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = NEW.donor_id AND role = 'donor' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'donor',
      'donation_recorded',
      'Donation Successful',
      CONCAT('Thank you for donating ', NEW.quantity_ml, 'ml of ', NEW.blood_group, '. You are a hero!'),
      '/donor/donations',
      'normal',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_blood_request_insert
-- 1. Notifies Blood Bank of new request
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_blood_request_insert`$$
CREATE TRIGGER `after_blood_request_insert`
AFTER INSERT ON `blood_request`
FOR EACH ROW
BEGIN
  DECLARE v_user_id VARCHAR(25);
  
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = NEW.bank_id AND role = 'bloodbank' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'bloodbank',
      'new_request',
      IF(NEW.priority = 'Emergency', 'EMERGENCY REQUEST', 'New Blood Request'),
      CONCAT('Received a ', NEW.priority, ' request for ', NEW.units_required, ' units of ', NEW.blood_group, '.'),
      '/bloodbank/requests',
      IF(NEW.priority = 'Emergency', 'critical', 'normal'),
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_blood_stock_update
-- 1. Low stock detection
-- 2. Sends Critical Notification if units drop below 10% capacity
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_blood_stock_update`$$
CREATE TRIGGER `after_blood_stock_update`
AFTER UPDATE ON `blood_stock`
FOR EACH ROW
BEGIN
  DECLARE v_user_id VARCHAR(25);
  
  -- Alert only if stock drops below 10% and it wasn't already below it (prevent spam)
  IF (NEW.available_units < (NEW.capacity * 0.10)) AND (OLD.available_units >= (NEW.capacity * 0.10)) THEN
    SELECT user_id INTO v_user_id FROM users WHERE entity_id = NEW.bank_id AND role = 'bloodbank' LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
      VALUES (
        CONCAT('NTF-', REPLACE(UUID(), '-', '')),
        v_user_id,
        'bloodbank',
        'stock_critical',
        CONCAT('Critical Stock: ', NEW.blood_group),
        CONCAT('Your units for ', NEW.blood_group, ' have dropped to ', NEW.available_units, '. Please restock soon.'),
        '/inventory',
        'critical',
        CURRENT_TIMESTAMP
      );
    END IF;
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_hospital_status_update
-- 1. Logs status changes to audit table
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_hospital_status_update`$$
CREATE TRIGGER `after_hospital_status_update`
AFTER UPDATE ON `hospital`
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO audit_log (log_id, action, entity, entity_id, detail, severity, created_at)
    VALUES (
      CONCAT('LOG-TRG-', LEFT(REPLACE(UUID(), '-', ''), 17)),
      'STATUS_CHANGE',
      'Hospital',
      NEW.hospital_id,
      CONCAT('Hospital status changed from ', OLD.status, ' to ', NEW.status),
      IF(NEW.status IN ('Suspended', 'Rejected', 'Deleted'), 'Warning', 'Info'),
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_user_status_update
-- 1. Logs security audit for user activation/deactivation
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_user_status_update`$$
CREATE TRIGGER `after_user_status_update`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
  IF OLD.is_active <> NEW.is_active OR OLD.is_approved <> NEW.is_approved THEN
    INSERT INTO audit_log (log_id, action, entity, entity_id, detail, severity, created_at)
    VALUES (
      CONCAT('LOG-TRG-', LEFT(REPLACE(UUID(), '-', ''), 17)),
      'SECURITY_UPDATE',
      'Users',
      NEW.user_id,
      CONCAT('User security state changed. Active: ', OLD.is_active, '->', NEW.is_active, ', Approved: ', OLD.is_approved, '->', NEW.is_approved),
      'Warning',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_appointment_insert
-- 1. Notifies bank of new booking
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_appointment_insert`$$
CREATE TRIGGER `after_appointment_insert`
AFTER INSERT ON `appointment`
FOR EACH ROW
BEGIN
  DECLARE v_user_id VARCHAR(25);
  DECLARE v_donor_name VARCHAR(100);

  SELECT name INTO v_donor_name FROM donor WHERE donor_id = NEW.donor_id;
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = NEW.bank_id AND role = 'bloodbank' LIMIT 1;

  -- Link donor to the blood bank
  INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id, created_at)
  VALUES (NEW.bank_id, NEW.donor_id, CURRENT_TIMESTAMP);
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'bloodbank',
      'new_appointment',
      'New Appointment Booked',
      CONCAT(v_donor_name, ' has booked an appointment for ', NEW.appointment_date, ' at ', NEW.appointment_time, '.'),
      '/bloodbank/appointments',
      'normal',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_blood_bank_status_update
-- 1. Logs status changes to audit table
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_blood_bank_status_update`$$
CREATE TRIGGER `after_blood_bank_status_update`
AFTER UPDATE ON `blood_bank`
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO audit_log (log_id, action, entity, entity_id, detail, severity, created_at)
    VALUES (
      CONCAT('LOG-TRG-', LEFT(REPLACE(UUID(), '-', ''), 17)),
      'STATUS_CHANGE',
      'Blood_Bank',
      NEW.bank_id,
      CONCAT('Blood Bank status changed from ', OLD.status, ' to ', NEW.status),
      IF(NEW.status IN ('Suspended', 'Rejected', 'Deleted'), 'Warning', 'Info'),
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_health_check_insert
-- 1. Notifies donor of check result
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_health_check_insert`$$
CREATE TRIGGER `after_health_check_insert`
AFTER INSERT ON `health_check`
FOR EACH ROW
BEGIN
  DECLARE v_user_id VARCHAR(25);
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = NEW.donor_id AND role = 'donor' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'donor',
      'health_check_result',
      IF(NEW.eligibility_status = 'Eligible', 'Health Check Passed', 'Health Check Deferred'),
      IF(NEW.eligibility_status = 'Eligible', 
         'Your health check was successful. You are eligible to donate!', 
         CONCAT('Your donation is deferred: ', NEW.deferred_reason)),
      '/donor/health-check',
      IF(NEW.eligibility_status = 'Eligible', 'normal', 'high'),
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

-- ─────────────────────────────────────
-- TRIGGER: after_camp_rsvp_insert
-- 1. Notifies bank of new RSVP
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS `after_camp_rsvp_insert`$$
CREATE TRIGGER `after_camp_rsvp_insert`
AFTER INSERT ON `camp_rsvp`
FOR EACH ROW
BEGIN
  DECLARE v_bank_id VARCHAR(25);
  DECLARE v_user_id VARCHAR(25);
  DECLARE v_donor_name VARCHAR(100);

  SELECT bank_id INTO v_bank_id FROM blood_camp WHERE camp_id = NEW.camp_id;
  SELECT name INTO v_donor_name FROM donor WHERE donor_id = NEW.donor_id;
  SELECT user_id INTO v_user_id FROM users WHERE entity_id = v_bank_id AND role = 'bloodbank' LIMIT 1;

  -- Link donor to the blood bank hosting the camp
  INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id, created_at)
  VALUES (v_bank_id, NEW.donor_id, CURRENT_TIMESTAMP);
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notification (notification_id, user_id, role, type, title, message, link, priority, created_at)
    VALUES (
      CONCAT('NTF-', REPLACE(UUID(), '-', '')),
      v_user_id,
      'bloodbank',
      'camp_rsvp',
      'New Camp RSVP',
      CONCAT(v_donor_name, ' has RSVPed for your upcoming camp.'),
      '/bloodbank/camps',
      'low',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

DELIMITER ;
