import { getApiBaseUrl } from './apiBase'

const API_BASE_URL = getApiBaseUrl()

export const buildMediaUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const trimmed = path.replace(/^\/+/, '')
  return `${API_BASE_URL}/${trimmed}`
}
