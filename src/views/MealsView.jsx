import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

function MealsView({
  meals,
  loading,
  error,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}) {
  return (
    <div className="foods-view">
      <header className="view-header">
        <div>
          <h2>Meals</h2>
          <p>Configure meal names, icons, and recommended ranges.</p>
        </div>
        <div className="view-header-actions">
          <button type="button" className="primary" onClick={onAddMeal}>
            + Add Meal
          </button>
        </div>
      </header>

      <section className="foods-table-card">
        <div className="table-card-head">
          <h3>Meal list ({meals.length})</h3>
        </div>
        {loading ? (
          <div className="table-placeholder">Loading meals…</div>
        ) : error ? (
          <div className="table-placeholder error">{error}</div>
        ) : meals.length === 0 ? (
          <div className="table-placeholder">No meals configured yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Recommended %</th>
                <th>Sort</th>
                <th>Icon</th>
                <th className="align-left status-cell">
                  <div className="status-cell-content">Status</div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal.id}>
                  <td>{meal.name}</td>
                  <td>{meal.key}</td>
                  <td>
                    {Math.round(meal.min_ratio * 100)}% - {Math.round(meal.max_ratio * 100)}%
                  </td>
                  <td>{meal.sort_order}</td>
                  <td>
                    {meal.icon_url ? (
                      <img
                        className="food-image-thumb"
                        src={meal.icon_url}
                        alt={meal.name}
                        loading="lazy"
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="align-left status-cell">
                    <div className="status-cell-content">
                      <span className={`status-pill ${meal.is_active ? 'success' : 'muted'}`}>
                        {meal.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" aria-label="Edit meal" onClick={() => onEditMeal(meal)}>
                        <img src={editIcon} alt="" />
                      </button>
                      <button type="button" aria-label="Delete meal" onClick={() => onDeleteMeal(meal)}>
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

export default MealsView
