import { useEffect, useState } from 'react'
import { complaintApi } from '../../services/complaintService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getStatusBadge } from '../../utils/status'

const uploadBaseUrl = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5001'

function EmployeeDashboardPage() {
  const [data, setData] = useState({ complaints: [], pagination: {} })
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const summary = await complaintApi.getMyComplaints({ page: 1, limit: 100 })
        const counts = summary.complaints.reduce(
          (acc, item) => {
            acc.total += 1
            if (item.status === 'Pending') acc.pending += 1
            if (item.status === 'In Progress') acc.inProgress += 1
            if (item.status === 'Resolved') acc.resolved += 1
            if (item.status === 'Closed') acc.closed += 1
            return acc
          },
          { total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 }
        )
        setStats(counts)
        const listing = await complaintApi.getMyComplaints({ page, limit: 8 })
        setData(listing)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [page])

  if (loading) return <LoadingSpinner />

  const cards = [
    { label: 'Total', value: stats.total },
    { label: 'Pending', value: stats.pending },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'Resolved', value: stats.resolved },
    { label: 'Closed', value: stats.closed },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <p className="text-slate-400 mt-1">Quick overview of your submitted complaints.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-lg font-semibold">My Complaints</h2>
        </div>

        {data.complaints.length === 0 ? (
          <p className="px-4 py-6 text-slate-400">No complaints found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Ticket ID</th>
                  <th className="text-left font-medium px-4 py-3">Title</th>
                  <th className="text-left font-medium px-4 py-3">Category</th>
                  <th className="text-left font-medium px-4 py-3">Priority</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Attachment</th>
                  <th className="text-left font-medium px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.complaints.map((item) => (
                  <tr key={item.id} className="border-t border-slate-700/70">
                    <td className="px-4 py-3 text-slate-300">{item.ticket_id}</td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3 text-slate-300">{item.category}</td>
                    <td className="px-4 py-3 text-slate-300">{item.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.attachment ? (
                        <a
                          href={`${uploadBaseUrl}/uploads/${item.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          View file
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-700 flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-slate-300">
            Page {data.pagination.page || 1} / {data.pagination.totalPages || 1}
          </span>
          <button
            className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
            disabled={page >= (data.pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboardPage
