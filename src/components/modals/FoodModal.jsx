import { useEffect, useRef } from 'react'
import Modal from '../shared/Modal'

function FoodModal({
  open,
  mode,
  form,
  setForm,
  categories,
  pendingAction,
  usdaResults,
  usdaLoading,
  usdaError,
  usdaDetailLoading,
  usdaSelected,
  onUsdaSearch,
  onUsdaSelect,
  onClose,
  onSubmit,
}) {
  if (!open) return null
  const title = mode === 'edit' ? 'Update Food' : 'Add Food'
  const toNumber = (value) => {
    if (value === '' || value == null) return null
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  const caloriesPer100gValue = toNumber(form.caloriesPer100g)
  const hasCaloriesPer100g = caloriesPer100gValue != null && caloriesPer100gValue > 0
  const ready = form.name.trim().length > 0 && hasCaloriesPer100g
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
    if (field === 'name') {
      nameTouchedRef.current = true
    }
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

  const searchTimeoutRef = useRef(null)
  const lastQueryRef = useRef('')
  const suppressNextSearchRef = useRef(false)
  const nameTouchedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    nameTouchedRef.current = false
    lastQueryRef.current = ''
    suppressNextSearchRef.current = false
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }, [open])

  useEffect(() => {
    if (usdaSelected) {
      suppressNextSearchRef.current = true
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [usdaSelected])

  useEffect(() => {
    if (!open || !onUsdaSearch) return undefined
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false
      return undefined
    }
    if (!nameTouchedRef.current) return undefined
    const query = form.name.trim()
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (query.length < 2) {
      if (lastQueryRef.current !== '') {
        lastQueryRef.current = ''
        onUsdaSearch('')
      }
      return undefined
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (query !== lastQueryRef.current) {
        lastQueryRef.current = query
        onUsdaSearch(query)
      }
    }, 350)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [form.name, onUsdaSearch, open])

  const formatMacroValue = (value, digits = 1) => {
    if (!Number.isFinite(value)) return null
    return value.toFixed(digits).replace(/\.?0+$/, '')
  }

  const servingNameValue = form.defaultServingName?.trim() || ''
  const servingGramsValue = toNumber(form.defaultServingGrams)
  const servingLabel =
    servingNameValue || (Number.isFinite(servingGramsValue) ? `${servingGramsValue} g` : '100 g')
  const showUsdaResults = Array.isArray(usdaResults) && usdaResults.length > 0
  const showUsdaPanel = usdaLoading || usdaDetailLoading || usdaError || showUsdaResults

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

        {showUsdaPanel ? (
          <div className="usda-search">
            {usdaLoading ? <div className="usda-status">Searching USDA…</div> : null}
            {usdaDetailLoading ? (
              <div className="usda-status">Loading USDA nutrition…</div>
            ) : null}
            {usdaError ? <div className="usda-status error">{usdaError}</div> : null}
            {showUsdaResults ? (
              <div className="usda-results">
                {usdaResults.map((item) => {
                  const isSelected = usdaSelected?.fdcId === item.fdcId
                  const calories = toNumber(item.calories)
                  const protein = toNumber(item.protein)
                  const carbs = toNumber(item.carbs)
                  const fat = toNumber(item.fat)
                  const macroParts = []
                  const caloriesLabel = formatMacroValue(calories, 0)
                  if (caloriesLabel) macroParts.push(`${caloriesLabel} kcal`)
                  const proteinLabel = formatMacroValue(protein)
                  if (proteinLabel) macroParts.push(`P ${proteinLabel}g`)
                  const carbsLabel = formatMacroValue(carbs)
                  if (carbsLabel) macroParts.push(`C ${carbsLabel}g`)
                  const fatLabel = formatMacroValue(fat)
                  if (fatLabel) macroParts.push(`F ${fatLabel}g`)
                  const macroLabel = macroParts.length ? ` (${macroParts.join(' · ')})` : ''
                  return (
                    <button
                      key={item.fdcId}
                      type="button"
                      className={`usda-result ${isSelected ? 'selected' : ''}`}
                      onClick={() => onUsdaSelect?.(item)}
                      disabled={usdaDetailLoading}
                    >
                      <div className="usda-result__title">{item.description}</div>
                      <div className="usda-result__meta">
                        {item.brandOwner ? item.brandOwner : 'Unbranded'}
                        {macroLabel}
                        {item.foodCategory ? ` (${item.foodCategory})` : ''} · {item.dataType}
                        {isSelected ? ' · Selected' : ''}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

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

        <div className="field-hint">Macros below are calculated per 100 g.</div>

        <div className="modal-field-row">
          <label className="modal-field">
            <span>Calories</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.caloriesPer100g}
              onChange={(event) => handleChange('caloriesPer100g', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Protein</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.proteinPer100g}
              onChange={(event) => handleChange('proteinPer100g', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Carbs</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.carbsPer100g}
              onChange={(event) => handleChange('carbsPer100g', event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span>Fat</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.fatPer100g}
              onChange={(event) => handleChange('fatPer100g', event.target.value)}
            />
          </label>
        </div>

        {form.source ? (
          <div className="field-hint">Serving: {servingLabel}</div>
        ) : null}

        <div className="modal-field-row">
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
        {form.source ? (
          <div className="usda-source">
            Source: {form.source}
            {form.sourceItemId ? ` · ID ${form.sourceItemId}` : ''}
          </div>
        ) : null}

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
