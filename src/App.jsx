import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  requestOtp,
  resendOtp,
  verifyOtp,
  logoutSession,
  fetchProfile,
  fetchUsers,
} from './services/api'
import './App.css'

const TOKEN_KEY = 'fitness_admin_access_token'

function App() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [flowHint, setFlowHint] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '')
  const [profile, setProfile] = useState(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [usersData, setUsersData] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [activeView, setActiveView] = useState(token ? 'dashboard' : 'login')
  const [status, setStatus] = useState(null)
  const [pendingAction, setPendingAction] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false)

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

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
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
      setActiveView('dashboard')
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

  const renderProfile = () => {
    if (profileLoading) {
      return (
        <div className="panel">
          <p>Loading profile...</p>
        </div>
      )
    }

    if (!profile) {
      return (
        <div className="panel">
          <p>No profile details available yet.</p>
        </div>
      )
    }

    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—'
    const infoRows = [
      { label: 'Name', value: fullName },
      { label: 'Email', value: profile.email },
      { label: 'Phone', value: profile.phone ?? '—' },
      { label: 'DOB', value: profile.dob ?? '—' },
      { label: 'Gender', value: profile.gender ?? '—' },
      { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive' },
    ]

    return (
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Dashboard</h2>
            <p>Account overview and profile information.</p>
          </div>
          <button className="link-button" onClick={loadProfile}>
            Refresh
          </button>
        </div>
        <div className="profile-card">
          {infoRows.map((row) => (
            <div key={row.label} className="profile-row">
              <span className="label">{row.label}</span>
              <span>{row.value ?? '—'}</span>
            </div>
          ))}
          {profile.photo ? (
            <div className="profile-row">
              <span className="label">Photo</span>
              <a href={profile.photo} target="_blank" rel="noreferrer" className="link-button">
                View photo
              </a>
            </div>
          ) : (
            <div className="profile-row">
              <span className="label">Photo</span>
              <span>Not uploaded</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderUsers = () => {
    if (usersLoading) {
      return (
        <div className="panel">
          <p>Loading users...</p>
        </div>
      )
    }

    if (!usersData) {
      return (
        <div className="panel">
          <p>Loading user list...</p>
        </div>
      )
    }

    const list = usersData.users ?? []

    return (
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>All Users</h2>
            <p>Showing {usersData.count ?? list.length} total accounts.</p>
          </div>
          <button className="link-button" onClick={loadUsers}>
            Refresh
          </button>
        </div>
        {list.length === 0 ? (
          <p>No users available.</p>
        ) : (
          <div className="users-list">
            {list.map((user, index) => {
              const fullName =
                [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—'
              return (
                <article className="user-card" key={user.id}>
                  <header className="user-card__header">
                    <div>
                      <span className="user-card__id">#{index + 1}</span>
                      <p className="user-card__name">{fullName}</p>
                    </div>
                    <span className={`pill ${user.is_active ? 'success' : 'danger'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </header>
                  <div className="user-card__grid">
                    <div className="user-field">
                      <span className="label">Email</span>
                      <span>{user.email ?? '—'}</span>
                    </div>
                    <div className="user-field">
                      <span className="label">Phone</span>
                      <span>{user.phone ?? '—'}</span>
                    </div>
                    <div className="user-field">
                      <span className="label">DOB</span>
                      <span>{user.dob ?? '—'}</span>
                    </div>
                    <div className="user-field">
                      <span className="label">Gender</span>
                      <span>{user.gender ?? '—'}</span>
                    </div>
                    <div className="user-field">
                      <span className="label">Photo</span>
                      {user.photo ? (
                        <a className="link-button" href={user.photo} target="_blank" rel="noreferrer">
                          View photo
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
      {!isLoggedIn ? (
        <section className="auth-board">
          <div className="auth-board__left">
            <div className="auth-brand">
              <div className="brand-icon">FC</div>
              <p>Fitness Cassie Admin</p>
            </div>
            <div className="auth-copy">
              <h1>Secure OTP access</h1>
              <p>Trigger OTP logins, verify sessions, and monitor profile completion in one place.</p>
            </div>
          </div>
          <div className="auth-board__form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <div className="button-row">
              <button
                onClick={handleRequestOtp}
                disabled={!trimmedEmail || pendingAction === 'request'}
              >
                {pendingAction === 'request' ? 'Sending...' : 'Send OTP'}
              </button>
              <button
                className="secondary"
                onClick={handleResendOtp}
                disabled={
                  !hasRequestedOtp ||
                  resendSeconds > 0 ||
                  pendingAction === 'resend' ||
                  !trimmedEmail
                }
              >
                {resendSeconds > 0
                  ? `Resend OTP in ${String(Math.floor(resendSeconds / 60)).padStart(2, '0')}:${String(resendSeconds % 60).padStart(2, '0')}`
                  : 'Resend OTP'}
              </button>
            </div>
            <label className="field">
              <span>One-Time Password</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(event) => handleOtpChange(event.target.value)}
                maxLength={6}
              />
            </label>
            <button
              className="primary"
              onClick={handleVerifyOtp}
              disabled={!trimmedEmail || otp.length < 6 || pendingAction === 'verify'}
            >
              {pendingAction === 'verify' ? 'Verifying...' : 'Verify & Login'}
            </button>
            {flowHint && (
              <p className="hint">
                Flow detected: <span className="pill neutral">{flowHint}</span>
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="workspace">
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="brand-icon">FC</div>
              <div>
                <p className="brand-title">Fitness Cassie</p>
                <span>Admin Suite</span>
              </div>
            </div>
            <nav className="sidebar-nav">
              <button
                className={activeView === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveView('dashboard')}
              >
                <span className="nav-icon">🏠</span>
                <span>Dashboard</span>
              </button>
              <button
                className={activeView === 'users' ? 'active' : ''}
                onClick={() => setActiveView('users')}
              >
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </button>
              <button
                className={activeView === 'videos' ? 'active' : ''}
                onClick={() => setActiveView('videos')}
              >
                <span className="nav-icon">🎬</span>
                <span>Videos</span>
              </button>
              <button
                className={activeView === 'questions' ? 'active' : ''}
                onClick={() => setActiveView('questions')}
              >
                <span className="nav-icon">❓</span>
                <span>Questions</span>
              </button>
              <button
                className={activeView === 'subscription' ? 'active' : ''}
                onClick={() => setActiveView('subscription')}
              >
                <span className="nav-icon">💳</span>
                <span>Subscription</span>
              </button>
            </nav>
            <div className="sidebar-section">
              <p className="sidebar-label">Signed in as</p>
              <p className="sidebar-email">{profile?.email ?? trimmedEmail}</p>
            </div>
            <div className="sidebar-footer">
              <button
                className="secondary"
                onClick={handleLogout}
                disabled={pendingAction === 'logout'}
              >
                {pendingAction === 'logout' ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </aside>
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
                {flowHint && (
                  <span className="pill neutral">Flow: {flowHint}</span>
                )}
              </div>
            </header>
            <main className="main-content">
              {activeView === 'dashboard' && renderProfile()}
              {activeView === 'users' && renderUsers()}
              {activeView === 'videos' && (
                <div className="panel placeholder-panel">
                  <h3>Videos</h3>
                  <p>Video management will appear here soon.</p>
                </div>
              )}
              {activeView === 'questions' && (
                <div className="panel placeholder-panel">
                  <h3>Questions</h3>
                  <p>Member questions will be surfaced here.</p>
                </div>
              )}
              {activeView === 'subscription' && (
                <div className="panel placeholder-panel">
                  <h3>Subscription</h3>
                  <p>Subscription metrics will show up in this section.</p>
                </div>
              )}
            </main>
          </div>
        </section>
      )}

      {status?.text && (
        <div className={`status-banner ${status.type}`}>
          <p>{status.text}</p>
        </div>
      )}
    </div>
  )
}

export default App
