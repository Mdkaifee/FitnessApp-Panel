import Modal from '../shared/Modal'
import { VIDEO_CATEGORIES, VIDEO_GENDERS } from '../../constants'

function VideoModal({ open, mode, form, setForm, pendingAction, onClose, onSubmit }) {
  if (!open) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field) => (event) => {
    const file = event.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, [field]: file }))
  }

  const uploadDisabled =
    mode === 'create' && !(form.videoFile && form.thumbnailFile && form.title.trim())

  const primaryLabel = pendingAction ? 'Saving…' : mode === 'create' ? 'Publish video' : 'Save changes'
  const modalTitle = mode === 'create' ? 'Upload New Video' : 'Update Video'

  return (
    <Modal open={open} onClose={onClose} dialogClassName="video-modal-dialog">
      <div className="video-modal">
        <div className="video-modal-header">
          <div>
            <p className="video-modal-tag">Media library</p>
            <h2>{modalTitle}</h2>
          </div>
          <button
            type="button"
            className="video-modal-close"
            onClick={onClose}
            aria-label="Close upload modal"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12m0-12L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="video-modal-form modal-form">
          <section className="video-section">
            <div className="video-section-head">
              <h4>Video Details</h4>
              <p>Organize the clip with clear metadata to help viewers find and understand your content.</p>
            </div>
            <div className="video-field-row">
              <label className="video-field">
                <span className="video-field-label">
                  Video Title <span className="required">*</span>
                </span>
                <input
                  type="text"
                  placeholder="Enter a descriptive title for your video"
                  value={form.title}
                  onChange={handleFieldChange('title')}
                  required={mode === 'create'}
                />
              </label>
              <label className="video-field">
                <span className="video-field-label">
                  Target Gender <span className="required">*</span>
                </span>
                <select value={form.gender} onChange={handleFieldChange('gender')}>
                  {VIDEO_GENDERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="video-field-row video-field-row--focus">
              <label className="video-field">
                <span className="video-field-label">
                  Body Part Focus <span className="required">*</span>
                </span>
                <select value={form.bodyPart} onChange={handleFieldChange('bodyPart')}>
                  {VIDEO_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="video-field">
                <span className="video-field-label">Description</span>
                <input
                  type="text"
                  placeholder="Write a short overview for your video"
                  value={form.description}
                  onChange={handleFieldChange('description')}
                  maxLength={50}
                />
                <span className="video-field-hint">Max 50 characters</span>
              </label>
            </div>
          </section>

          <section className="video-section">
            <div className="video-section-head">
              <h4>Media Files</h4>
              <p>Upload assets</p>
            </div>
            <div className="video-upload-row">
              <label className="upload-dropzone" htmlFor="video-upload-input">
                <input
                  id="video-upload-input"
                  className="upload-input"
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime"
                  onChange={handleFileChange('videoFile')}
                  required={mode === 'create'}
                />
                <span className="upload-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 5v14m0-14l-4 4m4-4l4 4M6 19h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="upload-title">Drop video file or click to upload</p>
                <p className="upload-hint">MP4, MPEG, or MOV up to 500 MB.</p>
                {form.videoFile ? <p className="upload-selected">Selected: {form.videoFile.name}</p> : null}
              </label>

              <label className="upload-dropzone" htmlFor="thumbnail-upload-input">
                <input
                  id="thumbnail-upload-input"
                  className="upload-input"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange('thumbnailFile')}
                  required={mode === 'create'}
                />
                <span className="upload-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M4 16l4-4 4 4 4-4 4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <p className="upload-title">Drop thumbnail or click to upload</p>
                <p className="upload-hint">PNG or JPG, minimum 800×600px.</p>
                {form.thumbnailFile ? (
                  <p className="upload-selected">Selected: {form.thumbnailFile.name}</p>
                ) : null}
              </label>
            </div>
          </section>

          <div className="modal-actions video-modal-actions">
            <button type="submit" disabled={pendingAction || (mode === 'create' && uploadDisabled)}>
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 5v12m0 0l-4-4m4 4l4-4M5 19h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {primaryLabel}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default VideoModal
