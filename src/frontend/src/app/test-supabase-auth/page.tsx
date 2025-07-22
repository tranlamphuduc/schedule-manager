'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStoreSupabase'

export default function TestSupabaseAuthPage() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout,
    clearError 
  } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData.name, formData.email, formData.password)
      alert('Đăng ký thành công!')
    } catch (error) {
      console.error('Register failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      alert('Đăng nhập thành công!')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      alert('Đăng xuất thành công!')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Supabase Auth
        </h1>

        {/* Current User Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Trạng thái hiện tại:</h2>
          <p><strong>Đã đăng nhập:</strong> {isAuthenticated ? 'Có' : 'Không'}</p>
          <p><strong>Đang tải:</strong> {isLoading ? 'Có' : 'Không'}</p>
          {user && (
            <div className="mt-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Tên:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Ngày tạo:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-6">
            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-lg font-semibold">Đăng ký</h3>
              <input
                type="text"
                name="name"
                placeholder="Tên"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            <hr />

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="text-lg font-semibold">Đăng nhập</h3>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-green-600">Bạn đã đăng nhập thành công!</p>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Hướng dẫn:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Đăng ký tài khoản mới sẽ lưu vào Supabase database</li>
            <li>Đăng nhập sẽ xác thực qua Supabase Auth</li>
            <li>Dữ liệu sẽ được lưu trực tiếp vào PostgreSQL</li>
            <li>Không còn sử dụng localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
