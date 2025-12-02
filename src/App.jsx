import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  requestOtp,
  resendOtp,
  verifyOtp,
  logoutSession,
  fetchProfile,
  fetchUsers,
  fetchVideosByCategory,
  uploadVideo,
  updateVideo,
  deleteVideo,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from './services/api'
import './App.css'
import {
  ACTIVE_VIEW_KEY,
  TOKEN_KEY,
  VIDEO_CATEGORIES,
  VIDEO_GENDERS,
  WORKSPACE_VIEWS,
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
import Sidebar from './components/layout/Sidebar'
import StatusBanner from './components/shared/StatusBanner'

function App() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [flowHint, setFlowHint] = useState(null)
  const [token, setToken] = useState(() => getInitialToken())
  const [profile, setProfile] = useState(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [usersData, setUsersData] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [activeView, setActiveView] = useState(() => getInitialActiveView())
  const [status, setStatus] = useState(null)
  const [pendingAction, setPendingAction] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false)
  const [videoCategory, setVideoCategory] = useState(VIDEO_CATEGORIES[0].value)
  const [videosData, setVideosData] = useState(null)
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState(null)
  const [videoPending, setVideoPending] = useState('')
  const [uploadForm, setUploadForm] = useState({
    bodyPart: VIDEO_CATEGORIES[0].value,
    gender: VIDEO_GENDERS[0].value,
    title: '',
    description: '',
    videoFile: null,
    thumbnailFile: null,
  })
  const [questionsData, setQuestionsData] = useState(null)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [questionsError, setQuestionsError] = useState(null)
  const [questionsFilter, setQuestionsFilter] = useState({
    questionType: '',
    gender: '',
  })
  const [questionPending, setQuestionPending] = useState('')
  const [questionForm, setQuestionForm] = useState({
    id: '',
    prompt: '',
    answer: '',
    gender: 'All',
    questionType: '',
    measurementUnits: [''],
  })
  const [updateForm, setUpdateForm] = useState({
    videoId: '',
    bodyPart: '',
    gender: '',
    title: '',
    description: '',
    videoFile: null,
    thumbnailFile: null,
  })

  const isLoggedIn = useMemo(() => Boolean(token), [token])
  const trimmedEmail = email.trim().toLowerCase()

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
      default:
        return {
          title: 'Fitness Cassie Admin',
          description: 'Stay in control of your coaching business.',
        }
    }
  }, [activeView])

  const resetSession = useCallback(() => {
    setToken('')
    setProfile(null)
    setUsersData(null)
    setActiveView('login')
    setProfileComplete(false)
    setHasRequestedOtp(false)
    setResendSeconds(0)
    safeRemoveFromStorage(TOKEN_KEY)
    safeRemoveFromStorage(ACTIVE_VIEW_KEY)
  }, [])

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
      setProfileComplete(Boolean(nextProfile?.first_name && nextProfile?.last_name))
    } catch (error) {
      handleApiError(error)
    } finally {
      setProfileLoading(false)
    }
  }, [handleApiError, token])

  const loadUsers = useCallback(async () => {
    if (!token) return
    setUsersLoading(true)
    try {
      const response = await fetchUsers(token)
      setUsersData(response?.data ?? null)
    } catch (error) {
      handleApiError(error)
    } finally {
      setUsersLoading(false)
    }
  }, [handleApiError, token])

  const loadVideos = useCallback(
    async (categoryOverride) => {
      if (!token) return
      const targetCategory = categoryOverride ?? videoCategory
      setVideosLoading(true)
      setVideosError(null)
      try {
        const response = await fetchVideosByCategory(targetCategory, token)
        setVideosData(response?.data ?? null)
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
    }
  }, [activeView, isLoggedIn, loadProfile])

  useEffect(() => {
    if (isLoggedIn && activeView === 'users') {
      loadUsers()
    }
  }, [activeView, isLoggedIn, loadUsers])

  useEffect(() => {
    if (isLoggedIn && activeView === 'videos') {
      loadVideos(videoCategory)
    }
  }, [activeView, isLoggedIn, loadVideos, videoCategory])

  useEffect(() => {
    if (isLoggedIn && activeView === 'questions') {
      loadQuestions()
    }
  }, [activeView, isLoggedIn, loadQuestions])

  useEffect(() => {
    if (resendSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendSeconds])

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
      setProfileComplete(Boolean(response?.data?.profile_complete))
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
    if (isLoggedIn) {
      loadVideos(value)
    }
  }

  const resetUploadForm = () =>
    setUploadForm({
      bodyPart: VIDEO_CATEGORIES[0].value,
      gender: VIDEO_GENDERS[0].value,
      title: '',
      description: '',
      videoFile: null,
      thumbnailFile: null,
    })

  const resetUpdateForm = () =>
    setUpdateForm({
      videoId: '',
      bodyPart: '',
      gender: '',
      title: '',
      description: '',
      videoFile: null,
      thumbnailFile: null,
    })

  const handleUploadVideoAction = async () => {
    if (!uploadForm.title.trim()) {
      setStatus({ type: 'error', text: 'Enter a title for the video.' })
      return
    }
    if (!uploadForm.videoFile || !uploadForm.thumbnailFile) {
      setStatus({ type: 'error', text: 'Attach both video and thumbnail files.' })
      return
    }
    setVideoPending('upload')
    try {
      const formData = new FormData()
      formData.append('body_part', uploadForm.bodyPart)
      formData.append('gender', uploadForm.gender)
      if (uploadForm.title) {
        formData.append('title', uploadForm.title)
      }
      if (uploadForm.description) {
        formData.append('description', uploadForm.description)
      }
      formData.append('video_file', uploadForm.videoFile)
      formData.append('thumbnail_file', uploadForm.thumbnailFile)
      const response = await uploadVideo(formData, token)
      setStatus({ type: 'success', text: response?.message ?? 'Video uploaded successfully.' })
      resetUploadForm()
      loadVideos(videoCategory)
    } catch (error) {
      handleApiError(error)
    } finally {
      setVideoPending('')
    }
  }

  const handleUpdateVideoAction = async () => {
    if (!updateForm.videoId) {
      setStatus({ type: 'error', text: 'Select a video to update.' })
      return
    }
    const formData = new FormData()
    let appendedField = false
    if (updateForm.bodyPart) {
      formData.append('body_part', updateForm.bodyPart)
      appendedField = true
    }
    if (updateForm.gender) {
      formData.append('gender', updateForm.gender)
      appendedField = true
    }
    if (updateForm.title) {
      formData.append('title', updateForm.title)
      appendedField = true
    }
    if (updateForm.description) {
      formData.append('description', updateForm.description)
      appendedField = true
    }
    if (updateForm.videoFile) {
      formData.append('video_file', updateForm.videoFile)
      appendedField = true
    }
    if (updateForm.thumbnailFile) {
      formData.append('thumbnail_file', updateForm.thumbnailFile)
      appendedField = true
    }
    if (!appendedField) {
      setStatus({ type: 'error', text: 'Provide at least one field to update.' })
      return
    }
    setVideoPending('update')
    try {
      const response = await updateVideo(updateForm.videoId, formData, token)
      setStatus({ type: 'success', text: response?.message ?? 'Video updated successfully.' })
      loadVideos(videoCategory)
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
      loadVideos(videoCategory)
    } catch (error) {
      handleApiError(error)
    } finally {
      setVideoPending('')
    }
  }

  const handleSelectVideoForEdit = (video) => {
    setUpdateForm({
      videoId: String(video.id),
      bodyPart: video.body_part ?? '',
      gender: video.gender ?? '',
      title: video.title ?? '',
      description: video.description ?? '',
      videoFile: null,
      thumbnailFile: null,
    })
  }

  const setMeasurementUnitValue = (index, value) => {
    setQuestionForm((prev) => {
      const nextUnits = [...prev.measurementUnits]
      nextUnits[index] = value
      return { ...prev, measurementUnits: nextUnits }
    })
  }

  const addMeasurementUnitField = () =>
    setQuestionForm((prev) => ({
      ...prev,
      measurementUnits: [...prev.measurementUnits, ''],
    }))

  const removeMeasurementUnitField = (index) =>
    setQuestionForm((prev) => {
      const nextUnits = prev.measurementUnits.filter((_, idx) => idx !== index)
      return { ...prev, measurementUnits: nextUnits.length ? nextUnits : [''] }
    })

  const resetQuestionForm = () =>
    setQuestionForm({
      id: '',
      prompt: '',
      answer: '',
      gender: 'All',
      questionType: '',
      measurementUnits: [''],
    })

  const prepareQuestionPayload = () => {
    const resolvedGender = questionForm.gender && questionForm.gender.trim()
    const payload = {
      prompt: questionForm.prompt.trim(),
      answer: questionForm.answer.trim(),
      gender: resolvedGender || 'All',
      question_type: questionForm.questionType || null,
    }
    const requiresUnits =
      questionForm.questionType === 'weight' || questionForm.questionType === 'height'
    const units = questionForm.measurementUnits
      .map((unit) => unit.trim())
      .filter((unit) => unit.length > 0)
    if (requiresUnits) {
      if (units.length === 0) {
        throw new Error('Provide at least one measurement unit for weight/height questions.')
      }
      payload.measurement_units = units
    } else if (units.length > 0) {
      payload.measurement_units = units
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
      prompt: question.prompt ?? '',
      answer: question.answer ?? '',
      gender: question.gender ?? 'All',
      questionType: question.question_type ?? '',
      measurementUnits: question.measurement_units && question.measurement_units.length
        ? question.measurement_units
        : [''],
    })
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
      loadQuestions()
    } catch (error) {
      handleApiError(error)
    } finally {
      setQuestionPending('')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return
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

  const signedEmail = profile?.email ?? trimmedEmail

  return (
    <div className="app-shell">
      {!isLoggedIn ? (
        <AuthView
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
        />
      ) : (
        <section className="workspace">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            signedEmail={signedEmail}
            pendingAction={pendingAction}
            onLogout={handleLogout}
          />
          <div className="content">
            <header className="content-header">
              <div>
                <h1>{viewMeta.title}</h1>
                <p>{viewMeta.description}</p>
              </div>
              <div className="topbar-meta">
                <span className={`profile-pill ${profileComplete ? 'complete' : 'incomplete'}`}>
                  {profileComplete ? 'Profile complete' : 'Profile incomplete'}
                </span>
                {flowHint && <span className="pill neutral">Flow: {flowHint}</span>}
              </div>
            </header>
            <main className="main-content">
              {activeView === 'dashboard' && (
                <DashboardView profile={profile} isLoading={profileLoading} onRefresh={loadProfile} />
              )}
              {activeView === 'users' && (
                <UsersView usersData={usersData} isLoading={usersLoading} onRefresh={loadUsers} />
              )}
              {activeView === 'videos' && (
                <VideosView
                  videosData={videosData}
                  videosLoading={videosLoading}
                  videosError={videosError}
                  videoCategory={videoCategory}
                  uploadForm={uploadForm}
                  updateForm={updateForm}
                  videoPending={videoPending}
                  onCategoryChange={handleVideoCategoryChange}
                  onRefresh={() => loadVideos(videoCategory)}
                  setUploadForm={setUploadForm}
                  setUpdateForm={setUpdateForm}
                  onUploadSubmit={handleUploadVideoAction}
                  onSelectVideoForEdit={handleSelectVideoForEdit}
                  onDeleteVideo={handleDeleteVideo}
                  onUpdateSubmit={handleUpdateVideoAction}
                  onResetUpdateForm={resetUpdateForm}
                />
              )}
              {activeView === 'questions' && (
                <QuestionsView
                  questionsData={questionsData}
                  questionsLoading={questionsLoading}
                  questionsError={questionsError}
                  questionsFilter={questionsFilter}
                  setQuestionsFilter={setQuestionsFilter}
                  questionForm={questionForm}
                  setQuestionForm={setQuestionForm}
                  questionPending={questionPending}
                  onRefresh={loadQuestions}
                  onCreateQuestion={handleCreateQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onEditQuestion={handleEditQuestion}
                  onResetQuestionForm={resetQuestionForm}
                  addMeasurementUnitField={addMeasurementUnitField}
                  removeMeasurementUnitField={removeMeasurementUnitField}
                  setMeasurementUnitValue={setMeasurementUnitValue}
                />
              )}
              {activeView === 'subscription' && <SubscriptionView />}
            </main>
          </div>
        </section>
      )}
      <StatusBanner status={status} />
    </div>
  )
}

export default App
