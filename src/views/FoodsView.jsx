import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

function FoodsView({
  foodsData,
  foodsLoading,
  foodsError,
  categories,
  filters,
  onFiltersChange,
  onAddFood,
  onEditFood,
  onDeleteFood,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onRefresh,
}) {
  const items = foodsData?.items ?? []
  const handleSearchChange = (event) => {
    onFiltersChange?.({ ...filters, search: event.target.value })
  }
  const handleCategoryChange = (event) => {
    onFiltersChange?.({ ...filters, categoryId: event.target.value })
  }
  const handleIncludeInactiveChange = (event) => {
    onFiltersChange?.({ ...filters, includeInactive: event.target.checked })
  }

  return (
    <div className="foods-view">
      <header className="view-header">
        <div>
          <h2>Food Library</h2>
          <p>Manage the foods available for users to log manually.</p>
        </div>
        <div className="view-header-actions">
          <button type="button" className="primary" onClick={onAddCategory}>
            + Add Category
          </button>
          <button type="button" className="primary" onClick={onAddFood}>
            + Add Food
          </button>
        </div>
      </header>

      <section className="foods-filters">
        <label className="filter-text-field">
          <span>Search foods</span>
          <input
            type="text"
            placeholder="Search by name or brand"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </label>
        <label className="filter-select">
          <span>Category</span>
          <select value={filters.categoryId} onChange={handleCategoryChange}>
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {!cat.is_active ? ' (archived)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.includeInactive}
            onChange={handleIncludeInactiveChange}
          />
          <span>Include archived</span>
        </label>
        <button type="button" className="ghost" onClick={onRefresh}>
          Refresh
        </button>
      </section>

      <section className="foods-table-card">
        <div className="table-card-head">
          <h3>Foods ({foodsData?.total ?? items.length})</h3>
        </div>
        {foodsLoading ? (
          <div className="table-placeholder">Loading foods…</div>
        ) : foodsError ? (
          <div className="table-placeholder error">{foodsError}</div>
        ) : items.length === 0 ? (
          <div className="table-placeholder">No foods match your filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Calories / serving</th>
                <th>Macros (g)</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((food) => (
                <tr key={food.id}>
                  <td>
                    <div className="table-primary-text">{food.product_name}</div>
                    {food.serving_quantity ? (
                      <div className="table-secondary-text">
                        {food.serving_quantity} {food.serving_unit ?? 'serving'}
                      </div>
                    ) : null}
                  </td>
                  <td>{food.category_name ?? '—'}</td>
                  <td>{food.calories != null ? `${food.calories.toFixed(0)} kcal` : '—'}</td>
                  <td>
                    <div className="macro-pill">
                      <span>P {food.protein != null ? food.protein.toFixed(1) : '—'}</span>
                      <span>C {food.carbs != null ? food.carbs.toFixed(1) : '—'}</span>
                      <span>F {food.fat != null ? food.fat.toFixed(1) : '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${food.is_active ? 'success' : 'muted'}`}>
                      {food.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" aria-label="Edit food" onClick={() => onEditFood(food)}>
                        <img src={editIcon} alt="" />
                      </button>
                      <button
                        type="button"
                        aria-label="Archive food"
                        onClick={() => onDeleteFood(food)}
                      >
                        <img src={deleteIcon} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="foods-category-card">
        <div className="table-card-head">
          <h3>Categories</h3>
          <p>Organize foods users browse inside the app.</p>
        </div>
        {categories.length === 0 ? (
          <div className="table-placeholder">No categories yet.</div>
        ) : (
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.sort_order}</td>
                  <td>
                    <span className={`status-pill ${cat.is_active ? 'success' : 'muted'}`}>
                      {cat.is_active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" aria-label="Edit category" onClick={() => onEditCategory(cat)}>
                        <img src={editIcon} alt="" />
                      </button>
                      <button
                        type="button"
                        aria-label="Archive category"
                        onClick={() => onDeleteCategory(cat)}
                      >
                        <img src={deleteIcon} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default FoodsView
