import Swal from 'sweetalert2'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'
import { QUESTION_TYPES } from '../constants'

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
      text: `This will remove "${question.prompt ?? 'this question'}".`,
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
