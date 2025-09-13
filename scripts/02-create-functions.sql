-- QueueUp PWA Database Functions
-- This script creates stored procedures and functions for queue management

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queues_updated_at BEFORE UPDATE ON queues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_restrictions_updated_at BEFORE UPDATE ON queue_restrictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check queue restrictions before joining
CREATE OR REPLACE FUNCTION check_queue_restrictions(
    p_user_id INTEGER,
    p_service_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_service_type VARCHAR(100);
    v_restaurant_count INTEGER;
    v_total_count INTEGER;
BEGIN
    -- Get service type
    SELECT service_type INTO v_service_type
    FROM services
    WHERE id = p_service_id;
    
    -- Count current restaurant queues for user
    SELECT COUNT(*) INTO v_restaurant_count
    FROM queues q
    JOIN services s ON q.service_id = s.id
    WHERE q.user_id = p_user_id 
    AND q.status = 'waiting'
    AND LOWER(s.service_type) = 'restaurant';
    
    -- Count total active queues for user
    SELECT COUNT(*) INTO v_total_count
    FROM queues
    WHERE user_id = p_user_id 
    AND status = 'waiting';
    
    -- Check restaurant limit (max 2)
    IF LOWER(v_service_type) = 'restaurant' AND v_restaurant_count >= 2 THEN
        RETURN FALSE;
    END IF;
    
    -- Check total limit (max 5)
    IF v_total_count >= 5 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to join a queue
CREATE OR REPLACE FUNCTION join_queue(
    p_user_id INTEGER,
    p_service_id INTEGER,
    p_qr_code VARCHAR(255)
) RETURNS TABLE(
    queue_id INTEGER,
    position INTEGER,
    estimated_wait INTEGER,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_queue_id INTEGER;
    v_position INTEGER;
    v_estimated_wait INTEGER;
    v_service_time INTEGER;
BEGIN
    -- Check if user can join this queue
    IF NOT check_queue_restrictions(p_user_id, p_service_id) THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, FALSE, 'Queue restrictions exceeded'::TEXT;
        RETURN;
    END IF;
    
    -- Check if service is open
    IF NOT EXISTS (SELECT 1 FROM services WHERE id = p_service_id AND is_open = TRUE) THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, FALSE, 'Service is currently closed'::TEXT;
        RETURN;
    END IF;
    
    -- Get next position in queue
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
    FROM queues
    WHERE service_id = p_service_id AND status = 'waiting';
    
    -- Get average service time for estimation
    SELECT average_service_time INTO v_service_time
    FROM services
    WHERE id = p_service_id;
    
    -- Calculate estimated wait time
    v_estimated_wait := (v_position - 1) * v_service_time;
    
    -- Insert into queue
    INSERT INTO queues (user_id, service_id, position, estimated_wait_time, qr_code)
    VALUES (p_user_id, p_service_id, v_position, v_estimated_wait, p_qr_code)
    RETURNING id INTO v_queue_id;
    
    -- Update queue restrictions
    INSERT INTO queue_restrictions (user_id, restriction_type, current_count, max_allowed)
    VALUES (p_user_id, 'max_total_queues', 1, 5)
    ON CONFLICT (user_id, restriction_type)
    DO UPDATE SET current_count = queue_restrictions.current_count + 1;
    
    -- Update restaurant-specific restriction if applicable
    IF EXISTS (SELECT 1 FROM services WHERE id = p_service_id AND LOWER(service_type) = 'restaurant') THEN
        INSERT INTO queue_restrictions (user_id, restriction_type, current_count, max_allowed)
        VALUES (p_user_id, 'max_restaurant_queues', 1, 2)
        ON CONFLICT (user_id, restriction_type)
        DO UPDATE SET current_count = queue_restrictions.current_count + 1;
    END IF;
    
    RETURN QUERY SELECT v_queue_id, v_position, v_estimated_wait, TRUE, 'Successfully joined queue'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to leave a queue
CREATE OR REPLACE FUNCTION leave_queue(
    p_user_id INTEGER,
    p_service_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_queue_record RECORD;
    v_service_type VARCHAR(100);
BEGIN
    -- Get queue record
    SELECT * INTO v_queue_record
    FROM queues
    WHERE user_id = p_user_id AND service_id = p_service_id AND status = 'waiting';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get service type
    SELECT service_type INTO v_service_type
    FROM services
    WHERE id = p_service_id;
    
    -- Update queue status to cancelled
    UPDATE queues
    SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
    WHERE id = v_queue_record.id;
    
    -- Add to history
    INSERT INTO queue_history (
        user_id, service_id, establishment_id, joined_at, cancelled_at,
        initial_position, final_status
    )
    SELECT 
        v_queue_record.user_id,
        v_queue_record.service_id,
        s.establishment_id,
        v_queue_record.joined_at,
        CURRENT_TIMESTAMP,
        v_queue_record.position,
        'cancelled'
    FROM services s
    WHERE s.id = v_queue_record.service_id;
    
    -- Update positions for remaining queue members
    UPDATE queues
    SET position = position - 1
    WHERE service_id = p_service_id 
    AND position > v_queue_record.position 
    AND status = 'waiting';
    
    -- Update queue restrictions
    UPDATE queue_restrictions
    SET current_count = current_count - 1
    WHERE user_id = p_user_id AND restriction_type = 'max_total_queues';
    
    -- Update restaurant-specific restriction if applicable
    IF LOWER(v_service_type) = 'restaurant' THEN
        UPDATE queue_restrictions
        SET current_count = current_count - 1
        WHERE user_id = p_user_id AND restriction_type = 'max_restaurant_queues';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to call next person in queue
CREATE OR REPLACE FUNCTION call_next_in_queue(
    p_service_id INTEGER,
    p_establishment_id INTEGER
) RETURNS TABLE(
    queue_id INTEGER,
    user_id INTEGER,
    user_name TEXT,
    phone VARCHAR(20),
    qr_code VARCHAR(255)
) AS $$
DECLARE
    v_queue_record RECORD;
BEGIN
    -- Get next person in queue
    SELECT q.*, u.first_name, u.last_name, u.phone
    INTO v_queue_record
    FROM queues q
    JOIN users u ON q.user_id = u.id
    JOIN services s ON q.service_id = s.id
    WHERE q.service_id = p_service_id 
    AND q.status = 'waiting'
    AND s.establishment_id = p_establishment_id
    ORDER BY q.position
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Update queue status to called
    UPDATE queues
    SET status = 'called', called_at = CURRENT_TIMESTAMP
    WHERE id = v_queue_record.id;
    
    -- Create notification
    INSERT INTO notifications (user_id, queue_id, type, title, message)
    VALUES (
        v_queue_record.user_id,
        v_queue_record.id,
        'called',
        'You''re being called!',
        'Please proceed to the service counter. Your turn has arrived.'
    );
    
    RETURN QUERY SELECT 
        v_queue_record.id,
        v_queue_record.user_id,
        (v_queue_record.first_name || ' ' || v_queue_record.last_name)::TEXT,
        v_queue_record.phone,
        v_queue_record.qr_code;
END;
$$ LANGUAGE plpgsql;
