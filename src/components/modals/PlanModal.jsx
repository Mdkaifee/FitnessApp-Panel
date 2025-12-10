import Modal from '../shared/Modal'

const PLAN_DURATION_OPTIONS = [
  { value: '1', label: '1 month' },
  { value: '3', label: '3 months' },
  { value: '12', label: '12 months' },
]

const getBillingPreview = (months) => {
  if (months >= 12) return 'Billed yearly'
  if (months === 3) return 'Billed quarterly'
  return 'Billed monthly'
}

const formatPreviewAmount = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '—'
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function PlanModal({ open, mode, form, setForm, pendingAction, onClose, onSubmit }) {
  if (!open) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const handleInputChange = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const durationMonths = Number(form.durationMonths) || 0
  const discounted = Number(form.discountedPrice) || 0
  const monthlyPreview = durationMonths > 0 ? discounted / durationMonths : 0
  const billingPreview = getBillingPreview(durationMonths)

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create subscription plan' : 'Update subscription plan'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form plan-modal">
        <section className="plan-modal-section">
          <div className="plan-section-head">
            <p className="plan-section-title">Plan settings</p>
            <p className="plan-section-description">
              Select the plan length and prices. Billing labels are auto-calculated on save.
            </p>
          </div>
          <div className="plan-field-grid">
            <label className="plan-field">
              <span>Plan month</span>
              <select
                value={form.durationMonths}
                onChange={handleInputChange('durationMonths')}
                required
              >
                {PLAN_DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>Only 1, 3, or 12-month plans are supported.</small>
            </label>
            <label className="plan-field">
              <span>Original price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={handleInputChange('originalPrice')}
                placeholder="999"
                required
              />
            </label>
            <label className="plan-field plan-field--full">
              <span>Discounted price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountedPrice}
                onChange={handleInputChange('discountedPrice')}
                placeholder="699"
                required
              />
              <small>Per-month rate and billing badge are generated for you.</small>
            </label>
          </div>
        </section>
        <div className="plan-divider" />
        <section className="plan-modal-section">
          <div className="plan-section-head">
            <p className="plan-section-title">Auto-calculated preview</p>
            <p className="plan-section-description">
              Final numbers come from the backend, but here&apos;s what to expect.
            </p>
          </div>
          <div className="plan-preview-grid">
            <div className="plan-preview-card">
              <span>Billing label</span>
              <strong>{billingPreview}</strong>
            </div>
            <div className="plan-preview-card">
              <span>Approx. per month</span>
              <strong>{formatPreviewAmount(monthlyPreview)}</strong>
            </div>
          </div>
        </section>
        <div className="plan-footer">
          <label className="plan-toggle">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
            <span>Plan is active & visible to members</span>
          </label>
          <button type="submit" className="plan-submit" disabled={Boolean(pendingAction)}>
            {pendingAction ? 'Saving…' : mode === 'create' ? 'Publish plan' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PlanModal
