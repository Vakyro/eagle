-- QueueUp PWA Database Views
-- This script creates useful views for reporting and analytics

-- View for current queue status with user and service details
CREATE OR REPLACE VIEW current_queue_status AS
SELECT 
    q.id as queue_id,
    q.position,
    q.estimated_wait_time,
    q.joined_at,
    q.status,
    q.qr_code,
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email as user_email,
    u.phone,
    s.id as service_id,
    s.name as service_name,
    s.service_type,
    s.max_capacity,
    s.average_service_time,
    s.is_open,
    e.id as establishment_id,
    e.business_name,
    e.business_type,
    e.address,
    e.phone as business_phone
FROM queues q
JOIN users u ON q.user_id = u.id
JOIN services s ON q.service_id = s.id
JOIN establishments e ON s.establishment_id = e.id
WHERE q.status = 'waiting'
ORDER BY s.id, q.position;

-- View for establishment analytics
CREATE OR REPLACE VIEW establishment_analytics AS
SELECT 
    e.id as establishment_id,
    e.business_name,
    e.business_type,
    COUNT(DISTINCT s.id) as total_services,
    COUNT(DISTINCT CASE WHEN s.is_open THEN s.id END) as active_services,
    COUNT(DISTINCT q.id) as current_queue_count,
    COUNT(DISTINCT qh.id) as total_served_today,
    AVG(qh.actual_wait_time) as avg_wait_time_today,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'completed' THEN qh.id END) as completed_today,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'cancelled' THEN qh.id END) as cancelled_today
FROM establishments e
LEFT JOIN services s ON e.id = s.establishment_id
LEFT JOIN queues q ON s.id = q.service_id AND q.status = 'waiting'
LEFT JOIN queue_history qh ON e.id = qh.establishment_id AND DATE(qh.created_at) = CURRENT_DATE
GROUP BY e.id, e.business_name, e.business_type;

-- View for user queue summary
CREATE OR REPLACE VIEW user_queue_summary AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT q.id) as active_queues,
    COUNT(DISTINCT CASE WHEN s.service_type = 'Restaurant' THEN q.id END) as restaurant_queues,
    COUNT(DISTINCT qh.id) as total_queue_history,
    AVG(qh.actual_wait_time) as avg_wait_time,
    MAX(q.joined_at) as last_queue_joined
FROM users u
LEFT JOIN queues q ON u.id = q.user_id AND q.status = 'waiting'
LEFT JOIN services s ON q.service_id = s.id
LEFT JOIN queue_history qh ON u.id = qh.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- View for service performance metrics
CREATE OR REPLACE VIEW service_performance AS
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.service_type,
    s.max_capacity,
    s.average_service_time,
    s.is_open,
    e.business_name,
    COUNT(DISTINCT q.id) as current_queue_size,
    COUNT(DISTINCT qh.id) as total_served_all_time,
    AVG(qh.actual_wait_time) as avg_actual_wait_time,
    AVG(CASE WHEN qh.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN qh.actual_wait_time END) as avg_wait_time_7_days,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'completed' THEN qh.id END) as total_completed,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'cancelled' THEN qh.id END) as total_cancelled,
    ROUND(
        COUNT(DISTINCT CASE WHEN qh.final_status = 'completed' THEN qh.id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT qh.id), 0) * 100, 2
    ) as completion_rate_percent
FROM services s
JOIN establishments e ON s.establishment_id = e.id
LEFT JOIN queues q ON s.id = q.service_id AND q.status = 'waiting'
LEFT JOIN queue_history qh ON s.id = qh.service_id
GROUP BY s.id, s.name, s.service_type, s.max_capacity, s.average_service_time, s.is_open, e.business_name;

-- View for daily queue statistics
CREATE OR REPLACE VIEW daily_queue_stats AS
SELECT 
    DATE(qh.created_at) as date,
    COUNT(DISTINCT qh.id) as total_queues,
    COUNT(DISTINCT qh.user_id) as unique_users,
    COUNT(DISTINCT qh.establishment_id) as active_establishments,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'completed' THEN qh.id END) as completed_queues,
    COUNT(DISTINCT CASE WHEN qh.final_status = 'cancelled' THEN qh.id END) as cancelled_queues,
    AVG(qh.actual_wait_time) as avg_wait_time,
    MIN(qh.actual_wait_time) as min_wait_time,
    MAX(qh.actual_wait_time) as max_wait_time
FROM queue_history qh
WHERE qh.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(qh.created_at)
ORDER BY date DESC;
