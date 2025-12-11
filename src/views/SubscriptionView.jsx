import Swal from 'sweetalert2'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

const formatDurationLabel = (months) => {
  const value = Number(months)
  if (!Number.isFinite(value) || value <= 0) return '—'
  if (value === 1) return '1 month'
  if (value % 12 === 0) {
    const years = value / 12
    return `${years} year${years > 1 ? 's' : ''}`
  }
  return `${value} months`
}

const deriveBillingLabel = (months) => {
  if (months >= 12) return 'Billed yearly'
  if (months === 3) return 'Billed quarterly'
  return 'Billed monthly'
}

const formatCurrencyValue = (value, currencyCode = 'USD') => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return '—'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(numericValue)
  } catch {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue)
  }
}

const getPlanCurrency = (plan) =>
  plan?.currency ??
  plan?.currency_code ??
  plan?.currencyCode ??
  plan?.pricing_currency ??
  'USD'

const getPlanDurationValue = (plan) => {
  const value = Number(plan?.duration_months ?? plan?.durationMonths ?? 0)
  return Number.isFinite(value) ? value : 0
}

const getPlanBillingLabel = (plan) => {
  const months = getPlanDurationValue(plan)
  return plan?.billing_term ?? plan?.billingTerm ?? deriveBillingLabel(months)
}

const getPlanMonthlyEquivalent = (plan) => {
  const explicit = plan?.monthly_equivalent ?? plan?.monthlyEquivalent
  const explicitValue = Number(explicit)
  if (Number.isFinite(explicitValue) && explicitValue > 0) {
    return explicitValue
  }
  const discounted = Number(plan?.discounted_price ?? plan?.discountedPrice ?? 0)
  const months = getPlanDurationValue(plan) || 1
  if (!Number.isFinite(discounted) || discounted <= 0) return 0
  return discounted / months
}

function SubscriptionView({
  plans,
  isLoading,
  error,
  onRefresh,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onTogglePlanActive,
  pendingAction,
  statusFilter = 'active',
  onStatusFilterChange,
}) {
  const list = Array.isArray(plans) ? plans : []
  const sortedPlans = [...list].sort((a, b) => {
    const aActive = (a?.is_active ?? a?.isActive ?? true) ? 1 : 0
    const bActive = (b?.is_active ?? b?.isActive ?? true) ? 1 : 0
    if (aActive === bActive) {
      return (a?.display_order ?? a?.displayOrder ?? a?.duration_months ?? 0) -
        (b?.display_order ?? b?.displayOrder ?? b?.duration_months ?? 0)
    }
    return bActive - aActive
  })
  const isViewingInactive = statusFilter === 'inactive'
  const shouldShowControls = list.length > 0 || isViewingInactive

  const handleStatusToggle = () => {
    if (!onStatusFilterChange) return
    const nextFilter = isViewingInactive ? 'active' : 'inactive'
    onStatusFilterChange(nextFilter)
  }

  const handleDeletePlan = (plan) => {
    if (!plan?.id) return
    Swal.fire({
      title: `Delete ${plan.name ?? 'this plan'}?`,
      text: 'Members will no longer see this plan in the app.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete plan',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onDeletePlan(plan.id)
      }
    })
  }

  return (
    <div className="subscription-view">
      {shouldShowControls && (
        <div className="subscription-controls">
          <div className="subscription-actions">
            {/* <button className="secondary slim" onClick={handleStatusToggle} disabled={isLoading}>
              {isViewingInactive ? 'Show active plans' : 'Inactive plans'}
            </button> */}
            {/* <button className="secondary slim" onClick={onRefresh} disabled={isLoading}>
              {isLoading
                ? 'Refreshing…'
                : isViewingInactive
                  ? 'Refresh inactive'
                  : 'Refresh plans'}
            </button> */}
            {!isViewingInactive && (
              <button className="primary slim" onClick={onAddPlan}>
                Add plan
              </button>
            )}
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {isLoading ? (
        <div className="loading-panel">Loading plans…</div>
      ) : list.length === 0 ? (
        <div className="empty-panel">
          <h3>{isViewingInactive ? 'No inactive plans' : 'No plans yet'}</h3>
          <p>
            {isViewingInactive
              ? 'Inactive plans will show up here after you toggle off their availability.'
              : 'Add your first membership to start selling subscriptions inside the app.'}
          </p>
          {!isViewingInactive && (
            <button className="primary" onClick={onAddPlan}>
              Create plan
            </button>
          )}
        </div>
      ) : (
        <div className="plan-grid">
          {sortedPlans.map((plan, index) => {
            const isActive = plan?.is_active ?? plan?.isActive ?? true
            const currency = getPlanCurrency(plan)
            const durationLabel = formatDurationLabel(getPlanDurationValue(plan))
            const discountedLabel = formatCurrencyValue(plan?.discounted_price, currency)
            const originalLabel = formatCurrencyValue(plan?.original_price, currency)
            const monthlyValue = getPlanMonthlyEquivalent(plan)
            const monthlyLabel = formatCurrencyValue(monthlyValue, currency)
            const billingLabel = getPlanBillingLabel(plan)
            return (
              <article
                key={plan.id ?? `plan-${index}`}
                className={`plan-card ${isActive ? 'plan-card--active' : 'plan-card--inactive'}`}
              >
                <div className="plan-card__header">
                  <div>
                    <p className="eyebrow">Plan month</p>
                    <h3>{durationLabel}</h3>
                  </div>
                </div>
                <div className="plan-card__price">
                  <span className="plan-price__discounted">{discountedLabel}</span>
                  <span className="plan-price__original">{originalLabel}</span>
                  <span className="plan-price__monthly">
                    Per month · <strong>{monthlyLabel}</strong>
                  </span>
                </div>
                <div className="plan-card__meta">
                  <div>
                    <span>Billing label</span>
                    <strong>{billingLabel}</strong>
                  </div>
                  <div>
                    <span>Per month</span>
                    <strong>{monthlyLabel}</strong>
                  </div>
                  <div>
                    <span>Plan length</span>
                    <strong>{durationLabel}</strong>
                  </div>
                </div>
                <div className="plan-card__actions">
                  <button type="button" className="plan-action" onClick={() => onEditPlan(plan)} title="Edit plan">
                    <img src={editIcon} alt="Edit plan" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="plan-action danger"
                    onClick={() => handleDeletePlan(plan)}
                    disabled={pendingAction === `delete-${plan.id}`}
                    title="Delete plan"
                  >
                    <img src={deleteIcon} alt="Delete plan" />
                    <span>{pendingAction === `delete-${plan.id}` ? 'Deleting…' : 'Delete'}</span>
                  </button>
                  <label
                    className={`plan-toggle-control ${!isActive ? 'plan-toggle-control--inactive' : ''}`}
                    aria-live="polite"
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      disabled={pendingAction === `toggle-${plan.id}`}
                      onChange={() => onTogglePlanActive?.(plan)}
                    />
                    <span>
                      {pendingAction === `toggle-${plan.id}`
                        ? 'Saving…'
                        : isActive
                          ? 'Active'
                          : 'Inactive'}
                    </span>
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

export default SubscriptionView
