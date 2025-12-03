import { buildMediaUrl } from '../utils/media'

function UsersView({ usersData, isLoading, onRefresh }) {
  if (isLoading) {
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
        <button className="link-button" onClick={onRefresh}>
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
                      <a
                        className="link-button"
                        href={buildMediaUrl(user.photo)}
                        target="_blank"
                        rel="noreferrer"
                      >
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

export default UsersView
