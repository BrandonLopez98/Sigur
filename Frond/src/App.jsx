import { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import LoginPage from './pages/Login/LoginPage'
import HistoryPage from './pages/History/HistoryPage'
import NewQueryPage from './pages/NewQuery/NewQueryPage'
import AccountPage from './pages/Account/AccountPage'
import PackagesPage from './pages/Packages/PackagesPage'
import TransactionsPage from './pages/Transactions/TransactionsPage'
import QueryResultPage from './pages/QueryResult/QueryResultPage'
import CreditMovementsPage from './pages/Credits/CreditMovementsPage'
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

/**
 * Componente principal: maneja sesión, usuario y navegación de Verifik.
 */
function App() {
  const [session, setSession] = useState(getSavedSession)
  const [activePage, setActivePage] = useState('history')
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedQueryId, setSelectedQueryId] = useState(null)

  /**
   * Carga el usuario una sola vez al iniciar o restaurar la sesión.
   *
   * No usamos un intervalo global: consultar /Auth/me cada pocos segundos
   * consume recursos aunque el usuario no haya realizado ninguna acción.
   * Tras un pago, Wompi redirige de nuevo a Verifik y la aplicación se monta
   * otra vez, por lo que el saldo actualizado se consulta en ese momento.
   */
  useEffect(() => {
    if (!session?.token) return undefined

    let isMounted = true

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser(session.token)

        if (isMounted) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('No fue posible cargar el usuario:', error)
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [session])

  function handleLogin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setSession(newSession)
    setActivePage('history')
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setCurrentUser(null)
    setActivePage('history')
  }

  function handleNavigation(page) {
    const availablePages = [
      'history',
      'new-query',
      'account',
      'packages',
      'transactions',
      'credits',
    ]

    if (availablePages.includes(page)) {
      setActivePage(page)
    }
  }

  function handleQueryCreated() {
    setActivePage('history')
  }

  function handleOpenResult(queryId) {
    setSelectedQueryId(queryId)
    setActivePage('query-result')
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
        onLogout={handleLogout}
      />
    )
  } else if (activePage === 'packages') {
    currentPage = <PackagesPage token={session.token} />
  } else if (activePage === 'transactions') {
    currentPage = <TransactionsPage token={session.token} />
  } else if (activePage === 'credits') {
    currentPage = (
      <CreditMovementsPage token={session.token} user={currentUser} />
    )
  } else if (activePage === 'query-result' && selectedQueryId) {
    currentPage = (
      <QueryResultPage
        token={session.token}
        queryId={selectedQueryId}
        onBack={() => setActivePage('history')}
      />
    )
  } else {
    currentPage = (
      <HistoryPage token={session.token} onOpenResult={handleOpenResult} />
    )
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
