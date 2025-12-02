import Swal from 'sweetalert2'
import playIcon from '../assets/play.png'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'
import { VIDEO_CATEGORIES } from "../constants"

function VideosView({
  videosData,
  videosLoading,
  videosError,
  videoCategory,
  videoPending,
  onCategoryChange,
  onRefresh,
  onEditVideo,
  onDeleteVideo,
}) {
  const list = videosData?.videos ?? []

  const handleDelete = (video) => {
    Swal.fire({
      title: 'Remove video?',
      text: `This will permanently remove "${video.title ?? 'this video'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteVideo(video.id)
      }
    })
  }

  return (
    <div className="videos-wrapper">
      <div className="videos-topbar">
        <div>
          <h2 className="videos-title">🎬 Video Library</h2>
          <p className="videos-subtitle">
            Showing <strong>{videosData?.count ?? list.length}</strong> videos in category{' '}
            <strong>{videoCategory}</strong>
          </p>
        </div>
        <div className="videos-controls">
          <select className="select" value={videoCategory} onChange={(event) => onCategoryChange(event.target.value)}>
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button className="btn btn-refresh" onClick={onRefresh}>
            {videosLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {videosError && <p className="error-text">{videosError}</p>}

      {videosLoading ? (
        <p className="loading-text">Loading videos…</p>
      ) : list.length === 0 ? (
        <div className="empty-state">No videos found in this category.</div>
      ) : (
        <div className="videos-grid">
          {list.map((video) => {
            const createdOn = video.created_at ? new Date(video.created_at).toLocaleDateString() : '—'
            return (
              <div className="video-card" key={video.id}>
                <div className="video-thumb">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title ?? 'Video thumbnail'} />
                  ) : (
                    <div className="thumb-placeholder">No Thumbnail</div>
                  )}
                </div>

                <div className="video-info">
                  <div className="video-tags">
                    <span className="tag">{video.body_part ?? '—'}</span>
                    <span className="tag">{video.gender ?? '—'}</span>
                  </div>
                  <h3 className="video-title">{video.title ?? 'Untitled Video'}</h3>
                  <p className="video-desc">{video.description ?? 'No description available.'}</p>
                </div>

                <div className="video-footer">
                  <span className="video-id">#{video.id}</span>
                  <span className="video-date">{createdOn}</span>
                </div>

                <div className="video-actions">
                  <div className="actions-right">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        if (video.video_url) {
                          window.open(video.video_url, '_blank', 'noopener,noreferrer')
                        }
                      }}
                      title={video.video_url ? 'Watch video' : 'No video attached'}
                      disabled={!video.video_url}
                    >
                      <img src={playIcon} alt="Watch video" />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEditVideo(video)}
                      title="Edit video"
                    >
                      <img src={editIcon} alt="Edit video" />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleDelete(video)}
                      disabled={videoPending === `delete-${video.id}`}
                      title="Delete video"
                    >
                      <img src={deleteIcon} alt="Delete video" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VideosView
