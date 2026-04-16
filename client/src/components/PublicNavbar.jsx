import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Home', id: 'top' },
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Dashboard', id: 'dashboard-preview' },
  { label: 'Contact', id: 'contact' },
]

function PublicNavbar({ onSectionNavigate, isCorporateGray = false, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSectionClick = (id) => {
    setMenuOpen(false)

    if (id === 'dashboard-preview' && user) {
      navigate(user.role === 'admin' ? '/admin' : '/employee')
      return
    }

    if (onSectionNavigate) {
      onSectionNavigate(id)
      return
    }

    navigate('/', { state: { scrollTo: id, from: location.pathname } })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        <button
          onClick={() => handleSectionClick('top')}
          className="text-2xl font-bold text-blue-400 transition-all duration-300 hover:text-blue-300 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]"
        >
          ResolveIT
        </button>

        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className="px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-auto">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={isCorporateGray ? 'Switch to original theme' : 'Switch to Corporate Gray theme'}
              className="w-10 h-10 grid place-items-center rounded-md bg-slate-800 hover:bg-slate-700 hover:shadow-md hover:shadow-slate-900/60 text-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {isCorporateGray ? '☀️' : '🌙'}
            </button>
          )}
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 hover:shadow-md hover:shadow-slate-900/60 text-sm transition-all duration-300 hover:-translate-y-0.5">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-900/50 text-sm transition-all duration-300 hover:-translate-y-0.5">
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 hover:shadow-md hover:shadow-slate-900/60 text-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Logout
            </button>
          )}
        </div>

        <button
          className="lg:hidden px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-all duration-300 hover:shadow-md hover:shadow-slate-900/60"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto px-6 pb-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className="w-full text-left px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-sm transition-all duration-300 hover:translate-x-1"
            >
              {item.label}
            </button>
          ))}
          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  aria-label="Toggle theme"
                  className="col-span-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-center text-sm transition-all duration-300"
                >
                  {isCorporateGray ? '☀️ Original Theme' : '🌙 Corporate Gray'}
                </button>
              )}
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-center text-sm transition-all duration-300">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-center text-sm transition-all duration-300">
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
                navigate('/')
              }}
              className="w-full px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default PublicNavbar

