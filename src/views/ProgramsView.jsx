import Swal from 'sweetalert2'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

const formatDurationLabel = (days) => {
  const numeric = Number(days)
  if (!Number.isFinite(numeric) || numeric <= 0) return '—'
  if (numeric === 1) return '1 day'
  if (numeric % 30 === 0) {
    const months = numeric / 30
    return `${months} month${months > 1 ? 's' : ''} (${numeric} days)`
  }
  return `${numeric} days`
}

const formatScheduleLabel = (program) => {
  const workouts = Number(program?.workouts_per_week ?? program?.workoutsPerWeek ?? 0)
  const rest = Number(program?.rest_days_per_week ?? program?.restDaysPerWeek ?? 0)
  if (!Number.isFinite(workouts) && !Number.isFinite(rest)) return 'Schedule not set'
  const workoutsLabel = Number.isFinite(workouts) && workouts > 0 ? `${workouts} workouts` : null
  const restLabel = Number.isFinite(rest) && rest > 0 ? `${rest} rest days` : null
  if (workoutsLabel && restLabel) return `${workoutsLabel} · ${restLabel} / week`
  return workoutsLabel ?? restLabel ?? 'Schedule not set'
}

const getAccessBadge = (program) => {
  const access = (program?.access_level ?? program?.accessLevel ?? 'free').toLowerCase()
  return access === 'paid' ? 'Premium' : 'Free'
}

const isPaidProgram = (program) => {
  const access = (program?.access_level ?? program?.accessLevel ?? 'free').toLowerCase()
  return access === 'paid'
}

const formatPriceLabel = (program) => {
  const raw = program?.price_usd ?? program?.priceUsd
  const value = typeof raw === 'string' ? Number(raw) : raw
  if (!Number.isFinite(value) || value <= 0) return '—'
  return `$${value.toFixed(2)}`
}

const isProgramActive = (program) => {
  const explicit = program?.is_active
  if (typeof explicit === 'boolean') return explicit
  return program?.isActive ?? true
}

function ProgramsView({
  programs,
  isLoading,
  error,
  onAddProgram,
  onEditProgram,
  onDeleteProgram,
  onToggleProgramActive,
  onManageSchedule,
  pendingAction,
}) {
  const list = Array.isArray(programs) ? programs : []
  const sortedPrograms = [...list].sort((a, b) => {
    const activeA = isProgramActive(a)
    const activeB = isProgramActive(b)
    if (activeA !== activeB) {
      return activeA ? -1 : 1
    }
    const featuredA = a?.is_featured ?? a?.isFeatured ?? false
    const featuredB = b?.is_featured ?? b?.isFeatured ?? false
    if (featuredA === featuredB) {
      return (a?.duration_days ?? 0) - (b?.duration_days ?? 0)
    }
    return featuredA ? -1 : 1
  })

  const handleDeleteProgram = (program) => {
    if (!program?.id && !program?.slug) return
    Swal.fire({
      title: `Delete ${program.title || 'this program'}?`,
      text: 'Members will no longer see this program in the app.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete program',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteProgram(program)
      }
    })
  }

  return (
    <div className="subscription-view">
      <div className="subscription-controls">
        <div className="subscription-actions">
          <button className="primary slim theme-button" onClick={onAddProgram}>
            Add program
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isLoading ? (
        <div className="loading-panel">Loading programs…</div>
      ) : sortedPrograms.length === 0 ? (
        <div className="empty-panel">
          <h3>No plans added</h3>
          <p>Add a plan to make it available for members in the app.</p>
          <button className="primary theme-button" onClick={onAddProgram}>
            Create program
          </button>
        </div>
      ) : (
        <div className="plan-grid">
          {sortedPrograms.map((program) => {
            const active = isProgramActive(program)
            const identifier = program.id ?? program.slug
            const pendingDelete = pendingAction === `delete-${identifier}`
            const pendingToggle = pendingAction === `toggle-${identifier}`
            return (
              <article
                key={identifier}
                className={`plan-card ${active ? 'plan-card--active' : 'plan-card--inactive'}`}
              >
                <div className="plan-card__header">
                  <div>
                    <p className="eyebrow">{getAccessBadge(program)}</p>
                    <h3>{program.title}</h3>
                  </div>
                  {program.subtitle ? <p className="plan-card__subtitle">{program.subtitle}</p> : null}
                </div>
                <div className="plan-card__meta">
                  <div>
                    <span>Number of days</span>
                    <strong>{formatDurationLabel(program.duration_days)}</strong>
                  </div>
                  <div>
                    <span>Access type</span>
                    <strong>{getAccessBadge(program)}</strong>
                  </div>
                  {isPaidProgram(program) ? (
                    <div>
                      <span>Price</span>
                      <strong>{formatPriceLabel(program)}</strong>
                    </div>
                  ) : null}
                  <div>
                    <span>Visibility</span>
                    <strong>{active ? 'Active' : 'Hidden'}</strong>
                  </div>
                </div>
                <div className="plan-card__actions">
                  <div className="plan-card__buttons">
                  <button
                    type="button"
                    className="plan-action"
                    onClick={() => onManageSchedule?.(program)}
                    title="Manage schedule"
                  >
                    <img src={editIcon} alt="Manage schedule" />
                    <span>Schedule</span>
                  </button>
                  <button
                    type="button"
                    className="plan-action"
                    onClick={() => onEditProgram(program)}
                    title="Edit program"
                  >
                    <img src={editIcon} alt="Edit program" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="plan-action danger"
                    onClick={() => handleDeleteProgram(program)}
                    disabled={pendingDelete}
                    title="Delete program"
                  >
                    <img src={deleteIcon} alt="Delete program" />
                    <span>{pendingDelete ? 'Deleting…' : 'Delete'}</span>
                  </button>
                  </div>
                  <label
                    className={`plan-toggle-control ${!active ? 'plan-toggle-control--inactive' : ''}`}
                    aria-live="polite"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={pendingToggle}
                      onChange={() => onToggleProgramActive?.(program)}
                    />
                    <span>{pendingToggle ? 'Saving…' : active ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProgramsView
