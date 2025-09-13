-- Eagle Queue Management System - Sample Data
-- Run this after creating the schema to populate with test data

-- ===== SAMPLE USERS =====

INSERT INTO users (id, first_name, last_name, email, phone, password_hash) VALUES
(uuid_generate_v4(), 'John', 'Doe', 'john.doe@email.com', '+1234567890', '$2b$10$example_hash_1'),
(uuid_generate_v4(), 'Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '$2b$10$example_hash_2'),
(uuid_generate_v4(), 'Michael', 'Johnson', 'michael.johnson@email.com', '+1234567892', '$2b$10$example_hash_3'),
(uuid_generate_v4(), 'Emily', 'Davis', 'emily.davis@email.com', '+1234567893', '$2b$10$example_hash_4'),
(uuid_generate_v4(), 'David', 'Wilson', 'david.wilson@email.com', '+1234567894', '$2b$10$example_hash_5'),
(uuid_generate_v4(), 'Sarah', 'Brown', 'sarah.brown@email.com', '+1234567895', '$2b$10$example_hash_6'),
(uuid_generate_v4(), 'James', 'Taylor', 'james.taylor@email.com', '+1234567896', '$2b$10$example_hash_7'),
(uuid_generate_v4(), 'Lisa', 'Anderson', 'lisa.anderson@email.com', '+1234567897', '$2b$10$example_hash_8'),
(uuid_generate_v4(), 'Robert', 'Martinez', 'robert.martinez@email.com', '+1234567898', '$2b$10$example_hash_9'),
(uuid_generate_v4(), 'Maria', 'Garcia', 'maria.garcia@email.com', '+1234567899', '$2b$10$example_hash_10');

-- ===== SAMPLE ESTABLISHMENTS =====

INSERT INTO establishments (id, business_name, business_type, owner_name, email, phone, address, description, password_hash) VALUES
(uuid_generate_v4(), 'Bella Vista Restaurant', 'restaurant', 'Antonio Rossi', 'antonio@bellavista.com', '+1555000001', '123 Main Street, Downtown', 'Authentic Italian cuisine with fresh ingredients and traditional recipes', '$2b$10$establishment_hash_1'),
(uuid_generate_v4(), 'City Medical Clinic', 'clinic', 'Dr. Sarah Johnson', 'admin@citymedical.com', '+1555000002', '456 Health Avenue, Medical District', 'Full-service medical clinic providing comprehensive healthcare services', '$2b$10$establishment_hash_2'),
(uuid_generate_v4(), 'Golden Scissors Salon', 'salon', 'Michelle Park', 'info@goldenscissors.com', '+1555000003', '789 Beauty Lane, Fashion District', 'Premium hair and beauty services with experienced stylists', '$2b$10$establishment_hash_3'),
(uuid_generate_v4(), 'First National Bank', 'bank', 'Robert Thompson', 'admin@firstnational.com', '+1555000004', '321 Finance Street, Business District', 'Full-service banking with personal and business solutions', '$2b$10$establishment_hash_4'),
(uuid_generate_v4(), 'DMV License Center', 'government', 'Linda Rodriguez', 'admin@dmvcenter.gov', '+1555000005', '654 Government Way, Civic Center', 'Department of Motor Vehicles services and licensing', '$2b$10$establishment_hash_5');

-- ===== SAMPLE SERVICES =====

-- Get establishment IDs for reference
WITH est_ids AS (
    SELECT id, business_name FROM establishments
)

INSERT INTO services (id, establishment_id, name, service_type, description, max_capacity, operating_hours, is_open)
SELECT
    uuid_generate_v4(),
    e.id,
    service_data.name,
    service_data.service_type,
    service_data.description,
    service_data.max_capacity,
    service_data.operating_hours,
    service_data.is_open
FROM est_ids e
CROSS JOIN (
    VALUES
    -- Bella Vista Restaurant services
    ('Bella Vista Restaurant', 'Dining Service', 'Restaurant', 'Fine dining experience with table service', 15, '11:00 AM - 10:00 PM', true),
    ('Bella Vista Restaurant', 'Takeout Orders', 'Restaurant', 'Quick pickup for takeout orders', 25, '11:00 AM - 10:00 PM', true),

    -- City Medical Clinic services
    ('City Medical Clinic', 'General Consultation', 'Clinic', 'General medical consultations and checkups', 20, '8:00 AM - 5:00 PM', true),
    ('City Medical Clinic', 'Specialist Appointments', 'Clinic', 'Specialized medical services and procedures', 10, '9:00 AM - 4:00 PM', true),
    ('City Medical Clinic', 'Lab Services', 'Clinic', 'Blood tests, lab work, and diagnostic services', 15, '7:00 AM - 3:00 PM', true),

    -- Golden Scissors Salon services
    ('Golden Scissors Salon', 'Hair Styling', 'Salon', 'Hair cuts, styling, and treatments', 12, '9:00 AM - 7:00 PM', true),
    ('Golden Scissors Salon', 'Nail Services', 'Salon', 'Manicures, pedicures, and nail art', 8, '9:00 AM - 7:00 PM', true),

    -- First National Bank services
    ('First National Bank', 'Teller Services', 'Bank', 'General banking transactions and services', 30, '9:00 AM - 4:00 PM', true),
    ('First National Bank', 'Loan Officer', 'Bank', 'Personal and business loan consultations', 5, '9:00 AM - 4:00 PM', true),

    -- DMV License Center services
    ('DMV License Center', 'Driver License Services', 'Government', 'New licenses, renewals, and updates', 25, '8:00 AM - 5:00 PM', true),
    ('DMV License Center', 'Vehicle Registration', 'Government', 'Vehicle registration and title services', 20, '8:00 AM - 5:00 PM', true)
) AS service_data(business_name, name, service_type, description, max_capacity, operating_hours, is_open)
WHERE e.business_name = service_data.business_name;

-- ===== SAMPLE QUEUE ENTRIES =====

-- Insert some active queue entries
WITH service_ids AS (
    SELECT s.id as service_id, s.name as service_name, e.business_name
    FROM services s
    JOIN establishments e ON s.establishment_id = e.id
),
user_ids AS (
    SELECT id as user_id, first_name, last_name
    FROM users
    LIMIT 8
)

INSERT INTO queue_entries (id, service_id, user_id, qr_code, status, joined_at, estimated_wait_time)
SELECT
    uuid_generate_v4(),
    s.service_id,
    u.user_id,
    'QR' || TO_CHAR(CURRENT_TIMESTAMP - INTERVAL '1 hour' * RANDOM() * 3, 'YYYYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    CASE
        WHEN ROW_NUMBER() OVER (PARTITION BY s.service_id ORDER BY RANDOM()) = 1 THEN 'called'
        WHEN ROW_NUMBER() OVER (PARTITION BY s.service_id ORDER BY RANDOM()) <= 2 THEN 'waiting'
        ELSE 'waiting'
    END,
    CURRENT_TIMESTAMP - INTERVAL '1 hour' * RANDOM() * 2,
    FLOOR(RANDOM() * 45) + 5
FROM service_ids s
CROSS JOIN user_ids u
WHERE
    (s.business_name = 'Bella Vista Restaurant' AND s.service_name = 'Dining Service') OR
    (s.business_name = 'City Medical Clinic' AND s.service_name = 'General Consultation') OR
    (s.business_name = 'Golden Scissors Salon' AND s.service_name = 'Hair Styling')
ORDER BY RANDOM()
LIMIT 15;

-- ===== SAMPLE NOTIFICATIONS =====

INSERT INTO notifications (id, user_id, title, message, type, is_read)
SELECT
    uuid_generate_v4(),
    u.id,
    'Queue Update',
    'You are now #' || (FLOOR(RANDOM() * 5) + 1)::TEXT || ' in line at ' || e.business_name,
    'queue_update',
    RANDOM() < 0.3
FROM users u
CROSS JOIN establishments e
WHERE RANDOM() < 0.4
LIMIT 20;

-- ===== SAMPLE ANALYTICS DATA =====

INSERT INTO queue_analytics (id, service_id, date, total_customers, served_customers, cancelled_customers, no_show_customers, average_wait_time, peak_hour_start, peak_hour_end)
SELECT
    uuid_generate_v4(),
    s.id,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    FLOOR(RANDOM() * 50) + 10,
    FLOOR(RANDOM() * 45) + 8,
    FLOOR(RANDOM() * 5),
    FLOOR(RANDOM() * 3),
    ROUND((RANDOM() * 30 + 15)::NUMERIC, 2),
    11 + FLOOR(RANDOM() * 3),
    13 + FLOOR(RANDOM() * 3)
FROM services s
LIMIT 35;

-- ===== SAMPLE SETTINGS =====

INSERT INTO settings (id, establishment_id, key, value, description)
SELECT
    uuid_generate_v4(),
    e.id,
    setting_data.key,
    setting_data.value,
    setting_data.description
FROM establishments e
CROSS JOIN (
    VALUES
    ('notification_enabled', 'true', 'Enable push notifications for queue updates'),
    ('auto_call_next', 'true', 'Automatically call next customer when one is served'),
    ('max_wait_time_minutes', '60', 'Maximum wait time before alerting customer'),
    ('queue_reminder_minutes', '10', 'Send reminder when customer turn is approaching'),
    ('business_hours_start', '09:00', 'Business opening time'),
    ('business_hours_end', '17:00', 'Business closing time'),
    ('weekend_enabled', 'true', 'Accept queue entries on weekends'),
    ('estimated_service_time', '15', 'Average service time per customer in minutes')
) AS setting_data(key, value, description)
LIMIT 40;

-- ===== UPDATE QUEUE COUNTERS =====

-- Update queue counters for services based on existing entries
UPDATE services
SET queue_number_counter = (
    SELECT COALESCE(MAX(queue_number), 0)
    FROM queue_entries
    WHERE queue_entries.service_id = services.id
);

-- ===== VERIFICATION QUERIES =====

-- Uncomment these to verify the data was inserted correctly

/*
-- Check total records created
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Establishments', COUNT(*) FROM establishments
UNION ALL
SELECT 'Services', COUNT(*) FROM services
UNION ALL
SELECT 'Queue Entries', COUNT(*) FROM queue_entries
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Analytics', COUNT(*) FROM queue_analytics
UNION ALL
SELECT 'Settings', COUNT(*) FROM settings;

-- Check queue status
SELECT
    e.business_name,
    s.name as service_name,
    COUNT(qe.id) as queue_length,
    COUNT(CASE WHEN qe.status = 'waiting' THEN 1 END) as waiting,
    COUNT(CASE WHEN qe.status = 'called' THEN 1 END) as called
FROM establishments e
JOIN services s ON e.id = s.establishment_id
LEFT JOIN queue_entries qe ON s.id = qe.service_id
GROUP BY e.business_name, s.name
ORDER BY e.business_name, s.name;
*/