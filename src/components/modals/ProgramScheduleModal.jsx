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
                {days.map((day) => {
                  const uploadReady = Boolean(day.videoId || day.videoUrl || day.videoFile)
                  const thumbnailReady = Boolean(day.thumbnailFile || day.videoThumbnail)
                  const cardClasses = [
                    'plan-day-card',
                    day.isRestDay ? 'plan-day-card--rest' : '',
                    !day.isRestDay && !uploadReady ? 'plan-day-card--pending' : '',
                    !day.isRestDay && uploadReady ? 'plan-day-card--complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <article key={`plan-day-${day.dayNumber}`} className={cardClasses}>
                      <div className="plan-day-card__header">
                        <div>
                          <p className="plan-day-card__eyebrow">Day {day.dayNumber}</p>
                          <h4>{day.isRestDay ? 'Recovery' : 'Workout'}</h4>
                          <span
                            className={`plan-day-card__badge ${
                              day.isRestDay ? 'plan-day-card__badge--rest' : ''
                            }`}
                          >
                            {day.isRestDay
                              ? 'Rest & recharge'
                              : uploadReady
                              ? 'Upload ready'
                              : 'Upload pending'}
                          </span>
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
                                {(day.videoUrl || day.videoId) ? (
                                  <div className="plan-day-card__actions">
                                    {day.videoUrl ? (
                                      <a
                                        href={day.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="plan-action-button"
                                      >
                                        Preview video
                                      </a>
                                    ) : null}
                                    {day.videoId ? (
                                      <button
                                        type="button"
                                        className="plan-action-button plan-action-button--ghost"
                                        onClick={() => onClearVideo(day.dayNumber)}
                                      >
                                        Remove video
                                      </button>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <p className="plan-day-card__hint">
                              Upload a workout video and thumbnail for this day.
                            </p>
                          )}

                          <div className="plan-day-card__divider" />

                          <div className="plan-day-card__upload-row">
                            <label className="upload-field upload-field--inline">
                              <span>Workout video</span>
                              <div className="upload-picker">
                                <span className="upload-picker__button">Choose file</span>
                                <span className="upload-picker__text">
                                  {day.videoFile?.name || day.videoTitle || 'No file chosen'}
                                </span>
                                <input
                                  type="file"
                                  className="upload-picker__input"
                                  accept="video/*"
                                  onChange={(event) =>
                                    onSelectFile(day.dayNumber, 'videoFile', event.target.files?.[0] || null)
                                  }
                                />
                              </div>
                            </label>

                            <label className="upload-field upload-field--inline">
                              <span>Thumbnail</span>
                              <div className="upload-picker">
                                <span className="upload-picker__button">Choose file</span>
                                <span className="upload-picker__text">
                                  {day.thumbnailFile?.name ||
                                    (day.videoThumbnail ? 'Existing thumbnail' : 'No file chosen')}
                                </span>
                                <input
                                  type="file"
                                  className="upload-picker__input"
                                  accept="image/png,image/jpeg"
                                  onChange={(event) =>
                                    onSelectFile(day.dayNumber, 'thumbnailFile', event.target.files?.[0] || null)
                                  }
                                />
                              </div>
                            </label>
                          </div>

                          <div className="plan-day-card__status-row">
                            <span
                              className={`plan-pill ${uploadReady ? 'plan-pill--success' : 'plan-pill--warning'}`}
                            >
                              {uploadReady ? 'Video ready' : 'Awaiting video'}
                            </span>
                            <span
                              className={`plan-pill ${thumbnailReady ? 'plan-pill--info' : 'plan-pill--muted'}`}
                            >
                              {thumbnailReady ? 'Thumbnail set' : 'Thumbnail missing'}
                            </span>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ProgramScheduleModal
