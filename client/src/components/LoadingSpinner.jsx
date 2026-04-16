function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-slate-300 text-sm">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
