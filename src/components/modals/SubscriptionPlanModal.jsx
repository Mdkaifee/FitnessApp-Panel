import Modal from '../shared/Modal'

function SubscriptionPlanModal({ open, mode, form, setForm, pendingAction, onClose, onSubmit }) {
  if (!open) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const handleInputChange = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.checked }))
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Update pricing plan' : 'Create pricing plan'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form plan-modal plan-modal--compact">
        <section className="plan-modal-section">
          <div className="plan-section-head" />
          <div className="plan-field-grid plan-field-grid--compact">
            <label className="plan-field">
              <span>Plan name</span>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={handleInputChange('name')}
                placeholder="e.g., Monthly"
              />
            </label>
            <label className="plan-field">
              <span>Billing term</span>
              <input
                type="text"
                value={form.billingTerm ?? ''}
                onChange={handleInputChange('billingTerm')}
                placeholder="e.g., Billed monthly"
              />
            </label>
            <label className="plan-field">
              <span>Duration (months)</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.durationMonths ?? ''}
                onChange={handleInputChange('durationMonths')}
                placeholder="e.g., 1"
              />
            </label>
            <label className="plan-field">
              <span>Original price (USD)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.originalPrice ?? ''}
                onChange={handleInputChange('originalPrice')}
                placeholder="e.g., 9.99"
              />
            </label>
            <label className="plan-field">
              <span>Discounted price (USD)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.discountedPrice ?? ''}
                onChange={handleInputChange('discountedPrice')}
                placeholder="e.g., 5.99"
              />
            </label>
            <label className="plan-field">
              <span>Monthly equivalent (optional)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.monthlyEquivalent ?? ''}
                onChange={handleInputChange('monthlyEquivalent')}
                placeholder="Auto if left blank"
              />
            </label>
            <label className="plan-field plan-field--full">
              <span>Description</span>
              <input
                type="text"
                value={form.description ?? ''}
                onChange={handleInputChange('description')}
                placeholder="Optional short description"
              />
            </label>
          </div>
        </section>

        <div className="plan-footer">
          <label className="plan-toggle">
            <input type="checkbox" checked={form.isActive} onChange={handleCheckboxChange('isActive')} />
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

export default SubscriptionPlanModal
