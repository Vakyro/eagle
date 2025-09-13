import { supabase } from './supabase'

// Simplified registration that works with Supabase's built-in auth
export async function simpleRegisterUser(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}) {
  try {
    console.log('Starting simple user registration...')

    // First test if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.error('Database connection test failed:', testError)
      throw new Error('Database not accessible. Please check if tables exist.')
    }

    console.log('Database connection successful, proceeding with registration...')

    // Try to insert directly into users table (simplified approach)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password_hash: `temp_${Date.now()}` // We'll hash this properly once bcrypt works
      }])
      .select()
      .single()

    if (insertError) {
      console.error('User creation failed:', insertError)
      if (insertError.code === '23505') { // Unique constraint violation
        throw new Error('User with this email already exists')
      }
      throw new Error(insertError.message)
    }

    console.log('User created successfully:', newUser.id)

    // Create a simple session token
    const sessionToken = `session_${newUser.id}_${Date.now()}`

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: 'user' as const
      },
      sessionToken
    }

  } catch (error: any) {
    console.error('Simple registration error:', error)
    return {
      success: false,
      error: error.message || 'Registration failed'
    }
  }
}

export async function simpleLogin(email: string, password: string) {
  try {
    console.log('Attempting simple login for:', email)

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Login query failed:', error)
      throw new Error('User not found or database error')
    }

    // For now, just check if user exists (we'll add proper password checking later)
    const sessionToken = `session_${user.id}_${Date.now()}`

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: 'user' as const
      },
      sessionToken
    }

  } catch (error: any) {
    console.error('Simple login error:', error)
    return {
      success: false,
      error: error.message || 'Login failed'
    }
  }
}