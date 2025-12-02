import Modal from '../shared/Modal'
import { QUESTION_TYPES } from '../../constants'

function QuestionModal({
  open,
  form,
  setForm,
  pendingAction,
  onClose,
  onSubmit,
  addMeasurementUnitField,
  removeMeasurementUnitField,
  setMeasurementUnitValue,
}) {
  if (!open) return null

  const requiresUnits = form.questionType === 'weight' || form.questionType === 'height'
  const ready =
    form.prompt.trim() &&
    form.answer.trim() &&
    (!requiresUnits || form.measurementUnits.some((unit) => unit.trim().length > 0))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Modal
      open={open}
      title={form.id ? 'Update question' : 'Create question'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <section className="modal-section">
          <header>
            <h4>Prompt & answer</h4>
            <p>Craft the question and default response.</p>
          </header>
          <div className="modal-grid">
            <label>
              Prompt
              <input
                type="text"
                value={form.prompt}
                onChange={(event) => setForm((prev) => ({ ...prev, prompt: event.target.value }))}
                placeholder="Enter the question prompt"
              />
            </label>
            <label>
              Answer
              <input
                type="text"
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                placeholder="Default answer or guidance"
              />
            </label>
            <label>
              Question type
              <select
                value={form.questionType}
                onChange={(event) => setForm((prev) => ({ ...prev, questionType: event.target.value }))}
              >
                <option value="">Select type</option>
                {QUESTION_TYPES.filter((type) => type.value !== '').map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Gender
              <select
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value || 'All' }))}
              >
                <option value="All">All</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </div>
        </section>
        <section className="modal-section">
          <header>
            <h4>Measurement units</h4>
            <p>Add unit labels when the question needs them.</p>
          </header>
          <div className="measurement-unit-group compact">
            <div className="measurement-unit-header">
              <span>Units</span>
              <button type="button" className="link-button" onClick={addMeasurementUnitField}>
                Add unit
              </button>
            </div>
            {form.measurementUnits.map((unit, index) => (
              <div key={index} className="measurement-unit-row">
                <input
                  type="text"
                  value={unit}
                  placeholder="e.g., kg"
                  onChange={(event) => setMeasurementUnitValue(index, event.target.value)}
                />
                {form.measurementUnits.length > 1 && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeMeasurementUnitField(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {requiresUnits && <small>Provide at least one unit for weight/height questions.</small>}
          </div>
        </section>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={!ready || pendingAction}>
            {pendingAction ? 'Saving…' : form.id ? 'Save changes' : 'Publish question'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default QuestionModal
