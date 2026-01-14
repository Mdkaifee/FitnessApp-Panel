import { useState } from 'react'
import Modal from '../shared/Modal'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '/home.png' },
  { id: 'users', label: 'Users', icon: '/user.png' },
  { id: 'videos', label: 'Videos', icon: '/video.png' },
  { id: 'exerciseLibrary', label: 'Exercise Library', icon: '/plan.png' },
  { id: 'questions', label: 'Questions', icon: '/question.png' },
  { id: 'programs', label: 'Programs', icon: '/plan.png' },
  { id: 'foods', label: 'Foods', icon: '/food.png' },
  { id: 'meals', label: 'Meals', icon: '/meals.png' },
  { id: 'products', label: 'Products', icon: '/product.png' },
  { id: 'privacyPolicy', label: 'Legal Documents', icon: '/legal.png' },
]


function Sidebar({ activeView, onViewChange, signedEmail, pendingAction, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
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


 <button className="logout-button" onClick={() => setShowLogoutConfirm(true)}>
  <img src="/logout.png" className="nav-icon-img" alt="logout" />
  Log Out
</button>

<Modal open={showLogoutConfirm} title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)}>
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.2)'
    }}>
      <span style={{ fontSize: '24px', color: '#dc2626' }}>⚠️</span>
    </div>
    <h4 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.1rem' }}>Are you sure you want to log out?</h4>
    <p style={{ margin: '0', color: '#64748b', fontSize: '0.95rem' }}>This will end your current session.</p>
  </div>
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "24px",
  }}
>
  <button
    onClick={() => setShowLogoutConfirm(false)}
    style={{
      width: "160px",
      padding: "12px 0",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      color: "#374151",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textAlign: "center",
    }}
  >
    Cancel
  </button>

  <button
    onClick={() => {
      setShowLogoutConfirm(false);
      onLogout();
    }}
    style={{
      width: "160px",
      padding: "12px 0",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(135deg, #FA99B5, #FA99B5)",
      color: "#ffffff",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 8px 18px rgba(230, 82, 122, 0.3)",
      transition: "all 0.2s ease",
      textAlign: "center",
    }}
  >
    Yes, Log Out
  </button>
</div>

  {/* <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
    <button
      className="secondary"
      onClick={() => setShowLogoutConfirm(false)}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        color: '#374151',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '120px'
      }}
    >
      Cancel
    </button>
    <button
      className="primary"
      onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #FA99B5, #FA99B5)',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 8px 18px rgba(230, 82, 122, 0.3)',
        transition: 'all 0.2s ease',
        minWidth: '120px'
      }}
    >
      Yes, Log Out
    </button>
  </div> */}
</Modal>

</aside>

  )
}

export default Sidebar
