-- QueueUp PWA Seed Data
-- This script populates the database with sample data for testing

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('john.doe@example.com', '$2b$10$example_hash_1', 'John', 'Doe', '+1234567890'),
('jane.smith@example.com', '$2b$10$example_hash_2', 'Jane', 'Smith', '+1234567891'),
('mike.johnson@example.com', '$2b$10$example_hash_3', 'Mike', 'Johnson', '+1234567892'),
('sarah.wilson@example.com', '$2b$10$example_hash_4', 'Sarah', 'Wilson', '+1234567893'),
('david.brown@example.com', '$2b$10$example_hash_5', 'David', 'Brown', '+1234567894');

-- Insert sample establishments
INSERT INTO establishments (email, password_hash, business_name, business_type, owner_name, phone, address, description) VALUES
('admin@bellavista.com', '$2b$10$example_hash_admin_1', 'Bella Vista Restaurant', 'restaurant', 'Marco Rossi', '+1555000001', '123 Main Street, Downtown', 'Authentic Italian cuisine with fresh ingredients and traditional recipes.'),
('admin@coffeecorner.com', '$2b$10$example_hash_admin_2', 'Coffee Corner', 'café', 'Lisa Chen', '+1555000002', '456 Oak Avenue, City Center', 'Premium coffee and fresh pastries in a cozy atmosphere.'),
('admin@pizzapalace.com', '$2b$10$example_hash_admin_3', 'Pizza Palace', 'restaurant', 'Tony Marinelli', '+1555000003', '789 Pine Street, Uptown', 'Wood-fired pizzas and Italian specialties.'),
('admin@healthclinic.com', '$2b$10$example_hash_admin_4', 'Downtown Health Clinic', 'clinic', 'Dr. Emily Rodriguez', '+1555000004', '321 Medical Drive, Downtown', 'Comprehensive healthcare services for the whole family.'),
('admin@beautysalon.com', '$2b$10$example_hash_admin_5', 'Glamour Beauty Salon', 'salon', 'Amanda Foster', '+1555000005', '654 Fashion Boulevard, Midtown', 'Full-service beauty salon offering cuts, colors, and treatments.');

-- Insert sample services
INSERT INTO services (establishment_id, name, service_type, description, max_capacity, average_service_time, is_open, operating_hours) VALUES
(1, 'Bella Vista Restaurant', 'Restaurant', 'Authentic Italian cuisine with fresh ingredients and traditional recipes.', 50, 45, true, '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'),
(2, 'Coffee Corner', 'Café', 'Premium coffee and fresh pastries in a cozy atmosphere.', 20, 8, true, '{"monday": {"open": "07:00", "close": "18:00"}, "tuesday": {"open": "07:00", "close": "18:00"}, "wednesday": {"open": "07:00", "close": "18:00"}, "thursday": {"open": "07:00", "close": "18:00"}, "friday": {"open": "07:00", "close": "19:00"}, "saturday": {"open": "08:00", "close": "19:00"}, "sunday": {"open": "08:00", "close": "17:00"}}'),
(3, 'Pizza Palace', 'Restaurant', 'Wood-fired pizzas and Italian specialties.', 40, 25, false, '{"monday": {"open": "17:00", "close": "23:00"}, "tuesday": {"open": "17:00", "close": "23:00"}, "wednesday": {"open": "17:00", "close": "23:00"}, "thursday": {"open": "17:00", "close": "23:00"}, "friday": {"open": "17:00", "close": "24:00"}, "saturday": {"open": "17:00", "close": "24:00"}, "sunday": {"closed": true}}'),
(4, 'General Consultation', 'Medical', 'General healthcare consultations and check-ups.', 30, 20, true, '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "16:00"}, "saturday": {"open": "09:00", "close": "13:00"}, "sunday": {"closed": true}}'),
(5, 'Hair Styling', 'Beauty', 'Professional hair cuts, styling, and coloring services.', 15, 60, true, '{"monday": {"closed": true}, "tuesday": {"open": "09:00", "close": "19:00"}, "wednesday": {"open": "09:00", "close": "19:00"}, "thursday": {"open": "09:00", "close": "20:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "16:00"}}');

-- Insert sample active queues
INSERT INTO queues (user_id, service_id, position, estimated_wait_time, qr_code, status) VALUES
(1, 1, 1, 45, 'queue-1-1-' || extract(epoch from now()), 'waiting'),
(2, 1, 2, 90, 'queue-1-2-' || extract(epoch from now()), 'waiting'),
(3, 1, 3, 135, 'queue-1-3-' || extract(epoch from now()), 'waiting'),
(4, 2, 1, 8, 'queue-2-1-' || extract(epoch from now()), 'waiting'),
(5, 2, 2, 16, 'queue-2-2-' || extract(epoch from now()), 'waiting'),
(1, 4, 1, 20, 'queue-4-1-' || extract(epoch from now()), 'waiting');

-- Insert sample queue restrictions
INSERT INTO queue_restrictions (user_id, restriction_type, current_count, max_allowed) VALUES
(1, 'max_total_queues', 2, 5),
(1, 'max_restaurant_queues', 1, 2),
(2, 'max_total_queues', 1, 5),
(2, 'max_restaurant_queues', 1, 2),
(3, 'max_total_queues', 1, 5),
(3, 'max_restaurant_queues', 1, 2),
(4, 'max_total_queues', 1, 5),
(4, 'max_restaurant_queues', 0, 2),
(5, 'max_total_queues', 1, 5),
(5, 'max_restaurant_queues', 0, 2);

-- Insert sample queue history
INSERT INTO queue_history (user_id, service_id, establishment_id, joined_at, completed_at, initial_position, final_status, actual_wait_time) VALUES
(1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 1, 'completed', 60),
(2, 2, 2, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2.5 hours', 1, 'completed', 30),
(3, 1, 1, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '23 hours', 2, 'completed', 50),
(4, 4, 4, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '25 minutes', 1, 'completed', 25),
(5, 5, 5, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 1, 'cancelled', NULL);

-- Insert sample notifications
INSERT INTO notifications (user_id, queue_id, type, title, message, is_read) VALUES
(1, 1, 'position_change', 'Queue Update', 'You are now #1 in line at Bella Vista Restaurant', false),
(2, 2, 'queue_update', 'Queue Update', 'Your estimated wait time has been updated to 90 minutes', true),
(4, 6, 'reminder', 'Queue Reminder', 'You have an active queue at Downtown Health Clinic', false);
