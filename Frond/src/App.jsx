import Navbar from './components/Navbar'
import HistoryPage from './Pages/HistoryPage'
import './App.css'

/**
 * Componente principal de la aplicación.
 */
function App() {
  // Por ahora solo existe la pantalla de historial.
  function handleNavigation(page) {
    console.log(`Navegación futura a: ${page}`)
  }

  return (
    <div className="app">
      <Navbar
        activePage="history"
        onNavigate={handleNavigation}
      />

      <HistoryPage />
    </div>
  )
}

export default App