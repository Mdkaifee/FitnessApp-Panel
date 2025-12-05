import Modal from '../shared/Modal'

const METRIC_FIELDS = [
  {
    key: 'water',
    fallbackKey: 'water_ml',
    label: 'Water (L)',
    precision: 1,
    transform: (value, sourceKey) => {
      if (value == null) return value
      if (sourceKey === 'water_ml' && typeof value === 'number') {
        return value / 1000
      }
      return value
    },
  },
  { key: 'steps', label: 'Steps' },
  { key: 'calories', label: 'Calories' },
  { key: 'fat', label: 'Fat (g)', precision: 1 },
  { key: 'protein', label: 'Protein (g)', precision: 1 },
  { key: 'carbs', fallbackKey: 'curbs', label: 'Carbs (g)', precision: 1 },
]

const formatMetricValue = (value, precision) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (Number.isFinite(numericValue)) {
    if (typeof precision === 'number') {
      return numericValue.toFixed(precision)
    }
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1)
  }
  return String(value)
}

const formatDateLabel = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const isTodayDate = (value) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  const today = new Date()
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  )
}

const getUserName = (user) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || user?.email || user?.phone || ''

const resolveMetricValue = (entry, field) => {
  if (!entry || !field) return { value: undefined, sourceKey: null }
  const keys = [field.key, field.fallbackKey].filter(Boolean)
  for (const key of keys) {
    const value = entry?.[key]
    if (value !== undefined && value !== null) {
      return { value, sourceKey: key }
    }
  }
  return { value: undefined, sourceKey: null }
}

function UserAnalyticsModal({
  open,
  onClose,
  user,
  data,
  isLoading,
  error,
  onRefresh,
}) {
  const entries = data?.entries ?? []
  const rangeLabel =
    data?.rangeLabel ?? (typeof data?.range === 'string' ? data?.range : null) ?? 'last 7 days'
  const userName = getUserName(user)
  const modalTitle = userName ? `${userName} Analytics` : 'User Analytics'
  const showLoading = isLoading && entries.length === 0 && !error
  const showEmpty = !isLoading && entries.length === 0 && !error

  return (
    <Modal open={open} onClose={onClose} title={modalTitle}>
      <section className="modal-section">
        <header>
          <h4>Tracking summary</h4>
          {onRefresh && (
            <button
              type="button"
              className="ghost-button"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </header>
        <div className="modal-info-grid">
          <div className="modal-info-card">
            <strong>Date range</strong>
            <span>{rangeLabel}</span>
          </div>
          <div className="modal-info-card">
            <strong>Entries found</strong>
            <span>{entries.length || '—'}</span>
          </div>
        </div>
      </section>
      <section className="modal-section">
        <header>
          <h4>Daily breakdown</h4>
          <p>The most recent day lives at index 0 (today when available).</p>
        </header>
        {error && <p className="error-text">{error}</p>}
        {showLoading && <p>Loading analytics…</p>}
        {showEmpty && <p>No analytics were reported for this range.</p>}
        {!showLoading && entries.length > 0 && (
          <div className="analytics-entry-list">
            {entries.map((entry, index) => {
              const entryDate = entry?.date ?? ''
              const isToday = isTodayDate(entryDate)
              const entryKey = entryDate ? `${entryDate}-${index}` : `entry-${index}`
              return (
                <article
                  key={entryKey}
                  className={`analytics-entry${isToday ? ' analytics-entry--today' : ''}`}
                >
                  <div className="analytics-entry__header">
                    <div>
                      <strong>{formatDateLabel(entryDate)}</strong>
                      {isToday && <span className="analytics-entry__tag">Today</span>}
                    </div>
                    <span className="analytics-entry__index">Index {index}</span>
                  </div>
                  <div className="analytics-metrics-grid">
                    {METRIC_FIELDS.map((field) => {
                      const { value, sourceKey } = resolveMetricValue(entry, field)
                      const metricValue = field.transform
                        ? field.transform(value, sourceKey)
                        : value
                      return (
                        <div key={field.key} className="analytics-metric">
                          <span className="metric-label">{field.label}</span>
                          <strong className="metric-value">
                            {formatMetricValue(metricValue, field.precision)}
                          </strong>
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </Modal>
  )
}

export default UserAnalyticsModal
