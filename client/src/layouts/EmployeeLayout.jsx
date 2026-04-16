import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/employee', label: 'Dashboard' },
  { to: '/employee/create-complaint', label: 'Create Complaint' },
  { to: '/employee/update-complaint', label: 'Update Complaint' },
  { to: '/employee/tracking', label: 'Tracking' },
  { to: '/employee/profile', label: 'Profile' },
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
  'Create Complaint': (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  'Update Complaint': (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m4 20 4-1 9-9-3-3-9 9-1 4ZM14 7l3 3" />
    </svg>
  ),
  Tracking: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  ),
  Profile: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c2.5-4 13.5-4 16 0" />
    </svg>
  ),
}

function EmployeeLayout() {
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
            <p className="text-xs text-slate-400">Employee Portal</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/employee'}
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

export default EmployeeLayout














