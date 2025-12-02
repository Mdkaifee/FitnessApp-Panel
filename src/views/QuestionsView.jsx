import Swal from 'sweetalert2'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'
import { ANSWER_TYPES, GENDER_ALL_LABEL, GENDER_API_BOTH } from '../constants'

function QuestionsView({
  questionsData,
  questionsLoading,
  questionsError,
  questionsFilter,
  setQuestionsFilter,
  questionPending,
  onRefresh,
  onDeleteQuestion,
  onEditQuestion,
}) {
  const list = questionsData?.questions ?? []
  const handleDelete = (question) => {
    Swal.fire({
      title: 'Delete question?',
      text: `This will remove "${question.question ?? 'this question'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteQuestion(question.id)
      }
    })
  }

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
            value={questionsFilter.answerType}
            onChange={(event) =>
              setQuestionsFilter((prev) => ({ ...prev, answerType: event.target.value }))
            }
          >
            <option value="">All answer types</option>
            {ANSWER_TYPES.map((type) => (
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
          <select
            value={questionsFilter.status}
            onChange={(event) =>
              setQuestionsFilter((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <header className="question-card-header">
                <p className="eyebrow muted">{question.answer_type ?? '—'}</p>
                <div className="question-pill-group">
                  <span className={`pill ${question.is_active ? 'success' : 'danger'}`}>
                    {question.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {question.is_required && <span className="pill neutral">Required</span>}
                  <span className="pill neutral">
                    {question.gender?.toLowerCase() === GENDER_API_BOTH.toLowerCase()
                      ? GENDER_ALL_LABEL
                      : question.gender || GENDER_ALL_LABEL}
                  </span>
                </div>
              </header>
              <div className="question-body">
                <h3>{question.question}</h3>
                {question.description && <p className="question-description">{question.description}</p>}
                {question.options?.length > 0 && (
                  <div className="question-options">
                    {question.options.map((option, index) => (
                      <div
                        key={option.id ?? `${option.option_text}-${option.value ?? index}`}
                        className="question-option"
                      >
                        <strong>{option.option_text}</strong>
                        {option.value && <span className="option-value">{option.value}</span>}
                        {!option.is_active && <small>Inactive</small>}
                      </div>
                    ))}
                  </div>
                )}
                <small>
                  Updated {question.updated_at ? new Date(question.updated_at).toLocaleDateString() : '—'} · Created{' '}
                  {question.created_at ? new Date(question.created_at).toLocaleDateString() : '—'}
                </small>
              </div>
              <div className="question-actions">
                <button
                  className="question-icon-button"
                  type="button"
                  onClick={() => onEditQuestion(question)}
                  title="Edit question"
                >
                  <img src={editIcon} alt="Edit question" />
                </button>
                <button
                  className="question-icon-button danger"
                  type="button"
                  onClick={() => handleDelete(question)}
                  disabled={questionPending === `delete-${question.id}`}
                  title="Delete question"
                >
                  <img src={deleteIcon} alt="Delete question" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuestionsView
