import { buildMediaUrl } from '../utils/media'

function UsersView({
  usersData,
  isLoading,
  onRefresh,
  onNextPage,
  hasNext,
  page,
  onToggleStatus,
  onToggleFlag,
  statusPending,
  flagsPending,
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
  const headerColumns = [
    { label: '#', align: 'left' },
    { label: 'Name', align: 'left' },
    { label: 'Email', align: 'left' },
    { label: 'Phone', align: 'left' },
    { label: 'DOB', align: 'left' },
    { label: 'Gender', align: 'left' },
    { label: 'Pilates Board', align: 'center' },
    { label: 'Ankle/Wrist', align: 'center' },
    { label: 'Purchased Plan', align: 'center' },
    { label: 'Status', align: 'center' },
    { label: 'Photo', align: 'center' },
    { label: 'Actions', align: 'right' },
  ]

  return (
    <div className="panel users-table-panel">
      <div className="panel-header">
        <div>
          <h2>All Users</h2>
          <p>Showing {usersData?.total ?? list.length} total accounts.</p>
        </div>
        {/* <button className="refresh-button" onClick={onRefresh} aria-label="Refresh users list">
          ↻
        </button> */}
      </div>
      {list.length === 0 ? (
        <p>No users available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {headerColumns.map((column) => (
                <th key={column.label} className={`align-${column.align}`}>
                  {column.label}
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((user, index) => {
                const fullName =
                  [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || '—'
                const isActionDisabled = statusPending === String(user.id) || isLoading
                const isFlagDisabled = Boolean(flagsPending?.[user.id]) || isLoading
                return (
                  <tr key={user.id}>
                    <td className="align-left">{index + 1}</td>
                    <td className="align-left">
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
                    <td className="align-left">
                      {user.email ? (
                        <button
                          type="button"
                          className="user-email-button"
                          // onClick={() => onViewAnalytics?.(user)}
                        >
                          {user.email}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="align-left">{user.phone ?? '—'}</td>
                    <td className="align-left">{user.dob ?? '—'}</td>
                    <td className="align-left">{user.gender ?? '—'}</td>
                    <td className="align-center">
                      <input
                        type="checkbox"
                        className="user-flag-toggle"
                        checked={Boolean(user.has_pilates_board)}
                        disabled={isFlagDisabled}
                        onChange={() =>
                          onToggleFlag?.(user.id, {
                            has_pilates_board: !user.has_pilates_board,
                          })
                        }
                        aria-label="Pilates board purchased"
                      />
                    </td>
                    <td className="align-center">
                      <input
                        type="checkbox"
                        className="user-flag-toggle"
                        checked={Boolean(user.has_ankle_wrist_weights)}
                        disabled={isFlagDisabled || !user.has_pilates_board}
                        onChange={() =>
                          onToggleFlag?.(user.id, {
                            has_ankle_wrist_weights: !user.has_ankle_wrist_weights,
                          })
                        }
                        aria-label="Ankle wrist weights purchased"
                      />
                    </td>
                    <td className="align-center">
                      <input
                        type="checkbox"
                        className="user-flag-toggle"
                        checked={Boolean(user.purchased_plan)}
                        disabled={isFlagDisabled}
                        onChange={() =>
                          onToggleFlag?.(user.id, {
                            purchased_plan: !user.purchased_plan,
                          })
                        }
                        aria-label="Premium plan purchased"
                      />
                    </td>
                    <td className="align-center">
                      <span className={`pill ${user.is_active ? 'success' : 'danger'}`}>
                      <span className="status-dot"></span>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-center">
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

                    <td className="align-right">
                      <button
                        type="button"
                        className={`link-button${user.is_active ? ' link-button--ghost' : ''}`}
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
