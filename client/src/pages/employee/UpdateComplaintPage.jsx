import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { complaintApi } from '../../services/complaintService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getStatusBadge } from '../../utils/status'

const priorities = ['Low', 'Medium', 'High', 'Critical']
const uploadBaseUrl = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5001'

function UpdateComplaintPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    attachment: null,
    existingAttachment: '',
  })

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const response = await complaintApi.getMyComplaints({ page: 1, limit: 100 })
      setComplaints(response.complaints)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const startEdit = (item) => {
    if (item.status !== 'Pending') {
      toast.error('Only pending complaints can be edited')
      return
    }

    setEditingId(item.id)
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      attachment: null,
      existingAttachment: item.attachment || '',
    })
  }

  const clearEdit = () => {
    setEditingId(null)
    setForm({
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
      attachment: null,
      existingAttachment: '',
    })
  }

  const submitUpdate = async (e) => {
    e.preventDefault()
    if (!editingId) return

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('priority', form.priority)
    if (form.attachment) fd.append('attachment', form.attachment)

    try {
      setSubmitting(true)
      await complaintApi.updateMyComplaint(editingId, fd)
      toast.success('Complaint updated')
      clearEdit()
      await loadComplaints()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update complaint')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelComplaint = async (id) => {
    if (!window.confirm('Cancel this complaint? This action cannot be undone.')) return

    try {
      await complaintApi.cancelMyComplaint(id)
      toast.success('Complaint cancelled')
      if (editingId === id) clearEdit()
      await loadComplaints()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel complaint')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Update Complaint</h1>
      <p className="text-slate-400 mt-1">Edit or cancel only complaints that are still pending.</p>

      {loading ? (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Ticket ID</th>
                  <th className="text-left font-medium px-4 py-3">Title</th>
                  <th className="text-left font-medium px-4 py-3">Category</th>
                  <th className="text-left font-medium px-4 py-3">Priority</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id} className="border-t border-slate-700/70">
                    <td className="px-4 py-3 text-slate-300">{item.ticket_id}</td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3 text-slate-300">{item.category}</td>
                    <td className="px-4 py-3 text-slate-300">{item.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(item)} className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-xs">
                            Edit
                          </button>
                          <button onClick={() => cancelComplaint(item.id)} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-xs">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Locked after progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingId && (
        <form onSubmit={submitUpdate} className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4 max-w-3xl">
          <h2 className="text-lg font-semibold">Edit Pending Complaint</h2>

          <input
            className="w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
          />

          <textarea
            rows={4}
            className="w-full"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Category"
              required
            />

            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full">
              {priorities.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Update Attachment (optional)</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
              onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })}
              className="w-full"
            />
            {form.existingAttachment && (
              <a
                href={`${uploadBaseUrl}/uploads/${form.existingAttachment}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-blue-400 hover:text-blue-300 underline text-sm"
              >
                View current attachment
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-70">
              {submitting ? 'Updating...' : 'Update Complaint'}
            </button>
            <button type="button" onClick={clearEdit} className="px-5 py-2 rounded bg-slate-700 hover:bg-slate-600">
              Cancel Edit
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UpdateComplaintPage
