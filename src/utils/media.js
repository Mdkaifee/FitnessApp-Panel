const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export const buildMediaUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const trimmed = path.replace(/^\/+/, '')
  return `${API_BASE_URL}/${trimmed}`
}
