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
      <form onSubmit={handleSubmit} className="modal-form">
        <section className="modal-section">
          <header>
            <h4>Plan settings</h4>
            <p>Select the plan length and prices. Billing labels are auto-calculated on save.</p>
          </header>
          <div className="modal-grid">
            <label>
              Plan month
              <select value={form.durationMonths} onChange={handleInputChange('durationMonths')} required>
                {PLAN_DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-hint">Only 1, 3, or 12-month plans are supported.</p>
            </label>
            <label>
              Original price
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
            <label>
              Discounted price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountedPrice}
                onChange={handleInputChange('discountedPrice')}
                placeholder="699"
                required
              />
              <p className="field-hint">Per-month rate and billing badge are generated for you.</p>
            </label>
          </div>
          <div className="plan-preview">
            <div className="plan-preview__copy">
              <p className="preview-title">Auto-calculated preview</p>
              <p className="preview-helper">
                Final numbers come from the backend, but here&apos;s what to expect.
              </p>
              <div className="modal-info-grid">
                <div className="modal-info-card">
                  <strong>Billing label</strong>
                  <span>{billingPreview}</span>
                </div>
                <div className="modal-info-card">
                  <strong>Approx. per month</strong>
                  <span>{formatPreviewAmount(monthlyPreview)}</span>
                </div>
              </div>
            </div>
            <div className="plan-preview__toggle">
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                <span>Plan is active and visible to members</span>
              </label>
            </div>
          </div>
        </section>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={Boolean(pendingAction)}>
            {pendingAction ? 'Saving…' : mode === 'create' ? 'Publish plan' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PlanModal
