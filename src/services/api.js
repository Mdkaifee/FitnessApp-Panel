import { getApiBaseUrl } from '../utils/apiBase'

const API_BASE_URL = getApiBaseUrl()

const extractErrorMessage = (payload) => {
  if (payload == null) return null;
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) {
    const parts = payload
      .map((item) => extractErrorMessage(item?.msg ?? item?.message ?? item?.detail ?? item))
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  }
  if (typeof payload === 'object') {
    return (
      extractErrorMessage(payload.message) ??
      extractErrorMessage(payload.detail) ??
      extractErrorMessage(payload.msg) ??
      extractErrorMessage(payload.error)
    );
  }
  return String(payload);
};

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
    const message = extractErrorMessage(data) || response.statusText || 'Request failed'
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

export const fetchLegalLinks = () =>
  apiRequest('/legal-links', {
    method: 'GET',
  })

export const updateLegalLinks = (payload, token) =>
  apiRequest('/legal-links/admin', {
    method: 'PUT',
    body: payload,
    token,
  })

export const fetchUsers = (token) =>
  apiRequest('/users', {
    token,
  })

export const fetchVideosByCategory = (
  category,
  token,
  page = 1,
  pageSize = 20,
  { gender, excludePlanVideos = true } = {},
) => {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('page_size', String(pageSize))
  if (gender && gender !== 'All') {
    params.append('gender', gender)
  }
  if (excludePlanVideos) {
    params.append('exclude_plan_videos', 'true')
  }
  const query = params.toString()
  return apiRequest(`/videos/db/${encodeURIComponent(category)}?${query}`, {
    token,
  })
}

export const fetchExerciseLibrary = (token) =>
  apiRequest('/exercise-library/admin', {
    token,
  })

export const updateExerciseLibraryItem = (itemId, payload, token) =>
  apiRequest(`/exercise-library/${itemId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const uploadVideo = (payload, token) =>
  apiRequest('/videos/upload', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateVideo = (videoId, payload, token) =>
  apiRequest(`/videos/${videoId}`, {
    method: 'PUT',
    body: payload,
    token,
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

export const updateUserFlags = (userId, payload, token) =>
  apiRequest(`/users/${userId}/flags`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const fetchUserAnalytics = (userId, days = 7, token) => {
  const params = new URLSearchParams()
  params.append('user_id', String(userId))
  params.append('days', String(days))
  return apiRequest(`/admin/users/analytics?${params.toString()}`, { token })
}

export const fetchPrograms = ({ includeInactive = true, access = '' } = {}, token) => {
  const params = new URLSearchParams()
  if (includeInactive) {
    params.append('include_inactive', 'true')
  }
  if (access) {
    params.append('access', access)
  }
  const query = params.toString()
  const suffix = query ? `?${query}` : ''
  return apiRequest(`/programs/admin${suffix}`, { token })
}

export const createProgram = (payload, token) =>
  apiRequest('/programs/admin', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateProgram = (programIdOrSlug, payload, token) =>
  apiRequest(`/programs/admin/${programIdOrSlug}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteProgram = (programIdOrSlug, token) =>
  apiRequest(`/programs/admin/${programIdOrSlug}`, {
    method: 'DELETE',
    token,
  })

export const fetchProgramDetailAdmin = (programIdOrSlug, token) =>
  apiRequest(`/programs/admin/${programIdOrSlug}`, {
    token,
  })

export const updateProgramSchedule = (programIdOrSlug, payload, token) =>
  apiRequest(`/programs/admin/${programIdOrSlug}/schedule`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const fetchFoodCategoriesAdmin = (token, { includeInactive = true } = {}) => {
  const query = includeInactive ? '?include_inactive=true' : '?include_inactive=false'
  return apiRequest(`/nutrition/admin/categories${query}`, { token })
}

export const createFoodCategory = (payload, token) =>
  apiRequest('/nutrition/admin/categories', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateFoodCategory = (categoryId, payload, token) =>
  apiRequest(`/nutrition/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteFoodCategory = (categoryId, token) =>
  apiRequest(`/nutrition/admin/categories/${categoryId}`, {
    method: 'DELETE',
    token,
  })

export const fetchFoodsAdmin = ({ search = '', categoryId = '', includeInactive = true, page = 1, pageSize = 50 } = {}, token) => {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('page_size', String(pageSize))
  if (search.trim()) params.append('search', search.trim())
  if (categoryId) params.append('category_id', String(categoryId))
  if (!includeInactive) params.append('include_inactive', 'false')
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/nutrition/admin/foods${query}`, { token })
}

export const createFood = (payload, token) =>
  apiRequest('/nutrition/admin/foods', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateFood = (foodId, payload, token) =>
  apiRequest(`/nutrition/admin/foods/${foodId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteFood = (foodId, token) =>
  apiRequest(`/nutrition/admin/foods/${foodId}`, {
    method: 'DELETE',
    token,
  })

export const fetchMealsAdmin = ({ includeInactive = true } = {}, token) => {
  const params = new URLSearchParams()
  if (includeInactive) {
    params.append('include_inactive', 'true')
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/nutrition/admin/meals${query}`, { token })
}

export const createMeal = (payload, token) =>
  apiRequest('/nutrition/admin/meals', {
    method: 'POST',
    body: payload,
    token,
  })

export const updateMeal = (mealId, payload, token) =>
  apiRequest(`/nutrition/admin/meals/${mealId}`, {
    method: 'PUT',
    body: payload,
    token,
  })

export const deleteMeal = (mealId, token) =>
  apiRequest(`/nutrition/admin/meals/${mealId}`, {
    method: 'DELETE',
    token,
  })
