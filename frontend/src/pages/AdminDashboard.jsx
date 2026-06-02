import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authAPI } from '../services/api'
import { Button, Card, Input, Loading } from '../components/Common'

const emptyForm = {
  name: '',
  email: '',
  password: '',
}

const AdminDashboard = () => {
  const [hosts, setHosts] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingHostId, setEditingHostId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { logout } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    fetchHosts()
  }, [])

  const fetchHosts = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getHosts()
      setHosts(response.data.data || [])
    } catch (error) {
      addToast('Failed to load host accounts', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingHostId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      if (editingHostId) {
        const updates = {
          name: formData.name,
          email: formData.email,
        }
        if (formData.password.trim()) {
          updates.password = formData.password
        }

        await authAPI.updateHost(editingHostId, updates)
        addToast('Host account updated', 'success')
      } else {
        await authAPI.createHost(formData)
        addToast('Host account created', 'success')
      }

      resetForm()
      fetchHosts()
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save host', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (host) => {
    setEditingHostId(host.userId)
    setFormData({
      name: host.name,
      email: host.email,
      password: '',
    })
  }

  const handleStatusToggle = async (host) => {
    try {
      await authAPI.updateHost(host.userId, {
        status: host.status === 'active' ? 'inactive' : 'active',
      })
      addToast('Host status updated', 'success')
      fetchHosts()
    } catch (error) {
      addToast('Failed to update host status', 'error')
    }
  }

  const handleDelete = async (host) => {
    if (!window.confirm(`Delete host account ${host.email}?`)) return

    try {
      await authAPI.deleteHost(host.userId)
      addToast('Host account deleted', 'success')
      fetchHosts()
      if (editingHostId === host.userId) resetForm()
    } catch (error) {
      addToast('Failed to delete host', 'error')
    }
  }

  if (loading && hosts.length === 0) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Host Accounts</h1>
            <p className="text-indigo-100 mt-2">Admin manages host access only</p>
          </div>
          <Button variant="outline" className="text-white border-white" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingHostId ? 'Edit Host' : 'Create Host'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingHostId ? '(leave blank to keep current)' : ''}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  required={!editingHostId}
                  minLength={editingHostId ? undefined : 8}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : editingHostId ? 'Update' : 'Create'}
                </Button>
                {editingHostId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            {hosts.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-gray-600">No host accounts yet.</p>
              </Card>
            ) : (
              hosts.map((host) => (
                <Card key={host.userId}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-800">{host.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            host.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {host.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{host.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="text-sm" onClick={() => handleEdit(host)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-sm"
                        onClick={() => handleStatusToggle(host)}
                      >
                        {host.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="danger"
                        className="text-sm"
                        onClick={() => handleDelete(host)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
