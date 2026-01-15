import Modal from '../shared/Modal'

function ProductModal({ open, mode, form, setForm, pendingAction, onClose, onSubmit }) {
  if (!open) return null
  const title = mode === 'edit' ? 'Update Product' : 'Add Product'
  const ready = form.title.trim().length > 0

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const imageUrl = form.imageUrl?.trim() || ''

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
          <span>Product Name *</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            placeholder="e.g., Pilates Board"
            required
          />
        </label>

        <label className="modal-field">
          <span>Subtitle</span>
          <input
            type="text"
            value={form.subtitle}
            onChange={(event) => handleChange('subtitle', event.target.value)}
            placeholder="e.g., Simple Starts Co(Optional)"
          />
        </label>

        <label className="modal-field">
          <span>Badge text</span>
          <input
            type="text"
            value={form.badgeText}
            onChange={(event) => handleChange('badgeText', event.target.value)}
            placeholder="e.g., 50% OFF"
          />
        </label>

        <label className="modal-field">
          <span>Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="modal-field">
          <span>Product Link</span>
          <input
            type="url"
            value={form.linkUrl}
            onChange={(event) => handleChange('linkUrl', event.target.value)}
            placeholder="https://example.com/product"
          />
        </label>

        <label className="modal-field">
          <span>Image upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleChange('imageFile', event.target.files?.[0] ?? null)}
          />
        </label>
        {imageUrl ? (
          <div className="meal-icon-preview">
            <span>Preview</span>
            <div className="meal-icon-preview__image">
              <img src={imageUrl} alt="Product preview" />
            </div>
          </div>
        ) : null}

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
            {pendingAction ? 'Saving…' : mode === 'edit' ? 'Save Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductModal
