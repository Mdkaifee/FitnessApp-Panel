import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'

function ProductsView({
  products,
  loading,
  error,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  const items = Array.isArray(products) ? products : []

  return (
    <div className="foods-view products-view">
      <header className="view-header">
        <div />
        <div className="view-header-actions">
          <button type="button" className="primary" onClick={onAddProduct}>
            + Add Product
          </button>
        </div>
      </header>

      <section className="foods-table-card">
        <div className="table-card-head">
          <h3>Products ({items.length})</h3>
        </div>
        {loading ? (
          <div className="table-placeholder">Loading products…</div>
        ) : error ? (
          <div className="table-placeholder error">{error}</div>
        ) : items.length === 0 ? (
          <div className="table-placeholder">No products yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Badge</th>
                <th>Description</th>
                <th>Link</th>
                <th className="align-left status-cell">
                  <div className="status-cell-content">Status</div>
                </th>
                <th>Sort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="food-name-cell">
                      <div>
                        <div className="table-primary-text">{product.title}</div>
                        {product.subtitle ? (
                          <div className="table-secondary-text">{product.subtitle}</div>
                        ) : null}
                      </div>
                      {product.image_url ? (
                        <img
                          className="food-image-thumb"
                          src={product.image_url}
                          alt={product.title ?? 'Product'}
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td>{product.badge_text ?? '—'}</td>
                  <td>{product.description ?? '—'}</td>
                  <td>
                    {product.link_url ? (
                      <a href={product.link_url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="align-left status-cell">
                    <div className="status-cell-content">
                      <span
                        className={`status-pill ${product.is_active ? 'success' : 'muted'}`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td>{product.sort_order ?? 0}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        aria-label="Edit product"
                        onClick={() => onEditProduct(product)}
                      >
                        <img src={editIcon} alt="" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete product"
                        onClick={() => onDeleteProduct(product)}
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

export default ProductsView
