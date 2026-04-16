import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import PublicNavbar from '../components/PublicNavbar'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const data = await authApi.register(form)
      login(data.token, data.user)
      toast.success('Registration successful')
      navigate(data.user.role === 'admin' ? '/admin' : '/employee')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <PublicNavbar />
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 text-slate-100">
          <h1 className="text-2xl font-bold">Create Account</h1>

          <div className="mt-5 space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full"
            />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <button disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-md font-medium disabled:opacity-70">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>

          <p className="text-sm text-slate-300 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
