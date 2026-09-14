import './Navbar.css'

// Opciones que se muestran en la navegación principal.
const links = [
  { id: 'home', label: 'Inicio' },
  { id: 'new-query', label: 'Nueva consulta' },
  { id: 'history', label: 'Historial' },
  { id: 'packages', label: 'Paquetes' },
  { id: 'help', label: 'Ayuda' },
]

/**
 * Barra de navegación reutilizable de la aplicación.
 *
 * @param {Object} props
 * @param {string} props.activePage - ID de la página actualmente visible.
 * @param {Function} props.onNavigate - Función que se ejecuta al elegir una opción.
 */
function Navbar({ activePage, onNavigate }) {
  return (
    <header className="navbar">
      <button
        type="button"
        className="navbar__brand"
        onClick={() => onNavigate('home')}
      >
        <span className="navbar__logo">V</span>

        <span className="navbar__name">
          Verifi<span>k</span>
        </span>
      </button>

      <nav className="navbar__links" aria-label="Navegación principal">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            className={activePage === link.id ? 'navbar__link navbar__link--active' : 'navbar__link'}
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="navbar__user">
        <button
          type="button"
          className="navbar__credits"
          onClick={() => onNavigate('packages')}
        >
          ◎ 38 créditos
        </button>

        <button
          type="button"
          className="navbar__avatar"
          onClick={() => onNavigate('account')}
          aria-label="Abrir mi cuenta"
        >
          JM
        </button>
      </div>
    </header>
  )
}

export default Navbar