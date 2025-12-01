const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

async function apiRequest(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message ?? data?.detail ?? 'Request failed'
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export const requestOtp = (email) =>
  apiRequest('/auth/otp/request', {
    method: 'POST',
    body: { email },
  })

export const resendOtp = (email) =>
  apiRequest('/auth/otp/resend', {
    method: 'POST',
    body: { email },
  })

export const verifyOtp = (email, otp) =>
  apiRequest('/auth/otp/verify', {
    method: 'POST',
    body: { email, otp },
  })

export const logoutSession = (token) =>
  apiRequest('/auth/logout', {
    method: 'POST',
    token,
  })

export const fetchProfile = (token) =>
  apiRequest('/profile/me', {
    token,
  })

export const fetchUsers = (token) =>
  apiRequest('/users', {
    token,
  })

export const fetchVideosByCategory = (category, token) =>
  apiRequest(`/videos/db/${encodeURIComponent(category)}`, {
    token,
  })

export const uploadVideo = (formData, token) =>
  apiRequest('/videos/upload', {
    method: 'POST',
    body: formData,
    token,
    isFormData: true,
  })

export const updateVideo = (videoId, formData, token) =>
  apiRequest(`/videos/${videoId}`, {
    method: 'PUT',
    body: formData,
    token,
    isFormData: true,
  })

export const deleteVideo = (videoId, token) =>
  apiRequest(`/videos/${videoId}`, {
    method: 'DELETE',
    token,
  })
