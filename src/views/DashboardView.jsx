import { buildMediaUrl } from '../utils/media'

function DashboardView({ profile, isLoading, onRefresh }) {
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

  return (
    <div className="panel profile-panel">
      <div className="profile-panel__top">
        <div>
          <p className="eyebrow muted">Dashboard</p>
          <h2>Account overview</h2>
          <p>Account overview and profile information.</p>
        </div>
        <button className="refresh-button" onClick={() => onRefresh?.()} aria-label="Refresh profile">
          ↻
        </button>
      </div>
      <div className="profile-panel__body">
        <div className="profile-identity">
          <div className="profile-avatar">
            {profile.photo ? (
              <img src={photoUrl} alt={fullName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <h3>{fullName}</h3>
            <p>{profile.email}</p>
          </div>
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
      </div>
    </div>
  )
}

export default DashboardView
