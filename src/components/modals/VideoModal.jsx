import Modal from '../shared/Modal'
import { VIDEO_CATEGORIES, VIDEO_GENDERS } from '../../constants'

function VideoModal({
  open,
  mode,
  form,
  setForm,
  pendingAction,
  onClose,
  onSubmit,
}) {
  if (!open) return null

  const uploadDisabled =
    mode === 'create' && !(form.videoFile && form.thumbnailFile && form.title.trim())

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Upload new video' : 'Update video'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <section className="modal-section">
          <header>
            <h4>Video details</h4>
            <p>Organize the clip with clear metadata.</p>
          </header>
          <div className="modal-grid">
            <label>
              Body part
              <select
                value={form.bodyPart}
                onChange={(event) => setForm((prev) => ({ ...prev, bodyPart: event.target.value }))}
              >
                {VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
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
                {VIDEO_GENDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                type="text"
                placeholder="Highlight the focus"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required={mode === 'create'}
              />
            </label>
            <label>
              Description
              <input
                type="text"
                placeholder="Optional short blurb"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
          </div>
        </section>
        <section className="modal-section">
          <header>
            <h4>Media files</h4>
            <p>Upload the clip and an eye-catching thumbnail.</p>
          </header>
          <div className="modal-grid">
            <label>
              Video file
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    videoFile: event.target.files?.[0] ?? null,
                  }))
                }
                required={mode === 'create'}
              />
              <p className="file-helper">MP4, MPEG, or MOV up to 500 MB.</p>
            </label>
            <label>
              Thumbnail file
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnailFile: event.target.files?.[0] ?? null,
                  }))
                }
                required={mode === 'create'}
              />
              <p className="file-helper">PNG or JPG, minimum 800×600px.</p>
            </label>
          </div>
        </section>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={pendingAction || (mode === 'create' && uploadDisabled)}>
            {pendingAction ? 'Saving…' : mode === 'create' ? 'Publish video' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default VideoModal
