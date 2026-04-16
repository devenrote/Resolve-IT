import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { complaintApi } from '../../services/complaintService'
import { getStatusBadge } from '../../utils/status'
import LoadingSpinner from '../../components/LoadingSpinner'

const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed']
const uploadBaseUrl = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5001'

function ComplaintManagementPage() {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' })
  const [loading, setLoading] = useState(true)

  const load = async (page = 1, activeFilters = filters) => {
    setLoading(true)
    try {
      const data = await complaintApi.getAllComplaints({ page, limit: 8, ...activeFilters })
      setComplaints(data.complaints)
      setPagination(data.pagination)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await complaintApi.updateStatus(id, status)
      toast.success('Status updated')
      load(pagination.page)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Status update failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return

    try {
      await complaintApi.deleteComplaint(id)
      toast.success('Complaint deleted')
      load(pagination.page)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed')
    }
  }

  const applyFilters = () => load(1, filters)

  return (
    <div>
      <h1 className="text-2xl font-bold">Complaint Management</h1>

      <div className="mt-5 grid md:grid-cols-4 gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <button onClick={applyFilters} className="bg-blue-500 hover:bg-blue-600 rounded-md px-4 py-2">
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {complaints.map((item) => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-400">
                    {item.ticket_id} • {item.employee_name} • {item.category} • {item.priority}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>{item.status}</span>
              </div>

              <p className="text-slate-300 text-sm mt-3">{item.description}</p>
              {item.attachment && (
                <a
                  href={`${uploadBaseUrl}/uploads/${item.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  View Attachment
                </a>
              )}

              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-400">Next status:</span>
                {statuses
                  .filter((status) => {
                    const idx = statuses.indexOf(item.status)
                    return statuses.indexOf(status) === idx + 1
                  })
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(item.id, status)}
                      className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-sm"
                    >
                      Move to {status}
                    </button>
                  ))}

                <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-sm ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
              disabled={pagination.page <= 1}
              onClick={() => load(pagination.page - 1)}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-slate-300">
              Page {pagination.page || 1} / {pagination.totalPages || 1}
            </span>
            <button
              className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
              disabled={pagination.page >= (pagination.totalPages || 1)}
              onClick={() => load(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintManagementPage
