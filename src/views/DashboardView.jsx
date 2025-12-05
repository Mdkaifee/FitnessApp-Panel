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
  const totalUsers =
    userStats.total ?? userStats.total_users ?? userStats.count ?? stats?.total_users ?? 0
  const activeUsers =
    userStats.active ?? userStats.active_users ?? userStats.active_count ?? stats?.active_users ?? 0
  const inactiveUsers =
    userStats.inactive ??
    userStats.inactive_users ??
    userStats.inactive_count ??
    stats?.inactive_users ??
    (totalUsers && activeUsers ? Math.max(totalUsers - activeUsers, 0) : 0)
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

  return (
    <div className="dashboard-panels">
      <div className="dashboard-avatar-launcher">
        <button
          type="button"
          className="profile-avatar-button fab"
          onClick={() => setProfileModalOpen(true)}
          aria-label="View profile details"
        >
          {profile.photo ? <img src={photoUrl} alt={fullName} /> : <span>{initials}</span>}
        </button>
      </div>
      <div className="panel dashboard-stats-panel">
        <div className="dashboard-stats-header">
          <div>
            <p className="eyebrow muted">Workspace insights</p>
            <h2>Content & member snapshot</h2>
            <p>Video availability and user activity at a glance.</p>
          </div>
          <button
            className="refresh-button"
            onClick={() => onRefreshStats?.()}
            aria-label="Refresh dashboard stats"
            disabled={statsLoading}
          >
            {statsLoading ? '…' : '↻'}
          </button>
        </div>
        {statsError && <p className="error-text">{statsError}</p>}
        {statsLoading && !statsReady && <p>Loading stats…</p>}
        {!statsLoading && !statsReady && !statsError && (
          <p>No dashboard metrics available yet.</p>
        )}
        {statsReady && (
          <>
            <div className="stats-card-grid">
              <div className="stat-card">
                <span className="label">Total users</span>
                <strong>{formatNumber(totalUsers)}</strong>
              </div>
              <div className="stat-card">
                <span className="label">Active users</span>
                <strong>{formatNumber(activeUsers)}</strong>
                <span className="stat-subtext">{userActivePercent}% active</span>
              </div>
              <div className="stat-card">
                <span className="label">Inactive users</span>
                <strong>{formatNumber(inactiveUsers)}</strong>
                <span className="stat-subtext">{userInactivePercent}% inactive</span>
              </div>
              <div className="stat-card">
                <span className="label">Videos available</span>
                <strong>{formatNumber(videosAvailable)}</strong>
                {totalVideos > 0 && (
                  <span className="stat-subtext">
                    {formatNumber(totalVideos)} total ·{' '}
                    {Math.round((videosAvailable / totalVideos) * 100) || 0}% ready
                  </span>
                )}
              </div>
            </div>
            <div className="stats-chart-grid">
              <div className="chart-card">
                <header>
                  <h4>Videos by category</h4>
                  <span className="chart-total">{formatNumber(totalVideos)} total</span>
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
                <header>
                  <h4>User activity</h4>
                  <span className="chart-total">{formatNumber(totalUsers)} members</span>
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
              <div className="chart-card">
                <header>
                  <h4>Videos by gender</h4>
                  <span className="chart-total">{formatNumber(totalVideos)} total</span>
                </header>
                <div className="chart-wrapper doughnut-wrapper">
                  <VideoGenderChart entries={genderEntries} />
                </div>
              </div>
              <div className="chart-card">
                <header>
                  <h4>Category × gender</h4>
                  <span className="chart-total">{formatNumber(totalVideos)} total</span>
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
          </>
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
          <button className="ghost-button" onClick={() => onRefresh?.()} aria-label="Refresh profile">
            Refresh
          </button>
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
