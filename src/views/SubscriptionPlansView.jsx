import Swal from 'sweetalert2'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

const formatMoney = (value) => {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(numeric)) return '—'
  return `$${numeric.toFixed(2)}`
}

const resolveBillingUnit = (plan) => {
  const term = (plan?.billing_term ?? plan?.billingTerm ?? '').toLowerCase()
  if (term.includes('week')) return 'week'
  if (term.includes('year')) return 'year'
  if (term.includes('month')) return 'month'
  const months = Number(plan?.duration_months ?? plan?.durationMonths ?? 0)
  if (months >= 12) return 'year'
  return 'month'
}

const resolveBillingLabel = (plan, unit) => {
  const term = plan?.billing_term ?? plan?.billingTerm
  if (term && term.trim()) return term
  if (unit === 'week') return 'Billed weekly'
  if (unit === 'year') return 'Billed yearly'
  return 'Billed monthly'
}

const resolveWeeklyEquivalent = (plan, unit) => {
  const discounted = Number(plan?.discounted_price ?? plan?.discountedPrice ?? 0)
  if (!Number.isFinite(discounted) || discounted <= 0) return null
  if (unit === 'week') return discounted
  if (unit === 'year') return discounted / 52
  return discounted / 4.33
}

const resolveDiscountPercent = (plan) => {
  const original = Number(plan?.original_price ?? plan?.originalPrice ?? 0)
  const discounted = Number(plan?.discounted_price ?? plan?.discountedPrice ?? 0)
  if (!Number.isFinite(original) || !Number.isFinite(discounted) || original <= 0) return null
  if (discounted >= original) return null
  const percent = Math.round(((original - discounted) / original) * 100)
  return percent > 0 ? percent : null
}

const isPlanActive = (plan) => {
  const explicit = plan?.is_active
  if (typeof explicit === 'boolean') return explicit
  return plan?.isActive ?? true
}

function SubscriptionPlansView({
  plans,
  isLoading,
  error,
  pendingAction,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onTogglePlanActive,
}) {
  const list = Array.isArray(plans) ? plans : []
  const featuredExists = list.some((plan) => plan?.is_featured ?? plan?.isFeatured)
  const unitOrder = { week: 0, month: 1, year: 2 }
  const sortedPlans = [...list].sort((a, b) => {
    const unitA = resolveBillingUnit(a)
    const unitB = resolveBillingUnit(b)
    const orderA = unitOrder[unitA] ?? 99
    const orderB = unitOrder[unitB] ?? 99
    if (orderA !== orderB) return orderA - orderB
    const priceA = Number(a?.discounted_price ?? a?.discountedPrice ?? 0)
    const priceB = Number(b?.discounted_price ?? b?.discountedPrice ?? 0)
    return priceA - priceB
  })

  const handleDeletePlan = (plan) => {
    if (!plan?.id) return
    Swal.fire({
      title: `Delete ${plan.name || 'this plan'}?`,
      text: 'Members will no longer see this pricing option in the app.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete plan',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onDeletePlan(plan)
      }
    })
  }

  return (
    <div className="subscription-view">
      <div className="subscription-controls">
        <div className="subscription-actions">
          <button className="primary slim theme-button" onClick={onAddPlan}>
            Add plan
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isLoading ? (
        <div className="loading-panel">Loading pricing plans…</div>
      ) : sortedPlans.length === 0 ? (
        <div className="empty-panel">
          <h3>No pricing plans added</h3>
          <p>Create weekly, monthly, and yearly pricing to sell Premium access.</p>
          <button className="primary theme-button" onClick={onAddPlan}>
            Create plan
          </button>
        </div>
      ) : (
        <div className="pricing-grid">
          {sortedPlans.map((plan) => {
            const unit = resolveBillingUnit(plan)
            const billingLabel = resolveBillingLabel(plan, unit)
            const weeklyRate = resolveWeeklyEquivalent(plan, unit)
            const discountPercent = resolveDiscountPercent(plan)
            const original = Number(plan?.original_price ?? plan?.originalPrice ?? 0)
            const discounted = Number(plan?.discounted_price ?? plan?.discountedPrice ?? 0)
            const active = isPlanActive(plan)
            const hasFeaturedFlag = plan?.is_featured ?? plan?.isFeatured
            const isFeatured = Boolean(hasFeaturedFlag) || (!featuredExists && unit === 'month')
            const pendingDelete = pendingAction === `delete-${plan.id}`
            const pendingToggle = pendingAction === `toggle-${plan.id}`
            return (
              <article
                key={plan.id}
                className={`pricing-card ${!active ? 'pricing-card--inactive' : ''} ${
                  isFeatured ? 'pricing-card--featured' : ''
                }`}
              >
                {isFeatured ? <span className="pricing-card__flag">Most Popular</span> : null}
                <div className="pricing-card__body">
                  <p className="pricing-card__title">{plan.name || plan.description || 'Plan'}</p>
                  <div className="pricing-card__price">
                    <span className="pricing-card__price-discounted">
                      {formatMoney(discounted)}
                    </span>
                    {original > discounted ? (
                      <span className="pricing-card__price-original">{formatMoney(original)}</span>
                    ) : null}
                  </div>
                  {discountPercent ? (
                    <span className="pricing-card__badge">{discountPercent}% OFF</span>
                  ) : null}
                  {weeklyRate ? (
                    <p className="pricing-card__weekly">
                      only {formatMoney(weeklyRate)} / week
                    </p>
                  ) : null}
                  <p className="pricing-card__billing">{billingLabel}</p>
                </div>
                <div className="pricing-card__actions">
                  <div className="plan-card__buttons">
                    <button
                      type="button"
                      className="plan-action"
                      onClick={() => onEditPlan(plan)}
                      title="Edit plan"
                    >
                      <img src={editIcon} alt="Edit plan" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="plan-action danger"
                      onClick={() => handleDeletePlan(plan)}
                      disabled={pendingDelete}
                      title="Delete plan"
                    >
                      <img src={deleteIcon} alt="Delete plan" />
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
                      onChange={() => onTogglePlanActive?.(plan)}
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

export default SubscriptionPlansView
