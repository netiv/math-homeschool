import { useState } from 'react'
import TopBar from './components/TopBar'
import LoginPage from './components/LoginPage'
import ChildPage from './components/ChildPage'
import ShopPage from './components/ShopPage'
import ParentPage from './components/ParentPage'
import SettingsPage from './components/SettingsPage'
import Toast, { useToast } from './components/Toast'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(null)
  const { msg, visible } = useToast()

  function handleLogin(member) {
    setUser(member)
    setPage(member.role === 'child' ? 'child' : 'parent')
  }

  function handleLogout() {
    setUser(null)
    setPage(null)
  }

  return (
    <div className="app">
      {user && (
        <TopBar user={user} activePage={page} onPageChange={setPage} onLogout={handleLogout} />
      )}

      {!user && <LoginPage onLogin={handleLogin} />}

      {user?.role === 'child' && page === 'child'    && <ChildPage user={user} />}
      {user?.role === 'child' && page === 'shop'     && <ShopPage  user={user} />}
      {user?.role === 'parent' && page === 'parent'  && <ParentPage user={user} />}
      {user?.role === 'parent' && page === 'settings' && <SettingsPage />}

      <Toast msg={msg} visible={visible} />
    </div>
  )
}
