'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [supabaseConfig, setSupabaseConfig] = useState<{
    url: string | undefined
    anonKey: string | undefined
  }>({
    url: undefined,
    anonKey: undefined
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      
      // Kiểm tra environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setSupabaseConfig({ url, anonKey })
      
      if (!url || !anonKey) {
        throw new Error('Missing Supabase environment variables')
      }

      // Test kết nối bằng cách thực hiện một query đơn giản
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      setConnectionStatus('success')
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || 'Unknown error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Supabase Connection Test
        </h1>
        
        {/* Environment Variables Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium">SUPABASE_URL:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                supabaseConfig.url ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {supabaseConfig.url ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">SUPABASE_ANON_KEY:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                supabaseConfig.anonKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {supabaseConfig.anonKey ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Connection Status</h2>
          <div className="flex items-center">
            {connectionStatus === 'testing' && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-600">Testing connection...</span>
              </div>
            )}
            {connectionStatus === 'success' && (
              <div className="flex items-center">
                <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600">✓ Connected successfully!</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center">
                <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600">✗ Connection failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-red-600">Error Details</h2>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <code className="text-sm text-red-800">{errorMessage}</code>
            </div>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={testConnection}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Test Again
        </button>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if environment variables are set in Vercel</li>
            <li>Verify Supabase URL and API key are correct</li>
            <li>Ensure database schema is properly set up</li>
            <li>Check if RLS policies allow access</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
