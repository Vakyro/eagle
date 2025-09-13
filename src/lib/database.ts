import { supabase } from './supabase'
import type {
  User,
  Establishment,
  Service,
  QueueEntry,
  Notification,
  QueueAnalytics,
  UserSession,
  Setting
} from './supabase'

// ===== USER OPERATIONS =====

export const userService = {
  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===== ESTABLISHMENT OPERATIONS =====

export const establishmentService = {
  async create(establishmentData: Omit<Establishment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('establishments')
      .insert([establishmentData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getAll(filters?: { business_type?: string; is_active?: boolean }) {
    let query = supabase.from('establishments').select('*')

    if (filters?.business_type) {
      query = query.eq('business_type', filters.business_type)
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Omit<Establishment, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('establishments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('establishments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===== SERVICE OPERATIONS =====

export const serviceService = {
  async create(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        establishment:establishments(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByEstablishment(establishmentId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAll(filters?: { is_open?: boolean; service_type?: string }) {
    let query = supabase
      .from('services')
      .select(`
        *,
        establishment:establishments(business_name, business_type, address)
      `)

    if (filters?.is_open !== undefined) {
      query = query.eq('is_open', filters.is_open)
    }
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async incrementQueueCounter(id: string) {
    const { data, error } = await supabase
      .from('services')
      .update({ queue_number_counter: supabase.sql`queue_number_counter + 1` })
      .eq('id', id)
      .select('queue_number_counter')
      .single()

    if (error) throw error
    return data.queue_number_counter
  }
}

// ===== QUEUE ENTRY OPERATIONS =====

export const queueService = {
  async create(queueData: Omit<QueueEntry, 'id' | 'queue_number' | 'qr_code'>) {
    // Generate QR code
    const qrCode = `QR${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('queue_entries')
      .insert([{ ...queueData, qr_code: qrCode }])
      .select(`
        *,
        user:users(first_name, last_name, email, phone),
        service:services(name, establishment_id, establishments(business_name))
      `)
      .single()

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('queue_entries')
      .select(`
        *,
        user:users(first_name, last_name, email, phone),
        service:services(name, establishment_id, establishments(business_name))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByService(serviceId: string, status?: QueueEntry['status']) {
    let query = supabase
      .from('queue_entries')
      .select(`
        *,
        user:users(first_name, last_name, email, phone)
      `)
      .eq('service_id', serviceId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('queue_number', { ascending: true })
    if (error) throw error
    return data
  },

  async getByUser(userId: string, status?: QueueEntry['status']) {
    let query = supabase
      .from('queue_entries')
      .select(`
        *,
        service:services(name, establishment_id, establishments(business_name, address))
      `)
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('joined_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByQrCode(qrCode: string) {
    const { data, error } = await supabase
      .from('queue_entries')
      .select(`
        *,
        user:users(first_name, last_name, email, phone),
        service:services(name, establishment_id, establishments(business_name))
      `)
      .eq('qr_code', qrCode)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Omit<QueueEntry, 'id' | 'service_id' | 'user_id' | 'queue_number' | 'qr_code'>>) {
    // Add timestamp for status changes
    if (updates.status === 'called' && !updates.called_at) {
      updates.called_at = new Date().toISOString()
    }
    if (updates.status === 'served' && !updates.served_at) {
      updates.served_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('queue_entries')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users(first_name, last_name, email, phone),
        service:services(name, establishment_id, establishments(business_name))
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('queue_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getQueuePosition(serviceId: string, queueNumber: number) {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('queue_number')
      .eq('service_id', serviceId)
      .in('status', ['waiting', 'called'])
      .lt('queue_number', queueNumber)
      .order('queue_number', { ascending: true })

    if (error) throw error
    return data.length + 1 // Position in queue (1-indexed)
  },

  async getEstimatedWaitTime(serviceId: string, position: number) {
    // Get average service time from settings or use default
    const avgServiceTime = 15 // minutes - could be fetched from settings
    return position * avgServiceTime
  }
}

// ===== NOTIFICATION OPERATIONS =====

export const notificationService = {
  async create(notificationData: Omit<Notification, 'id' | 'sent_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUser(userId: string, isRead?: boolean) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead)
    }

    const { data, error } = await query.order('sent_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByEstablishment(establishmentId: string, isRead?: boolean) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('establishment_id', establishmentId)

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead)
    }

    const { data, error } = await query.order('sent_at', { ascending: false })
    if (error) throw error
    return data
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markAllAsRead(userId?: string, establishmentId?: string) {
    let query = supabase
      .from('notifications')
      .update({ is_read: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (establishmentId) {
      query = query.eq('establishment_id', establishmentId)
    }

    const { error } = await query
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===== ANALYTICS OPERATIONS =====

export const analyticsService = {
  async create(analyticsData: Omit<QueueAnalytics, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('queue_analytics')
      .insert([analyticsData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByService(serviceId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('queue_analytics')
      .select('*')
      .eq('service_id', serviceId)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query.order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async getByEstablishment(establishmentId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('queue_analytics')
      .select(`
        *,
        service:services(name)
      `)
      .eq('services.establishment_id', establishmentId)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query.order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async update(serviceId: string, date: string, updates: Partial<Omit<QueueAnalytics, 'id' | 'service_id' | 'date' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('queue_analytics')
      .update(updates)
      .eq('service_id', serviceId)
      .eq('date', date)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async upsert(analyticsData: Omit<QueueAnalytics, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('queue_analytics')
      .upsert([analyticsData], { onConflict: 'service_id,date' })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ===== SESSION OPERATIONS =====

export const sessionService = {
  async create(sessionData: Omit<UserSession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByToken(sessionToken: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async delete(sessionToken: string) {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken)

    if (error) throw error
  },

  async deleteExpired() {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (error) throw error
  }
}

// ===== SETTINGS OPERATIONS =====

export const settingsService = {
  async create(settingData: Omit<Setting, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('settings')
      .insert([settingData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByEstablishment(establishmentId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('establishment_id', establishmentId)

    if (error) throw error
    return data
  },

  async getByKey(establishmentId: string, key: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('key', key)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async update(establishmentId: string, key: string, value: string) {
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ establishment_id: establishmentId, key, value }], {
        onConflict: 'establishment_id,key'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(establishmentId: string, key: string) {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('establishment_id', establishmentId)
      .eq('key', key)

    if (error) throw error
  }
}