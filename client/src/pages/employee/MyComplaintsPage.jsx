import { useEffect, useState } from 'react'
import { complaintApi } from '../../services/complaintService'
import { getStatusBadge } from '../../utils/status'
import LoadingSpinner from '../../components/LoadingSpinner'

function MyComplaintsPage() {
  const [data, setData] = useState({ complaints: [], pagination: {} })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const response = await complaintApi.getMyComplaints({ page, limit: 8 })
      setData(response)
      setLoading(false)
    }

    load()
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold">My Complaints</h1>

      {loading ? (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 mt-6">
            {data.complaints.map((item) => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.ticket_id} • {item.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>{item.status}</span>
                </div>
                <p className="text-slate-300 text-sm mt-3">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-slate-300">
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
        </>
      )}
    </div>
  )
}

export default MyComplaintsPage
