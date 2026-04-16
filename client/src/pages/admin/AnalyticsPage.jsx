import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { complaintApi } from '../../services/complaintService'
import LoadingSpinner from '../../components/LoadingSpinner'

const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function AnalyticsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    complaintApi.analytics().then(setData)
  }, [])

  if (!data) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-2xl font-semibold mt-2">{data.totals.total || 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-2xl font-semibold mt-2">{data.totals.pending || 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="text-2xl font-semibold mt-2">{data.totals.in_progress || 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Resolved</p>
          <p className="text-2xl font-semibold mt-2">{data.totals.resolved || 0}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Closed</p>
          <p className="text-2xl font-semibold mt-2">{data.totals.closed || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-96">
          <h2 className="font-semibold mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.byCategory}>
              <XAxis dataKey="category" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-96">
          <h2 className="font-semibold mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                {data.byStatus.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
