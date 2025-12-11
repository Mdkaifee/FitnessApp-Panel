import { useState } from 'react'
import { buildMediaUrl } from '../utils/media'
import Modal from '../components/shared/Modal'
import CategoryBarChart from '../components/charts/CategoryBarChart'
import UserActivityDoughnut from '../components/charts/UserActivityDoughnut'
import VideoGenderChart from '../components/charts/VideoGenderChart'
import CategoryGenderChart from '../components/charts/CategoryGenderChart'

const labelForGender = (input) => {
  if (!input) return 'Unspecified'
  const normalized = String(input).toLowerCase()
  switch (normalized) {
    case 'm':
    case 'male':
      return 'Male'
    case 'f':
    case 'female':
      return 'Female'
    case 'both':
    case 'all':
      return 'All'
    case 'other':
      return 'Other'
    default:
      return input.charAt(0).toUpperCase() + input.slice(1)
  }
}

const normalizeCategoryEntries = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        const label = item?.label ?? item?.category ?? item?.name
        const value = Number(item?.value ?? item?.count ?? item?.total ?? 0)
        if (!label) return null
        return { label, value: Number.isFinite(value) ? value : 0 }
      })
      .filter(Boolean)
  }
  return Object.entries(raw).map(([label, value]) => ({
    label,
    value: Number.isFinite(Number(value)) ? Number(value) : 0,
  }))
}

const normalizeGenderEntries = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        const label = entry?.label ?? entry?.gender ?? entry?.name
        const value = Number(entry?.value ?? entry?.count ?? entry?.total ?? 0)
        if (!label) return null
        return { label: labelForGender(label), value: Number.isFinite(value) ? value : 0 }
      })
      .filter(Boolean)
  }
  return Object.entries(raw).map(([gender, value]) => ({
    label: labelForGender(gender),
    value: Number.isFinite(Number(value)) ? Number(value) : 0,
  }))
}

const normalizeCategoryGenderEntries = (raw) => {
  if (!raw) return []
  const payload = Array.isArray(raw)
    ? raw
    : Object.entries(raw).map(([category, entries]) => ({
        category,
        entries,
      }))
  const normalized = []
  payload.forEach((entry) => {
    if (entry?.entries && Array.isArray(entry.entries)) {
      entry.entries.forEach((inner) => {
        const category = inner?.category ?? entry.category ?? entry.label
        const gender = inner?.gender ?? inner?.label ?? 'Unspecified'
        const value = Number(inner?.count ?? inner?.value ?? inner?.total ?? 0)
        if (!category) return
        normalized.push({
          category,
          gender: labelForGender(gender),
          value: Number.isFinite(value) ? value : 0,
        })
      })
      return
    }
    const category = entry?.category ?? entry?.label ?? entry?.name
    const gender = entry?.gender ?? entry?.key ?? 'Unspecified'
    const value = Number(entry?.count ?? entry?.value ?? entry?.total ?? 0)
    if (!category) return
    normalized.push({
      category,
      gender: labelForGender(gender),
      value: Number.isFinite(value) ? value : 0,
    })
  })
  return normalized
}

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString()
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return parsed
  }
  return fallback
}

function DashboardView({
  profile,
  isLoading,
  onRefresh,
  stats,
  statsLoading,
  statsError,
  onRefreshStats,
}) {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false)
  if (isLoading) {
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

  const rawName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
  const fullName = rawName || '—'
  const initials =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .map((name) => name[0]?.toUpperCase())
      .join('') ||
    profile.email?.[0]?.toUpperCase() ||
    'U'
  const photoUrl = buildMediaUrl(profile.photo)
  const infoRows = [
    { label: 'Name', value: fullName },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone ?? '—' },
    { label: 'DOB', value: profile.dob ?? '—' },
    { label: 'Gender', value: profile.gender ?? '—' },
    { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive' },
  ]

  const userStats = stats?.users ?? stats?.user ?? stats ?? {}
  const fallbackAdminCount = profile?.is_admin ? 1 : 0
  const fallbackActiveAdminCount = profile?.is_admin && profile?.is_active ? 1 : 0
  const fallbackInactiveAdminCount =
    profile?.is_admin && profile?.is_active === false ? 1 : 0
  const rawTotalUsers =
    userStats.total ?? userStats.total_users ?? userStats.count ?? stats?.total_users ?? 0
  const rawNonAdminTotal =
    userStats.non_admin ??
    userStats.non_admin_total ??
    userStats.members ??
    userStats.member_count ??
    userStats.users_without_admin ??
    stats?.non_admin_users ??
    null
  const adminUsers =
    userStats.admin ??
    userStats.admins ??
    userStats.admin_count ??
    userStats.admin_users ??
    stats?.admin_users ??
    stats?.total_admins ??
    fallbackAdminCount
  const totalUsers =
    rawNonAdminTotal != null
      ? Math.max(toNumber(rawNonAdminTotal), 0)
      : Math.max(toNumber(rawTotalUsers) - toNumber(adminUsers), 0)
  const rawActiveUsers =
    userStats.active ??
    userStats.active_users ??
    userStats.active_count ??
    stats?.active_users ??
    0
  const rawActiveNonAdmin =
    userStats.active_non_admin ??
    userStats.non_admin_active ??
    userStats.active_members ??
    userStats.member_active ??
    stats?.active_non_admin_users ??
    null
  const adminActiveUsers =
    userStats.admin_active ??
    userStats.active_admin ??
    userStats.admin_active_users ??
    stats?.admin_active_users ??
    fallbackActiveAdminCount
  const activeUsers =
    rawActiveNonAdmin != null
      ? Math.max(toNumber(rawActiveNonAdmin), 0)
      : Math.max(toNumber(rawActiveUsers) - toNumber(adminActiveUsers), 0)
  const rawInactiveUsers =
    userStats.inactive ??
    userStats.inactive_users ??
    userStats.inactive_count ??
    stats?.inactive_users ??
    null
  const rawInactiveNonAdmin =
    userStats.inactive_non_admin ??
    userStats.non_admin_inactive ??
    userStats.inactive_members ??
    stats?.inactive_non_admin_users ??
    null
  const adminInactiveUsers =
    userStats.admin_inactive ??
    userStats.inactive_admin ??
    userStats.admin_inactive_users ??
    stats?.admin_inactive_users ??
    fallbackInactiveAdminCount
  const inactiveUsers =
    rawInactiveNonAdmin != null
      ? Math.max(toNumber(rawInactiveNonAdmin), 0)
      : rawInactiveUsers != null
        ? Math.max(toNumber(rawInactiveUsers) - toNumber(adminInactiveUsers), 0)
        : totalUsers && activeUsers
          ? Math.max(totalUsers - activeUsers, 0)
          : 0
  const videosStats = stats?.videos ?? stats ?? {}
  const totalVideos =
    videosStats.total ??
    videosStats.total_videos ??
    videosStats.count ??
    stats?.total_videos ??
    stats?.videos_total ??
    0
  const videosAvailable =
    videosStats.available ?? videosStats.available_videos ?? stats?.videos_available ?? totalVideos
  const categoryEntries = normalizeCategoryEntries(
    videosStats.by_category ?? videosStats.categories ?? stats?.videos_by_category,
  )
  const sortedCategories = [...categoryEntries].sort((a, b) => b.value - a.value)
  const genderEntries = normalizeGenderEntries(
    videosStats.by_gender ?? stats?.videos_by_gender ?? stats?.gender ?? null,
  ).filter((entry) => entry.value > 0)
  const categoryGenderEntries = normalizeCategoryGenderEntries(
    videosStats.by_category_gender ?? stats?.videos_by_category_gender ?? null,
  ).filter((entry) => entry.value > 0)
  const userActivePercent = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  const userInactivePercent = totalUsers > 0 ? 100 - userActivePercent : 0
  const statsReady =
    Boolean(stats) &&
    (sortedCategories.length > 0 ||
      totalUsers ||
      totalVideos ||
      genderEntries.length ||
      categoryGenderEntries.length)

  const summaryCards = [
    {
      label: 'Total users',
      value: totalUsers,
      accent: 'accent-indigo',
      iconSrc: '/1.png',
    },
    {
      label: 'Active users',
      value: activeUsers,
      accent: 'accent-green',
      iconSrc: '/2.png',
    },
    {
      label: 'Inactive users',
      value: inactiveUsers,
      accent: 'accent-orange',
      iconSrc: '/3.png',
    },
    {
      label: 'Videos available',
      value: videosAvailable,
      accent: 'accent-purple',
      iconSrc: '/4.png',
    },
  ]

  return (
    <div className="dashboard-panels">
      <div className="dashboard-page-header">
        <div className="dashboard-page-copy">
          <h1>Profile Overview</h1>
          <p>Review current account status and personal details.</p>
        </div>
        <div className="dashboard-page-greeting">
          <div className="dashboard-page-greeting-text">
            <p className="welcome-line">
              Welcome back, <strong>{fullName}</strong>
            </p>
            <span className="greeting-role">Admin Suite</span>
          </div>
          <button
            type="button"
            className="profile-avatar-button mini"
            onClick={() => setProfileModalOpen(true)}
            aria-label="View profile details"
          >
            {profile.photo ? <img src={photoUrl} alt={fullName} /> : <span>{initials}</span>}
          </button>
        </div>
      </div>
      <div className="dashboard-stats-panel">
        <div className="dashboard-summary-head summary-actions-only">
          <div className="dashboard-summary-actions">
            {/* <button
              className="dashboard-refresh"
              onClick={() => onRefreshStats?.()}
              aria-label="Refresh dashboard stats"
              disabled={statsLoading}
            >
              {statsLoading ? '…' : '↻'}
            </button> */}
          </div>
        </div>
        <div className="summary-card-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className={`summary-card ${card.accent}`}>
              <div className="summary-card-icon">
                {card.iconSrc ? <img src={card.iconSrc} alt="" /> : null}
              </div>
              <div className="summary-card-body">
                <strong>{formatNumber(card.value)}</strong>
                <span className="summary-card-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
        {statsError && <p className="error-text">{statsError}</p>}
        {statsLoading && !statsReady && <p>Loading stats…</p>}
        {!statsLoading && !statsReady && !statsError && (
          <p>No dashboard metrics available yet.</p>
        )}
        {statsReady && (
          <div className="stats-chart-grid">
            <div className="chart-card">
              <header className="chart-card-head">
                <div>
                  <p className="chart-title">Video by category</p>
                </div>
                <span className="chart-total">({formatNumber(totalVideos)} Total)</span>
              </header>
                {sortedCategories.length === 0 ? (
                  <p className="chart-empty">No category breakdown available.</p>
                ) : (
                  <div className="chart-wrapper">
                    <CategoryBarChart categories={sortedCategories} />
                  </div>
                )}
              </div>
            <div className="chart-card">
              <header className="chart-card-head">
                <div>
                  <p className="chart-title">User activity</p>
                </div>
                <span className="chart-total">({formatNumber(totalUsers)} Members)</span>
              </header>
                {totalUsers === 0 ? (
                  <p className="chart-empty">No user data yet.</p>
                ) : (
                  <div className="user-activity-chart">
                    <div className="chart-wrapper doughnut-wrapper">
                      <UserActivityDoughnut active={activeUsers} inactive={inactiveUsers} />
                      <div className="doughnut-center">
                        <strong>{userActivePercent}%</strong>
                        <span>Active</span>
                      </div>
                    </div>
                    <div className="user-activity-legend">
                      <span>
                        <span className="legend-dot is-active" /> Active · {formatNumber(activeUsers)}
                      </span>
                      <span>
                        <span className="legend-dot is-inactive" /> Inactive · {formatNumber(inactiveUsers)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            {/* <div className="chart-card">
              <header className="chart-card-head">
                <div>
                  <p className="chart-title">Video by gender</p>
                </div>
                <span className="chart-total">({formatNumber(totalVideos)} Total)</span>
              </header>
              <div className="chart-wrapper doughnut-wrapper">
                <VideoGenderChart entries={genderEntries} />
              </div>
            </div> */}
            <div className="chart-card">
              <header className="chart-card-head">
                <div>
                  <p className="chart-title">Category × gender</p>
                </div>
                <span className="chart-total">({formatNumber(totalVideos)} Total)</span>
              </header>
              {categoryGenderEntries.length === 0 ? (
                <p className="chart-empty">No category and gender data available.</p>
              ) : (
                <div className="chart-wrapper tall-chart">
                  <CategoryGenderChart entries={categoryGenderEntries} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Modal
        open={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Account overview"
      >
        <div className="profile-modal-header">
          <div>
            <h3>{fullName}</h3>
            <p>{profile.email}</p>
          </div>
          {/* <button className="ghost-button" onClick={() => onRefresh?.()} aria-label="Refresh profile">
            Refresh
          </button> */}
        </div>
        <div className="profile-info-grid">
          {infoRows.map((row) => (
            <div key={row.label} className="profile-info-card">
              <span className="label">{row.label}</span>
              <span>{row.value ?? '—'}</span>
            </div>
          ))}
          <div className="profile-info-card">
            <span className="label">Photo</span>
            {profile.photo ? (
              <a href={photoUrl} target="_blank" rel="noreferrer" className="link-button">
                View photo
              </a>
            ) : (
              <span>Not uploaded</span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DashboardView
