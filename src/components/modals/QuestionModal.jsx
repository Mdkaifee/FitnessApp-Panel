import Modal from '../shared/Modal'
import { ANSWER_TYPES, GENDER_ALL_LABEL } from '../../constants'

const isChoiceType = (type) => type === 'single_choice' || type === 'multi_choice'

function QuestionModal({
  open,
  form,
  setForm,
  pendingAction,
  onClose,
  onSubmit,
  addOptionField,
  removeOptionField,
  updateOptionField,
  toggleOptionActive,
}) {
  if (!open) return null

  const choiceType = isChoiceType(form.answerType)
  const showOptions = Boolean(form.answerType)
  const hasQuestion = form.question.trim().length > 0 && form.answerType
  const hasOptions = !choiceType || form.options.some((option) => option.optionText.trim().length > 0)
  const ready = hasQuestion && hasOptions

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Modal open={open} title={form.id ? 'Update question' : 'Create question'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <section className="modal-section">
          <header>
            <h4>Question details</h4>
            <p>Define the prompt, answer type, and availability.</p>
          </header>
          <div className="modal-grid">
            <label>
              Question
              <input
                type="text"
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                placeholder="Enter the question prompt"
              />
            </label>
            <label>
              Description (optional)
              <input
                type="text"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Additional context for admins"
              />
            </label>
            <label>
              Answer type
              <select
                value={form.answerType}
                onChange={(event) => setForm((prev) => ({ ...prev, answerType: event.target.value }))}
              >
                <option value="">Select type</option>
                {ANSWER_TYPES.map((type) => (
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
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value={GENDER_ALL_LABEL}>{GENDER_ALL_LABEL}</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={(event) => setForm((prev) => ({ ...prev, isRequired: event.target.checked }))}
              />
              Required
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Active
            </label>
          </div>
        </section>

        {showOptions && (
          <section className="modal-section">
            <header>
              <h4>Options {choiceType ? '(required)' : '(optional)'}</h4>
              <p>
                {choiceType
                  ? 'Provide the exact choices members can pick from.'
                  : 'Add toggle values (e.g., Lbs/Kg) if you need them for this question.'}
              </p>
            </header>
            <div className="option-list">
              {form.options.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(event) => updateOptionField(index, 'optionText', event.target.value)}
                    placeholder="Option text"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(event) => updateOptionField(index, 'value', event.target.value)}
                    placeholder="Value (optional)"
                  />
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={option.isActive}
                      onChange={() => toggleOptionActive(index)}
                    />
                    Active
                  </label>
                  {form.options.length > 1 && (
                    <button type="button" className="ghost-button" onClick={() => removeOptionField(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="link-button" onClick={addOptionField}>
              Add option
            </button>
          </section>
        )}

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
