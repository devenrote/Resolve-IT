const uploadBaseUrl = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5000'

export const resolveFileUrl = (filePath) => {
  if (!filePath) return ''
  if (/^https?:\/\//i.test(filePath)) {
    return filePath
  }
  return `${uploadBaseUrl}/api/complaints/attachment/${encodeURIComponent(filePath)}`
}

export const resolveDownloadUrl = (filePath) => {
  if (!filePath) return ''
  if (/^https?:\/\//i.test(filePath)) {
    // For Cloudinary files, we can add fl_attachment to force direct download
    if (filePath.includes('/upload/') && !filePath.includes('/upload/fl_attachment/')) {
      return filePath.replace('/upload/', '/upload/fl_attachment/')
    }
    return filePath
  }
  // Local attachments default download endpoint
  return `${uploadBaseUrl}/api/complaints/attachment/${encodeURIComponent(filePath)}`
}
