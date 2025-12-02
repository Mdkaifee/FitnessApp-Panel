import { VIDEO_CATEGORIES, VIDEO_GENDERS } from '../constants'

function VideosView({
  videosData,
  videosLoading,
  videosError,
  videoCategory,
  uploadForm,
  updateForm,
  videoPending,
  onCategoryChange,
  onRefresh,
  setUploadForm,
  setUpdateForm,
  onUploadSubmit,
  onSelectVideoForEdit,
  onDeleteVideo,
  onUpdateSubmit,
  onResetUpdateForm,
}) {
  const list = videosData?.videos ?? []
  const uploadReady = Boolean(
    uploadForm.videoFile && uploadForm.thumbnailFile && uploadForm.title.trim(),
  )
  const updateReady =
    updateForm.videoId &&
    (updateForm.bodyPart ||
      updateForm.gender ||
      updateForm.title ||
      updateForm.description ||
      updateForm.videoFile ||
      updateForm.thumbnailFile)

  return (
    <div className="panel videos-panel">
      <div className="videos-header">
        <div>
          <h2>Video Library</h2>
          <p>
            Category: <strong>{videoCategory}</strong> ·{' '}
            {videosData?.count ?? list.length} total records from database.
          </p>
        </div>
        <div className="video-filter">
          <select value={videoCategory} onChange={(event) => onCategoryChange(event.target.value)}>
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button className="refresh-button" onClick={onRefresh}>
            {videosLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      {videosError && <p className="error-text">{videosError}</p>}
      {videosLoading ? (
        <p>Loading videos...</p>
      ) : list.length === 0 ? (
        <p>No videos available for this category.</p>
      ) : (
        <div className="video-card-grid">
          {list.map((video) => {
            const createdOn = video.created_at ? new Date(video.created_at).toLocaleDateString() : '—'
            return (
              <article className="video-card" key={video.id}>
                <div className="video-card__media">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title ?? `Video ${video.id}`} />
                  ) : (
                    <div className="video-card__placeholder">No thumbnail</div>
                  )}
                  <div className="video-card__meta">
                    <span>{video.body_part ?? '—'}</span>
                    <span className="pill neutral">{video.gender ?? '—'}</span>
                  </div>
                </div>
                <div className="video-card__content">
                  <h3>{video.title ?? 'Untitled video'}</h3>
                  <p>{video.description ?? 'No description provided.'}</p>
                  <div className="video-card__info">
                    <span>ID #{video.id}</span>
                    <span>{createdOn}</span>
                    {video.video_url && (
                      <a href={video.video_url} target="_blank" rel="noreferrer" className="link-button">
                        Watch
                      </a>
                    )}
                  </div>
                </div>
                <div className="video-card__actions">
                  <button className="secondary" onClick={() => onSelectVideoForEdit(video)}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => onDeleteVideo(video.id)}
                    disabled={videoPending === `delete-${video.id}`}
                  >
                    {videoPending === `delete-${video.id}` ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      <div className="video-forms">
        <div className="video-form">
          <h3>Upload new video</h3>
          <div className="video-form__grid">
            <label>
              Body part
              <select
                value={uploadForm.bodyPart}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, bodyPart: event.target.value }))
                }
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
                value={uploadForm.gender}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, gender: event.target.value }))
                }
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
                placeholder="Enter title"
                value={uploadForm.title}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>
            <label className="full-width">
              Description
              <textarea
                rows={3}
                placeholder="Optional description"
                value={uploadForm.description}
                onChange={(event) =>
                  setUploadForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <label>
              Video file
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime"
                onChange={(event) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    videoFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
            <label>
              Thumbnail file
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    thumbnailFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
          </div>
          <button onClick={onUploadSubmit} disabled={!uploadReady || videoPending === 'upload'}>
            {videoPending === 'upload' ? 'Publishing…' : 'Publish video'}
          </button>
        </div>
        <div className="video-form">
          <h3>Update existing video</h3>
          <div className="video-form__grid">
            <label>
              Select video
              <select
                value={updateForm.videoId}
                onChange={(event) => {
                  const selectedId = event.target.value
                  if (!selectedId) {
                    onResetUpdateForm()
                    return
                  }
                  const selectedVideo = list.find((video) => String(video.id) === selectedId)
                  if (selectedVideo) {
                    onSelectVideoForEdit(selectedVideo)
                  } else {
                    setUpdateForm((prev) => ({ ...prev, videoId: selectedId }))
                  }
                }}
              >
                <option value="">Choose a video</option>
                {list.map((video) => (
                  <option key={video.id} value={video.id}>
                    #{video.id} · {video.title ?? 'Untitled'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                type="text"
                placeholder="Leave blank to keep current"
                value={updateForm.title}
                onChange={(event) =>
                  setUpdateForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>
            <label className="full-width">
              Description
              <textarea
                rows={3}
                placeholder="Leave blank to keep current"
                value={updateForm.description}
                onChange={(event) =>
                  setUpdateForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <label>
              Body part
              <select
                value={updateForm.bodyPart}
                onChange={(event) =>
                  setUpdateForm((prev) => ({ ...prev, bodyPart: event.target.value }))
                }
              >
                <option value="">Keep current</option>
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
                value={updateForm.gender}
                onChange={(event) =>
                  setUpdateForm((prev) => ({ ...prev, gender: event.target.value }))
                }
              >
                <option value="">Keep current</option>
                {VIDEO_GENDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Replace video file
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime"
                onChange={(event) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    videoFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
            <label>
              Replace thumbnail
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    thumbnailFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
          </div>
          <div className="video-form__actions">
            <button
              className="secondary"
              onClick={onResetUpdateForm}
              type="button"
              disabled={videoPending === 'update'}
            >
              Reset
            </button>
            <button onClick={onUpdateSubmit} disabled={!updateReady || videoPending === 'update'}>
              {videoPending === 'update' ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideosView
