-- Simple Eagle Database Schema (without RLS for easier setup)
-- Run this if you're having issues with the full schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS queue_analytics;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS queue_entries;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS establishments;
DROP TABLE IF EXISTS users;

-- Users table (for customers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Establishments table (for business owners)
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('restaurant', 'clinic', 'salon', 'bank', 'government', 'other')),
    owner_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    description TEXT,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    operating_hours VARCHAR(100) NOT NULL,
    is_open BOOLEAN DEFAULT true,
    queue_number_counter INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queue entries table
CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_number INTEGER NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'served', 'cancelled', 'no_show')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    estimated_wait_time INTEGER,
    UNIQUE(service_id, queue_number)
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('user', 'establishment')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    queue_entry_id UUID REFERENCES queue_entries(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('queue_update', 'called', 'reminder', 'cancelled', 'general')),
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE queue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_customers INTEGER DEFAULT 0,
    served_customers INTEGER DEFAULT 0,
    cancelled_customers INTEGER DEFAULT 0,
    no_show_customers INTEGER DEFAULT 0,
    average_wait_time DECIMAL(5,2),
    peak_hour_start INTEGER,
    peak_hour_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, date)
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(establishment_id, key)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_establishments_email ON establishments(email);
CREATE INDEX idx_services_establishment_id ON services(establishment_id);
CREATE INDEX idx_queue_entries_service_id ON queue_entries(service_id);
CREATE INDEX idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);

-- Insert some basic test data
INSERT INTO establishments (business_name, business_type, owner_name, email, phone, address, password_hash) VALUES
('Test Restaurant', 'restaurant', 'John Doe', 'admin@testrestaurant.com', '+1234567890', '123 Test St', 'temp_hash_123'),
('Test Clinic', 'clinic', 'Dr. Smith', 'admin@testclinic.com', '+1234567891', '456 Medical Ave', 'temp_hash_456');

INSERT INTO services (establishment_id, name, service_type, max_capacity, operating_hours)
SELECT e.id, e.business_name || ' Service', 'General', 20, '9:00 AM - 5:00 PM'
FROM establishments e;

-- Success message
SELECT 'Simple database schema created successfully!' as status;