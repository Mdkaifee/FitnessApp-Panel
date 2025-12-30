import { useMemo, useState } from 'react'
import { buildMediaUrl } from '../utils/media'

const ExerciseLibraryView = ({
  items = [],
  isLoading = false,
  error,
  pendingId = '',
  onSave,
}) => {
  const [libraryDrafts, setLibraryDrafts] = useState({})
  const sortedItems = useMemo(() => {
    if (!Array.isArray(items)) return []
    return [...items].sort(
      (a, b) =>
        (Number(a?.sort_order ?? a?.sortOrder) || 0) -
        (Number(b?.sort_order ?? b?.sortOrder) || 0),
    )
  }, [items])

  const handleTitleChange = (itemId, value) => {
    setLibraryDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        title: value,
      },
    }))
  }

  const handleFileChange = (itemId, file) => {
    setLibraryDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        file,
      },
    }))
  }

  const handleSave = async (item) => {
    if (!onSave) return
    const draft = libraryDrafts[item.id] ?? {}
    const title = typeof draft.title === 'string' ? draft.title : item.title
    const file = draft.file ?? null
    const didSave = await onSave(item.id, { title, file })
    if (didSave) {
      setLibraryDrafts((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
  }

  return (
    <div className="videos-wrapper">
      <div className="exercise-library-panel">
        <div className="exercise-library-header">
          <div>
            <h3>Exercise Library Cards</h3>
            <p>Update titles and cover images shown on the app home screen.</p>
          </div>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {isLoading ? (
          <p className="loading-text">Loading exercise library…</p>
        ) : (
          <div className="exercise-library-grid">
            {sortedItems.map((item) => {
              const draft = libraryDrafts[item.id] ?? {}
              const titleValue =
                typeof draft.title === 'string' ? draft.title : item.title ?? ''
              const isPending = String(pendingId) === String(item.id)
              const hasChanges =
                Boolean(draft.file) ||
                (typeof draft.title === 'string' &&
                  draft.title.trim() &&
                  draft.title.trim() !== (item.title ?? '').trim())
              const coverUrl = buildMediaUrl(
                item.cover_image_url ?? item.coverImageUrl ?? '',
              )
              return (
                <div key={item.id} className="exercise-library-card">
                  <div className="exercise-library-cover">
                    {coverUrl ? (
                      <img src={coverUrl} alt={item.title ?? 'Cover'} />
                    ) : (
                      <div className="exercise-library-cover-placeholder">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="exercise-library-meta">
                    <span className="exercise-library-slug">{item.slug}</span>
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(event) =>
                        handleTitleChange(item.id, event.target.value)
                      }
                      placeholder="Card title"
                    />
                  </div>
                  <div className="exercise-library-actions">
                    <label className="exercise-library-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const [file] = event.target.files ?? []
                          if (file) {
                            handleFileChange(item.id, file)
                          }
                          event.target.value = ''
                        }}
                      />
                      {draft.file ? 'Cover selected' : 'Change cover'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSave(item)}
                      disabled={isPending || !hasChanges}
                    >
                      {isPending ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseLibraryView
