import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  updateCurrentUserProfile,
} from '../../services/profileApi'
import './AccountPage.css'

function formatDate(date) {
  if (!date) return 'Sin información'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function getInitials(profile, email) {
  const firstName = profile?.first_name?.trim() || ''
  const lastName = profile?.last_name?.trim() || ''

  if (firstName || lastName) {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  return email?.slice(0, 2).toUpperCase() || 'U'
}

/**
 * Muestra y permite actualizar el perfil del usuario autenticado.
 */
function AccountPage({ token, onUserUpdated, onLogout }) {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        setError('')

        const currentUser = await getCurrentUser(token)

        setUser(currentUser)
        setFormData({
          first_name: currentUser.profile?.first_name || '',
          last_name: currentUser.profile?.last_name || '',
          phone: currentUser.profile?.phone || '',
          birth_date: currentUser.profile?.birth_date || '',
        })
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const updatedProfile = await updateCurrentUserProfile(token, formData)

      const updatedUser = {
        ...user,
        profile: updatedProfile,
      }

      setUser(updatedUser)

      // Actualiza créditos e iniciales mostradas por el Navbar.
      onUserUpdated?.(updatedUser)

      setSuccessMessage('Tus datos se actualizaron correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="account-page">
        <p className="account-page__message">Cargando tu cuenta...</p>
      </main>
    )
  }

  if (error && !user) {
    return (
      <main className="account-page">
        <p className="account-page__error">{error}</p>
      </main>
    )
  }

  const fullName =
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() ||
    'Completa tu perfil'

  const credits = user.wallet?.balance ?? 0
  const initials = getInitials(user.profile, user.email)

  return (
    <main className="account-page">
      <header className="account-page__header">
        <p className="account-page__eyebrow">MI CUENTA</p>
        <h1>{fullName}</h1>
        <p>Administra tu información y consulta tu saldo disponible.</p>
      </header>

      <section className="account-summary">
        <div className="account-summary__identity">
          <div className="account-summary__avatar">{initials}</div>

          <div>
            <strong>{user.email}</strong>
            <span>Miembro desde {formatDate(user.created_at)}</span>
          </div>
        </div>

        <div className="account-summary__credits">
          <strong>{credits}</strong>
          <span>créditos disponibles</span>
        </div>
      </section>

      <section className="account-content">
        <p className="account-content__eyebrow">DATOS PERSONALES</p>
        <h2>Tu perfil</h2>

        <form className="account-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Tu apellido"
            />
          </label>

          <label>
            Teléfono
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="300 123 4567"
            />
          </label>

          <label>
            Fecha de nacimiento
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </label>

          {error && <p className="account-form__error">{error}</p>}

          {successMessage && (
            <p className="account-form__success">{successMessage}</p>
          )}

          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <section className="account-content"></section>
          <div className="account-logout">
  <div>
    <h3>Cerrar sesión</h3>
    <p>Saldrás de Verifik en este dispositivo.</p>
  </div>

    <button
      type="button"
      className="account-logout__button"
      onClick={onLogout}
    >
      Cerrar sesión
    </button>
  </div>
        </form>
      </section>
    </main>
  )
}

export default AccountPage