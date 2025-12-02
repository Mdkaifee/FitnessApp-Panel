function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="ghost-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
