-- Eagle Queue Management System - Database Schema for Supabase
-- This file contains all the necessary tables and sample data for the Eagle app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM PUBLIC;

-- ===== CORE TABLES =====

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

-- Services table (each establishment can have multiple services/queues)
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

-- Queue entries table (tracks users in queues)
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
    estimated_wait_time INTEGER, -- in minutes
    UNIQUE(service_id, queue_number)
);

-- Notifications table (for push notifications and alerts)
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

-- Analytics table (for tracking queue performance)
CREATE TABLE queue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_customers INTEGER DEFAULT 0,
    served_customers INTEGER DEFAULT 0,
    cancelled_customers INTEGER DEFAULT 0,
    no_show_customers INTEGER DEFAULT 0,
    average_wait_time DECIMAL(5,2), -- in minutes
    peak_hour_start INTEGER, -- hour of day (0-23)
    peak_hour_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, date)
);

-- User sessions table (for authentication)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('user', 'establishment')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (for app-wide and establishment-specific settings)
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

-- ===== INDEXES =====

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Establishments
CREATE INDEX idx_establishments_email ON establishments(email);
CREATE INDEX idx_establishments_business_type ON establishments(business_type);
CREATE INDEX idx_establishments_is_active ON establishments(is_active);

-- Services
CREATE INDEX idx_services_establishment_id ON services(establishment_id);
CREATE INDEX idx_services_is_open ON services(is_open);
CREATE INDEX idx_services_service_type ON services(service_type);

-- Queue entries
CREATE INDEX idx_queue_entries_service_id ON queue_entries(service_id);
CREATE INDEX idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_joined_at ON queue_entries(joined_at);
CREATE INDEX idx_queue_entries_qr_code ON queue_entries(qr_code);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_establishment_id ON notifications(establishment_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Analytics
CREATE INDEX idx_queue_analytics_service_id ON queue_analytics(service_id);
CREATE INDEX idx_queue_analytics_date ON queue_analytics(date);

-- Sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_establishment_id ON user_sessions(establishment_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ===== FUNCTIONS =====

-- Function to generate QR codes
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN 'QR' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update queue numbers
CREATE OR REPLACE FUNCTION update_queue_counter()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the queue counter for the service
    UPDATE services
    SET queue_number_counter = queue_number_counter + 1
    WHERE id = NEW.service_id;

    -- Set the queue number for the new entry
    NEW.queue_number := (SELECT queue_number_counter FROM services WHERE id = NEW.service_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== TRIGGERS =====

-- Trigger to auto-generate QR codes
CREATE TRIGGER set_qr_code_trigger
    BEFORE INSERT ON queue_entries
    FOR EACH ROW
    WHEN (NEW.qr_code IS NULL OR NEW.qr_code = '')
    EXECUTE FUNCTION generate_qr_code();

-- Trigger to update queue numbers
CREATE TRIGGER update_queue_number_trigger
    BEFORE INSERT ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_counter();

-- Triggers to update updated_at timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at
    BEFORE UPDATE ON establishments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY POLICIES =====

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Establishments can only see their own data
CREATE POLICY "Establishments can view own profile" ON establishments
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Establishments can update own profile" ON establishments
    FOR UPDATE USING (auth.uid() = id);

-- Services are viewable by everyone but only editable by owners
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (true);

CREATE POLICY "Establishments can manage own services" ON services
    FOR ALL USING (
        establishment_id IN (
            SELECT id FROM establishments WHERE auth.uid() = id
        )
    );

-- Queue entries policies
CREATE POLICY "Users can view own queue entries" ON queue_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Establishments can view their service queues" ON queue_entries
    FOR SELECT USING (
        service_id IN (
            SELECT s.id FROM services s
            JOIN establishments e ON s.establishment_id = e.id
            WHERE e.id = auth.uid()
        )
    );

CREATE POLICY "Users can create queue entries" ON queue_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Establishments can update their service queues" ON queue_entries
    FOR UPDATE USING (
        service_id IN (
            SELECT s.id FROM services s
            JOIN establishments e ON s.establishment_id = e.id
            WHERE e.id = auth.uid()
        )
    );