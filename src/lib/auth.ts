import { userService, establishmentService, sessionService } from './database'
import bcrypt from 'bcryptjs'

export type UserType = 'user' | 'establishment'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  businessName?: string
  userType: UserType
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  sessionToken?: string
  error?: string
}

// Generate a secure session token
function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// User registration
export async function registerUser(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}): Promise<AuthResult> {
  try {
    console.log('Starting user registration for:', userData.email)

    // Check if user already exists
    let existingUser
    try {
      existingUser = await userService.getByEmail(userData.email)
    } catch (error: any) {
      // If it's a "not found" error, that's okay, user doesn't exist
      if (error.code !== 'PGRST116') {
        console.error('Error checking existing user:', error)
        return { success: false, error: 'Database connection failed. Please check if the database tables exist.' }
      }
    }

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    console.log('Hashing password...')
    // Hash password and create user
    const passwordHash = await hashPassword(userData.password)

    console.log('Creating user in database...')
    const newUser = await userService.create({
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password_hash: passwordHash
    })

    console.log('User created successfully, creating session...')
    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sessionService.create({
      user_id: newUser.id,
      session_token: sessionToken,
      user_type: 'user',
      expires_at: expiresAt.toISOString()
    })

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      userType: 'user'
    }

    console.log('Registration completed successfully')
    return { success: true, user: authUser, sessionToken }
  } catch (error: any) {
    console.error('Registration error:', error)

    // Provide more specific error messages
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      return { success: false, error: 'Database tables not found. Please run the database setup first.' }
    }

    if (error.code === 'PGRST301') {
      return { success: false, error: 'Database connection failed. Please check your Supabase configuration.' }
    }

    return { success: false, error: error.message || 'Registration failed. Please try again.' }
  }
}

// Establishment registration
export async function registerEstablishment(establishmentData: {
  businessName: string
  businessType: string
  ownerName: string
  email: string
  phone: string
  address: string
  description?: string
  password: string
}): Promise<AuthResult> {
  try {
    // Check if establishment already exists
    const existingEstablishment = await establishmentService.getByEmail(establishmentData.email)
    if (existingEstablishment) {
      return { success: false, error: 'Establishment with this email already exists' }
    }

    // Hash password and create establishment
    const passwordHash = await hashPassword(establishmentData.password)
    const newEstablishment = await establishmentService.create({
      business_name: establishmentData.businessName,
      business_type: establishmentData.businessType as any,
      owner_name: establishmentData.ownerName,
      email: establishmentData.email,
      phone: establishmentData.phone,
      address: establishmentData.address,
      description: establishmentData.description,
      password_hash: passwordHash,
      is_active: true
    })

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sessionService.create({
      establishment_id: newEstablishment.id,
      session_token: sessionToken,
      user_type: 'establishment',
      expires_at: expiresAt.toISOString()
    })

    const authUser: AuthUser = {
      id: newEstablishment.id,
      email: newEstablishment.email,
      businessName: newEstablishment.business_name,
      userType: 'establishment'
    }

    return { success: true, user: authUser, sessionToken }
  } catch (error) {
    console.error('Establishment registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

// User login
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await userService.getByEmail(email)

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sessionService.create({
      user_id: user.id,
      session_token: sessionToken,
      user_type: 'user',
      expires_at: expiresAt.toISOString()
    })

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: 'user'
    }

    return { success: true, user: authUser, sessionToken }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Establishment login
export async function loginEstablishment(email: string, password: string): Promise<AuthResult> {
  try {
    const establishment = await establishmentService.getByEmail(email)

    if (!establishment) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!establishment.is_active) {
      return { success: false, error: 'Account is deactivated' }
    }

    const isValidPassword = await verifyPassword(password, establishment.password_hash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await sessionService.create({
      establishment_id: establishment.id,
      session_token: sessionToken,
      user_type: 'establishment',
      expires_at: expiresAt.toISOString()
    })

    const authUser: AuthUser = {
      id: establishment.id,
      email: establishment.email,
      businessName: establishment.business_name,
      userType: 'establishment'
    }

    return { success: true, user: authUser, sessionToken }
  } catch (error) {
    console.error('Establishment login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Validate session
export async function validateSession(sessionToken: string): Promise<AuthUser | null> {
  try {
    const session = await sessionService.getByToken(sessionToken)

    if (!session) {
      return null
    }

    if (session.user_type === 'user' && session.user_id) {
      const user = await userService.getById(session.user_id)
      if (user) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: 'user'
        }
      }
    }

    if (session.user_type === 'establishment' && session.establishment_id) {
      const establishment = await establishmentService.getById(session.establishment_id)
      if (establishment && establishment.is_active) {
        return {
          id: establishment.id,
          email: establishment.email,
          businessName: establishment.business_name,
          userType: 'establishment'
        }
      }
    }

    return null
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// Logout
export async function logout(sessionToken: string): Promise<void> {
  try {
    await sessionService.delete(sessionToken)
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await sessionService.deleteExpired()
  } catch (error) {
    console.error('Session cleanup error:', error)
  }
}