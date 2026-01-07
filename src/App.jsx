import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import {
  requestOtp,
  resendOtp,
  verifyOtp,
  logoutSession,
  fetchProfile,
  fetchUsersPaginated,
  fetchVideosByCategory,
  fetchExerciseLibrary,
  updateExerciseLibraryItem,
  uploadVideo,
  updateVideo,
  deleteVideo,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateUserStatus,
  updateUserFlags,
  fetchUserAnalytics,
  fetchDashboardMetrics,
  fetchPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  fetchProgramDetailAdmin,
  updateProgramSchedule,
  fetchFoodCategoriesAdmin,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
  fetchFoodsAdmin,
  createFood,
  updateFood,
  deleteFood,
  fetchMealsAdmin,
  createMeal,
  updateMeal,
  deleteMeal,
} from './services/api'
import { uploadFileToSpaces, ensureSpacesFolders } from './services/spaces'
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
import VideosView, { ALL_VIDEOS_CATEGORY } from './views/VideosView'
import ExerciseLibraryView from './views/ExerciseLibraryView'
import QuestionsView from './views/QuestionsView'
import ProgramsView from './views/ProgramsView'
import FoodsView from './views/FoodsView'
import MealsView from './views/MealsView'
import PrivacyPolicyView from './views/PrivacyPolicyView'
import DeleteAccountView from './views/DeleteAccountView'
import Sidebar from './components/layout/Sidebar'
import StatusBanner from './components/shared/StatusBanner'
import VideoModal from './components/modals/VideoModal'
import QuestionModal from './components/modals/QuestionModal'
import UserAnalyticsModal from './components/modals/UserAnalyticsModal'
import ProgramModal from './components/modals/ProgramModal'
import ProgramScheduleModal from './components/modals/ProgramScheduleModal'
import FoodModal from './components/modals/FoodModal'
import FoodCategoryModal from './components/modals/FoodCategoryModal'
import MealModal from './components/modals/MealModal'
// import { createLogger } from 'vite'

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

const getVideoUploadFolder = (bodyPart) => {
  if (typeof bodyPart === 'string' && bodyPart.trim()) {
    return bodyPart.trim()
  }
  return 'videos'
}

const getThumbnailUploadFolder = (bodyPart) => {
  const base = getVideoUploadFolder(bodyPart)
  return base ? `${base}/thumbnails` : 'thumbnails'
}

const OTP_LENGTH = 6
const getEmptyOtpDigits = () => Array(OTP_LENGTH).fill('')

const getDefaultProgramForm = () => ({
  id: '',
  title: '',
  durationDays: '28',
  accessLevel: 'free',
  priceUsd: '',
  paidTerm: 'monthly',
  originalPrice: '',
  discountedPrice: '',
  isActive: true,
})

const getDefaultFoodForm = () => ({
  id: '',
  name: '',
  brand: '',
  imageUrl: '',
  imageFile: null,
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  servingQuantity: '',
  servingUnit: 'serving',
  categoryId: '',
  isActive: true,
})

const getDefaultMealForm = () => ({
  id: '',
  key: '',
  name: '',
  iconUrl: '',
  iconFile: null,
  minRatio: '0.2',
  maxRatio: '0.3',
  sortOrder: '0',
  isActive: true,
})

const FOOD_IMAGE_FOLDER = 'food-images'
const MEAL_ICON_FOLDER = 'meal-icons'

const getDefaultCategoryForm = () => ({
  id: '',
  name: '',
  description: '',
  isActive: true,
})

const parseIntValue = (value) => {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseFloatValue = (value) => {
  if (value === '' || value == null) return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeProgramSlug = (slug, fallbackTitle) => {
  const source = slug?.trim() || fallbackTitle?.trim() || ''
  if (!source) return ''
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const sanitizeString = (value) => {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

const buildScheduleDaysState = (program, detailResponse) => {
  const duration = parseIntValue(program?.duration_days ?? program?.durationDays ?? 0)
  const remoteDays = Array.isArray(detailResponse?.days) ? detailResponse.days : []
  const map = new Map()
  remoteDays.forEach((day) => {
    map.set(day.day_number, {
      id: day.id,
      dayNumber: day.day_number,
      isRestDay: Boolean(day.is_rest_day),
      videoId: day.video_id ?? null,
      videoUrl: day.video?.video_url ?? '',
      videoThumbnail: day.video?.thumbnail_url ?? '',
      videoTitle: day.video?.title ?? '',
      videoFile: null,
      thumbnailFile: null,
    })
  })
  const schedule = []
  for (let dayNumber = 1; dayNumber <= (duration || 0); dayNumber += 1) {
    schedule.push(
      map.get(dayNumber) || {
        id: null,
        dayNumber,
        isRestDay: false,
        videoId: null,
        videoUrl: '',
        videoThumbnail: '',
        videoTitle: '',
        videoFile: null,
        thumbnailFile: null,
      },
    )
  }
  return schedule
}

const buildPlanSlug = (durationDays, accessLevel) => {
  const duration = parseIntValue(durationDays)
  const access = accessLevel === 'paid' ? 'paid' : 'free'
  const durationLabel = duration > 0 ? `${duration}-day` : 'custom'
  return `${durationLabel}-${access}-plan`.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

const resolvePaidTerm = (value) => {
  const term = sanitizeString(value).trim().toLowerCase()
  if (term === 'weekly' || term === 'monthly' || term === 'yearly') return term
  return 'monthly'
}

const paidTermToDays = (term) => {
  if (term === 'weekly') return 7
  if (term === 'yearly') return 365
  return 30
}

const paidTitleForTerm = (term) => {
  if (term === 'weekly') return 'Paid Plan - Weekly'
  if (term === 'yearly') return 'Paid Plan - Yearly'
  return 'Paid Plan - Monthly'
}

const resolvePaidTermFromProgram = (program) => {
  if (program?.weekly_price_usd || program?.weekly_original_price_usd) return 'weekly'
  if (program?.monthly_price_usd || program?.monthly_original_price_usd) return 'monthly'
  if (program?.yearly_price_usd || program?.yearly_original_price_usd) return 'yearly'
  const duration = parseIntValue(program?.duration_days ?? program?.durationDays ?? 0)
  if (duration >= 365) return 'yearly'
  if (duration >= 28) return 'monthly'
  return 'weekly'
}

const resolvePaidPricesFromProgram = (program, term) => {
  if (term === 'weekly') {
    return {
      original: program?.weekly_original_price_usd ?? program?.weeklyOriginalPriceUsd ?? null,
      discounted: program?.weekly_price_usd ?? program?.weeklyPriceUsd ?? null,
    }
  }
  if (term === 'yearly') {
    return {
      original: program?.yearly_original_price_usd ?? program?.yearlyOriginalPriceUsd ?? null,
      discounted: program?.yearly_price_usd ?? program?.yearlyPriceUsd ?? null,
    }
  }
  return {
    original: program?.monthly_original_price_usd ?? program?.monthlyOriginalPriceUsd ?? null,
    discounted: program?.monthly_price_usd ?? program?.monthlyPriceUsd ?? null,
  }
}

const getPlanMediaFolder = (program) => {
  const duration = parseIntValue(program?.duration_days ?? program?.durationDays ?? 0)
  if (duration === 28) return '28 days plan videos'
  if (duration === 60) return '60 days plan videos'
  const slug = typeof program?.slug === 'string' ? program.slug.trim() : ''
  if (slug) return `programs/${slug}`
  const identifier = program?.id ?? ''
  return `programs/plan-${identifier || 'custom'}`
}

const buildProgramPayload = (form) => {
  const accessValue = typeof form.accessLevel === 'string' ? form.accessLevel.trim().toLowerCase() : 'free'
  const accessLevel = accessValue === 'paid' ? 'paid' : 'free'
  const paidTerm = resolvePaidTerm(form.paidTerm)
  const durationDays =
    accessLevel === 'paid' ? paidTermToDays(paidTerm) : parseIntValue(form.durationDays)
  const normalizedTitle = typeof form.title === 'string' ? form.title.trim() : ''
  const originalPrice = accessLevel === 'paid' ? parseFloatValue(form.originalPrice) : null
  const discountedPrice =
    accessLevel === 'paid' ? parseFloatValue(form.discountedPrice) : null
  const priceUsd = accessLevel === 'paid' ? discountedPrice : null
  const weeklyPriceUsd = accessLevel === 'paid' && paidTerm === 'weekly' ? discountedPrice : null
  const weeklyOriginalPriceUsd =
    accessLevel === 'paid' && paidTerm === 'weekly' ? originalPrice : null
  const monthlyPriceUsd =
    accessLevel === 'paid' && paidTerm === 'monthly' ? discountedPrice : null
  const monthlyOriginalPriceUsd =
    accessLevel === 'paid' && paidTerm === 'monthly' ? originalPrice : null
  const yearlyPriceUsd = accessLevel === 'paid' && paidTerm === 'yearly' ? discountedPrice : null
  const yearlyOriginalPriceUsd =
    accessLevel === 'paid' && paidTerm === 'yearly' ? originalPrice : null
  const slugFromTitle = normalizeProgramSlug(
    undefined,
    accessLevel === 'paid' ? paidTitleForTerm(paidTerm) : normalizedTitle,
  )
  const slug = slugFromTitle || buildPlanSlug(durationDays, accessLevel)
  return {
    slug,
    title:
      accessLevel === 'paid'
        ? paidTitleForTerm(paidTerm)
        : normalizedTitle || (durationDays > 0 ? `${durationDays}-Day Plan` : 'Program'),
    subtitle: null,
    description: null,
    duration_days: durationDays,
    workouts_per_week: 0,
    rest_days_per_week: 0,
    level: null,
    access_level: accessLevel,
    price_usd: priceUsd,
    weekly_price_usd: weeklyPriceUsd,
    weekly_original_price_usd: weeklyOriginalPriceUsd,
    monthly_price_usd: monthlyPriceUsd,
    monthly_original_price_usd: monthlyOriginalPriceUsd,
    yearly_price_usd: yearlyPriceUsd,
    yearly_original_price_usd: yearlyOriginalPriceUsd,
    cta_label: null,
    is_active: Boolean(form.isActive),
  }
}

const buildProgramPayloadFromRecord = (program, overrides = {}) => {
  const durationDays = parseIntValue(
    overrides.durationDays ?? overrides.duration_days ?? program?.duration_days ?? 0,
  )
  const normalizedTitle =
    typeof overrides.title === 'string' && overrides.title.trim()
      ? overrides.title.trim()
      : typeof program?.title === 'string'
        ? program.title.trim()
        : ''
  const accessLevelRaw =
    overrides.accessLevel ??
    overrides.access_level ??
    program?.access_level ??
    program?.accessLevel ??
    'free'
  const accessLevel = accessLevelRaw === 'paid' ? 'paid' : 'free'
  const rawPrice = parseFloatValue(
    overrides.priceUsd ??
      overrides.price_usd ??
      program?.price_usd ??
      program?.priceUsd,
  )
  const priceUsd = accessLevel === 'paid' ? rawPrice : null
  const weeklyPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.weeklyPriceUsd ??
            overrides.weekly_price_usd ??
            program?.weekly_price_usd ??
            program?.weeklyPriceUsd,
        )
      : null
  const weeklyOriginalPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.weeklyOriginalPriceUsd ??
            overrides.weekly_original_price_usd ??
            program?.weekly_original_price_usd ??
            program?.weeklyOriginalPriceUsd,
        )
      : null
  const monthlyPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.monthlyPriceUsd ??
            overrides.monthly_price_usd ??
            program?.monthly_price_usd ??
            program?.monthlyPriceUsd,
        )
      : null
  const monthlyOriginalPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.monthlyOriginalPriceUsd ??
            overrides.monthly_original_price_usd ??
            program?.monthly_original_price_usd ??
            program?.monthlyOriginalPriceUsd,
        )
      : null
  const yearlyPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.yearlyPriceUsd ??
            overrides.yearly_price_usd ??
            program?.yearly_price_usd ??
            program?.yearlyPriceUsd,
        )
      : null
  const yearlyOriginalPriceUsd =
    accessLevel === 'paid'
      ? parseFloatValue(
          overrides.yearlyOriginalPriceUsd ??
            overrides.yearly_original_price_usd ??
            program?.yearly_original_price_usd ??
            program?.yearlyOriginalPriceUsd,
        )
      : null
  const nextActive =
    typeof overrides.isActive === 'boolean'
      ? overrides.isActive
      : typeof overrides.is_active === 'boolean'
        ? overrides.is_active
        : Boolean(program?.is_active ?? program?.isActive ?? true)
  const slug =
    normalizeProgramSlug(overrides.slug, normalizedTitle) ||
    normalizeProgramSlug(program?.slug, normalizedTitle) ||
    normalizeProgramSlug(undefined, normalizedTitle) ||
    buildPlanSlug(durationDays, accessLevel)
  return {
    slug,
    title: normalizedTitle || (durationDays > 0 ? `${durationDays}-Day Plan` : 'Program'),
    subtitle: null,
    description: null,
    duration_days: durationDays,
    workouts_per_week: 0,
    rest_days_per_week: 0,
    level: null,
    access_level: accessLevel,
    price_usd: priceUsd,
    weekly_price_usd: weeklyPriceUsd,
    weekly_original_price_usd: weeklyOriginalPriceUsd,
    monthly_price_usd: monthlyPriceUsd,
    monthly_original_price_usd: monthlyOriginalPriceUsd,
    yearly_price_usd: yearlyPriceUsd,
    yearly_original_price_usd: yearlyOriginalPriceUsd,
    cta_label: null,
    is_active: nextActive,
  }
}

const deriveCategoryCountsFromVideos = (videos) => {
  if (!Array.isArray(videos) || videos.length === 0) return null
  return videos.reduce((acc, video) => {
    const rawBodyPart =
      (typeof video?.body_part === 'string' && video.body_part.trim()) ||
      (typeof video?.bodyPart === 'string' && video.bodyPart.trim()) ||
      ''
    const key = rawBodyPart || 'Uncategorized'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

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
  const ensuredCategoryFoldersRef = useRef(false)
  const [email, setEmail] = useState(getInitialEmail)
  const [otpDigits, setOtpDigits] = useState(getEmptyOtpDigits)
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
  const [userFlagsPending, setUserFlagsPending] = useState({})
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
  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits])
  const [videoCategory, setVideoCategory] = useState(ALL_VIDEOS_CATEGORY)
  const [videoGender, setVideoGender] = useState('All')
  const [videosData, setVideosData] = useState(null)
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState(null)
  const [videoPage, setVideoPage] = useState(1)
  const [videoPending, setVideoPending] = useState('')
  const [exerciseLibraryItems, setExerciseLibraryItems] = useState([])
  const [exerciseLibraryLoading, setExerciseLibraryLoading] = useState(false)
  const [exerciseLibraryError, setExerciseLibraryError] = useState('')
  const [exerciseLibraryPendingId, setExerciseLibraryPendingId] = useState('')
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

  useEffect(() => {
    if (ensuredCategoryFoldersRef.current) return
    let isActive = true
    const ensureFolders = async () => {
      try {
        const folders = VIDEO_CATEGORIES.flatMap((category) => {
          if (!category?.value || typeof category.value !== 'string') return []
          const trimmed = category.value.trim()
          if (!trimmed) return []
          return [trimmed, `${trimmed}/thumbnails`]
        })
        folders.push('exercise-library')
        await ensureSpacesFolders(folders)
      } catch (error) {
        console.error('Failed to ensure Spaces category folders', error)
      } finally {
        if (isActive) {
          ensuredCategoryFoldersRef.current = true
        }
      }
    }
    ensureFolders()
    return () => {
      isActive = false
    }
  }, [])
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
  const [programs, setPrograms] = useState([])
  const [programsLoading, setProgramsLoading] = useState(false)
  const [programsError, setProgramsError] = useState('')
  const [programPending, setProgramPending] = useState('')
  const [programModalMode, setProgramModalMode] = useState('create')
  const [isProgramModalOpen, setProgramModalOpen] = useState(false)
  const [programForm, setProgramForm] = useState(getDefaultProgramForm)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleProgram, setScheduleProgram] = useState(null)
  const [scheduleDays, setScheduleDays] = useState([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [schedulePending, setSchedulePending] = useState(false)
  const [foodsData, setFoodsData] = useState({ items: [], total: 0, page: 1, pageSize: 50 })
  const [foodsLoading, setFoodsLoading] = useState(false)
  const [foodsError, setFoodsError] = useState('')
  const [foodFilters, setFoodFilters] = useState({
    search: '',
    categoryId: '',
  })
  const [foodModalMode, setFoodModalMode] = useState('create')
  const [isFoodModalOpen, setFoodModalOpen] = useState(false)
  const [foodForm, setFoodForm] = useState(getDefaultFoodForm)
  const [foodPending, setFoodPending] = useState(false)
  const [foodCategories, setFoodCategories] = useState([])
  const [foodCategoriesLoading, setFoodCategoriesLoading] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState('create')
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState(getDefaultCategoryForm)
  const [categoryPending, setCategoryPending] = useState(false)
  const [mealsData, setMealsData] = useState([])
  const [mealsLoading, setMealsLoading] = useState(false)
  const [mealsError, setMealsError] = useState('')
  const [mealModalMode, setMealModalMode] = useState('create')
  const [isMealModalOpen, setMealModalOpen] = useState(false)
  const [mealForm, setMealForm] = useState(getDefaultMealForm)
  const [mealPending, setMealPending] = useState(false)

  const isLoggedIn = useMemo(() => Boolean(token), [token])
  const trimmedEmail = email.trim().toLowerCase()
  const isPublicView = PUBLIC_VIEWS.has(activeView)

  const viewMeta = useMemo(() => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: '',
          description: '',
        }
      case 'users':
        return {
          title: 'User Directory',
          description: 'Browse every account in the system with live status tags.',
        }
      case 'videos':
        return {
          title: '',
          description: '',
        }
      case 'exerciseLibrary':
        return {
          title: 'Exercise Library',
          description: 'Manage home screen card titles and cover images.',
        }
      case 'questions':
        return {
          title: '',
          description: '',
        }
      case 'programs':
        return {
          title: 'Programs & Plans',
          description: 'Configure the 28-day free program and the paid 60-day premium journey.',
        }
      case 'foods':
        return {
          title: '',
          description: '',
        }
      case 'meals':
        return {
          title: '',
          description: '',
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
    setExerciseLibraryItems([])
    setExerciseLibraryError('')
    setExerciseLibraryLoading(false)
    setExerciseLibraryPendingId('')
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
    async (categoryValue, pageValue = 1, genderValue = 'All') => {
      if (!token) return
      const targetCategory = categoryValue ?? ALL_VIDEOS_CATEGORY
      const targetGender = genderValue ?? 'All'
      const normalizedCategory =
        !targetCategory || targetCategory === ALL_VIDEOS_CATEGORY ? 'all' : targetCategory
      const normalizedGender = targetGender && targetGender !== 'All' ? targetGender : ''
      const targetPage = pageValue ?? 1
      setVideosLoading(true)
      setVideosError(null)
      try {
        const response = await fetchVideosByCategory(
          normalizedCategory,
          token,
          targetPage,
          VIDEO_PAGE_SIZE,
          { gender: normalizedGender },
        )
        const payload = response?.data ?? {}
        const derivedCounts = deriveCategoryCountsFromVideos(payload?.videos)
        setVideosData((prev) => {
          const countsFromApi = payload?.category_counts ?? payload?.categoryCounts ?? null
          const hasApiCounts =
            countsFromApi && typeof countsFromApi === 'object' && Object.keys(countsFromApi).length > 0
          const derivedCountsValid =
            derivedCounts && typeof derivedCounts === 'object' && Object.keys(derivedCounts).length > 0
          const previousCountsSnapshot =
            prev?.category_counts_snapshot ??
            prev?.categoryCountsSnapshot ??
            prev?.category_counts ??
            prev?.categoryCounts ??
            null
          const shouldUpdateSnapshot =
            (hasApiCounts || derivedCountsValid) && normalizedCategory === 'all' && !normalizedGender
          const nextCountsSnapshot = shouldUpdateSnapshot
            ? hasApiCounts
              ? countsFromApi
              : derivedCounts
            : previousCountsSnapshot ?? null
          const countsForUi =
            nextCountsSnapshot ??
            (hasApiCounts ? countsFromApi : null) ??
            previousCountsSnapshot ??
            (derivedCountsValid ? derivedCounts : null) ??
            null
          const countsTotal =
            countsForUi && typeof countsForUi === 'object'
              ? Object.values(countsForUi).reduce((sum, value) => sum + (Number(value) || 0), 0)
              : null
          const pageSize =
            payload?.page_size ?? payload?.pageSize ?? prev?.page_size ?? VIDEO_PAGE_SIZE
          const totalCountFromPayload =
            payload?.total ??
            payload?.count ??
            payload?.total_count ??
            payload?.totalCount ??
            payload?.videos?.length ??
            prev?.total ??
            0
          const totalCount =
            normalizedCategory === 'all' && !normalizedGender
              ? countsTotal ?? totalCountFromPayload
              : totalCountFromPayload
          return {
            ...prev,
            ...payload,
            category: targetCategory,
            category_counts_snapshot: nextCountsSnapshot ?? undefined,
            categoryCountsSnapshot: nextCountsSnapshot ?? undefined,
            category_counts: countsForUi ?? undefined,
            categoryCounts: countsForUi ?? undefined,
            page_size: pageSize,
            videos: payload?.videos ?? [],
            total: totalCount,
            pageCount: Math.max(1, Math.ceil(Math.max(totalCount, 0) / pageSize)),
            gender: targetGender,
          }
        })
        const nextPageValue = Number(payload?.page ?? targetPage) || 1
        setVideoPage(nextPageValue)
      } catch (error) {
        setVideosError(error?.message ?? 'Unable to load videos.')
        handleApiError(error)
      } finally {
        setVideosLoading(false)
      }
    },
    [handleApiError, token],
  )

  const loadExerciseLibrary = useCallback(async () => {
    if (!token) return
    setExerciseLibraryLoading(true)
    setExerciseLibraryError('')
    try {
      const response = await fetchExerciseLibrary(token)
      const payload = response?.data ?? {}
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : []
      setExerciseLibraryItems(items)
    } catch (error) {
      setExerciseLibraryError(error?.message ?? 'Unable to load exercise library.')
      handleApiError(error)
    } finally {
      setExerciseLibraryLoading(false)
    }
  }, [handleApiError, token])

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

  const loadPrograms = useCallback(
    async (options = {}) => {
      if (!token) return
      setProgramsLoading(true)
      setProgramsError('')
      try {
        const includeInactive =
          typeof options.includeInactive === 'boolean' ? options.includeInactive : true
        const response = await fetchPrograms({ includeInactive }, token)
        const payload = response?.data ?? response ?? []
        const normalizedPrograms = Array.isArray(payload) ? payload : payload?.programs ?? []
        setPrograms(normalizedPrograms ?? [])
      } catch (error) {
        setProgramsError(error?.message ?? 'Unable to load programs.')
        handleApiError(error)
      } finally {
        setProgramsLoading(false)
      }
    },
    [handleApiError, token],
  )

  const loadFoodCategories = useCallback(async () => {
    if (!token) return
    setFoodCategoriesLoading(true)
    try {
      const response = await fetchFoodCategoriesAdmin(token, { includeInactive: true })
      const payload = response?.data ?? response ?? {}
      setFoodCategories(payload.categories ?? [])
    } catch (error) {
      handleApiError(error)
    } finally {
      setFoodCategoriesLoading(false)
    }
  }, [handleApiError, token])

  const loadFoods = useCallback(
    async (overrideFilters) => {
      if (!token) return
      const nextFilters = overrideFilters ?? foodFilters
      setFoodsLoading(true)
      setFoodsError('')
      try {
        const response = await fetchFoodsAdmin(
          {
            search: nextFilters.search,
            categoryId: nextFilters.categoryId,
            includeInactive: true,
            page: 1,
            pageSize: 100,
          },
          token,
        )
        const payload = response?.data ?? response ?? {}
        setFoodsData({
          items: payload.items ?? [],
          total: payload.total ?? (payload.items?.length ?? 0),
          page: payload.page ?? 1,
          pageSize: payload.page_size ?? payload.pageSize ?? 100,
          hasNext: Boolean(payload.has_next),
        })
      } catch (error) {
        setFoodsError(error?.message ?? 'Unable to load foods.')
        handleApiError(error)
      } finally {
        setFoodsLoading(false)
      }
    },
    [foodFilters, handleApiError, token],
  )

  const loadMeals = useCallback(async () => {
    if (!token) return
    setMealsLoading(true)
    setMealsError('')
    try {
      const response = await fetchMealsAdmin({ includeInactive: true }, token)
      const payload = response?.data ?? response ?? {}
      setMealsData(payload.meals ?? [])
    } catch (error) {
      setMealsError(error?.message ?? 'Unable to load meals.')
      handleApiError(error)
    } finally {
      setMealsLoading(false)
    }
  }, [handleApiError, token])

  const openCreateProgramModal = useCallback(() => {
    setProgramModalMode('create')
    setProgramForm(getDefaultProgramForm())
    setProgramModalOpen(true)
  }, [])

  const openEditProgramModal = useCallback((program) => {
    if (!program) return
    setProgramModalMode('edit')
    const accessLevel =
      (program.access_level ?? program.accessLevel ?? 'free') === 'paid' ? 'paid' : 'free'
    const paidTerm = accessLevel === 'paid' ? resolvePaidTermFromProgram(program) : 'monthly'
    const paidPrices =
      accessLevel === 'paid' ? resolvePaidPricesFromProgram(program, paidTerm) : { original: null, discounted: null }
    setProgramForm({
      id: program.id ?? '',
      title: program.title ?? '',
      durationDays: String(program.duration_days ?? program.durationDays ?? ''),
      accessLevel,
      priceUsd:
        program.price_usd != null
          ? String(program.price_usd)
          : program.priceUsd != null
            ? String(program.priceUsd)
            : '',
      paidTerm,
      originalPrice:
        paidPrices.original != null
          ? String(paidPrices.original)
          : '',
      discountedPrice:
        paidPrices.discounted != null
          ? String(paidPrices.discounted)
          : '',
      isActive:
        typeof program.is_active === 'boolean' ? program.is_active : program.isActive ?? true,
    })
    setProgramModalOpen(true)
  }, [])

  const closeProgramModal = useCallback(() => {
    setProgramModalOpen(false)
  }, [])

  const openScheduleModal = useCallback(
    async (program) => {
      if (!token || !program) return
      setScheduleProgram(program)
      setScheduleModalOpen(true)
      setScheduleLoading(true)
      setScheduleError('')
      try {
        const identifier = program.id ?? program.slug
        if (!identifier) {
          throw new Error('Unable to determine program identifier.')
        }
        const response = await fetchProgramDetailAdmin(identifier, token)
        const payload = response?.data ?? response
        setScheduleDays(buildScheduleDaysState(program, payload))
      } catch (error) {
        handleApiError(error)
        setScheduleError(error?.message ?? 'Unable to load program schedule.')
        setScheduleDays([])
      } finally {
        setScheduleLoading(false)
      }
    },
    [handleApiError, token],
  )

  const closeScheduleModal = useCallback(() => {
    setScheduleModalOpen(false)
    setScheduleProgram(null)
    setScheduleDays([])
    setScheduleError('')
  }, [])

  const handleToggleDayRest = useCallback((dayNumber, isRestDay) => {
    setScheduleError('')
    setScheduleDays((prev) =>
      prev.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              isRestDay,
              ...(isRestDay
                ? {
                    videoId: null,
                    videoUrl: '',
                    videoThumbnail: '',
                    videoTitle: '',
                    videoFile: null,
                    thumbnailFile: null,
                  }
                : {}),
            }
          : day,
      ),
    )
  }, [])

  const handleSelectDayFile = useCallback((dayNumber, field, file) => {
    setScheduleError('')
    setScheduleDays((prev) =>
      prev.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              [field]: file ?? null,
            }
          : day,
      ),
    )
  }, [])

  const handleClearDayVideo = useCallback((dayNumber) => {
    setScheduleError('')
    setScheduleDays((prev) =>
      prev.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              videoId: null,
              videoUrl: '',
              videoThumbnail: '',
              videoTitle: '',
              videoFile: null,
              thumbnailFile: null,
            }
          : day,
      ),
    )
  }, [])

  const handleAutoRestDays = useCallback(() => {
    setScheduleError('')
    setScheduleDays((prev) =>
      prev.map((day) => {
        const patternIndex = (day.dayNumber - 1) % 7
        const shouldRest = patternIndex == 2 || patternIndex == 6
        if (!shouldRest) {
          return {
            ...day,
            isRestDay: false,
          }
        }
        return {
          ...day,
          isRestDay: true,
          videoId: null,
          videoUrl: '',
          videoThumbnail: '',
          videoTitle: '',
          videoFile: null,
          thumbnailFile: null,
        }
      }),
    )
  }, [])

  const handleSaveSchedule = useCallback(async () => {
    if (!token || !scheduleProgram) return
    if (scheduleDays.length === 0) {
      setScheduleError('Add at least one day to the plan.')
      return
    }
    for (const day of scheduleDays) {
      if (day.isRestDay) continue
      const hasExistingVideo = Boolean(day.videoId)
      const hasVideoFile = Boolean(day.videoFile)
      const hasThumbnailFile = Boolean(day.thumbnailFile)
      const wantsUpload = hasVideoFile || hasThumbnailFile
      if (wantsUpload && !(hasVideoFile && hasThumbnailFile)) {
        setScheduleError(`Day ${day.dayNumber}: select both a video and thumbnail.`)
        return
      }
      if (!hasExistingVideo && !wantsUpload) {
        setScheduleError(`Day ${day.dayNumber} requires a workout video.`)
        return
      }
    }
    const identifier = scheduleProgram.id ?? scheduleProgram.slug
    if (!identifier) {
      setScheduleError('Unable to determine program identifier.')
      return
    }
    setSchedulePending(true)
    setScheduleError('')
    try {
      const planFolder = getPlanMediaFolder(scheduleProgram)
      await ensureSpacesFolders([planFolder, `${planFolder}/thumbnails`])

      const preparedDays = []
      for (const day of scheduleDays) {
        if (day.isRestDay) {
          preparedDays.push({
            day_number: day.dayNumber,
            is_rest_day: true,
            title: `Rest Day ${day.dayNumber}`,
          })
          continue
        }
        let videoId = day.videoId
        if (day.videoFile || day.thumbnailFile) {
          if (!day.videoFile || !day.thumbnailFile) {
            throw new Error(`Day ${day.dayNumber}: select both a video and thumbnail.`)
          }
          const [videoUpload, thumbUpload] = await Promise.all([
            uploadFileToSpaces(day.videoFile, { folder: planFolder }),
            uploadFileToSpaces(day.thumbnailFile, { folder: `${planFolder}/thumbnails` }),
          ])
          const videoPayload = {
            body_part: '',
            gender: '',
            title: `${scheduleProgram.title || 'Program'} · Day ${day.dayNumber}`,
            description: `Workout for day ${day.dayNumber}`,
            video_url: videoUpload.url,
            thumbnail_url: thumbUpload.url,
          }
          const uploadResponse = await uploadVideo(videoPayload, token)
          videoId =
            uploadResponse?.data?.id ??
            uploadResponse?.data?.video?.id ??
            uploadResponse?.data?.video_id ??
            null
          if (!videoId) {
            throw new Error(`Unable to attach video for day ${day.dayNumber}.`)
          }
        }
        if (!videoId) {
          throw new Error(`Day ${day.dayNumber} requires a workout video.`)
        }
        preparedDays.push({
          day_number: day.dayNumber,
          is_rest_day: false,
          video_id: videoId,
          title: `${scheduleProgram.title || 'Program'} · Day ${day.dayNumber}`,
        })
      }
      const response = await updateProgramSchedule(identifier, { days: preparedDays }, token)
      setStatus({
        type: 'success',
        text: response?.message ?? 'Program schedule updated successfully.',
      })
      closeScheduleModal()
      loadPrograms()
    } catch (error) {
      handleApiError(error)
      setScheduleError(error?.message ?? 'Unable to save schedule.')
    } finally {
      setSchedulePending(false)
    }
  }, [closeScheduleModal, handleApiError, loadPrograms, scheduleDays, scheduleProgram, token])

  const handleProgramModalSubmit = useCallback(async () => {
    if (!token) return
    const accessInput = (programForm.accessLevel ?? '').trim().toLowerCase()
    if (accessInput !== 'free' && accessInput !== 'paid') {
      setStatus({ type: 'error', text: 'Access type must be either "free" or "paid".' })
      return
    }
    const trimmedName = (programForm.title ?? '').trim()
    if (accessInput === 'free' && !trimmedName) {
      setStatus({ type: 'error', text: 'Plan name is required.' })
      return
    }
    const parsedDays = parseIntValue(programForm.durationDays)
    if (accessInput === 'free' && parsedDays <= 0) {
      setStatus({ type: 'error', text: 'Number of days must be greater than 0.' })
      return
    }
    const paidTerm = resolvePaidTerm(programForm.paidTerm)
    const originalPrice = parseFloatValue(programForm.originalPrice)
    const discountedPrice = parseFloatValue(programForm.discountedPrice)
    if (accessInput === 'paid' && (!originalPrice || !discountedPrice)) {
      setStatus({
        type: 'error',
        text: 'Enter original and discounted prices for paid plans.',
      })
      return
    }
    const payload = buildProgramPayload({
      ...programForm,
      title: accessInput === 'paid' ? paidTitleForTerm(paidTerm) : trimmedName,
      durationDays: accessInput === 'paid' ? String(paidTermToDays(paidTerm)) : String(parsedDays),
      accessLevel: accessInput,
      paidTerm,
      originalPrice: accessInput === 'paid' ? String(originalPrice ?? '') : '',
      discountedPrice: accessInput === 'paid' ? String(discountedPrice ?? '') : '',
    })
    const mode = programModalMode
    const identifier = mode === 'edit' ? programForm.id || programForm.slug : undefined
    if (mode === 'edit' && !identifier) return
    setProgramPending(mode)
    try {
      const response =
        mode === 'edit'
          ? await updateProgram(identifier, payload, token)
          : await createProgram(payload, token)
      setStatus({
        type: 'success',
        text:
          response?.message ??
          (mode === 'edit' ? 'Program updated successfully.' : 'Program created successfully.'),
      })
      setProgramModalOpen(false)
      setProgramForm(getDefaultProgramForm())
      loadPrograms()
    } catch (error) {
      handleApiError(error)
    } finally {
      setProgramPending('')
    }
  }, [handleApiError, loadPrograms, programForm, programModalMode, token])

  const handleDeleteProgram = useCallback(
    async (program) => {
      if (!token) return
      const identifier = program?.id ?? program?.slug
      if (!identifier) return
      setProgramPending(`delete-${identifier}`)
      try {
        const response = await deleteProgram(identifier, token)
        setStatus({
          type: 'success',
          text: response?.message ?? 'Program deleted successfully.',
        })
        setPrograms((prev) =>
          prev.filter((item) => item.id !== program?.id && item.slug !== program?.slug),
        )
      } catch (error) {
        handleApiError(error)
      } finally {
        setProgramPending('')
      }
    },
    [handleApiError, token],
  )

  const handleToggleProgramActive = useCallback(
    async (program) => {
      if (!token || !program?.id) return
      const identifier = program.id
      const nextActive = !(program?.is_active ?? program?.isActive ?? true)
      const payload = buildProgramPayloadFromRecord(program, { isActive: nextActive })
      setProgramPending(`toggle-${identifier}`)
      try {
        const response = await updateProgram(identifier, payload, token)
        const updatedProgram = response?.data ?? response ?? null
        setPrograms((prev) =>
          prev.map((item) =>
            item.id === identifier
              ? {
                  ...item,
                  ...(updatedProgram ?? {}),
                  is_active: nextActive,
                }
              : item,
          ),
        )
        setStatus({
          type: 'success',
          text: response?.message ?? (nextActive ? 'Program activated.' : 'Program hidden.'),
        })
      } catch (error) {
        handleApiError(error)
      } finally {
        setProgramPending('')
      }
    },
    [handleApiError, token],
  )

  const handleFoodFiltersChange = useCallback((updates) => {
    setFoodFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const openCreateFoodModal = useCallback(() => {
    setFoodModalMode('create')
    setFoodForm(getDefaultFoodForm())
    setFoodModalOpen(true)
  }, [])

  const openEditFoodModal = useCallback((food) => {
    if (!food) return
    setFoodModalMode('edit')
    setFoodForm({
      id: food.id,
      name: food.product_name ?? '',
      brand: food.brand ?? '',
      imageUrl: food.image_url ?? '',
      imageFile: null,
      calories: food.calories != null ? String(food.calories) : '',
      protein: food.protein != null ? String(food.protein) : '',
      carbs: food.carbs != null ? String(food.carbs) : '',
      fat: food.fat != null ? String(food.fat) : '',
      servingQuantity: food.serving_quantity != null ? String(food.serving_quantity) : '',
      servingUnit: food.serving_unit ?? 'serving',
      categoryId: food.category_id ? String(food.category_id) : '',
      isActive: Boolean(food.is_active ?? true),
    })
    setFoodModalOpen(true)
  }, [])

  const closeFoodModal = useCallback(() => {
    setFoodModalOpen(false)
  }, [])

  const handleFoodModalSubmit = useCallback(async () => {
    if (!token) return
    const caloriesValue = Number(foodForm.calories)
    if (!foodForm.name.trim() || Number.isNaN(caloriesValue) || caloriesValue <= 0) {
      setStatus({ type: 'error', text: 'Name and calories are required.' })
      return
    }
    const toNumber = (value) => {
      if (value === '' || value == null) return null
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? null : parsed
    }
    setFoodPending('saving')
    try {
      let imageUrl = foodForm.imageUrl?.trim() || ''
      if (foodForm.imageFile) {
        setFoodPending('uploading')
        await ensureSpacesFolders([FOOD_IMAGE_FOLDER])
        const { url } = await uploadFileToSpaces(foodForm.imageFile, { folder: FOOD_IMAGE_FOLDER })
        imageUrl = url
      }
      const payload = {
        product_name: foodForm.name.trim(),
        brand: foodForm.brand.trim() || null,
        calories: caloriesValue,
        protein: toNumber(foodForm.protein),
        carbs: toNumber(foodForm.carbs),
        fat: toNumber(foodForm.fat),
        serving_quantity: toNumber(foodForm.servingQuantity) ?? 1,
        serving_unit: foodForm.servingUnit?.trim() || 'serving',
        image_url: imageUrl || null,
        category_id: foodForm.categoryId ? Number(foodForm.categoryId) : null,
        is_active: Boolean(foodForm.isActive),
      }
      setFoodPending('saving')
      if (foodModalMode === 'edit' && foodForm.id) {
        const response = await updateFood(foodForm.id, payload, token)
        setStatus({ type: 'success', text: response?.message ?? 'Food updated.' })
      } else {
        const response = await createFood(payload, token)
        setStatus({ type: 'success', text: response?.message ?? 'Food created.' })
      }
      setFoodModalOpen(false)
      loadFoods()
      loadFoodCategories()
    } catch (error) {
      handleApiError(error)
    } finally {
      setFoodPending('')
    }
  }, [foodForm, foodModalMode, handleApiError, loadFoodCategories, loadFoods, token])

  const handleFoodDelete = useCallback(
    async (food) => {
      if (!token || !food) return
      const result = await Swal.fire({
        title: `Delete ${food.product_name ?? 'this food'}?`,
        text: 'This will permanently remove it from the database.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#FA99B5',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      })
      if (!result.isConfirmed) return
      try {
        await deleteFood(food.id, token)
        setStatus({ type: 'success', text: 'Food deleted.' })
        loadFoods()
      } catch (error) {
        handleApiError(error)
      }
    },
    [handleApiError, loadFoods, token],
  )

  const openCreateMealModal = useCallback(() => {
    setMealModalMode('create')
    setMealForm(getDefaultMealForm())
    setMealModalOpen(true)
  }, [])

  const openEditMealModal = useCallback((meal) => {
    if (!meal) return
    setMealModalMode('edit')
    setMealForm({
      id: meal.id,
      key: meal.key ?? '',
      name: meal.name ?? '',
      iconUrl: meal.icon_url ?? '',
      iconFile: null,
      minRatio: meal.min_ratio != null ? String(meal.min_ratio) : '0',
      maxRatio: meal.max_ratio != null ? String(meal.max_ratio) : '0',
      sortOrder: meal.sort_order != null ? String(meal.sort_order) : '0',
      isActive: Boolean(meal.is_active ?? true),
    })
    setMealModalOpen(true)
  }, [])

  const closeMealModal = useCallback(() => {
    setMealModalOpen(false)
  }, [])

  const handleMealModalSubmit = useCallback(async () => {
    if (!token) return
    if (!mealForm.name.trim() || !mealForm.key.trim()) {
      setStatus({ type: 'error', text: 'Meal key and name are required.' })
      return
    }
    const toNumber = (value) => {
      if (value === '' || value == null) return 0
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    setMealPending('saving')
    try {
      let iconUrl = mealForm.iconUrl?.trim() || ''
      if (mealForm.iconFile) {
        setMealPending('uploading')
        await ensureSpacesFolders([MEAL_ICON_FOLDER])
        const { url } = await uploadFileToSpaces(mealForm.iconFile, {
          folder: MEAL_ICON_FOLDER,
        })
        iconUrl = url
      }
      const payload = {
        key: mealForm.key.trim(),
        name: mealForm.name.trim(),
        icon_url: iconUrl || null,
        min_ratio: toNumber(mealForm.minRatio),
        max_ratio: toNumber(mealForm.maxRatio),
        sort_order: Number(mealForm.sortOrder) || 0,
        is_active: Boolean(mealForm.isActive),
      }
      if (mealModalMode === 'edit' && mealForm.id) {
        const response = await updateMeal(mealForm.id, payload, token)
        setStatus({ type: 'success', text: response?.message ?? 'Meal updated.' })
      } else {
        const response = await createMeal(payload, token)
        setStatus({ type: 'success', text: response?.message ?? 'Meal created.' })
      }
      setMealModalOpen(false)
      loadMeals()
    } catch (error) {
      handleApiError(error)
    } finally {
      setMealPending('')
    }
  }, [handleApiError, loadMeals, mealForm, mealModalMode, token])

  const handleMealDelete = useCallback(
    async (meal) => {
      if (!token || !meal) return
      const result = await Swal.fire({
        title: `Delete ${meal.name ?? 'this meal'}?`,
        text: 'This will permanently remove it from the database.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#FA99B5',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      })
      if (!result.isConfirmed) return
      try {
        await deleteMeal(meal.id, token)
        setStatus({ type: 'success', text: 'Meal deleted.' })
        loadMeals()
      } catch (error) {
        handleApiError(error)
      }
    },
    [handleApiError, loadMeals, token],
  )

  const openCreateCategoryModal = useCallback(() => {
    setCategoryModalMode('create')
    setCategoryForm(getDefaultCategoryForm())
    setCategoryModalOpen(true)
  }, [])

  const openEditCategoryModal = useCallback((category) => {
    if (!category) return
    setCategoryModalMode('edit')
    setCategoryForm({
      id: category.id,
      name: category.name ?? '',
      description: category.description ?? '',
      isActive: Boolean(category.is_active ?? true),
    })
    setCategoryModalOpen(true)
  }, [])

  const closeCategoryModal = useCallback(() => {
    setCategoryModalOpen(false)
  }, [])

  const handleCategoryModalSubmit = useCallback(async () => {
    if (!token) return
    if (!categoryForm.name.trim()) {
      setStatus({ type: 'error', text: 'Name is required.' })
      return
    }
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description?.trim() || null,
      is_active: Boolean(categoryForm.isActive),
    }
    setCategoryPending('saving')
    try {
      if (categoryModalMode === 'edit' && categoryForm.id) {
        await updateFoodCategory(categoryForm.id, payload, token)
        setStatus({ type: 'success', text: 'Category updated.' })
      } else {
        await createFoodCategory(payload, token)
        setStatus({ type: 'success', text: 'Category created.' })
      }
      setCategoryModalOpen(false)
      loadFoodCategories()
    } catch (error) {
      handleApiError(error)
    } finally {
      setCategoryPending('')
    }
  }, [categoryForm, categoryModalMode, handleApiError, loadFoodCategories, token])

  const handleCategoryDelete = useCallback(
    async (category) => {
      if (!token || !category) return
      const result = await Swal.fire({
        title: `Delete ${category.name}?`,
        text: 'Foods in this category will be left uncategorized.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete category',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#FA99B5',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
      })
      if (!result.isConfirmed) return
      try {
        await deleteFoodCategory(category.id, token)
        setStatus({ type: 'success', text: 'Category deleted.' })
        loadFoodCategories()
        loadFoods()
      } catch (error) {
        handleApiError(error)
      }
    },
    [handleApiError, loadFoodCategories, loadFoods, token],
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
    loadVideos(videoCategory, 1, videoGender)
  }
}, [activeView, isLoggedIn, loadVideos, videoCategory, videoGender])

useEffect(() => {
  if (isLoggedIn && activeView === 'exerciseLibrary') {
    loadExerciseLibrary()
  }
}, [activeView, isLoggedIn, loadExerciseLibrary])

  useEffect(() => {
    if (isLoggedIn && activeView === 'questions') {
      loadQuestions()
    }
  }, [activeView, isLoggedIn, loadQuestions])

  useEffect(() => {
    if (isLoggedIn && activeView === 'programs') {
      loadPrograms()
    }
  }, [activeView, isLoggedIn, loadPrograms])

  useEffect(() => {
    if (isLoggedIn && activeView === 'foods') {
      loadFoodCategories()
    }
  }, [activeView, isLoggedIn, loadFoodCategories])

  useEffect(() => {
    if (isLoggedIn && activeView === 'foods') {
      loadFoods()
    }
  }, [activeView, isLoggedIn, loadFoods])

  useEffect(() => {
    if (isLoggedIn && activeView === 'meals') {
      loadMeals()
    }
  }, [activeView, isLoggedIn, loadMeals])

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
    if (!trimmedEmail || otpDigits.some((digit) => !digit)) {
      setStatus({ type: 'error', text: 'Enter your email and the 6-digit OTP.' })
      return
    }
    setPendingAction('verify')
    setStatus(null)
    try {
      const response = await verifyOtp(trimmedEmail, otpValue)
      const accessToken = response?.data?.access_token
      if (!accessToken) {
        throw new Error('No access token returned.')
      }
      setToken(accessToken)
      safeSetInStorage(TOKEN_KEY, accessToken)
      setActiveView('dashboard')
      safeSetInStorage(ACTIVE_VIEW_KEY, 'dashboard')
      setStatus({ type: 'success', text: response?.message ?? 'OTP verified successfully.' })
      setOtpDigits(getEmptyOtpDigits())
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
      setOtpDigits(getEmptyOtpDigits())
    }
  }

  const handleOtpChange = (digits) => {
    if (!Array.isArray(digits)) return
    setOtpDigits(
      Array.from({ length: OTP_LENGTH }, (_, index) => {
        const value = digits[index]
        if (typeof value !== 'string') return ''
        const numericChar = value.replace(/\D/g, '')
        return numericChar ? numericChar.slice(-1) : ''
      }),
    )
  }

  const videoPageCount = videosData?.pageCount ?? Math.max(1, Math.ceil(Math.max(videosData?.total ?? 0, 0) / VIDEO_PAGE_SIZE))

  const handleVideoCategoryChange = (value) => {
    setVideoCategory(value)
    setVideoPage(1)
    loadVideos(value, 1, videoGender)
  }

  const handleVideoGenderChange = (value) => {
    setVideoGender(value)
    setVideoPage(1)
    loadVideos(videoCategory, 1, value)
  }

  const handleVideoFiltersReset = () => {
    setVideoGender('All')
    setVideoCategory(ALL_VIDEOS_CATEGORY)
    setVideoPage(1)
    loadVideos(ALL_VIDEOS_CATEGORY, 1, 'All')
  }

  const handleVideosPageChange = useCallback(
    (page) => {
      const currentPage = videoPage ?? 1
      const nextPage = Math.max(1, Math.min(Number(page) || 1, videoPageCount))
      if (nextPage === currentPage) return
      loadVideos(videoCategory, nextPage, videoGender)
    },
    [loadVideos, videoCategory, videoGender, videoPage, videoPageCount],
  )

  const resetVideoForm = () => setVideoForm(getDefaultVideoForm())

  const openCreateVideoModal = () => {
    setVideoModalMode('create')
    resetVideoForm()
    setVideoModalOpen(true)
  }

  // console.log('ABCD', {shouldShowAuth,isLoggedIn,activeView})

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
    const trimmedTitle = (videoForm.title ?? '').trim()
    const trimmedDescription = (videoForm.description ?? '').trim()
    if (videoModalMode === 'create') {
      if (!trimmedTitle) {
        setStatus({ type: 'error', text: 'Enter a title for the video.' })
        return
      }
      if (!videoForm.videoFile || !videoForm.thumbnailFile) {
        setStatus({ type: 'error', text: 'Attach both video and thumbnail files.' })
        return
      }
      setVideoPending('upload')
      try {
        const videoFolder = getVideoUploadFolder(videoForm.bodyPart)
        const thumbnailFolder = getThumbnailUploadFolder(videoForm.bodyPart)
        const [uploadedVideo, uploadedThumbnail] = await Promise.all([
          uploadFileToSpaces(videoForm.videoFile, { folder: videoFolder }),
          uploadFileToSpaces(videoForm.thumbnailFile, { folder: thumbnailFolder }),
        ])
        const payload = {
          body_part: videoForm.bodyPart,
          gender: videoForm.gender,
          title: trimmedTitle,
          video_url: uploadedVideo.url,
          thumbnail_url: uploadedThumbnail.url,
        }
        if (trimmedDescription) {
          payload.description = trimmedDescription
        }
        const response = await uploadVideo(payload, token)
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

    setVideoPending('update')
    try {
      const payload = {}
      if (videoForm.bodyPart) {
        payload.body_part = videoForm.bodyPart
      }
      if (videoForm.gender) {
        payload.gender = videoForm.gender
      }
      if (trimmedTitle) {
        payload.title = trimmedTitle
      }
      if (trimmedDescription) {
        payload.description = trimmedDescription
      }
      const videoFolder = getVideoUploadFolder(videoForm.bodyPart)
      const thumbnailFolder = getThumbnailUploadFolder(videoForm.bodyPart)
      if (videoForm.videoFile) {
        const { url } = await uploadFileToSpaces(videoForm.videoFile, { folder: videoFolder })
        payload.video_url = url
      }
      if (videoForm.thumbnailFile) {
        const { url } = await uploadFileToSpaces(videoForm.thumbnailFile, { folder: thumbnailFolder })
        payload.thumbnail_url = url
      }

      const response = await updateVideo(videoForm.videoId, payload, token)
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

  const handleExerciseLibrarySave = useCallback(
    async (itemId, { title, file } = {}) => {
      if (!token) return false
      setExerciseLibraryPendingId(String(itemId))
      try {
        let coverUrl = ''
        if (file) {
          const uploaded = await uploadFileToSpaces(file, { folder: 'exercise-library' })
          coverUrl = uploaded?.url ?? ''
        }
        const payload = {}
        if (typeof title === 'string' && title.trim()) {
          payload.title = title.trim()
        }
        if (coverUrl) {
          payload.cover_image_url = coverUrl
        }
        if (Object.keys(payload).length === 0) {
          return true
        }
        const response = await updateExerciseLibraryItem(itemId, payload, token)
        setStatus({
          type: 'success',
          text: response?.message ?? 'Exercise library item updated.',
        })
        await loadExerciseLibrary()
        return true
      } catch (error) {
        handleApiError(error)
        return false
      } finally {
        setExerciseLibraryPendingId('')
      }
    },
    [handleApiError, loadExerciseLibrary, token],
  )

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

  const handleUserFlagChange = async (userId, updates) => {
    if (!userId || !token || !updates) return
    setUserFlagsPending((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await updateUserFlags(userId, updates, token)
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
        text: response?.message ?? 'User updated successfully.',
      })
    } catch (error) {
      handleApiError(error)
    } finally {
      setUserFlagsPending((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    }
  }

  const handleBackToLoginStep = () => {
    navigateAuthStep('login')
    setOtpDigits(getEmptyOtpDigits())
    setHasRequestedOtp(false)
    setResendSeconds(0)
    setStatus({ type: 'info', text: 'Enter a new email address to request another OTP.' })
  }

  const signedEmail = profile?.email ?? trimmedEmail

  const shouldShowAuth = !isLoggedIn && !isPublicView
  console.log('ABCD', { shouldShowAuth, isLoggedIn, activeView })

  return (
    <div className="app-shell">
      {shouldShowAuth ? (
        <AuthView
          authStep={authStep}
          email={email}
          otpDigits={otpDigits}
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
                {viewMeta.title ? <h1>{viewMeta.title}</h1> : null}
                {viewMeta.description ? <p>{viewMeta.description}</p> : null}
              </div>
              <div className="topbar-meta" />
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
                  onToggleFlag={handleUserFlagChange}
                  flagsPending={userFlagsPending}
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
                  videoCategory={videoCategory}
                  videoGender={videoGender}
                  videoPending={videoPending}
                  onCategoryChange={handleVideoCategoryChange}
                  onGenderChange={handleVideoGenderChange}
                  onResetFilters={handleVideoFiltersReset}
                  onRefresh={() => loadVideos(videoCategory, 1, videoGender)}
                  onEditVideo={openEditVideoModal}
                  onDeleteVideo={handleDeleteVideo}
                  currentPage={videoPage}
                  totalPages={videoPageCount}
                  onPageChange={handleVideosPageChange}
                  onUploadVideo={openCreateVideoModal}
                />
              )}
              {activeView === 'exerciseLibrary' && (
                <ExerciseLibraryView
                  items={exerciseLibraryItems}
                  isLoading={exerciseLibraryLoading}
                  error={exerciseLibraryError}
                  pendingId={exerciseLibraryPendingId}
                  onSave={handleExerciseLibrarySave}
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
                  onAddQuestion={openCreateQuestionModal}
                />
              )}
              {activeView === 'programs' && (
                <ProgramsView
                  programs={programs}
                  isLoading={programsLoading}
                  error={programsError}
                  onAddProgram={openCreateProgramModal}
                  onEditProgram={openEditProgramModal}
                  onDeleteProgram={handleDeleteProgram}
                  onToggleProgramActive={handleToggleProgramActive}
                  onManageSchedule={openScheduleModal}
                  pendingAction={programPending}
                />
              )}
              {activeView === 'foods' && (
                <FoodsView
                  foodsData={foodsData}
                  foodsLoading={foodsLoading || foodCategoriesLoading}
                  foodsError={foodsError}
                  categories={foodCategories}
                  filters={foodFilters}
                  onFiltersChange={handleFoodFiltersChange}
                  onAddFood={openCreateFoodModal}
                  onEditFood={openEditFoodModal}
                  onDeleteFood={handleFoodDelete}
                  onAddCategory={openCreateCategoryModal}
                  onEditCategory={openEditCategoryModal}
                  onDeleteCategory={handleCategoryDelete}
                />
              )}
              {activeView === 'meals' && (
                <MealsView
                  meals={mealsData}
                  loading={mealsLoading}
                  error={mealsError}
                  onAddMeal={openCreateMealModal}
                  onEditMeal={openEditMealModal}
                  onDeleteMeal={handleMealDelete}
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
      <ProgramModal
        open={isProgramModalOpen}
        mode={programModalMode}
        form={programForm}
        setForm={setProgramForm}
        pendingAction={
          programPending === 'create' || programPending === 'edit' ? programPending : ''
        }
        onClose={closeProgramModal}
        onSubmit={handleProgramModalSubmit}
      />
      <ProgramScheduleModal
        open={scheduleModalOpen}
        program={scheduleProgram}
        days={scheduleDays}
        loading={scheduleLoading}
        error={scheduleError}
        pending={schedulePending}
        onClose={closeScheduleModal}
        onToggleRest={handleToggleDayRest}
        onSelectFile={handleSelectDayFile}
        onClearVideo={handleClearDayVideo}
        onAutoRest={handleAutoRestDays}
        onSave={handleSaveSchedule}
      />
      <FoodModal
        open={isFoodModalOpen}
        mode={foodModalMode}
        form={foodForm}
        setForm={setFoodForm}
        categories={foodCategories}
        pendingAction={foodPending === 'saving' ? 'saving' : ''}
        onClose={closeFoodModal}
        onSubmit={handleFoodModalSubmit}
      />
      <FoodCategoryModal
        open={isCategoryModalOpen}
        mode={categoryModalMode}
        form={categoryForm}
        setForm={setCategoryForm}
        pendingAction={categoryPending === 'saving' ? 'saving' : ''}
        onClose={closeCategoryModal}
        onSubmit={handleCategoryModalSubmit}
      />
      <MealModal
        open={isMealModalOpen}
        mode={mealModalMode}
        form={mealForm}
        setForm={setMealForm}
        pendingAction={mealPending}
        onClose={closeMealModal}
        onSubmit={handleMealModalSubmit}
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
