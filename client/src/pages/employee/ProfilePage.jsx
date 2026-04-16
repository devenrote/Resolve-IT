import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/authService'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nick_name: user?.nick_name || '',
    country: user?.country || '',
    language: user?.language || '',
    timezone: user?.timezone || '',
    linkedin_url: user?.linkedin_url || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      nick_name: user?.nick_name || '',
      country: user?.country || '',
      language: user?.language || '',
      timezone: user?.timezone || '',
      linkedin_url: user?.linkedin_url || '',
    })
  }, [user])

  const profileInitial = useMemo(() => (form.name?.trim()?.[0] || 'U').toUpperCase(), [form.name])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = await authApi.updateProfile(form)
      setUser(data.user)
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-slate-400 mt-1">Manage your account details and professional profile links.</p>

      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-400/40 via-slate-300/20 to-amber-200/30" />

        <div className="px-6 md:px-8 pb-8 -mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-2xl font-semibold text-blue-300">
                {profileInitial}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{form.name || 'User Profile'}</h2>
                <p className="text-slate-400">{form.email || '-'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={form.linkedin_url || '#'}
                target="_blank"
                rel="noreferrer"
                className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                  form.linkedin_url
                    ? 'border-blue-400/40 text-blue-300 hover:bg-blue-500/20'
                    : 'border-slate-700 text-slate-500 pointer-events-none'
                }`}
                title="LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.95 1.95 0 1 0 5.25 6.9 1.95 1.95 0 0 0 5.25 3Zm14.2 8.95c0-2.82-1.5-4.13-3.52-4.13-1.63 0-2.36.9-2.77 1.53v-1.3H9.78V20h3.38v-5.7c0-1.5.28-2.96 2.14-2.96 1.83 0 1.86 1.72 1.86 3.05V20h3.39l-.1-8.05Z" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm"
              >
                {isEditing ? 'Close' : 'Edit'}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full"
              disabled={!isEditing}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nick Name</label>
            <input
              value={form.nick_name}
              onChange={(e) => setForm({ ...form, nick_name: e.target.value })}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full"
              disabled={!isEditing}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Country</label>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Language</label>
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Time Zone</label>
            <input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">LinkedIn URL</label>
            <input
              placeholder="https://www.linkedin.com/in/your-profile"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              className="w-full"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="md:col-span-2 pt-1">
              <button disabled={loading} className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-md disabled:opacity-70">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
