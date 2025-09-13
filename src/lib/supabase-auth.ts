import { supabase } from './supabase'

// This uses Supabase's built-in auth system which bypasses RLS for user creation
export async function registerUserWithSupabaseAuth(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}) {
  try {
    console.log('Starting Supabase auth registration...')

    // Use Supabase's built-in auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone
        }
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('No user data returned from Supabase')
    }

    console.log('Supabase auth user created:', authData.user.id)

    // Now create a record in our users table using the service role
    // This bypasses RLS because it's done server-side
    const { data: userData_record, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id, // Use the same UUID from auth
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password_hash: 'supabase_managed' // Auth is handled by Supabase
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user record:', insertError)
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Profile creation failed: ${insertError.message}`)
    }

    // Get the session
    const { data: session } = await supabase.auth.getSession()

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: 'user' as const
      },
      sessionToken: session.session?.access_token || 'supabase_session'
    }

  } catch (error: any) {
    console.error('Supabase auth registration error:', error)
    return {
      success: false,
      error: error.message || 'Registration failed'
    }
  }
}

export async function loginWithSupabaseAuth(email: string, password: string) {
  try {
    console.log('Starting Supabase auth login...')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Supabase auth login error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user || !authData.session) {
      throw new Error('No user or session data returned')
    }

    // Get user profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      // User might not have a profile yet, use auth data
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          firstName: authData.user.user_metadata?.first_name || '',
          lastName: authData.user.user_metadata?.last_name || '',
          userType: 'user' as const
        },
        sessionToken: authData.session.access_token
      }
    }

    return {
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        userType: 'user' as const
      },
      sessionToken: authData.session.access_token
    }

  } catch (error: any) {
    console.error('Supabase auth login error:', error)
    return {
      success: false,
      error: error.message || 'Login failed'
    }
  }
}

export async function logoutSupabaseAuth() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}