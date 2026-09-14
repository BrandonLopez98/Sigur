import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import LoginPage from './pages/Login/LoginPage'
import HistoryPage from './pages/History/HistoryPage'
import NewQueryPage from './pages/NewQuery/NewQueryPage'

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

  function handleLogin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    setActivePage('history')
  }

  function handleNavigation(page) {
    // Por ahora estas son las dos páginas ya construidas.
    if (page === 'history' || page === 'new-query') {
      setActivePage(page)
    }
  }

  function handleQueryCreated() {
    // Al crear una consulta volvemos al historial para verla en estado pendiente.
    setActivePage('history')
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Navbar activePage={activePage} onNavigate={handleNavigation} />

      {activePage === 'new-query' ? (
        <NewQueryPage
          token={session.token}
          onQueryCreated={handleQueryCreated}
        />
      ) : (
        <HistoryPage token={session.token} />
      )}
    </div>
  )
}

export default App