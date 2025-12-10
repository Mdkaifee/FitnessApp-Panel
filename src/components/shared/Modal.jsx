function Modal({ open, title, children, onClose, dialogClassName = '' }) {
  if (!open) return null

  const bodyClassName = title ? 'modal-body' : 'modal-body modal-body--no-header'
  const dialogClasses = ['modal-dialog', dialogClassName].filter(Boolean).join(' ')

  return (
    <div className="modal-backdrop">
      <div className={dialogClasses} role="dialog" aria-modal="true" aria-label={title ?? undefined}>
        {title ? (
          <header className="modal-header">
            <h3>{title}</h3>
            <button className="ghost-button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </header>
        ) : null}
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
