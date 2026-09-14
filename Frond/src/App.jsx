import Navbar from './components/Navbar/Navbar'
import HistoryPage from './pages/History/HistoryPage'

/**
 * Punto de entrada de las páginas de la aplicación.
 */
function App() {
  /**
   * Temporal: muestra en consola a qué página se quiere navegar.
   * Luego aquí conectaremos el sistema de rutas.
   */
  function handleNavigation(page) {
    console.log(`Navegar a: ${page}`)
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