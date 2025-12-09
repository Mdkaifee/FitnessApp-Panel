import { buildMediaUrl } from '../utils/media'

function UsersView({
  usersData,
  isLoading,
  onRefresh,
  onNextPage,
  hasNext,
  page,
  onToggleStatus,
  statusPending,
  onViewAnalytics,
  onUserNameClick,
  onPrevPage,
}) {
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
    <div className="panel users-table-panel">
      <div className="panel-header">
        <div>
          <h2>All Users</h2>
          <p>Showing {usersData?.total ?? list.length} total accounts.</p>
        </div>
        <button className="refresh-button" onClick={onRefresh} aria-label="Refresh users list">
          ↻
        </button>
      </div>
      {list.length === 0 ? (
        <p>No users available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Photo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((user, index) => {
                const fullName =
                  [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || '—'
                const isActionDisabled = statusPending === String(user.id) || isLoading
                return (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      {onUserNameClick ? (
                        <button
                          type="button"
                          className="user-name-button"
                          onClick={() => onUserNameClick(user)}
                        >
                          {fullName}
                        </button>
                      ) : (
                        fullName
                      )}
                    </td>
                    <td>
                      {user.email ? (
                        <button
                          type="button"
                          className="user-email-button"
                          onClick={() => onViewAnalytics?.(user)}
                        >
                          {user.email}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{user.phone ?? '—'}</td>
                    <td>{user.dob ?? '—'}</td>
                    <td>{user.gender ?? '—'}</td>
                    <td>
                      <span className={`pill ${user.is_active ? 'success' : 'danger'}`}>
                      <span className="status-dot"></span>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
  {user.photo ? (
    <img
      src={buildMediaUrl(user.photo)}
      className="user-avatar"
      alt="User"
    />
  ) : (
    '—'
  )}
</td>

                    <td>
                      <button
                        type="button"
                        className="link-button"
                        disabled={isActionDisabled}
                        onClick={() => onToggleStatus?.(user.id, !user.is_active)}
                      >
                        {isActionDisabled
                          ? 'Updating…'
                          : user.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="table-footer">
            <div>
              Page {usersData?.page ?? page} · Showing {usersData?.count ?? list.length} of{' '}
              {usersData?.total ?? '—'}
            </div>
            <div className="table-footer__actions">
              <button
                className="link-button"
                disabled={isLoading || (usersData?.page ?? page) <= 1}
                onClick={onPrevPage}
              >
                Previous
              </button>
              <button className="link-button" disabled={!hasNext || isLoading} onClick={onNextPage}>
                {isLoading ? 'Loading…' : hasNext ? 'Next page' : 'No more results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersView
