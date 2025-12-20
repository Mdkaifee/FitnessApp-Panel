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
            <label className="plan-field">
              <span>Plan name</span>
              <input
                type="text"
                value={form.title ?? ''}
                onChange={handleInputChange('title')}
                placeholder="e.g., 28-Day Plan"
              />
            </label>
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
            <label className="plan-field">
              <span>Access type</span>
              <select value={form.accessLevel ?? 'free'} onChange={handleInputChange('accessLevel')}>
                <option value="free">Free plan</option>
                <option value="paid">Paid plan</option>
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
