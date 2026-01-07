import Modal from '../shared/Modal'

function ProgramModal({ open, mode, form, setForm, pendingAction, onClose, onSubmit }) {
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

  const isPaid = (form.accessLevel ?? 'free') === 'paid'
  const paidTerm = form.paidTerm ?? 'monthly'
  const paidTitle =
    paidTerm === 'weekly'
      ? 'Paid Plan - Weekly'
      : paidTerm === 'yearly'
        ? 'Paid Plan - Yearly'
        : 'Paid Plan - Monthly'
  const parseNumber = (value) => {
    if (value == null || value === '') return null
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  const originalPrice = parseNumber(form.originalPrice)
  const discountedPrice = parseNumber(form.discountedPrice)
  const percentOff =
    originalPrice && discountedPrice && originalPrice > discountedPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : null
  const weeklyRate = discountedPrice
    ? paidTerm === 'weekly'
      ? discountedPrice
      : paidTerm === 'yearly'
        ? discountedPrice / 52
        : discountedPrice / 4.33
    : null
  const percentLabel = percentOff != null ? `${percentOff}% OFF` : '-'
  const weeklyRateLabel =
    weeklyRate != null ? `$${weeklyRate.toFixed(2)} / week` : '-'

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Update program' : 'Create program'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form plan-modal plan-modal--compact">
        <section className="plan-modal-section">
          <div className="plan-section-head">
            {/* <p className="plan-section-title">Plan basics</p>
            <p className="plan-section-description">
              Choose the plan length and access level. Other details will auto-generate.
            </p> */}
          </div>
          <div className="plan-field-grid plan-field-grid--compact">
            {isPaid ? (
              <label className="plan-field">
                <span>Plan name</span>
                <input type="text" value={paidTitle} disabled />
              </label>
            ) : (
              <label className="plan-field">
                <span>Plan name</span>
                <input
                  type="text"
                  value={form.title ?? ''}
                  onChange={handleInputChange('title')}
                  placeholder="e.g., 28-Day Plan"
                />
              </label>
            )}
            {isPaid ? (
              <label className="plan-field">
                <span>Plan term</span>
                <select value={paidTerm} onChange={handleInputChange('paidTerm')}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
            ) : (
              <label className="plan-field">
                <span>Number of days</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.durationDays ?? ''}
                  onChange={handleInputChange('durationDays')}
                  placeholder="e.g., 28"
                />
              </label>
            )}
            <label className="plan-field">
              <span>Access type</span>
              <select value={form.accessLevel ?? 'free'} onChange={handleInputChange('accessLevel')}>
                <option value="free">Free plan</option>
                <option value="paid">Paid plan</option>
              </select>
            </label>
            {isPaid ? (
              <>
                <label className="plan-field">
                  <span>Original price (USD)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form.originalPrice ?? ''}
                    onChange={handleInputChange('originalPrice')}
                    placeholder="e.g., 11.99"
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
                  <span>Percent off (auto)</span>
                  <input type="text" value={percentLabel} disabled />
                </label>
                <label className="plan-field">
                  <span>Weekly rate (auto)</span>
                  <input type="text" value={weeklyRateLabel} disabled />
                </label>
              </>
            ) : null}
          </div>
        </section>

        <div className="plan-footer">
          <label className="plan-toggle">
            <input type="checkbox" checked={form.isActive} onChange={handleCheckboxChange('isActive')} />
            <span>Program is active & visible to members</span>
          </label>
          <button type="submit" className="plan-submit" disabled={Boolean(pendingAction)}>
            {pendingAction ? 'Saving…' : mode === 'create' ? 'Publish program' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProgramModal
