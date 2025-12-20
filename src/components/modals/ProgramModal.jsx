import Modal from '../shared/Modal'

const ACCESS_OPTIONS = [
  { value: 'free', label: 'Free plan' },
  { value: 'paid', label: 'Premium plan' },
]

const DAY_OPTIONS = [
  { value: '28', label: '28-Day Journey' },
  { value: '60', label: '60-Day Journey' },
]

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

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Update program' : 'Create program'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form plan-modal plan-modal--compact">
        <section className="plan-modal-section">
          <div className="plan-section-head">
            <p className="plan-section-title">Plan basics</p>
            <p className="plan-section-description">
              Choose the plan length and access level. Other details will auto-generate.
            </p>
          </div>
          <div className="plan-field-grid plan-field-grid--compact">
            <label className="plan-field">
              <span>Number of days</span>
              <select value={form.durationDays} onChange={handleInputChange('durationDays')}>
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="plan-field">
              <span>Access type</span>
              <select value={form.accessLevel} onChange={handleInputChange('accessLevel')}>
                {ACCESS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
