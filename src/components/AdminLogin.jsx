import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff, Shield, Key } from 'lucide-react'
import axios from 'axios'

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Arema123'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password) {
      toast.error('Please enter password')
      return
    }

    setLoading(true)
    
    try {
      // First try server validation
      const response = await axios.post(`${API_BASE}/api/admin/login`, {
        password: password
      })
      
      if (response.data.success) {
        toast.success('Login successful!')
        localStorage.setItem('adminAuth', 'true')
        onLogin(true)
      } else {
        toast.error('Invalid password!')
        setPassword('')
      }
    } catch (error) {
      // Fallback to client-side validation if server is not available
      console.log('Server validation failed, using client-side validation')
      
      if (password === ADMIN_PASSWORD) {
        toast.success('Login successful!')
        localStorage.setItem('adminAuth', 'true')
        onLogin(true)
      } else {
        toast.error('Invalid password!')
        setPassword('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600">Enter password to access admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter admin password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Access Admin Dashboard
                </div>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Secure Admin Access</p>
                <p className="mt-1">This area is protected and requires admin credentials to access the dashboard and management features.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to User View */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Back to User View
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
