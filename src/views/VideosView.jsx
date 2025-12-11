import { useMemo } from 'react'
import Swal from 'sweetalert2'
import playIcon from '../assets/play.png'
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'
import { VIDEO_CATEGORIES } from '../constants'

const normalizeKey = (value) => {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim().toLowerCase()
  return String(value).trim().toLowerCase()
}

const collapseKey = (value) => normalizeKey(value).replace(/[^a-z0-9]/g, '')

export const ALL_VIDEOS_CATEGORY = '__all__'

function VideosView({
  videosData,
  videosLoading,
  videosError,
  videoCategory,
  videoGender,
  videoPending,
  onCategoryChange,
  onGenderChange,
  onResetFilters,
  onRefresh,
  onEditVideo,
  onDeleteVideo,
  onUploadVideo,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const list = videosData?.videos ?? []

  const categoryCounts = useMemo(() => {
    const payloadCounts =
      videosData?.category_counts ?? videosData?.categoryCounts ?? videosData?.counts ?? null
    if (payloadCounts && typeof payloadCounts === 'object') return payloadCounts
    return {}
  }, [videosData])

  const categoryCountsLookup = useMemo(() => {
    return Object.entries(categoryCounts ?? {}).reduce((acc, [key, value]) => {
      const normalizedKey = normalizeKey(key)
      const collapsedKey = collapseKey(key)
      const numericValue = Number(value) || 0
      acc[key] = numericValue
      if (normalizedKey) acc[normalizedKey] = numericValue
      if (collapsedKey) acc[collapsedKey] = numericValue
      return acc
    }, {})
  }, [categoryCounts])

  const totalVideos = useMemo(() => {
    const entries = Object.values(categoryCounts)
    if (entries.length > 0) {
      return entries.reduce((sum, value) => sum + (Number(value) || 0), 0)
    }
    return videosData?.total ?? list.length
  }, [categoryCounts, videosData, list.length])

  const pageNumbers = useMemo(() => {
    const pages = []
    const safeTotal = Math.max(1, totalPages)
    for (let i = 1; i <= safeTotal; i += 1) {
      pages.push(i)
    }
    return pages
  }, [totalPages])

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

  const getGenderIcon = (gender = '') => {
    const normalized = String(gender).trim().toLowerCase()
    if (normalized === 'female') return '/female.png'
    if (normalized === 'male') return '/male.png'
    return '/male.png'
  }

  const formatDuration = (video) => {
    const raw =
      video?.duration ??
      video?.duration_label ??
      video?.durationLabel ??
      video?.length ??
      video?.duration_seconds ??
      video?.durationSeconds
    if (raw == null) return ''
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      const minutes = Math.floor(raw / 60)
      const seconds = Math.floor(raw % 60)
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    if (typeof raw === 'string') return raw
    return ''
  }

  const handleBodyPartSelect = (value) => {
    if (!value) {
      onCategoryChange?.(ALL_VIDEOS_CATEGORY)
      return
    }
    onCategoryChange?.(value)
  }

  const handleGenderSelect = (value) => {
    onGenderChange?.(value)
  }

  const currentBodyPartValue = videoCategory === ALL_VIDEOS_CATEGORY ? '' : videoCategory
  const normalizedBodyPartFilter = normalizeKey(currentBodyPartValue)
  const normalizedGenderFilter = normalizeKey(videoGender)
  const shouldFilterCategory = Boolean(normalizedBodyPartFilter)
  const shouldFilterGender =
    normalizedGenderFilter.length > 0 && normalizedGenderFilter !== 'all'

  const filteredList = useMemo(() => {
    if (!shouldFilterCategory && !shouldFilterGender) return list
    return list.filter((video) => {
      const videoBodyPart = normalizeKey(video?.body_part ?? video?.bodyPart ?? '')
      const videoGenderValue = normalizeKey(video?.gender ?? '')
      const matchesCategory = !shouldFilterCategory || videoBodyPart === normalizedBodyPartFilter
      const matchesGender = !shouldFilterGender || videoGenderValue === normalizedGenderFilter
      return matchesCategory && matchesGender
    })
  }, [list, normalizedBodyPartFilter, normalizedGenderFilter, shouldFilterCategory, shouldFilterGender])

  return (
    <div className="videos-wrapper">
      <div className="videos-filter-card">
        <button type="button" className="filter-icon-button" aria-label="Filter videos">
          <img src="/filter.png" alt="Filter" />
        </button>
        <button
          type="button"
          className={`video-filter-chip${videoCategory === ALL_VIDEOS_CATEGORY && videoGender === 'All' ? ' active' : ''}`}
          onClick={() => onResetFilters?.()}
        >
          All Videos ({totalVideos})
        </button>
        <div className="video-filter-selects">
          <label className="filter-select">
            <select
              value={currentBodyPartValue}
              onChange={(event) => handleBodyPartSelect(event.target.value || ALL_VIDEOS_CATEGORY)}
            >
              <option value="">All body parts</option>
              {VIDEO_CATEGORIES.map((cat) => {
                const collapsedKey = collapseKey(cat.value)
                const normalizedCatValue = normalizeKey(cat.value)
                const count =
                  categoryCountsLookup?.[cat.value] ??
                  categoryCountsLookup?.[normalizedCatValue] ??
                  categoryCountsLookup?.[collapsedKey] ??
                  0
                return (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} ({count})
                  </option>
                )
              })}
            </select>
          </label>
          {/* <label className="filter-select">
            <select value={videoGender} onChange={(event) => handleGenderSelect(event.target.value)}>
              {['All', 'Male', 'Female'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label> */}
          {/* <button
            type="button"
            className="videos-refresh-button"
            onClick={onRefresh}
            aria-label="Refresh videos"
          >
            ↻
          </button> */}
        </div>
        <div className="videos-filter-actions">
          <button
            type="button"
            className="videos-upload-button"
            onClick={onUploadVideo}
            disabled={!onUploadVideo}
          >
            <span aria-hidden="true" className="videos-upload-icon">
              <img src="/download.png" alt="" width="18" height="18" />
            </span>
            Upload Video
          </button>
        </div>
      </div>

      {videosError && <p className="error-text">{videosError}</p>}

      {videosLoading ? (
        <p className="loading-text">Loading videos…</p>
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          {list.length === 0 ? 'No videos found in this category.' : 'No videos match the selected filters.'}
        </div>
      ) : (
        <>
          <div className="videos-grid">
            {filteredList.map((video) => {
              const durationLabel = formatDuration(video)
              const genderIcon = getGenderIcon(video.gender)
              const categoryLabel = video.body_part ?? '—'
              return (
                <div className="video-card" key={video.id}>
                  <div className="video-thumb">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title ?? 'Video thumbnail'} />
                    ) : (
                      <div className="thumb-placeholder">No Thumbnail</div>
                    )}
                    <span className="video-thumb-badge">{categoryLabel}</span>
                    {durationLabel ? <span className="video-thumb-duration">{durationLabel}</span> : null}
                  </div>

                  <div className="video-card-body">
                    <h3 className="video-card-title">{video.title ?? 'Untitled Video'}</h3>
                    <p className="video-card-desc">{video.description ?? 'No description available.'}</p>
                  </div>

                  <div className="video-card-footer">
                    {/* <div className="video-gender-icon" title={video.gender ?? 'Gender'}>
                      <img src={genderIcon} alt={video.gender ?? 'Gender'} />
                    </div> */}
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
                </div>
              )
            })}
          </div>
          <div className="videos-pagination">
            <button
              type="button"
              className="pagination-nav-button"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1 || videosLoading}
            >
              Prev
            </button>
            <div className="pagination-pages">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-chip${pageNumber === currentPage ? ' active' : ''}`}
                  onClick={() => onPageChange?.(pageNumber)}
                  disabled={pageNumber === currentPage || videosLoading}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="pagination-nav-button"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages || videosLoading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default VideosView
