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
    <div className="page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="page-header">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Host Accounts</h1>
            <p className="mt-1 text-sm text-slate-500">{hosts.length} total</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-950">
              {editingHostId ? 'Edit Host' : 'Create Host'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label">Name</label>
                <Input
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label">
                  Password {editingHostId ? '(optional)' : ''}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  required={!editingHostId}
                  minLength={editingHostId ? undefined : 8}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
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
              <Card className="py-10 text-center">
                <p className="text-sm text-slate-500">No host accounts.</p>
              </Card>
            ) : (
              hosts.map((host) => (
                <Card key={host.userId}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{host.name}</h3>
                        <span
                          className={`status-pill ${
                            host.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {host.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{host.email}</p>
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
