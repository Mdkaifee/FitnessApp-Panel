function StatusBanner({ status }) {
  if (!status?.text) return null
  return (
    <div className={`status-banner ${status.type}`}>
      <p>{status.text}</p>
    </div>
  )
}

export default StatusBanner
