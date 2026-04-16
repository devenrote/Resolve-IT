import { useState } from 'react'
import toast from 'react-hot-toast'
import { complaintApi } from '../../services/complaintService'

const categories = ['Hardware', 'Software', 'Network', 'Access', 'Email', 'Other']
const priorities = ['Low', 'Medium', 'High', 'Critical']

function CreateComplaintPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    attachment: null,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('priority', form.priority)
    if (form.attachment) fd.append('attachment', form.attachment)

    try {
      setLoading(true)
      const data = await complaintApi.create(fd)
      toast.success(`Complaint created: ${data.complaint.ticket_id}`)
      setForm({ title: '', description: '', category: categories[0], priority: priorities[1], attachment: null })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Create Complaint</h1>
      <p className="text-slate-400 mt-1">Provide clear details so the support team can resolve your issue faster.</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-700 bg-slate-900/40">
          <h2 className="font-semibold">Complaint Details</h2>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Title</label>
            <input
              className="w-full"
              placeholder="Brief issue title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={4}
              className="w-full"
              placeholder="Describe the issue, impact, and any troubleshooting steps already tried."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full">
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Attachment (optional)</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
              onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })}
              className="w-full"
            />
            <p className="text-xs text-slate-400 mt-1">Allowed: image, PDF, DOC, DOCX (max 10MB)</p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-700 bg-slate-900/40 flex justify-end">
          <button
            disabled={loading}
            className="min-w-40 bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-lg font-medium disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateComplaintPage
