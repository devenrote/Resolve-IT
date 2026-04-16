import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { userApi } from '../../services/userService'

function UserManagementPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({ users: [], stats: {}, defaultPassword: 'Admin@123', pagination: {} })
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' })
  const [page, setPage] = useState(1)

  const loadUsers = async (nextPage = page) => {
    setLoading(true)
    try {
      const response = await userApi.getUsers({ page: nextPage, limit: 10 })
      setData(response)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(page)
  }, [page])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const response = await userApi.createUser(form)
      toast.success(`User created. Default password: ${response.defaultPassword}`)
      setForm({ name: '', email: '', role: 'employee' })
      await loadUsers(1)
      setPage(1)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset this user password to default?')) return

    try {
      const response = await userApi.resetUserPassword(id)
      toast.success(`Password reset: ${response.defaultPassword}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset password')
    }
  }

  const cards = [
    { label: 'Total Users', value: data.stats.total_users || 0 },
    { label: 'Employees', value: data.stats.total_employees || 0 },
    { label: 'Admins', value: data.stats.total_admins || 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">User Manage</h1>
      <p className="text-slate-400 mt-1">Create users, view user records, and manage default passwords.</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateUser} className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-5 grid md:grid-cols-4 gap-3">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="User Name"
          required
          className="w-full"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="User Email"
          required
          className="w-full"
        />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full">
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button disabled={submitting} className="bg-blue-500 hover:bg-blue-600 rounded-md px-4 py-2 disabled:opacity-70">
          {submitting ? 'Creating...' : 'Create User'}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-400">
        Default password for admin-created/reset users: <span className="text-slate-200 font-medium">{data.defaultPassword}</span>
      </div>

      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="text-left font-medium px-4 py-3">User ID</th>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Default Password</th>
                  <th className="text-left font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-700/70">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">{data.defaultPassword}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleResetPassword(user.id)} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-xs">
                        Reset to Default
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-700 flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-slate-300">
            Page {data.pagination.page || page} / {data.pagination.totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
            disabled={loading || page >= (data.pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
