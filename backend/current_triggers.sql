[dotenv@17.3.1] injecting env (20) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2

-- ═══════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════

DELIMITER $$

CREATE TRIGGER `after_blood_issue_insert` 
AFTER INSERT ON `Blood_Issue` 
FOR EACH ROW 
DECLARE v_bank_id     VARCHAR(25);
  DECLARE v_blood_group VARCHAR(5);

  SELECT bank_id, blood_group
    INTO v_bank_id, v_blood_group
    FROM Blood_Request
   WHERE request_id = NEW.request_id;

  UPDATE Blood_Stock
     SET available_units = GREATEST(
           available_units - NEW.units_issued, 0
         ),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id    = v_bank_id
     AND blood_group = v_blood_group;

  UPDATE Blood_Request
     SET status     = 'Fulfilled',
         updated_at = CURRENT_TIMESTAMP
   WHERE request_id = NEW.request_id;

END$$

CREATE TRIGGER `after_donation_insert` 
AFTER INSERT ON `Donation_Record` 
FOR EACH ROW 
DECLARE v_units INT;

  SET v_units = FLOOR(NEW.quantity_ml / 450);
  IF v_units < 1 THEN SET v_units = 1; END IF;

  UPDATE Blood_Stock
     SET available_units = LEAST(
           available_units + v_units,
           capacity
         ),
         last_updated = CURRENT_TIMESTAMP
   WHERE bank_id    = NEW.bank_id
     AND blood_group = NEW.blood_group;

  UPDATE Donor
     SET last_donation_date = NEW.donation_date,
         updated_at         = CURRENT_TIMESTAMP
   WHERE donor_id = NEW.donor_id;

  INSERT IGNORE INTO blood_bank_donor (bank_id, donor_id, created_at)
  VALUES (NEW.bank_id, NEW.donor_id, CURRENT_TIMESTAMP);

END$$

DELIMITER ;

