"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testDatabaseConnection, testTableExists } from "@/lib/db-test"
import { simpleRegisterUser, simpleLogin } from "@/lib/simple-auth"

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const dbTest = await testDatabaseConnection()
      addResult("Database Connection", dbTest)

      if (dbTest.success) {
        // Test each table
        const tables = ['users', 'establishments', 'services', 'queue_entries', 'user_sessions']

        for (const table of tables) {
          const tableTest = await testTableExists(table)
          addResult(`Table: ${table}`, tableTest)
        }
      }
    } catch (error: any) {
      addResult("Database Connection", { success: false, error: error.message })
    }
    setLoading(false)
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const testData = {
        firstName: "Test",
        lastName: "User",
        email: `test${Date.now()}@example.com`,
        phone: "+1234567890",
        password: "testpass123"
      }

      const result = await simpleRegisterUser(testData)
      addResult("Test Registration", result)
    } catch (error: any) {
      addResult("Test Registration", { success: false, error: error.message })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Database Debug Panel</CardTitle>
            <CardDescription>
              Use this page to test your Supabase database connection and troubleshoot issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testDatabase} disabled={loading}>
                Test Database Connection
              </Button>
              <Button onClick={testRegistration} disabled={loading}>
                Test User Registration
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Environment Variables:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Not set'}</div>
                <div>SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '❌ Not set'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a test button above to start.</p>
            ) : (
              <div className="space-y-4">
                {results.map((item, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.test}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <pre className="whitespace-pre-wrap overflow-auto">
                        {JSON.stringify(item.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Check Environment Variables</h4>
              <p className="text-sm text-gray-600">
                Make sure your <code>.env.local</code> file contains the correct Supabase URL and API key.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Run Database Schema</h4>
              <p className="text-sm text-gray-600">
                In your Supabase dashboard, go to SQL Editor and run the <code>database_schema.sql</code> file first,
                then run <code>sample_data.sql</code> for test data.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Check Row Level Security</h4>
              <p className="text-sm text-gray-600">
                The schema includes RLS policies. Make sure they're properly set up or temporarily disable RLS
                for testing by running: <code>ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}