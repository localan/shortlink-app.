import React, { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Link, Copy, Search, Plus, ExternalLink, Settings, Users, LogOut, Shuffle, Edit3 } from 'lucide-react'
import axios from 'axios'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'

// API base URL - ganti dengan URL Cloudflare Worker Anda
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

function App() {
  const [activeTab, setActiveTab] = useState('user') // 'user' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customShort, setCustomShort] = useState('')
  const [useCustomShort, setUseCustomShort] = useState(false)
  const [links, setLinks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLinks()
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true)
    }
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/links`)
      setLinks(response.data)
    } catch (error) {
      console.error('Error fetching links:', error)
      // Fallback data untuk demo
      setLinks([
        {
          id: 1,
          short: 'edit',
          url: 'https://www.dwx.my.id/edit',
          title: '',
          description: '',
          created_at: '2024-01-01'
        },
        {
          id: 2,
          short: 'nixos',
          url: 'https://www.dwx.my.id/nixos',
          title: 'Install Nixos',
          description: 'tentang mengistall nix os',
          created_at: '2024-01-01'
        },
        {
          id: 3,
          short: 'nixpkgs',
          url: 'https://www.dwx.my.id/nixpkgs',
          title: 'Install nixpkgs',
          description: '',
          created_at: '2024-01-01'
        },
        {
          id: 4,
          short: 'nvim-lazy',
          url: 'https://www.dwx.my.id/nvim-lazy',
          title: '',
          description: '',
          created_at: '2024-01-01'
        }
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    // Validate custom short URL if enabled
    if (useCustomShort) {
      if (!customShort) {
        toast.error('Please enter a custom short URL')
        return
      }
      
      // Basic validation for custom short URL
      const shortUrlPattern = /^[a-zA-Z0-9_-]+$/
      if (!shortUrlPattern.test(customShort)) {
        toast.error('Custom short URL can only contain letters, numbers, hyphens, and underscores')
        return
      }
      
      if (customShort.length < 2 || customShort.length > 50) {
        toast.error('Custom short URL must be between 2-50 characters')
        return
      }
    }

    setLoading(true)
    try {
      const requestData = {
        url,
        title,
        description
      }
      
      // Add custom short URL if enabled
      if (useCustomShort && customShort) {
        requestData.customShort = customShort
      }
      
      const response = await axios.post(`${API_BASE}/api/shorten`, requestData)
      
      toast.success('URL shortened successfully!')
      setUrl('')
      setTitle('')
      setDescription('')
      setCustomShort('')
      setUseCustomShort(false)
      fetchLinks()
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error('This custom short URL is already taken. Please choose another one.')
      } else {
        toast.error('Error shortening URL')
      }
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    toast.success('Copied to clipboard!')
  }

  const handleAdminLogin = (isAuthenticated) => {
    setIsAdminAuthenticated(isAuthenticated)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth')
    setIsAdminAuthenticated(false)
    setActiveTab('user')
    toast.success('Logged out successfully!')
  }

  const handleTabChange = (tab) => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      // Don't change tab, login component will be shown
      setActiveTab('admin')
    } else {
      setActiveTab(tab)
    }
  }

  const filteredLinks = links.filter(link =>
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.short.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // If admin tab is active, check authentication
  if (activeTab === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div>
          <Toaster position="top-right" />
          <AdminLogin onLogin={handleAdminLogin} />
        </div>
      )
    }

    return (
      <div>
        <Toaster position="top-right" />
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-8">
                <button
                  onClick={() => handleTabChange('user')}
                  className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm flex items-center"
                >
                  <Users className="w-4 h-4 mr-2" />
                  User View
                </button>
                <button
                  onClick={() => handleTabChange('admin')}
                  className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </button>
              </div>
              <button
                onClick={handleAdminLogout}
                className="py-2 px-4 text-red-600 hover:text-red-700 font-medium text-sm flex items-center border border-red-200 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('user')}
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              User View
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">URL Shortener Links</h1>
          </div>
          <p className="text-gray-600">Create and manage your shortened URLs</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL to shorten *
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Custom Short URL Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Short URL Options
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setUseCustomShort(false)}
                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      !useCustomShort 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    Auto Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomShort(true)}
                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      useCustomShort 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Custom
                  </button>
                </div>
              </div>

              {useCustomShort && (
                <div>
                  <label htmlFor="customShort" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Short URL *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {window.location.hostname === 'localhost' ? 'link.dwx.my.id/' : `${window.location.origin}/`}
                    </span>
                    <input
                      type="text"
                      id="customShort"
                      value={customShort}
                      onChange={(e) => setCustomShort(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="my-custom-link"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="50"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Only letters, numbers, hyphens, and underscores allowed (2-50 characters)
                  </p>
                </div>
              )}

              {!useCustomShort && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <Shuffle className="w-4 h-4 mr-2 text-blue-500" />
                    <span>A random short URL will be generated automatically (e.g., abc123)</span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Creating...' : 'Shorten URL'}
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {filteredLinks.map((link) => (
            <div key={link.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <a
                      href={`${API_BASE}/${link.short}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      {window.location.hostname === 'localhost' ? `link.dwx.my.id/${link.short}` : `${window.location.origin}/${link.short}`}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(window.location.hostname === 'localhost' ? `https://link.dwx.my.id/${link.short}` : `${window.location.origin}/${link.short}`)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {link.title && (
                    <h3 className="font-medium text-gray-900 mb-1">Title: {link.title}</h3>
                  )}
                  
                  {link.description && (
                    <p className="text-gray-600 text-sm mb-2">Description: {link.description}</p>
                  )}
                  
                  <p className="text-gray-500 text-sm break-all">{link.url}</p>
                </div>
                
                <button
                  onClick={() => copyToClipboard(window.location.hostname === 'localhost' ? `https://link.dwx.my.id/${link.short}` : `${window.location.origin}/${link.short}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No links found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
