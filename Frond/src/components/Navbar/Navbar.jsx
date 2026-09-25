import './Navbar.css'

// Opciones que se muestran en la navegación principal.
const links = [
  { id: 'home', label: 'Inicio' },
  { id: 'new-query', label: 'Nueva consulta' },
  { id: 'history', label: 'Historial' },
  { id: 'packages', label: 'Paquetes' },
  { id: 'transactions', label: 'Transacciones' },
  { id: 'help', label: 'Ayuda' },
  
]

/**
 * Obtiene las iniciales visibles del usuario.
 */
function getInitials(user) {
  const firstName = user?.profile?.first_name?.trim() || ''
  const lastName = user?.profile?.last_name?.trim() || ''

  if (firstName || lastName) {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  return user?.email?.slice(0, 2).toUpperCase() || 'U'
}

/**
 * Barra de navegación reutilizable de la aplicación.
 */
function Navbar({ activePage, onNavigate, user }) {
  const credits = user?.wallet?.balance ?? 0
  const initials = getInitials(user)

  return (
    <header className="navbar">
      <button
        type="button"
        className="navbar__brand"
        onClick={() => onNavigate('history')}
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
            className={
              activePage === link.id
                ? 'navbar__link navbar__link--active'
                : 'navbar__link'
            }
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
          onClick={() => onNavigate('credits')}
        >
          ◎ {credits} créditos
        </button>

        <button
          type="button"
          className="navbar__avatar"
          onClick={() => onNavigate('account')}
          aria-label="Abrir mi cuenta"
          title={user?.email || 'Mi cuenta'}
        >
          {initials}
        </button>
      </div>
    </header>
  )
}

export default Navbar
