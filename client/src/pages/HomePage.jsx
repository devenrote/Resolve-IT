import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar'
import { contactApi } from '../services/contactService'

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCorporateGray, setIsCorporateGray] = useState(
    () => localStorage.getItem('resolveit_home_theme') === 'corporate-gray'
  )
  const [contactForm, setContactForm] = useState({ email: '', message: '' })
  const [sending, setSending] = useState(false)

  const scrollToSection = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (!location.state?.scrollTo) return
    scrollToSection(location.state.scrollTo)
    navigate('/', { replace: true, state: null })
  }, [location.state, navigate])

  useEffect(() => {
    localStorage.setItem('resolveit_home_theme', isCorporateGray ? 'corporate-gray' : 'original')
  }, [isCorporateGray])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      setSending(true)
      const data = await contactApi.sendMessage(contactForm)
      toast.success(data.message || 'Message sent successfully')
      setContactForm({ email: '', message: '' })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      id="top"
      className={`resolveit-home min-h-screen bg-slate-900 text-slate-100 ${
        isCorporateGray ? 'corporate-gray' : ''
      }`}
    >
      <PublicNavbar
        onSectionNavigate={scrollToSection}
        isCorporateGray={isCorporateGray}
        onToggleTheme={() => setIsCorporateGray((prev) => !prev)}
      />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-blue-300 text-xs md:text-sm uppercase tracking-[0.2em]">Corporate Complaint Management System</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            Simplifying Complaint Resolution for Modern Organizations
          </h1>
          <p className="mt-6 text-slate-300 max-w-3xl mx-auto text-lg">
            ResolveIT enables employees and customers to submit, track, and resolve complaints efficiently with real-time status updates and transparent workflows.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-7 py-3 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-900/30 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/60">
              Submit Complaint
            </Link>
            <button onClick={() => scrollToSection('dashboard-preview')} className="px-7 py-3 rounded-full bg-slate-700/40 hover:bg-slate-700 border border-slate-500/70 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-950/60">
              Track Status
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/40">
            <h3 className="font-semibold">Role-Based Dashboards</h3>
            <p className="text-slate-300 mt-2 text-sm">Different dashboards for users, administrators, and support teams.</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/40">
            <h3 className="font-semibold">Complaint Management</h3>
            <p className="text-slate-300 mt-2 text-sm">Create, filter, update, and manage complaint statuses efficiently.</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/40">
            <h3 className="font-semibold">Analytics & Reports</h3>
            <p className="text-slate-300 mt-2 text-sm">Visual insights with charts showing open, resolved, and pending complaints.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <div className="mt-6 grid xl:grid-cols-4 md:grid-cols-2 gap-5">
          {[
            'Submit Complaint',
            'Complaint Assigned to Authority',
            'Investigation and Review',
            'Resolution and Feedback',
          ].map((step, idx) => (
            <div
              key={step}
              className="relative bg-slate-800/90 text-slate-100 border border-slate-600/60 rounded-2xl p-6 min-h-[170px] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-900/40"
            >
              {idx < 3 && <div className="hidden xl:block absolute top-8 -right-6 w-6 h-[2px] bg-blue-500/60" />}
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center mx-auto shadow-md shadow-blue-900/40">
                {idx + 1}
              </div>
              <p className="mt-4 text-center font-semibold text-lg">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="dashboard-preview" className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold">Dashboard Preview</h2>
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-3 md:p-4 shadow-xl shadow-slate-950/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-blue-950/40">
          <img
            src="/dashboard-preview.png"
            alt="ResolveIT admin analytics dashboard preview"
            className="w-full h-auto rounded-lg border border-slate-700 object-cover transition-all duration-500 hover:scale-[1.01] hover:border-blue-500/70"
          />
          <p className="text-xs text-slate-400 mt-3 px-1">
            Dashboard analytics preview showing total complaints, category-wise distribution, and status insights.
          </p>
        </div>
      </section>

      <section id="contact" className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold">Contact</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/30">
            <h3 className="font-semibold">Support Information</h3>
            <p className="text-slate-300 text-sm mt-3">Email: support@resolveit.com</p>
            <p className="text-slate-300 text-sm mt-1">Helpdesk: +91 8767392393</p>
            <p className="text-slate-300 text-sm mt-1">Always-On Helpdesk: 24/7 Incident Support</p>
          </div>
          <form onSubmit={handleSendMessage} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3 transition-all duration-300 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-950/30">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />
            <textarea
              rows={4}
              placeholder="Your Message"
              className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              required
            />
            <button disabled={sending} type="submit" className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/50">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-800 mt-8 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-300">ResolveIT</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Complaint & Grievance Redressal System built for modern organizations with transparent workflows and faster resolution.
              </p>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-slate-300">Quick Links</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
                <button onClick={() => scrollToSection('top')} className="text-left hover:text-white transition-all duration-300 hover:translate-x-1">Home</button>
                <button onClick={() => scrollToSection('features')} className="text-left hover:text-white transition-all duration-300 hover:translate-x-1">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-white transition-all duration-300 hover:translate-x-1">How It Works</button>
                <button onClick={() => scrollToSection('dashboard-preview')} className="text-left hover:text-white transition-all duration-300 hover:translate-x-1">Dashboard</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-slate-300">Platform</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
                <Link to="/login" className="hover:text-white transition-all duration-300 hover:translate-x-1">Login</Link>
                <Link to="/register" className="hover:text-white transition-all duration-300 hover:translate-x-1">Register</Link>
                <button onClick={() => scrollToSection('contact')} className="text-left hover:text-white transition-all duration-300 hover:translate-x-1">Contact Support</button>
              </div>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-slate-300">Support</h4>
              <div className="mt-3 text-sm text-slate-400 space-y-2">
                <p>Email: support@resolveit.com</p>
                <p>Helpdesk: +91 8767392393</p>
                <p>Mon - Fri | 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} ResolveIT. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="hover:text-slate-300 transition-all duration-300 hover:-translate-y-0.5">Privacy Policy</button>
              <button className="hover:text-slate-300 transition-all duration-300 hover:-translate-y-0.5">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
