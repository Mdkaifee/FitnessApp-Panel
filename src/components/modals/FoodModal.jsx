import Modal from '../shared/Modal'

function FoodModal({
  open,
  mode,
  form,
  setForm,
  categories,
  pendingAction,
  onClose,
  onSubmit,
}) {
  if (!open) return null
  const title = mode === 'edit' ? 'Update Food' : 'Add Food'
  const ready = form.name.trim().length > 0 && Number(form.calories) > 0
  const isUploading = pendingAction === 'uploading'
  const isSaving = Boolean(pendingAction)
  const primaryLabel = isUploading
    ? 'Uploading…'
    : pendingAction
      ? 'Saving…'
      : mode === 'edit'
        ? 'Save Food'
        : 'Add Food'

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, imageFile: file }))
  }

  const handleClearImageFile = () => {
    setForm((prev) => ({ ...prev, imageFile: null }))
  }

  const handleRemoveImageUrl = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }))
  }

  return (
    <Modal open={open} onClose={onClose} title={title} dialogClassName="food-modal">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready || pendingAction) return
          onSubmit()
        }}
        className="modal-form"
      >
        <label className="modal-field">
          <span>Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g., Apple"
            required
          />
        </label>

        <label className="modal-field">
          <span>Brand / subtitle</span>
          <input
            type="text"
            value={form.brand}
            onChange={(event) => handleChange('brand', event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="modal-field">
          <span>Food image (optional)</span>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {form.imageFile ? (
            <div className="food-image-selected">
              <span>Selected: {form.imageFile.name}</span>
              <button type="button" className="secondary slim" onClick={handleClearImageFile}>
                Clear
              </button>
            </div>
          ) : null}
          {!form.imageFile && form.imageUrl ? (
            <div className="food-image-preview">
              <img src={form.imageUrl} alt="Food preview" />
              <button type="button" className="secondary slim" onClick={handleRemoveImageUrl}>
                Remove image
              </button>
            </div>
          ) : null}
          {!form.imageFile && !form.imageUrl ? (
            <span className="field-hint">Upload a JPG or PNG to show in the app.</span>
          ) : null}
        </label>

        <div className="modal-field-row">
          <label className="modal-field">
            <span>Calories *</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.calories}
              onChange={(event) => handleChange('calories', event.target.value)}
              required
            />
          </label>
          <label className="modal-field">
            <span>Protein (g)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.protein}
              onChange={(event) => handleChange('protein', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Carbs (g)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.carbs}
              onChange={(event) => handleChange('carbs', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Fat (g)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.fat}
              onChange={(event) => handleChange('fat', event.target.value)}
            />
          </label>
        </div>

        <div className="modal-field-row">
          <label className="modal-field">
            <span>Serving quantity</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.servingQuantity}
              onChange={(event) => handleChange('servingQuantity', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Serving unit</span>
            <input
              type="text"
              value={form.servingUnit}
              onChange={(event) => handleChange('servingUnit', event.target.value)}
              placeholder="serving, cup, tbsp…"
            />
          </label>
          <label className="modal-field">
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) => handleChange('categoryId', event.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

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
          <button type="submit" className="theme-button" disabled={!ready || isSaving}>
            {primaryLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FoodModal
