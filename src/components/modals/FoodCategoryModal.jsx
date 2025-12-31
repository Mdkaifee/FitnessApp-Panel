import Modal from '../shared/Modal'

function FoodCategoryModal({
  open,
  mode,
  form,
  setForm,
  pendingAction,
  onClose,
  onSubmit,
}) {
  if (!open) return null
  const title = mode === 'edit' ? 'Update Category' : 'Add Category'
  const ready = form.name.trim().length > 0

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

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
          <span>Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g., Fruits"
            required
          />
        </label>

        <label className="modal-field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={3}
            placeholder="Shown to admins only"
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
            {pendingAction ? 'Saving…' : mode === 'edit' ? 'Save Category' : 'Add Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FoodCategoryModal
