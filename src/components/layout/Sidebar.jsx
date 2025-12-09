const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '/home.png' },
  { id: 'users', label: 'Users', icon: '/user.png' },
  { id: 'videos', label: 'Videos', icon: '/video.png' },
  { id: 'questions', label: 'Questions', icon: '/question.png' },
  { id: 'subscription', label: 'Subscription', icon: '/plan.png' },
]


function Sidebar({ activeView, onViewChange, signedEmail, pendingAction, onLogout }) {
  return (
    <aside className="sidebar">
  <div className="sidebar-brand">
    <img src="/splash text.png" className="sidebar-logo" />
    {/* <h2 className="sidebar-title">SIMPLE <span>STARTS</span></h2> */}
  </div>
  <div className="sidebar-divider"></div>  {/* Divider line */}
 <nav className="sidebar-nav">
  {NAV_ITEMS.map((item) => (
    <button
      key={item.id}
      className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
      onClick={() => onViewChange(item.id)}
    >
      <img src={item.icon} className="nav-icon-img" alt={item.label} />
      <span>{item.label}</span>
    </button>
  ))}
</nav>


 <button className="logout-button" onClick={onLogout}>
  <img src="/logout.png" className="nav-icon-img" alt="logout" />
  Log Out
</button>

</aside>

  )
}

export default Sidebar
