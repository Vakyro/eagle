import { supabase } from './supabase'

export type UserType = 'user' | 'establishment'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  businessName?: string
  userType: UserType
}

// Autenticación súper simple - solo tabla users
export async function registerBasicUser(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}) {
  try {
    console.log('Registrando usuario básico:', userData.email)

    // Verificar si el email ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'Ya existe un usuario con este email'
      }
    }

    // Si no existe, crear el usuario (el error PGRST116 significa que no se encontró, está bien)
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error verificando usuario:', checkError)
      return {
        success: false,
        error: 'Error de base de datos'
      }
    }

    // Crear el usuario nuevo
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password_hash: userData.password // Para simplicidad, guardamos la contraseña en texto plano
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error creando usuario:', insertError)
      return {
        success: false,
        error: `Error creando usuario: ${insertError.message}`
      }
    }

    console.log('Usuario creado exitosamente:', newUser.id)

    // Crear token de sesión simple
    const sessionToken = `token_${newUser.id}_${Date.now()}`

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
    console.error('Error en registro:', error)
    return {
      success: false,
      error: error.message || 'Error desconocido'
    }
  }
}

export async function loginBasicUser(email: string, password: string) {
  try {
    console.log('Login básico para:', email)

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // Comparación directa de contraseña
      .single()

    if (error || !user) {
      console.error('Error en login:', error)
      return {
        success: false,
        error: 'Email o contraseña incorrectos'
      }
    }

    // Login exitoso
    const sessionToken = `token_${user.id}_${Date.now()}`

    console.log('Login exitoso para usuario:', user.id)

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
    console.error('Error en login:', error)
    return {
      success: false,
      error: error.message || 'Error de login'
    }
  }
}

export async function registerBasicEstablishment(data: {
  businessName: string
  businessType: string
  ownerName: string
  email: string
  phone: string
  address: string
  description?: string
  password: string
}) {
  try {
    console.log('Registrando establecimiento:', data.email)

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('establishments')
      .select('email')
      .eq('email', data.email)
      .single()

    if (existing) {
      return {
        success: false,
        error: 'Ya existe un establecimiento con este email'
      }
    }

    // Crear establecimiento
    const { data: newEstablishment, error } = await supabase
      .from('establishments')
      .insert([{
        business_name: data.businessName,
        business_type: data.businessType,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        description: data.description,
        password_hash: data.password,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creando establecimiento:', error)
      return {
        success: false,
        error: `Error: ${error.message}`
      }
    }

    const sessionToken = `token_est_${newEstablishment.id}_${Date.now()}`

    return {
      success: true,
      user: {
        id: newEstablishment.id,
        email: newEstablishment.email,
        businessName: newEstablishment.business_name,
        userType: 'establishment' as const
      },
      sessionToken
    }

  } catch (error: any) {
    console.error('Error registrando establecimiento:', error)
    return {
      success: false,
      error: error.message || 'Error desconocido'
    }
  }
}

export async function loginBasicEstablishment(email: string, password: string) {
  try {
    console.log('Login establecimiento:', email)

    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single()

    if (error || !establishment) {
      return {
        success: false,
        error: 'Email o contraseña incorrectos'
      }
    }

    const sessionToken = `token_est_${establishment.id}_${Date.now()}`

    return {
      success: true,
      user: {
        id: establishment.id,
        email: establishment.email,
        businessName: establishment.business_name,
        userType: 'establishment' as const
      },
      sessionToken
    }

  } catch (error: any) {
    console.error('Error login establecimiento:', error)
    return {
      success: false,
      error: error.message || 'Error de login'
    }
  }
}

// Validar sesión básica
export async function validateBasicSession(sessionToken: string): Promise<AuthUser | null> {
  try {
    console.log('Validando sesión:', sessionToken)

    if (!sessionToken || !sessionToken.startsWith('token_')) {
      console.log('Token inválido o no encontrado')
      return null
    }

    const parts = sessionToken.split('_')
    if (parts.length < 3) {
      console.log('Formato de token inválido')
      return null
    }

    // Verificar si es establishment (formato: token_est_establishmentId_timestamp)
    if (parts[1] === 'est') {
      const establishmentId = parts[2]
      console.log('Validando establishment:', establishmentId)

      const { data: establishment, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('id', establishmentId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.log('Error buscando establishment:', error)
        return null
      }

      if (establishment) {
        console.log('Establishment válido encontrado:', establishment.business_name)
        return {
          id: establishment.id,
          email: establishment.email,
          businessName: establishment.business_name,
          userType: 'establishment' as const
        }
      }
    } else {
      // Es un usuario normal (formato: token_userId_timestamp)
      const userId = parts[1]
      console.log('Validando usuario:', userId)

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Error buscando usuario:', error)
        return null
      }

      if (user) {
        console.log('Usuario válido encontrado:', user.first_name, user.last_name)
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: 'user' as const
        }
      }
    }

    console.log('No se encontró usuario/establishment válido')
    return null

  } catch (error) {
    console.error('Error validando sesión:', error)
    return null
  }
}