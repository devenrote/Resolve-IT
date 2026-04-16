export const getStatusBadge = (status) => {
  const map = {
    Pending: 'bg-amber-500/20 text-amber-300',
    'In Progress': 'bg-blue-500/20 text-blue-300',
    Resolved: 'bg-emerald-500/20 text-emerald-300',
    Closed: 'bg-slate-500/20 text-slate-300',
  }

  return map[status] || 'bg-slate-700 text-slate-200'
}
