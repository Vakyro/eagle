import { supabase } from './supabase'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Database test failed:', error)
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }

    console.log('Database connection successful!')
    return {
      success: true,
      message: 'Database connection is working',
      userCount: data
    }
  } catch (error: any) {
    console.error('Database test error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

export async function testTableExists(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      return {
        exists: false,
        error: error.message,
        code: error.code
      }
    }

    return {
      exists: true,
      message: `Table ${tableName} exists and is accessible`
    }
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Unknown error'
    }
  }
}