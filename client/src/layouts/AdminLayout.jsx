import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/complaints', label: 'Complaints' },
  { to: '/admin/users', label: 'User Manage' },
]

const iconByLabel = {
  Home: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5V20H3v-8.5Z" />
    </svg>
  ),
  Dashboard: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" />
    </svg>
  ),
  Complaints: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  'User Manage': (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
}

function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 md:flex">
      <aside className="w-full md:w-72 bg-[#0a1b3a] border-r border-slate-800 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-semibold">
            R
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-300 leading-tight">ResolveIT</h2>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-indigo-900/80 text-white' : 'text-slate-300 hover:bg-indigo-950/50'
                }`
              }
            >
              <span className="w-7 h-7 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-slate-300">
                {iconByLabel[link.label]}
              </span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-5 border-t border-slate-700/60">
          <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium">
            Logout
          </button>
          <p className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold inline-flex items-center justify-center">D</span>
            <span>Created By: <span className="text-slate-200 font-medium">Deven Rote</span></span>
          </p>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout














