import { useState } from 'react'
import toast from 'react-hot-toast'
import { complaintApi } from '../../services/complaintService'
import { getStatusBadge } from '../../utils/status'

const statusSteps = ['Pending', 'In Progress', 'Resolved', 'Closed']

function TrackingPage() {
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)
  const [complaint, setComplaint] = useState(null)

  const getProgressLabel = (status) => {
    const idx = statusSteps.indexOf(status)
    if (idx === -1) return 'Unknown'
    return `Step ${idx + 1} of ${statusSteps.length}`
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    const normalizedTicketId = ticketId.trim().toUpperCase()

    if (!normalizedTicketId) {
      toast.error('Please enter a complaint ID')
      return
    }

    try {
      setLoading(true)
      const result = await complaintApi.trackMyComplaintByTicket(normalizedTicketId)
      setComplaint(result.complaint)
    } catch (error) {
      setComplaint(null)
      toast.error(error?.response?.data?.message || 'Complaint not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Tracking</h1>
      <p className="text-slate-400 mt-1">Enter your complaint ID to check current status.</p>

      <form onSubmit={handleTrack} className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-2xl">
        <label className="text-sm text-slate-300">Complaint ID</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Example: CMP-2026-001"
            className="w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-70"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
      </form>

      {complaint && (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{complaint.title}</h2>
              <p className="text-slate-400 text-sm mt-1">{complaint.ticket_id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(complaint.status)}`}>{complaint.status}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
            <p className="text-slate-300">
              <span className="text-slate-400">Category:</span> {complaint.category}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Priority:</span> {complaint.priority}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Progress:</span> {getProgressLabel(complaint.status)}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Last Updated:</span> {new Date(complaint.updated_at || complaint.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackingPage
