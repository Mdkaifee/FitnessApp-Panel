import { useEffect, useState } from 'react'
import Modal from '../shared/Modal'

function MealModal({
  open,
  mode,
  form,
  setForm,
  pendingAction,
  onClose,
  onSubmit,
}) {
  if (!open) return null
  const title = mode === 'edit' ? 'Update Meal' : 'Add Meal'
  const ready = form.name.trim().length > 0 && form.key.trim().length > 0
  const [previewUrl, setPreviewUrl] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (form.iconFile) {
      const objectUrl = URL.createObjectURL(form.iconFile)
      setPreviewUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    setPreviewUrl(form.iconUrl?.trim() || '')
    return undefined
  }, [form.iconFile, form.iconUrl])

  return (
    <Modal open={open} onClose={onClose} title={title} dialogClassName="food-category-modal">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready || pendingAction) return
          onSubmit()
        }}
        className="modal-form"
      >
        <label className="modal-field">
          <span>Key *</span>
          <input
            type="text"
            value={form.key}
            onChange={(event) => handleChange('key', event.target.value)}
            placeholder="e.g., breakfast"
            required
          />
        </label>

        <label className="modal-field">
          <span>Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g., Breakfast"
            required
          />
        </label>

        <label className="modal-field">
          <span>Icon</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleChange('iconFile', event.target.files?.[0] ?? null)}
          />
        </label>
        {previewUrl ? (
          <div className="meal-icon-preview">
            <span>Preview</span>
            <div className="meal-icon-preview__image">
              <img src={previewUrl} alt="Meal icon preview" />
            </div>
          </div>
        ) : null}

        <div className="modal-field-row">
          <label className="modal-field">
            <span>Min %</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={form.minRatio}
              onChange={(event) => handleChange('minRatio', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Max %</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={form.maxRatio}
              onChange={(event) => handleChange('maxRatio', event.target.value)}
            />
          </label>
        </div>

        <label className="modal-field">
          <span>Sort order</span>
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) => handleChange('sortOrder', event.target.value)}
          />
        </label>

        <label className="modal-field checkbox">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => handleChange('isActive', event.target.checked)}
          />
          <span>Active</span>
        </label>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="theme-button" disabled={!ready || pendingAction}>
            {pendingAction ? 'Saving…' : mode === 'edit' ? 'Save Meal' : 'Add Meal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default MealModal
