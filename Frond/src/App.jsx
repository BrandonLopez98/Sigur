import { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import LoginPage from './pages/Login/LoginPage'
import HistoryPage from './pages/History/HistoryPage'
import NewQueryPage from './pages/NewQuery/NewQueryPage'
import AccountPage from './pages/Account/AccountPage'
import { getCurrentUser } from './services/profileApi'

const SESSION_KEY = 'verifik_session'

function getSavedSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY)
    return savedSession ? JSON.parse(savedSession) : null
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState(getSavedSession)
  const [activePage, setActivePage] = useState('history')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (!session?.token) return

    getCurrentUser(session.token)
      .then((user) => setCurrentUser(user))
      .catch((error) => console.error('No fue posible cargar el usuario:', error))
  }, [session])

  function handleLogin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    setActivePage('history')
  }

  function handleNavigation(page) {
    if (
      page === 'history' ||
      page === 'new-query' ||
      page === 'account'
    ) {
      setActivePage(page)
    }
  }

  function handleQueryCreated() {
    setActivePage('history')
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  let currentPage

  if (activePage === 'new-query') {
    currentPage = (
      <NewQueryPage
        token={session.token}
        onQueryCreated={handleQueryCreated}
      />
    )
  } else if (activePage === 'account') {
    currentPage = (
      <AccountPage
        token={session.token}
        onUserUpdated={setCurrentUser}
      />
    )
  } else {
    currentPage = <HistoryPage token={session.token} />
  }

  return (
    <div className="app">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigation}
        user={currentUser}
      />

      {currentPage}
    </div>
  )
}

export default App