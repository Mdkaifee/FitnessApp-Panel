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

  const modalTitle = form.id ? 'Update Question' : 'Create Question'

  return (
    <Modal open={open} onClose={onClose} dialogClassName="question-modal-dialog" title="">
      <div className="question-modal">
        <div className="question-modal-header">
          <h2>{modalTitle}</h2>
          <button type="button" className="video-modal-close" onClick={onClose} aria-label="Close question modal">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12m0-12L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="question-modal-form">
          <section className="question-section">
            <div className="question-section-head">
              <h4>Question Details</h4>
              <p>Define the prompt, answer type and availability.</p>
            </div>
            <div className="question-field-row">
              <label className="question-field">
                <span className="question-field-label">
                  Question <span className="required">*</span>
                </span>
                <input
                  type="text"
                  value={form.question}
                  onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                  placeholder="Enter a question prompt"
                />
              </label>
              <label className="question-field">
                <span className="question-field-label">Answer Type</span>
                <select
                  value={form.answerType}
                  onChange={(event) => setForm((prev) => ({ ...prev, answerType: event.target.value }))}
                >
                  <option value="">Select</option>
                  {ANSWER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="question-field-row">
              <label className="question-field">
                <span className="question-field-label">Gender</span>
                <select
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                >
                  <option value={GENDER_ALL_LABEL}>{GENDER_ALL_LABEL}</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </label>
              <label className="question-field">
                <span className="question-field-label">Description</span>
                <input
                  type="text"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Enter a question title"
                />
              </label>
            </div>
            <div className="question-checkbox-row">
              <label className="question-checkbox">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={(event) => setForm((prev) => ({ ...prev, isRequired: event.target.checked }))}
                />
                <span>Required</span>
              </label>
              <label className="question-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>
          </section>

          {showOptions && (
            <section className="question-section">
              <div className="question-section-head question-section-head--options">
                <div>
                  <h4>Question (Optional)</h4>
                  <p>Add toggle values if you need them for this question.</p>
                </div>
                <button type="button" className="question-add-option" onClick={addOptionField}>
                  <span aria-hidden="true">＋</span> Add Option
                </button>
              </div>
              <div className="question-option-list">
                {form.options.map((option, index) => (
                  <div key={index} className="question-option-row">
                    <label className="question-field">
                      <span className="question-field-label">Option Text</span>
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(event) => updateOptionField(index, 'optionText', event.target.value)}
                        placeholder="Option text"
                      />
                    </label>
                    <label className="question-field">
                      <span className="question-field-label">Value (Optional)</span>
                      <input
                        type="text"
                        value={option.value}
                        onChange={(event) => updateOptionField(index, 'value', event.target.value)}
                        placeholder="Value"
                      />
                    </label>
                    <label className="question-checkbox">
                      <input
                        type="checkbox"
                        checked={option.isActive}
                        onChange={() => toggleOptionActive(index)}
                      />
                      <span>Active</span>
                    </label>
                    {form.options.length > 1 && (
                      <button
                        type="button"
                        className="question-remove-option"
                        aria-label="Remove option"
                        onClick={() => removeOptionField(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="question-modal-actions">
            <button type="submit" disabled={!ready || pendingAction}>
              {pendingAction ? 'Saving…' : form.id ? 'Save Question' : 'Publish Question'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default QuestionModal
