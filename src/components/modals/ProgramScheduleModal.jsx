import Modal from '../shared/Modal'

function ProgramScheduleModal({
  open,
  program,
  days,
  loading,
  error,
  pending,
  onClose,
  onToggleRest,
  onSelectFile,
  onClearVideo,
  onAutoRest,
  onSave,
}) {
  if (!open) return null
  const planTitle = program?.title || `${program?.duration_days || program?.durationDays || ''}-Day Plan`
  return (
    <Modal open={open} title={`${planTitle} schedule`} onClose={onClose}>
      <div className="plan-schedule-modal">
        {loading ? (
          <div className="loading-panel">Loading schedule…</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : (
          <>
            <div className="plan-schedule-toolbar">
              <div>
                <p className="plan-section-title">Daily structure</p>
                <p className="plan-section-description">
                  Assign two rest days per week and upload workouts for every other day.
                </p>
              </div>
              <div className="plan-schedule-toolbar__actions">
                <button type="button" className="secondary slim" onClick={onAutoRest}>
                  Auto rest pattern
                </button>
                <button
                  type="button"
                  className="primary slim theme-button"
                  onClick={onSave}
                  disabled={pending}
                >
                  {pending ? 'Saving…' : 'Save schedule'}
                </button>
              </div>
            </div>
            {days.length === 0 ? (
              <p className="plan-day-card__hint">
                This plan does not have any days yet. Add a program first, then configure the schedule.
              </p>
            ) : (
              <div className="plan-schedule-grid">
                {days.map((day) => (
                <article
                  key={`plan-day-${day.dayNumber}`}
                  className={`plan-day-card ${day.isRestDay ? 'plan-day-card--rest' : ''}`}
                >
                  <div className="plan-day-card__header">
                    <div>
                      <p className="plan-day-card__eyebrow">Day {day.dayNumber}</p>
                      <h4>{day.isRestDay ? 'Recovery' : 'Workout'}</h4>
                    </div>
                    <label className="plan-toggle">
                      <input
                        type="checkbox"
                        checked={day.isRestDay}
                        onChange={(event) => onToggleRest(day.dayNumber, event.target.checked)}
                      />
                      <span>Rest day</span>
                    </label>
                  </div>
                  {day.isRestDay ? (
                    <p className="plan-day-card__rest-note">
                      Members will see a rest message on this day. No video upload required.
                    </p>
                  ) : (
                    <div className="plan-day-card__content">
                      {day.videoThumbnail || day.videoUrl ? (
                        <div className="plan-day-card__video-preview">
                          {day.videoThumbnail ? (
                            <img src={day.videoThumbnail} alt={`Day ${day.dayNumber} thumbnail`} />
                          ) : null}
                          <div>
                            <p className="plan-day-card__video-title">
                              {day.videoTitle || 'Uploaded workout'}
                            </p>
                            {day.videoUrl ? (
                              <a href={day.videoUrl} target="_blank" rel="noreferrer">
                                Preview video
                              </a>
                            ) : null}
                            {day.videoId ? (
                              <button type="button" className="link-button" onClick={() => onClearVideo(day.dayNumber)}>
                                Remove video
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p className="plan-day-card__hint">
                          Upload a workout video and thumbnail for this day.
                        </p>
                      )}
                      <label className="upload-field">
                        <span>Workout video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(event) =>
                            onSelectFile(day.dayNumber, 'videoFile', event.target.files?.[0] || null)
                          }
                        />
                        {day.videoFile ? (
                          <small className="upload-selected">Selected: {day.videoFile.name}</small>
                        ) : null}
                      </label>
                      <label className="upload-field">
                        <span>Thumbnail</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(event) =>
                            onSelectFile(day.dayNumber, 'thumbnailFile', event.target.files?.[0] || null)
                          }
                        />
                        {day.thumbnailFile ? (
                          <small className="upload-selected">Selected: {day.thumbnailFile.name}</small>
                        ) : null}
                      </label>
                    </div>
                  )}
                </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ProgramScheduleModal
