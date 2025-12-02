const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'questions', label: 'Questions', icon: '❓' },
  { id: 'subscription', label: 'Subscription', icon: '💳' },
]

function Sidebar({ activeView, onViewChange, signedEmail, pendingAction, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">FC</div>
        <div>
          <p className="brand-title">Fitness Cassie</p>
          <span>Admin Suite</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={activeView === item.id ? 'active' : ''}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-section">
        <p className="sidebar-label">Signed in as</p>
        <p className="sidebar-email">{signedEmail}</p>
      </div>
      <div className="sidebar-footer">
        <button className="secondary" onClick={onLogout} disabled={pendingAction === 'logout'}>
          {pendingAction === 'logout' ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
