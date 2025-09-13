-- QueueUp PWA Database Schema
-- This script creates all the necessary tables for the queue management system

-- Users table for normal users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Establishments table for business owners
CREATE TABLE IF NOT EXISTS establishments (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- restaurant, clinic, salon, bank, government, other
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Services table for individual services offered by establishments
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- restaurant, café, clinic, etc.
    description TEXT,
    max_capacity INTEGER NOT NULL DEFAULT 50,
    average_service_time INTEGER NOT NULL DEFAULT 15, -- in minutes
    is_open BOOLEAN DEFAULT false,
    operating_hours JSONB, -- store hours as JSON: {"monday": {"open": "09:00", "close": "17:00"}, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queues table to track active queues for each service
CREATE TABLE IF NOT EXISTS queues (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    estimated_wait_time INTEGER, -- in minutes
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, called, completed, cancelled
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a user can't join the same service queue twice
    UNIQUE(user_id, service_id)
);

-- Queue restrictions table to enforce business rules
CREATE TABLE IF NOT EXISTS queue_restrictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(50) NOT NULL, -- max_restaurant_queues, max_total_queues
    current_count INTEGER NOT NULL DEFAULT 0,
    max_allowed INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, restriction_type)
);

-- Queue history table for analytics and tracking
CREATE TABLE IF NOT EXISTS queue_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL,
    called_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    initial_position INTEGER,
    final_status VARCHAR(20) NOT NULL, -- completed, cancelled, no_show
    actual_wait_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table for push notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INTEGER REFERENCES establishments(id) ON DELETE CASCADE,
    queue_id INTEGER REFERENCES queues(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- queue_update, position_change, called, reminder
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table for authentication management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INTEGER REFERENCES establishments(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- user, admin
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_queues_user_id ON queues(user_id);
CREATE INDEX IF NOT EXISTS idx_queues_service_id ON queues(service_id);
CREATE INDEX IF NOT EXISTS idx_queues_status ON queues(status);
CREATE INDEX IF NOT EXISTS idx_queues_joined_at ON queues(joined_at);
CREATE INDEX IF NOT EXISTS idx_services_establishment_id ON services(establishment_id);
CREATE INDEX IF NOT EXISTS idx_services_is_open ON services(is_open);
CREATE INDEX IF NOT EXISTS idx_queue_history_user_id ON queue_history(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_service_id ON queue_history(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_establishment_id ON queue_history(establishment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_establishment_id ON notifications(establishment_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
