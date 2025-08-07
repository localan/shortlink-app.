import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  BarChart3, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  TrendingUp, 
  Link2, 
  MousePointer,
  Calendar,
  Save,
  X
} from 'lucide-react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

const AdminDashboard = () => {
  const [links, setLinks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [editingLink, setEditingLink] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [linksRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/links`),
        axios.get(`${API_BASE}/api/analytics`)
      ])
      setLinks(linksRes.data)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
    }
  }

  const handleEdit = (link) => {
    setEditingLink({ ...link })
  }

  const handleSave = async () => {
    if (!editingLink.url) {
      toast.error('URL is required')
      return
    }

    setLoading(true)
    try {
      await axios.put(`${API_BASE}/api/links/${editingLink.id}`, {
        url: editingLink.url,
        title: editingLink.title,
        description: editingLink.description
      })
      
      toast.success('Link updated successfully!')
      setEditingLink(null)
      fetchData()
    } catch (error) {
      toast.error('Error updating link')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    setLoading(true)
    try {
      await axios.delete(`${API_BASE}/api/links/${linkId}`)
      toast.success('Link deleted successfully!')
      fetchData()
    } catch (error) {
      toast.error('Error deleting link')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your shortened URLs and analytics</p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Link2 className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Links</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.stats.total_links}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.stats.total_clicks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(analytics.stats.avg_clicks || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Link Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.stats.max_clicks}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent & Top Links */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Links */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Links
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.recentLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {link.title || 'Untitled'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {link.clicks} clicks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Links */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Top Performing Links
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.topLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {link.title || 'Untitled'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{link.url}</p>
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        {link.clicks} clicks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Links Management Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Links Management</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingLink && editingLink.id === link.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingLink.title}
                            onChange={(e) => setEditingLink({...editingLink, title: e.target.value})}
                            placeholder="Title"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="url"
                            value={editingLink.url}
                            onChange={(e) => setEditingLink({...editingLink, url: e.target.value})}
                            placeholder="URL"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editingLink.description}
                            onChange={(e) => setEditingLink({...editingLink, description: e.target.value})}
                            placeholder="Description"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {link.title || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {link.url}
                          </div>
                          {link.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {link.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-mono">
                        /{link.short}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {link.clicks} clicks
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingLink && editingLink.id === link.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLink(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(link)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
