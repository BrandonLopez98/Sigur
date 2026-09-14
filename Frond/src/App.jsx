import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import LoginPage from './pages/Login/LoginPage';
import HistoryPage from './pages/History/HistoryPage';

const SESSION_KEY = 'verifik_session';

/**
 * Recupera una sesión guardada sin bloquear la app si el dato está dañado.
 */
function getSavedSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  } catch {
    return null;
  }
}

/**
 * Controla qué pantalla se muestra según exista o no una sesión.
 */
function App() {
  const [session, setSession] = useState(getSavedSession);

  /**
   * Guarda token y usuario después de un login exitoso.
   */
  function handleLogin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  /**
   * Temporal: más adelante conectaremos las demás páginas del menú.
   */
  function handleNavigation(page) {
    console.log(`Navegar a: ${page}`);
  }

  // Si no existe sesión, la primera pantalla será Login.
  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Navbar
        activePage="history"
        onNavigate={handleNavigation}
      />

      <HistoryPage userId={session.user.id} />
    </div>
  );
}

export default App;