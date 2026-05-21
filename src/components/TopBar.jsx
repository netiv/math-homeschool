import useStore, { avatarBg } from '../store/useStore'

export default function TopBar({ user, activePage, onPageChange, onLogout }) {
  const notifications = useStore(s => s.notifications)

  const unread = notifications.filter(n => n.to === user.id && !n.read).length

  const tabs = user.role === 'child'
    ? [{ id: 'child', label: '학습' }, { id: 'shop', label: '상점' }]
    : [{ id: 'parent', label: '학습 관리' }, { id: 'settings', label: '설정' }]

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <span className="logo">
          <i className="ti ti-math-function" /> 수학 홈스쿨
        </span>
        <div className="user-badge" onClick={onLogout}>
          <div className="av" style={{ background: avatarBg(user.color), color: user.color }}>
            {user.name[0]}
          </div>
          <span>{user.name}</span>
          {unread > 0 && <span className="notif-dot" />}
          <i className="ti ti-chevron-down" style={{ fontSize: 12 }} />
        </div>
      </div>
      <div className="nav-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`nav-tab${activePage === t.id ? ' active' : ''}`}
            onClick={() => onPageChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
