import { createClient } from '@supabase/supabase-js'

// Provide fallback values for build time when environment variables might not be available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Runtime validation helper
export function validateSupabaseConfig() {
  if (typeof window !== 'undefined' && 
      (supabaseUrl === 'https://placeholder.supabase.co' || 
       supabaseAnonKey === 'placeholder-anon-key')) {
    console.warn('Warning: Supabase environment variables are not properly configured. Please check your .env.local file.');
  }
}

// Database types based on our schema
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Establishment {
  id: string
  business_name: string
  business_type: 'restaurant' | 'clinic' | 'salon' | 'bank' | 'government' | 'other'
  owner_name: string
  email: string
  phone: string
  address: string
  description?: string
  password_hash: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  establishment_id: string
  name: string
  service_type: string
  description?: string
  max_capacity: number
  operating_hours: string
  is_open: boolean
  queue_number_counter: number
  created_at: string
  updated_at: string
}

export interface QueueEntry {
  id: string
  service_id: string
  user_id: string
  queue_number: number
  qr_code: string
  status: 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show'
  joined_at: string
  called_at?: string
  served_at?: string
  notes?: string
  estimated_wait_time?: number
}

export interface Notification {
  id: string
  user_id?: string
  establishment_id?: string
  queue_entry_id?: string
  title: string
  message: string
  type: 'queue_update' | 'called' | 'reminder' | 'cancelled' | 'general'
  is_read: boolean
  sent_at: string
}

export interface QueueAnalytics {
  id: string
  service_id: string
  date: string
  total_customers: number
  served_customers: number
  cancelled_customers: number
  no_show_customers: number
  average_wait_time?: number
  peak_hour_start?: number
  peak_hour_end?: number
  created_at: string
}

export interface UserSession {
  id: string
  user_id?: string
  establishment_id?: string
  session_token: string
  user_type: 'user' | 'establishment'
  expires_at: string
  created_at: string
}

export interface Setting {
  id: string
  establishment_id?: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}