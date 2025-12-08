import { getApiBaseUrl } from '../utils/apiBase'

const API_BASE_URL = getApiBaseUrl()

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

const adminPayload = (email, extra = {}) => ({ email, is_admin: true, platform: 'web', ...extra })

export const requestOtp = (email) =>
  apiRequest('/auth/otp/request', {
    method: 'POST',
    body: adminPayload(email),
  })

export const resendOtp = (email) =>
  apiRequest('/auth/otp/resend', {
    method: 'POST',
    body: adminPayload(email),
  })

export const verifyOtp = (email, otp) =>
  apiRequest('/auth/otp/verify', {
    method: 'POST',
    body: adminPayload(email, { otp }),
  })

export const logoutSession = (token) =>
  apiRequest('/auth/logout', {
    method: 'POST',
    token,
  })

export const fetchDashboardMetrics = (token) =>
  apiRequest('/admin/dashboard/metrics', {
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

export const fetchVideosByCategory = (category, token, page = 1, pageSize = 20) =>
  apiRequest(`/videos/db/${encodeURIComponent(category)}?page=${page}&page_size=${pageSize}`, {
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

import { GENDER_ALL_LABEL, GENDER_API_BOTH } from '../constants'

export const fetchQuestions = ({ answerType, gender, status }, token) => {
  const params = new URLSearchParams()
  if (answerType) params.append('answer_type', answerType)
  if (gender) {
    if (gender === GENDER_ALL_LABEL) {
      params.append('gender', GENDER_API_BOTH)
    } else {
      params.append('gender', gender)
    }
  }
  if (status) {
    params.append('is_active', status === 'active' ? 'true' : 'false')
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/questions${query}`, { token })
}

export const createQuestion = (payload, token) =>
  apiRequest('/questions', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateQuestion = (questionId, payload, token) =>
  apiRequest(`/questions/${questionId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteQuestion = (questionId, token) =>
  apiRequest(`/questions/${questionId}`, {
    method: 'DELETE',
    token,
  })

export const fetchUsersPaginated = ({ page, pageSize }, token) =>
  apiRequest(`/users?page=${page}&page_size=${pageSize}`, { token })

export const updateUserStatus = (userId, isActive, token) =>
  apiRequest(`/users/${userId}/status?is_active=${isActive ? 'true' : 'false'}`, {
    method: 'PUT',
    token,
  })

export const fetchUserAnalytics = (userId, days = 7, token) => {
  const params = new URLSearchParams()
  params.append('user_id', String(userId))
  params.append('days', String(days))
  return apiRequest(`/admin/users/analytics?${params.toString()}`, { token })
}

export const fetchSubscriptionPlans = ({ includeInactive = false, status = '' } = {}, token) => {
  const params = new URLSearchParams()
  if (status) {
    params.append('status', status)
  }
  if (includeInactive) {
    params.append('include_inactive', 'true')
  }
  const query = params.toString()
  const suffix = query ? `?${query}` : ''
  return apiRequest(`/plans/admin${suffix}`, { token })
}

export const createSubscriptionPlan = (payload, token) =>
  apiRequest('/plans/admin', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateSubscriptionPlan = (planId, payload, token) =>
  apiRequest(`/plans/admin/${planId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteSubscriptionPlan = (planId, token) =>
  apiRequest(`/plans/admin/${planId}`, {
    method: 'DELETE',
    token,
  })
