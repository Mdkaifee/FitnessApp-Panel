import Modal from '../shared/Modal'

const ACCESS_OPTIONS = [
  { value: 'free', label: 'Free plan' },
  { value: 'paid', label: 'Premium plan' },
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
      <form onSubmit={handleSubmit} className="modal-form plan-modal">
        <section className="plan-modal-section">
          <div className="plan-field-grid">
            <label className="plan-field">
              <span>URL slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={handleInputChange('slug')}
                placeholder="28-day-free-plan"
              />
              <small>Leave blank to auto-generate from the title.</small>
            </label>
            <label className="plan-field">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={handleInputChange('title')}
                placeholder="28-Day Free Plan"
                required
              />
            </label>
            <label className="plan-field">
              <span>Subtitle</span>
              <input
                type="text"
                value={form.subtitle}
                onChange={handleInputChange('subtitle')}
                placeholder="5 workouts per week"
              />
            </label>
            <label className="plan-field plan-field--full">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={handleInputChange('description')}
                rows={3}
                placeholder="Short description for admins and marketing surfaces."
              />
            </label>
          </div>
        </section>

        <div className="plan-divider" />

        <section className="plan-modal-section">
          <div className="plan-section-head">
            <p className="plan-section-title">Schedule & visibility</p>
            <p className="plan-section-description">Tell members what to expect each week.</p>
          </div>
          <div className="plan-field-grid">
            <label className="plan-field">
              <span>Duration (days)</span>
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={handleInputChange('durationDays')}
                required
              />
            </label>
            <label className="plan-field">
              <span>Workouts / week</span>
              <input
                type="number"
                min="0"
                max="7"
                value={form.workoutsPerWeek}
                onChange={handleInputChange('workoutsPerWeek')}
                required
              />
            </label>
            <label className="plan-field">
              <span>Rest days / week</span>
              <input
                type="number"
                min="0"
                max="7"
                value={form.restDaysPerWeek}
                onChange={handleInputChange('restDaysPerWeek')}
                required
              />
            </label>
            <label className="plan-field">
              <span>Level</span>
              <input
                type="text"
                value={form.level}
                onChange={handleInputChange('level')}
                placeholder="Beginner, Intermediate, etc."
              />
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
            <label className="plan-field">
              <span>CTA label</span>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={handleInputChange('ctaLabel')}
                placeholder="Start for Free"
              />
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
