'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

export default function ApiTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testApiConnection = async () => {
    setLoading(true)
    setResult('Testing API connection...')
    
    try {
      // Test 1: Check API base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      setResult(prev => prev + `\n\n1. API URL: ${apiUrl}`)
      
      // Test 2: Try to fetch health endpoint
      const healthResponse = await fetch('https://schedule-manager-backend.vercel.app/health')
      const healthData = await healthResponse.text()
      setResult(prev => prev + `\n\n2. Health Check: ${healthResponse.status} - ${healthData}`)
      
      // Test 3: Try to register a test user
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'test123456'
      const testName = 'Test User'
      
      setResult(prev => prev + `\n\n3. Testing Register with: ${testEmail}`)
      
      const registerResponse = await apiClient.register(testName, testEmail, testPassword)
      setResult(prev => prev + `\n   Register Success: ${JSON.stringify(registerResponse, null, 2)}`)
      
      // Test 4: Try to login with the same user
      setResult(prev => prev + `\n\n4. Testing Login with same credentials...`)
      
      const loginResponse = await apiClient.login(testEmail, testPassword)
      setResult(prev => prev + `\n   Login Success: ${JSON.stringify(loginResponse, null, 2)}`)
      
    } catch (error) {
      setResult(prev => prev + `\n\nERROR: ${error instanceof Error ? error.message : String(error)}`)
      console.error('API Test Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>
      
      <button
        onClick={testApiConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
