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

function AdminDashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    complaintApi.analytics().then(setData)
  }, [])

  if (!data) return <LoadingSpinner />

  const cards = [
    { label: 'Total Complaints', value: data.totals.total || 0 },
    { label: 'Pending', value: data.totals.pending || 0 },
    { label: 'In Progress', value: data.totals.in_progress || 0 },
    { label: 'Resolved', value: data.totals.resolved || 0 },
    { label: 'Closed', value: data.totals.closed || 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-slate-400 mt-1">System-wide complaint metrics.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-96 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20">
          <h2 className="font-semibold mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.byCategory}>
              <XAxis dataKey="category" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.15)' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#cbd5e1' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-96 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-900/20">
          <h2 className="font-semibold mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                {data.byStatus.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#cbd5e1' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
