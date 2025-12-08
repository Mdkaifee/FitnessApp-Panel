import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  requestOtp,
  resendOtp,
  verifyOtp,
  logoutSession,
  fetchProfile,
  fetchUsersPaginated,
  fetchVideosByCategory,
  uploadVideo,
  updateVideo,
  deleteVideo,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateUserStatus,
  fetchUserAnalytics,
  fetchDashboardMetrics,
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from './services/api'
import './App.css'
import {
  ACTIVE_VIEW_KEY,
  AUTH_EMAIL_KEY,
  PUBLIC_VIEWS,
  ROUTE_TO_WORKSPACE_VIEW,
  TOKEN_KEY,
  VIDEO_CATEGORIES,
  VIDEO_GENDERS,
  WORKSPACE_VIEW_ROUTES,
  WORKSPACE_VIEWS,
  GENDER_ALL_LABEL,
  GENDER_API_BOTH,
} from './constants'
import {
  getInitialActiveView,
  getInitialToken,
  safeGetFromStorage,
  safeRemoveFromStorage,
  safeSetInStorage,
} from './utils/storage'
import AuthView from './views/AuthView'
import DashboardView from './views/DashboardView'
import UsersView from './views/UsersView'
import VideosView from './views/VideosView'
import QuestionsView from './views/QuestionsView'
import SubscriptionView from './views/SubscriptionView'
import PrivacyPolicyView from './views/PrivacyPolicyView'
import DeleteAccountView from './views/DeleteAccountView'
import Sidebar from './components/layout/Sidebar'
import StatusBanner from './components/shared/StatusBanner'
import VideoModal from './components/modals/VideoModal'
import QuestionModal from './components/modals/QuestionModal'
import UserAnalyticsModal from './components/modals/UserAnalyticsModal'
import PlanModal from './components/modals/PlanModal'

const getInitialEmail = () => safeGetFromStorage(AUTH_EMAIL_KEY) ?? ''

const getInitialAuthStep = () => {
  if (typeof window === 'undefined') return 'login'
  return window.location.pathname === '/verify-otp' ? 'otp' : 'login'
}

const getDefaultVideoForm = () => ({
  videoId: '',
  bodyPart: VIDEO_CATEGORIES[0].value,
  gender: VIDEO_GENDERS[0].value,
  title: '',
  description: '',
  videoFile: null,
  thumbnailFile: null,
})

const getDefaultPlanForm = () => ({
  id: '',
  durationMonths: '12',
  originalPrice: '',
  discountedPrice: '',
  isActive: true,
})

const parseCurrencyValue = (value) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseIntValue = (value) => {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildPlanPayload = (form) => ({
  duration_months: parseIntValue(form.durationMonths),
  original_price: parseCurrencyValue(form.originalPrice),
  discounted_price: parseCurrencyValue(form.discountedPrice),
  is_active: Boolean(form.isActive),
})

const buildPlanPayloadFromRecord = (plan, overrides = {}) => ({
  duration_months: parseIntValue(
    overrides.durationMonths ?? overrides.duration_months ?? plan?.duration_months ?? plan?.durationMonths ?? 0,
  ),
  original_price: parseCurrencyValue(
    overrides.originalPrice ?? overrides.original_price ?? plan?.original_price ?? plan?.originalPrice ?? 0,
  ),
  discounted_price: parseCurrencyValue(
    overrides.discountedPrice ?? overrides.discounted_price ?? plan?.discounted_price ?? plan?.discountedPrice ?? 0,
  ),
  is_active:
    typeof overrides.isActive === 'boolean'
      ? overrides.isActive
      : typeof overrides.is_active === 'boolean'
        ? overrides.is_active
        : Boolean(plan?.is_active ?? plan?.isActive ?? true),
})

const VIDEO_PAGE_SIZE = 20

const formatAnalyticsRangeLabel = (range) => {
  if (!range) return 'last 7 days'
  if (typeof range === 'string') return range
  const { start, end } = range
  if (!start || !end) return 'last 7 days'
  const startDate = new Date(start)
  const endDate = new Date(end)
  const formatDate = (value, fallback) => {
    if (!value) return fallback ?? '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  const startLabel = formatDate(start, start)
  const endLabel = formatDate(end, end)
  return `${startLabel} → ${endLabel}`
}

function App() {
  const [email, setEmail] = useState(getInitialEmail)
  const [otp, setOtp] = useState('')
  const [authStep, setAuthStep] = useState(getInitialAuthStep)
  const [flowHint, setFlowHint] = useState(null)
  const [token, setToken] = useState(() => getInitialToken())
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(false)
  const [dashboardStatsError, setDashboardStatsError] = useState('')
  const [usersData, setUsersData] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const [usersHasNext, setUsersHasNext] = useState(false)
  const [userStatusPending, setUserStatusPending] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userAnalytics, setUserAnalytics] = useState(null)
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false)
  const [userAnalyticsError, setUserAnalyticsError] = useState('')
  const [isUserAnalyticsOpen, setUserAnalyticsOpen] = useState(false)
  const [activeView, setActiveView] = useState(() => getInitialActiveView())
  const [status, setStatus] = useState(null)
  const [pendingAction, setPendingAction] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false)
  const [videoCategory, setVideoCategory] = useState(VIDEO_CATEGORIES[0].value)
  const [videosData, setVideosData] = useState(null)
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState(null)
  const [videoPage, setVideoPage] = useState(1)
  const [videosHasNext, setVideosHasNext] = useState(false)
  const [videoPending, setVideoPending] = useState('')
  const [videoForm, setVideoForm] = useState(getDefaultVideoForm)
  const [videoModalMode, setVideoModalMode] = useState('create')
  const [isVideoModalOpen, setVideoModalOpen] = useState(false)
  const [questionsData, setQuestionsData] = useState(null)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionsError, setQuestionsError] = useState(null)
  const [questionsFilter, setQuestionsFilter] = useState({
    answerType: '',
    gender: '',
    status: '',
  })
  const [questionPending, setQuestionPending] = useState('')
  const [questionForm, setQuestionForm] = useState({
    id: '',
    question: '',
    description: '',
    answerType: 'text',
    gender: GENDER_ALL_LABEL,
    isRequired: true,
    isActive: true,
    options: [{ id: '', optionText: '', value: '', isActive: true }],
  })
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState('')
  const [planStatusFilter, setPlanStatusFilter] = useState('active')
  const [planPending, setPlanPending] = useState('')
  const [planModalMode, setPlanModalMode] = useState('create')
  const [isPlanModalOpen, setPlanModalOpen] = useState(false)
  const [planForm, setPlanForm] = useState(getDefaultPlanForm)

  const isLoggedIn = useMemo(() => Boolean(token), [token])
  const trimmedEmail = email.trim().toLowerCase()
  const isPublicView = PUBLIC_VIEWS.has(activeView)

  const viewMeta = useMemo(() => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Profile Overview',
          description: 'Review current account status and personal details.',
        }
      case 'users':
        return {
          title: 'User Directory',
          description: 'Browse every account in the system with live status tags.',
        }
      case 'videos':
        return {
          title: 'Videos',
          description: 'Manage your coaching video resources from this screen.',
        }
      case 'questions':
        return {
          title: 'Questions',
          description: 'Keep up with incoming member questions and replies.',
        }
      case 'subscription':
        return {
          title: 'Subscription',
          description: 'Monitor subscription metrics and plan usage.',
        }
      case 'privacyPolicy':
        return {
          title: 'Privacy Policy',
          description: 'See how Fitness Cassie collects, stores, and protects member data.',
        }
      case 'deleteAccount':
        return {
          title: 'Delete Account',
          description: 'Step-by-step instructions for removing member accounts on request.',
        }
      default:
        return {
          title: 'Fitness Cassie Admin',
          description: 'Stay in control of your coaching business.',
        }
    }
  }, [activeView])

  const navigateAuthStep = useCallback((nextStep) => {
    setAuthStep(nextStep)
    if (typeof window !== 'undefined') {
      const target = nextStep === 'otp' ? '/verify-otp' : '/'
      if (window.location.pathname !== target) {
        window.history.pushState({ authStep: nextStep }, '', target)
      }
    }
  }, [])

  const resetSession = useCallback(() => {
    setToken('')
    setProfile(null)
    setDashboardStats(null)
    setDashboardStatsError('')
    setUsersData(null)
    setSelectedUser(null)
    setUserAnalytics(null)
    setUserAnalyticsError('')
    setUserAnalyticsOpen(false)
    setUserAnalyticsLoading(false)
    setActiveView('login')
    setHasRequestedOtp(false)
    setResendSeconds(0)
    navigateAuthStep('login')
    safeRemoveFromStorage(TOKEN_KEY)
    safeRemoveFromStorage(ACTIVE_VIEW_KEY)
  }, [navigateAuthStep])

  const handleApiError = useCallback(
    (error) => {
      const message = error?.message ?? 'Something went wrong'
      setStatus({ type: 'error', text: message })
      if (error?.status === 401) {
        resetSession()
      }
    },
    [resetSession],
  )

  const loadProfile = useCallback(async (overrideToken) => {
    const authToken = overrideToken ?? token
    if (!authToken) return
    setProfileLoading(true)
    try {
      const response = await fetchProfile(authToken)
      const nextProfile = response?.data ?? null
      setProfile(nextProfile)
    } catch (error) {
      handleApiError(error)
    } finally {
      setProfileLoading(false)
    }
  }, [handleApiError, token])

  const loadDashboardStats = useCallback(async () => {
    if (!token) return
    setDashboardStatsLoading(true)
    setDashboardStatsError('')
    try {
      const response = await fetchDashboardMetrics(token)
      setDashboardStats(response?.data ?? response ?? null)
    } catch (error) {
      setDashboardStatsError(error?.message ?? 'Unable to load dashboard metrics.')
      handleApiError(error)
    } finally {
      setDashboardStatsLoading(false)
    }
  }, [handleApiError, token])

  const loadUsers = useCallback(
    async (page = 1, pageSize = 20) => {
      if (!token) return
      setUsersLoading(true)
      try {
        const response = await fetchUsersPaginated({ page, pageSize }, token)
        const payload = response?.data ?? {}
        const normalizedUsers = payload.users ?? []
        setUsersData({
          ...payload,
          users: normalizedUsers,
          displayed_count: normalizedUsers.length,
        })
        setUsersPage(payload.page ?? page)
        setUsersHasNext(Boolean(payload.has_next))
      } catch (error) {
        handleApiError(error)
      } finally {
        setUsersLoading(false)
      }
    },
    [handleApiError, token],
  )

  const loadUserAnalytics = useCallback(
    async (userId, days = 7) => {
      if (!token || !userId) return
      setUserAnalyticsLoading(true)
      setUserAnalyticsError('')
      try {
        const response = await fetchUserAnalytics(userId, days, token)
        const payload = response?.data ?? response ?? null
        const analyticsPayload = payload?.analytics ?? payload ?? {}
        const rawEntries = Array.isArray(analyticsPayload?.entries)
          ? analyticsPayload.entries
          : []
        const sortedEntries = [...rawEntries].sort((a, b) => {
          const dateA = new Date(a?.date ?? 0)
          const dateB = new Date(b?.date ?? 0)
          return dateB - dateA
        })
        const nextRange = analyticsPayload?.range ?? payload?.range ?? null
        const rangeLabel =
          analyticsPayload?.range_label ??
          analyticsPayload?.rangeLabel ??
          payload?.range_label ??
          formatAnalyticsRangeLabel(nextRange)
        setUserAnalytics(
          payload
            ? {
                user: payload?.user ?? null,
                user_id: payload?.user?.id ?? payload?.user_id ?? userId,
                range: nextRange,
                rangeLabel,
                entries: sortedEntries,
              }
            : null,
        )
      } catch (error) {
        console.error('Failed to load user analytics', {
          userId,
          days,
          message: error?.message,
          status: error?.status,
        })
        setUserAnalyticsError(error?.message ?? 'Unable to load analytics.')
        handleApiError(error)
      } finally {
        setUserAnalyticsLoading(false)
      }
    },
    [handleApiError, token],
  )

  const loadVideos = useCallback(
    async (categoryOverride, pageOverride = 1) => {
      if (!token) return
      const targetCategory = categoryOverride ?? videoCategory
      const targetPage = pageOverride ?? 1
      setVideosLoading(true)
      setVideosError(null)
      try {
        const response = await fetchVideosByCategory(
          targetCategory,
          token,
          targetPage,
          VIDEO_PAGE_SIZE,
        )
        const payload = response?.data ?? {}
        setVideosData((prev) => {
          const previousCategory = prev?.category
          const shouldReset = targetPage === 1 || previousCategory !== targetCategory
          const previousVideos = shouldReset ? [] : prev?.videos ?? []
          const mergedVideos = [...previousVideos, ...(payload.videos ?? [])]
          return {
            ...payload,
            category: targetCategory,
            videos: mergedVideos,
            count: mergedVideos.length,
          }
        })
        setVideoPage(payload?.page ?? targetPage)
        setVideosHasNext(Boolean(payload?.has_next))
      } catch (error) {
        setVideosError(error?.message ?? 'Unable to load videos.')
        handleApiError(error)
      } finally {
        setVideosLoading(false)
      }
    },
    [handleApiError, token, videoCategory],
  )

  const loadQuestions = useCallback(async () => {
    if (!token) return
    setQuestionsLoading(true)
    setQuestionsError(null)
    try {
      const response = await fetchQuestions(questionsFilter, token)
      setQuestionsData(response?.data ?? null)
    } catch (error) {
      setQuestionsError(error?.message ?? 'Unable to load questions.')
      handleApiError(error)
    } finally {
      setQuestionsLoading(false)
    }
  }, [handleApiError, questionsFilter, token])

  const loadPlans = useCallback(
    async (options = {}) => {
      if (!token) return
      setPlansLoading(true)
      setPlansError('')
      const targetStatus = options.status ?? planStatusFilter ?? 'active'
      const shouldIncludeInactive =
        typeof options.includeInactive === 'boolean'
          ? options.includeInactive
          : targetStatus === 'inactive' || targetStatus === 'all'
      try {
        const response = await fetchSubscriptionPlans(
          { includeInactive: shouldIncludeInactive, status: targetStatus },
          token,
        )
        const payload = response?.data ?? response ?? []
        const normalizedPlans = Array.isArray(payload) ? payload : payload?.plans ?? []
        setPlans(normalizedPlans ?? [])
      } catch (error) {
        setPlansError(error?.message ?? 'Unable to load subscription plans.')
        handleApiError(error)
      } finally {
        setPlansLoading(false)
      }
    },
    [handleApiError, planStatusFilter, token],
  )

  const handlePlanStatusFilterChange = useCallback((nextFilter) => {
    setPlanStatusFilter((prev) => (prev === nextFilter ? prev : nextFilter))
  }, [])

  const openCreatePlanModal = useCallback(() => {
    setPlanModalMode('create')
    setPlanForm(getDefaultPlanForm())
    setPlanModalOpen(true)
  }, [])

  const openEditPlanModal = useCallback((plan) => {
    if (!plan) return
    setPlanModalMode('edit')
    setPlanForm({
      id: plan.id ?? '',
      durationMonths:
        typeof plan.duration_months === 'number'
          ? String(plan.duration_months)
          : String(plan.durationMonths ?? ''),
      originalPrice: String(
        plan.original_price ?? plan.originalPrice ?? plan.price ?? '',
      ),
      discountedPrice: String(
        plan.discounted_price ?? plan.discountedPrice ?? '',
      ),
      isActive:
        typeof plan.is_active === 'boolean' ? plan.is_active : plan.isActive ?? true,
    })
    setPlanModalOpen(true)
  }, [])

  const closePlanModal = useCallback(() => {
    setPlanModalOpen(false)
  }, [])

  const handlePlanModalSubmit = useCallback(async () => {
    if (!token) return
    const payload = buildPlanPayload(planForm)
    const mode = planModalMode
    if (mode === 'edit' && !planForm.id) return
    setPlanPending(mode)
    try {
      const response =
        mode === 'edit'
          ? await updateSubscriptionPlan(planForm.id, payload, token)
          : await createSubscriptionPlan(payload, token)
      setStatus({
        type: 'success',
        text:
          response?.message ??
          (mode === 'edit' ? 'Plan updated successfully.' : 'Plan created successfully.'),
      })
      setPlanModalOpen(false)
      setPlanForm(getDefaultPlanForm())
      loadPlans()
    } catch (error) {
      handleApiError(error)
    } finally {
      setPlanPending('')
    }
  }, [handleApiError, loadPlans, planForm, planModalMode, token])

  const handleDeletePlan = useCallback(
    async (planId) => {
      if (!token || !planId) return
      setPlanPending(`delete-${planId}`)
      try {
        const response = await deleteSubscriptionPlan(planId, token)
        setStatus({
          type: 'success',
          text: response?.message ?? 'Plan deleted successfully.',
        })
        setPlans((prev) => prev.filter((plan) => plan.id !== planId))
      } catch (error) {
        handleApiError(error)
      } finally {
        setPlanPending('')
      }
    },
    [handleApiError, token],
  )

  const handleTogglePlanActive = useCallback(
    async (plan) => {
      if (!token || !plan?.id) return
      const planId = plan.id
      const currentActive = plan?.is_active ?? plan?.isActive ?? true
      const nextActive = !currentActive
      const payload = buildPlanPayloadFromRecord(plan, { isActive: nextActive })
      setPlanPending(`toggle-${planId}`)
      try {
        const response = await updateSubscriptionPlan(planId, payload, token)
        const updatedPlan = response?.data ?? response ?? null
        setPlans((prev) =>
          prev.map((item) =>
            item.id === planId
              ? {
                  ...item,
                  ...(updatedPlan ?? {}),
                  is_active: nextActive,
                }
              : item,
          ),
        )
        setStatus({
          type: 'success',
          text: response?.message ?? (nextActive ? 'Plan activated.' : 'Plan hidden.'),
        })
      } catch (error) {
        handleApiError(error)
      } finally {
        setPlanPending('')
      }
    },
    [handleApiError, token],
  )

  useEffect(() => {
    if (token) {
      safeSetInStorage(TOKEN_KEY, token)
    } else {
      safeRemoveFromStorage(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (!token || activeView === 'login') {
      safeRemoveFromStorage(ACTIVE_VIEW_KEY)
      return
    }
    safeSetInStorage(ACTIVE_VIEW_KEY, activeView)
  }, [activeView, token])

  useEffect(() => {
    if (token) return
    const storedToken = safeGetFromStorage(TOKEN_KEY)
    if (!storedToken) return
    setToken(storedToken)
    const storedView = safeGetFromStorage(ACTIVE_VIEW_KEY)
    if (storedView && WORKSPACE_VIEWS.has(storedView)) {
      setActiveView(storedView)
    } else {
      setActiveView('dashboard')
    }
  }, [token])

  useEffect(() => {
    if (status?.type !== 'error' && status?.text) {
      const timer = setTimeout(() => setStatus(null), 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [status])

  useEffect(() => {
    if (isLoggedIn && activeView === 'dashboard') {
      loadProfile()
      loadDashboardStats()
    }
  }, [activeView, isLoggedIn, loadDashboardStats, loadProfile])

  useEffect(() => {
    if (isLoggedIn && activeView === 'users') {
      loadUsers(1)
    }
  }, [activeView, isLoggedIn, loadUsers])

  useEffect(() => {
    if (isLoggedIn && activeView === 'videos') {
      loadVideos(videoCategory, 1)
    }
  }, [activeView, isLoggedIn, loadVideos, videoCategory])

  useEffect(() => {
    if (isLoggedIn && activeView === 'questions') {
      loadQuestions()
    }
  }, [activeView, isLoggedIn, loadQuestions])

  useEffect(() => {
    if (isLoggedIn && activeView === 'subscription') {
      loadPlans()
    }
  }, [activeView, isLoggedIn, loadPlans])

  useEffect(() => {
    if (resendSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendSeconds])

  useEffect(() => {
    const normalized = email.trim().toLowerCase()
    if (normalized) {
      safeSetInStorage(AUTH_EMAIL_KEY, normalized)
    } else {
      safeRemoveFromStorage(AUTH_EMAIL_KEY)
    }
  }, [email])

  useEffect(() => {
    if (isLoggedIn || isPublicView) return
    if (typeof window === 'undefined') return
    const desiredPath = authStep === 'otp' ? '/verify-otp' : '/'
    if (window.location.pathname !== desiredPath) {
      window.history.replaceState({ authStep }, '', desiredPath)
    }
  }, [authStep, isLoggedIn, isPublicView])

  useEffect(() => {
    if (!isLoggedIn) return
    if (typeof window === 'undefined') return
    if (!WORKSPACE_VIEWS.has(activeView)) return
    const targetPath =
      WORKSPACE_VIEW_ROUTES[activeView] ?? WORKSPACE_VIEW_ROUTES.dashboard ?? '/dashboard'
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: activeView }, '', targetPath)
    }
  }, [activeView, isLoggedIn])

  useEffect(() => {
    if (isLoggedIn || !isPublicView) return
    if (typeof window === 'undefined') return
    const targetPath =
      WORKSPACE_VIEW_ROUTES[activeView] ??
      WORKSPACE_VIEW_ROUTES.privacyPolicy ??
      '/privacy-policy'
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ view: activeView }, '', targetPath)
    }
  }, [activeView, isLoggedIn, isPublicView])

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return
      const path = window.location.pathname
      if (path === '/verify-otp') {
        navigateAuthStep('otp')
        return
      }
      const workspaceView = ROUTE_TO_WORKSPACE_VIEW[path]
      if (workspaceView) {
        if (isLoggedIn || PUBLIC_VIEWS.has(workspaceView)) {
          setActiveView(workspaceView)
        } else {
          navigateAuthStep('login')
        }
        return
      }
      navigateAuthStep('login')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isLoggedIn, navigateAuthStep, setActiveView])

  const handleRequestOtp = async () => {
    if (!trimmedEmail) {
      setStatus({ type: 'error', text: 'Please enter an email address.' })
      return
    }
    setPendingAction('request')
    setStatus(null)
    try {
      const response = await requestOtp(trimmedEmail)
      setFlowHint(response?.data?.flow ?? null)
      setHasRequestedOtp(true)
      setResendSeconds(120)
      setStatus({ type: 'success', text: response?.message ?? 'OTP sent successfully.' })
      navigateAuthStep('otp')
    } catch (error) {
      handleApiError(error)
    } finally {
      setPendingAction('')
    }
  }

  const handleResendOtp = async () => {
    if (!trimmedEmail) {
      setStatus({ type: 'error', text: 'Please enter an email address first.' })
      return
    }
    setPendingAction('resend')
    setStatus(null)
    try {
      const response = await resendOtp(trimmedEmail)
      setFlowHint(response?.data?.flow ?? null)
      setResendSeconds(120)
      setStatus({ type: 'success', text: response?.message ?? 'OTP resent successfully.' })
      navigateAuthStep('otp')
    } catch (error) {
      handleApiError(error)
    } finally {
      setPendingAction('')
    }
  }

  const handleVerifyOtp = async () => {
    if (!trimmedEmail || otp.length < 6) {
      setStatus({ type: 'error', text: 'Enter your email and the 6-digit OTP.' })
      return
    }
    setPendingAction('verify')
    setStatus(null)
    try {
      const response = await verifyOtp(trimmedEmail, otp)
      const accessToken = response?.data?.access_token
      if (!accessToken) {
        throw new Error('No access token returned.')
      }
      setToken(accessToken)
      safeSetInStorage(TOKEN_KEY, accessToken)
      setActiveView('dashboard')
      safeSetInStorage(ACTIVE_VIEW_KEY, 'dashboard')
      setStatus({ type: 'success', text: response?.message ?? 'OTP verified successfully.' })
      setOtp('')
      await loadProfile(accessToken)
    } catch (error) {
      handleApiError(error)
    } finally {
      setPendingAction('')
    }
  }

  const handleLogout = async () => {
    if (!token) return
    setPendingAction('logout')
    try {
      const response = await logoutSession(token)
      setStatus({ type: 'success', text: response?.message ?? 'Logout successful.' })
    } catch (error) {
      handleApiError(error)
    } finally {
      setPendingAction('')
      resetSession()
      setFlowHint(null)
      setEmail('')
      setOtp('')
    }
  }

  const handleOtpChange = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setOtp(numericValue)
  }

  const handleVideoCategoryChange = (value) => {
    setVideoCategory(value)
    setVideoPage(1)
    setVideosHasNext(false)
  }

  const handleVideosNextPage = useCallback(() => {
    if (!videosHasNext || videosLoading) return
    const nextPage = (videoPage ?? 1) + 1
    loadVideos(videoCategory, nextPage)
  }, [loadVideos, videoCategory, videoPage, videosHasNext, videosLoading])

  const resetVideoForm = () => setVideoForm(getDefaultVideoForm())

  const openCreateVideoModal = () => {
    setVideoModalMode('create')
    resetVideoForm()
    setVideoModalOpen(true)
  }

  const openEditVideoModal = (video) => {
    setVideoModalMode('edit')
    setVideoForm({
      videoId: String(video.id),
      bodyPart: video.body_part ?? VIDEO_CATEGORIES[0].value,
      gender: video.gender ?? VIDEO_GENDERS[0].value,
      title: video.title ?? '',
      description: video.description ?? '',
      videoFile: null,
      thumbnailFile: null,
    })
    setVideoModalOpen(true)
  }

  const closeVideoModal = () => {
    setVideoModalOpen(false)
    resetVideoForm()
  }

  const handleVideoModalSubmit = async () => {
    if (videoModalMode === 'create') {
      if (!videoForm.title.trim()) {
        setStatus({ type: 'error', text: 'Enter a title for the video.' })
        return
      }
      if (!videoForm.videoFile || !videoForm.thumbnailFile) {
        setStatus({ type: 'error', text: 'Attach both video and thumbnail files.' })
        return
      }
      setVideoPending('upload')
      try {
        const formData = new FormData()
        formData.append('body_part', videoForm.bodyPart)
        formData.append('gender', videoForm.gender)
        formData.append('title', videoForm.title)
        if (videoForm.description) {
          formData.append('description', videoForm.description)
        }
        formData.append('video_file', videoForm.videoFile)
        formData.append('thumbnail_file', videoForm.thumbnailFile)
        const response = await uploadVideo(formData, token)
        setStatus({ type: 'success', text: response?.message ?? 'Video uploaded successfully.' })
        closeVideoModal()
        loadVideos(videoCategory, 1)
      } catch (error) {
        handleApiError(error)
      } finally {
        setVideoPending('')
      }
      return
    }

    if (!videoForm.videoId) {
      setStatus({ type: 'error', text: 'Select a video to update.' })
      return
    }

    const formData = new FormData()
    if (videoForm.bodyPart) {
      formData.append('body_part', videoForm.bodyPart)
    }
    if (videoForm.gender) {
      formData.append('gender', videoForm.gender)
    }
    if (videoForm.title) {
      formData.append('title', videoForm.title)
    }
    if (videoForm.description) {
      formData.append('description', videoForm.description)
    }
    if (videoForm.videoFile) {
      formData.append('video_file', videoForm.videoFile)
    }
    if (videoForm.thumbnailFile) {
      formData.append('thumbnail_file', videoForm.thumbnailFile)
    }

    setVideoPending('update')
    try {
      const response = await updateVideo(videoForm.videoId, formData, token)
      setStatus({ type: 'success', text: response?.message ?? 'Video updated successfully.' })
      closeVideoModal()
      loadVideos(videoCategory, 1)
    } catch (error) {
      handleApiError(error)
    } finally {
      setVideoPending('')
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Remove this video?')) return
    setVideoPending(`delete-${videoId}`)
    try {
      const response = await deleteVideo(videoId, token)
      setStatus({ type: 'success', text: response?.message ?? 'Video removed successfully.' })
      loadVideos(videoCategory, 1)
    } catch (error) {
      handleApiError(error)
    } finally {
      setVideoPending('')
    }
  }

  const createEmptyOption = () => ({ id: '', optionText: '', value: '', isActive: true })
  const usesOptions = (type) => type === 'single_choice' || type === 'multi_choice'

  const addOptionField = () =>
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, createEmptyOption()],
    }))

  const updateOptionField = (index, field, value) =>
    setQuestionForm((prev) => {
      const nextOptions = [...prev.options]
      nextOptions[index] = { ...nextOptions[index], [field]: value }
      return { ...prev, options: nextOptions }
    })

  const toggleOptionActive = (index) =>
    setQuestionForm((prev) => {
      const nextOptions = [...prev.options]
      nextOptions[index] = { ...nextOptions[index], isActive: !nextOptions[index].isActive }
      return { ...prev, options: nextOptions }
    })

  const removeOptionField = (index) =>
    setQuestionForm((prev) => {
      const remaining = prev.options.filter((_, idx) => idx !== index)
      return { ...prev, options: remaining.length ? remaining : [createEmptyOption()] }
    })

  const resetQuestionForm = () =>
    setQuestionForm({
      id: '',
      question: '',
      description: '',
      answerType: 'text',
      gender: GENDER_ALL_LABEL,
      isRequired: true,
      isActive: true,
      options: [createEmptyOption()],
    })

  const prepareQuestionPayload = () => {
    const trimmedQuestion = questionForm.question.trim()
    if (!trimmedQuestion) {
      throw new Error('Enter a question prompt.')
    }
    if (!questionForm.answerType) {
      throw new Error('Select an answer type.')
    }
    const payload = {
      question: trimmedQuestion,
      description: questionForm.description.trim() || null,
      answer_type: questionForm.answerType,
      gender:
        questionForm.gender?.toLowerCase() === GENDER_ALL_LABEL.toLowerCase()
          ? GENDER_API_BOTH
          : questionForm.gender,
      is_required: Boolean(questionForm.isRequired),
      is_active: Boolean(questionForm.isActive),
    }
    const formattedOptions = questionForm.options
      .map((option) => ({
        ...(option.id ? { id: option.id } : {}),
        option_text: option.optionText.trim(),
        value: option.value.trim() || null,
        is_active: option.isActive,
      }))
      .filter((option) => option.option_text.length > 0)

    if (usesOptions(questionForm.answerType)) {
      if (!formattedOptions.length) {
        throw new Error('Add at least one option for this answer type.')
      }
      payload.options = formattedOptions
    } else if (formattedOptions.length > 0) {
      payload.options = formattedOptions
    }
    return payload
  }

  const handleCreateQuestion = async () => {
    try {
      const payload = prepareQuestionPayload()
      setQuestionPending('create')
      const response = await createQuestion(payload, token)
      setStatus({ type: 'success', text: response?.message ?? 'Question created successfully.' })
      resetQuestionForm()
      setQuestionModalOpen(false)
      loadQuestions()
    } catch (error) {
      handleApiError(error)
    } finally {
      setQuestionPending('')
    }
  }

  const handleEditQuestion = (question) => {
    setQuestionForm({
      id: question.id,
      question: question.question ?? '',
      description: question.description ?? '',
      answerType: question.answer_type ?? 'text',
      gender: (question.gender?.toLowerCase() === GENDER_API_BOTH.toLowerCase() ? GENDER_ALL_LABEL : question.gender) ?? GENDER_ALL_LABEL,
      isRequired: question.is_required ?? true,
      isActive: question.is_active ?? true,
      options:
        question.options && question.options.length
          ? question.options.map((option) => ({
              id: option.id ?? '',
              optionText: option.option_text ?? '',
              value: option.value ?? '',
              isActive: option.is_active ?? true,
            }))
          : [createEmptyOption()],
    })
    setQuestionModalOpen(true)
  }

  const openCreateQuestionModal = () => {
    resetQuestionForm()
    setQuestionModalOpen(true)
  }

  const closeQuestionModal = () => {
    setQuestionModalOpen(false)
    resetQuestionForm()
  }

  const handleQuestionModalSubmit = () => {
    if (questionForm.id) {
      handleUpdateQuestion()
    } else {
      handleCreateQuestion()
    }
  }

  const handleUpdateQuestion = async () => {
    if (!questionForm.id) {
      setStatus({ type: 'error', text: 'Select a question to update.' })
      return
    }
    try {
      const payload = prepareQuestionPayload()
      setQuestionPending('update')
      const response = await updateQuestion(questionForm.id, payload, token)
      setStatus({ type: 'success', text: response?.message ?? 'Question updated successfully.' })
      resetQuestionForm()
      setQuestionModalOpen(false)
      loadQuestions()
    } catch (error) {
      handleApiError(error)
    } finally {
      setQuestionPending('')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    setQuestionPending(`delete-${questionId}`)
    try {
      const response = await deleteQuestion(questionId, token)
      setStatus({ type: 'success', text: response?.message ?? 'Question deleted successfully.' })
      loadQuestions()
    } catch (error) {
      handleApiError(error)
    } finally {
      setQuestionPending('')
    }
  }

  const handleUsersNextPage = useCallback(() => {
    if (!usersHasNext || usersLoading) return
    loadUsers((usersPage ?? 1) + 1)
  }, [loadUsers, usersHasNext, usersLoading, usersPage])

  const handleUsersPrevPage = useCallback(() => {
    if (usersLoading) return
    const currentPage = usersPage ?? 1
    if (currentPage <= 1) return
    loadUsers(currentPage - 1)
  }, [loadUsers, usersLoading, usersPage])

  const handleUserNameClick = useCallback((user) => {
    if (!user) return
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    const label = fullName || user.email || user.phone || String(user.id ?? '')
    console.info('User name clicked. Analytics are available via the email column.', {
      id: user.id,
      label,
    })
  }, [])

  const handleUserAnalyticsOpen = useCallback(
    (user) => {
      if (!user?.id) return
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
      const label = fullName || user.email || user.phone || String(user.id ?? '')
      console.info('User email clicked. Loading analytics…', { id: user.id, label })
      setSelectedUser(user)
      setUserAnalytics(null)
      setUserAnalyticsError('')
      setUserAnalyticsOpen(true)
      loadUserAnalytics(user.id)
    },
    [loadUserAnalytics],
  )

  const handleUserAnalyticsClose = useCallback(() => {
    setUserAnalyticsOpen(false)
    setSelectedUser(null)
    setUserAnalytics(null)
    setUserAnalyticsError('')
  }, [])

  const handleUserStatusChange = async (userId, nextActive) => {
    if (!userId || !token) return
    setUserStatusPending(String(userId))
    try {
      const response = await updateUserStatus(userId, nextActive, token)
      const updatedUser = response?.data ?? null
      if (updatedUser) {
        setUsersData((prev) => {
          if (!prev) return prev
          const nextUsers = (prev.users ?? []).map((user) =>
            user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
          )
          return { ...prev, users: nextUsers }
        })
      }
      setStatus({
        type: 'success',
        text: response?.message ?? `User ${nextActive ? 'activated' : 'deactivated'}.`,
      })
    } catch (error) {
      handleApiError(error)
    } finally {
      setUserStatusPending('')
    }
  }

  const handleBackToLoginStep = () => {
    navigateAuthStep('login')
    setOtp('')
    setHasRequestedOtp(false)
    setResendSeconds(0)
    setStatus({ type: 'info', text: 'Enter a new email address to request another OTP.' })
  }

  const signedEmail = profile?.email ?? trimmedEmail

  const shouldShowAuth = !isLoggedIn && !isPublicView

  return (
    <div className="app-shell">
      {shouldShowAuth ? (
        <AuthView
          authStep={authStep}
          email={email}
          otp={otp}
          flowHint={flowHint}
          trimmedEmail={trimmedEmail}
          pendingAction={pendingAction}
          hasRequestedOtp={hasRequestedOtp}
          resendSeconds={resendSeconds}
          onEmailChange={setEmail}
          onRequestOtp={handleRequestOtp}
          onResendOtp={handleResendOtp}
          onVerifyOtp={handleVerifyOtp}
          onOtpChange={handleOtpChange}
          onBackToLogin={handleBackToLoginStep}
        />
      ) : (
        <section className={isLoggedIn ? 'workspace' : 'public-view'}>
          {isLoggedIn && (
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              signedEmail={signedEmail}
              pendingAction={pendingAction}
              onLogout={handleLogout}
            />
          )}
          <div className="content">
            <header className="content-header">
              <div>
                <h1>{viewMeta.title}</h1>
                <p>{viewMeta.description}</p>
              </div>
              <div className="topbar-meta">
                {isLoggedIn && flowHint && <span className="pill neutral">Flow: {flowHint}</span>}
                {isLoggedIn && activeView === 'videos' && (
                  <button className="primary" onClick={openCreateVideoModal}>
                    Upload Video
                  </button>
                )}
                {isLoggedIn && activeView === 'questions' && (
                  <button className="primary" onClick={openCreateQuestionModal}>
                    Add Question
                  </button>
                )}
              </div>
            </header>
            <main className="main-content">
              {activeView === 'dashboard' && (
                <DashboardView
                  profile={profile}
                  isLoading={profileLoading}
                  onRefresh={loadProfile}
                  stats={dashboardStats}
                  statsLoading={dashboardStatsLoading}
                  statsError={dashboardStatsError}
                  onRefreshStats={loadDashboardStats}
                />
              )}
              {activeView === 'users' && (
                <UsersView
                  usersData={usersData}
                  isLoading={usersLoading}
                  onRefresh={() => loadUsers(1)}
                  onNextPage={handleUsersNextPage}
                  hasNext={usersHasNext}
                  page={usersPage}
                  onToggleStatus={handleUserStatusChange}
                  statusPending={userStatusPending}
                  onViewAnalytics={handleUserAnalyticsOpen}
                  onUserNameClick={handleUserNameClick}
                  onPrevPage={handleUsersPrevPage}
                />
              )}
              {activeView === 'videos' && (
                <VideosView
                  videosData={videosData}
                  videosLoading={videosLoading}
                  videosError={videosError}
                  videosHasNext={videosHasNext}
                  videoCategory={videoCategory}
                  videoPending={videoPending}
                  onCategoryChange={handleVideoCategoryChange}
                  onRefresh={() => loadVideos(videoCategory, 1)}
                  onEditVideo={openEditVideoModal}
                  onDeleteVideo={handleDeleteVideo}
                  onLoadMore={handleVideosNextPage}
                />
              )}
              {activeView === 'questions' && (
                <QuestionsView
                  questionsData={questionsData}
                  questionsLoading={questionsLoading}
                  questionsError={questionsError}
                  questionsFilter={questionsFilter}
                  setQuestionsFilter={setQuestionsFilter}
                  questionPending={questionPending}
                  onRefresh={loadQuestions}
                  onDeleteQuestion={handleDeleteQuestion}
                  onEditQuestion={handleEditQuestion}
                />
              )}
              {activeView === 'subscription' && (
                <SubscriptionView
                  plans={plans}
                  isLoading={plansLoading}
                  error={plansError}
                  onRefresh={loadPlans}
                  onAddPlan={openCreatePlanModal}
                  onEditPlan={openEditPlanModal}
                  onDeletePlan={handleDeletePlan}
                  onTogglePlanActive={handleTogglePlanActive}
                  pendingAction={planPending}
                  statusFilter={planStatusFilter}
                  onStatusFilterChange={handlePlanStatusFilterChange}
                />
              )}
              {activeView === 'privacyPolicy' && <PrivacyPolicyView />}
              {activeView === 'deleteAccount' && <DeleteAccountView />}
            </main>
          </div>
        </section>
      )}
      <StatusBanner status={status} />
      <VideoModal
        open={isVideoModalOpen}
        mode={videoModalMode}
        form={videoForm}
        setForm={setVideoForm}
        pendingAction={videoPending === 'upload' || videoPending === 'update' ? videoPending : ''}
        onClose={closeVideoModal}
        onSubmit={handleVideoModalSubmit}
      />
      <QuestionModal
        open={isQuestionModalOpen}
        form={questionForm}
        setForm={setQuestionForm}
        pendingAction={
          questionPending === 'create' || questionPending === 'update' ? questionPending : ''
        }
        onClose={closeQuestionModal}
        onSubmit={handleQuestionModalSubmit}
        addOptionField={addOptionField}
        removeOptionField={removeOptionField}
        updateOptionField={updateOptionField}
        toggleOptionActive={toggleOptionActive}
      />
      <PlanModal
        open={isPlanModalOpen}
        mode={planModalMode}
        form={planForm}
        setForm={setPlanForm}
        pendingAction={planPending === 'create' || planPending === 'edit' ? planPending : ''}
        onClose={closePlanModal}
        onSubmit={handlePlanModalSubmit}
      />
      <UserAnalyticsModal
        open={isUserAnalyticsOpen}
        user={selectedUser}
        data={userAnalytics}
        isLoading={userAnalyticsLoading}
        error={userAnalyticsError}
        onClose={handleUserAnalyticsClose}
        onRefresh={() => (selectedUser?.id ? loadUserAnalytics(selectedUser.id) : null)}
      />
    </div>
  )
}

export default App
