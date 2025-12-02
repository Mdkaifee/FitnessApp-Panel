import { QUESTION_TYPES } from '../constants'

function QuestionsView({
  questionsData,
  questionsLoading,
  questionsError,
  questionsFilter,
  setQuestionsFilter,
  questionForm,
  setQuestionForm,
  questionPending,
  onRefresh,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onEditQuestion,
  onResetQuestionForm,
  addMeasurementUnitField,
  removeMeasurementUnitField,
  setMeasurementUnitValue,
}) {
  const list = questionsData?.questions ?? []
  const requiresUnits =
    questionForm.questionType === 'weight' || questionForm.questionType === 'height'
  const questionReady =
    questionForm.prompt.trim() &&
    questionForm.answer.trim() &&
    (!requiresUnits || questionForm.measurementUnits.some((unit) => unit.trim().length > 0))

  return (
    <div className="panel questions-panel">
      <div className="questions-header">
        <div>
          <h2>Questions</h2>
          <p>
            Showing {questionsData?.count ?? list.length} question
            {list.length === 1 ? '' : 's'} with current filters.
          </p>
        </div>
        <div className="question-filter">
          <select
            value={questionsFilter.questionType}
            onChange={(event) =>
              setQuestionsFilter((prev) => ({ ...prev, questionType: event.target.value }))
            }
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={questionsFilter.gender}
            onChange={(event) =>
              setQuestionsFilter((prev) => ({ ...prev, gender: event.target.value }))
            }
          >
            <option value="">All genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
          <button className="refresh-button" onClick={onRefresh}>
            {questionsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      {questionsError && <p className="error-text">{questionsError}</p>}
      {questionsLoading ? (
        <p>Loading questions...</p>
      ) : list.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <div className="question-list">
          {list.map((question) => (
            <article className="question-card" key={question.id}>
              <header>
                <p className="eyebrow muted">{question.question_type ?? 'General'}</p>
                <div>
                  <strong>#{question.id}</strong>
                  <span className="pill neutral">{question.gender || 'All'}</span>
                </div>
              </header>
              <div className="question-body">
                <h3>{question.prompt}</h3>
                <p>{question.answer || 'No answer provided yet.'}</p>
                {question.measurement_units?.length > 0 && (
                  <div className="question-units">
                    <span>Units:</span>
                    <div className="unit-list">
                      {question.measurement_units.map((unit) => (
                        <span key={unit}>{unit}</span>
                      ))}
                    </div>
                  </div>
                )}
                <small>
                  Updated {question.updated_at ? new Date(question.updated_at).toLocaleDateString() : '—'} ·
                  Created {question.created_at ? new Date(question.created_at).toLocaleDateString() : '—'}
                </small>
              </div>
              <div className="question-actions">
                <button className="secondary" onClick={() => onEditQuestion(question)}>
                  Edit
                </button>
                <button
                  className="danger"
                  onClick={() => onDeleteQuestion(question.id)}
                  disabled={questionPending === `delete-${question.id}`}
                >
                  {questionPending === `delete-${question.id}` ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="question-form">
        <h3>{questionForm.id ? 'Update question' : 'Create question'}</h3>
        <div className="question-form-grid">
          <label>
            Prompt
            <input
              type="text"
              value={questionForm.prompt}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, prompt: event.target.value }))
              }
              placeholder="Enter the question prompt"
            />
          </label>
          <label>
            Answer
            <textarea
              rows={1}
              value={questionForm.answer}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, answer: event.target.value }))
              }
              placeholder="Default answer or guidance"
            />
          </label>
          <label>
            Question type
            <select
              value={questionForm.questionType}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, questionType: event.target.value }))
              }
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
              value={questionForm.gender}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, gender: event.target.value || 'All' }))
              }
            >
              <option value="All">All</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </label>
          <div className="measurement-unit-group">
            <div className="measurement-unit-header">
              <span>Measurement units</span>
              <button type="button" className="link-button" onClick={addMeasurementUnitField}>
                Add unit
              </button>
            </div>
            {questionForm.measurementUnits.map((unit, index) => (
              <div key={index} className="measurement-unit-row">
                <input
                  type="text"
                  value={unit}
                  placeholder="e.g., kg"
                  onChange={(event) => setMeasurementUnitValue(index, event.target.value)}
                />
                {questionForm.measurementUnits.length > 1 && (
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
        </div>
        <div className="question-form-actions">
          <button className="secondary" onClick={onResetQuestionForm} type="button">
            Clear
          </button>
          {questionForm.id ? (
            <button onClick={onUpdateQuestion} disabled={!questionReady || questionPending === 'update'}>
              {questionPending === 'update' ? 'Saving…' : 'Save changes'}
            </button>
          ) : (
            <button onClick={onCreateQuestion} disabled={!questionReady || questionPending === 'create'}>
              {questionPending === 'create' ? 'Publishing…' : 'Publish question'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionsView
