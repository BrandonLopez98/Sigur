import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from '../../services/profileApi'
import './AccountPage.css'

function formatDate(date) {
  if (!date) return 'Sin información'

  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00`)
    : new Date(date)

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(normalizedDate)
}

function getInitials(profile, email) {
  const firstName = profile?.first_name?.trim() || ''
  const lastName = profile?.last_name?.trim() || ''

  if (firstName || lastName) {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  return email?.slice(0, 2).toUpperCase() || 'U'
}

/** Cuenta del usuario: datos, edición, contraseña y cierre de sesión. */
function AccountPage({ token, onUserUpdated, onLogout }) {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
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

  function handleProfileChange(event) {
    const { name, value } = event.target
    setFormData((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handlePasswordInput(event) {
    const { name, value } = event.target
    setPasswordData((currentPassword) => ({
      ...currentPassword,
      [name]: value,
    }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      const updatedProfile = await updateCurrentUserProfile(token, formData)
      const updatedUser = { ...user, profile: updatedProfile }

      setUser(updatedUser)
      onUserUpdated?.(updatedUser)
      setIsEditing(false)
      setSuccessMessage('Tus datos se actualizaron correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('La confirmación no coincide con la nueva contraseña.')
      return
    }

    try {
      setChangingPassword(true)
      setPasswordError('')
      const result = await updateCurrentUserPassword(token, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setIsChangingPassword(false)
      setPasswordMessage(result.message)
    } catch (requestError) {
      setPasswordError(requestError.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <main className="account-page">Cargando tu cuenta...</main>
  if (error && !user) return <main className="account-page account-page__error">{error}</main>

  const profile = user.profile || {}
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const displayName = fullName || 'Completa tu perfil'
  const credits = user.wallet?.balance ?? 0
  const initials = getInitials(profile, user.email)
  const details = [
    ['Nombre completo', displayName],
    ['Correo electrónico', user.email],
    ['Teléfono', profile.phone || 'Sin registrar'],
    ['Fecha de nacimiento', formatDate(profile.birth_date)],
    ['Fecha de registro', formatDate(user.created_at)],
    ['Créditos disponibles', `${credits} créditos`],
  ]

  return (
    <main className="account-page">
      <header className="account-page__header">
        <p className="account-page__eyebrow">MI CUENTA</p>
        <h1>{displayName}</h1>
        <p>Administra tu información, saldo y seguridad.</p>
      </header>

      <section className="account-card">
        <header className="account-card__hero">
          <div className="account-card__identity">
            <span className="account-card__avatar">{initials}</span>
            <div>
              <h2>{displayName}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <span className="account-card__status">Activo</span>
        </header>

        <div className="account-card__details">
          {details.map(([label, value]) => (
            <div
              className={label === 'Créditos disponibles' ? 'account-detail account-detail--credits' : 'account-detail'}
              key={label}
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="account-actions" aria-label="Acciones de cuenta">
        <button type="button" className="account-action" onClick={() => setIsEditing((isOpen) => !isOpen)}>
          <span className="account-action__icon">✎</span>
          <span><strong>Actualizar datos</strong><small>Modifica tu teléfono, fecha de nacimiento y nombre.</small></span>
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" className="account-action" onClick={() => setIsChangingPassword((isOpen) => !isOpen)}>
          <span className="account-action__icon">⌑</span>
          <span><strong>Cambiar contraseña</strong><small>Actualiza la clave de acceso a tu cuenta.</small></span>
          <span aria-hidden="true">›</span>
        </button>
      </section>

      {successMessage && <p className="account-feedback">{successMessage}</p>}
      {passwordMessage && <p className="account-feedback">{passwordMessage}</p>}

      {isEditing && (
        <section className="account-panel">
          <h2>Actualizar datos personales</h2>
          <form className="account-form" onSubmit={handleProfileSubmit}>
            <label>Nombre<input type="text" name="first_name" value={formData.first_name} onChange={handleProfileChange} /></label>
            <label>Apellido<input type="text" name="last_name" value={formData.last_name} onChange={handleProfileChange} /></label>
            <label>Teléfono<input type="tel" name="phone" value={formData.phone} onChange={handleProfileChange} /></label>
            <label>Fecha de nacimiento<input type="date" name="birth_date" value={formData.birth_date} onChange={handleProfileChange} /></label>
            {error && <p className="account-form__error">{error}</p>}
            <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </form>
        </section>
      )}

      {isChangingPassword && (
        <section className="account-panel">
          <h2>Cambiar contraseña</h2>
          <form className="account-form account-form--password" onSubmit={handlePasswordSubmit}>
            <label>Contraseña actual<input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordInput} autoComplete="current-password" /></label>
            <label>Nueva contraseña<input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordInput} autoComplete="new-password" minLength="8" /></label>
            <label>Confirma la nueva contraseña<input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordInput} autoComplete="new-password" minLength="8" /></label>
            {passwordError && <p className="account-form__error">{passwordError}</p>}
            <button type="submit" disabled={changingPassword}>{changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}</button>
          </form>
        </section>
      )}

      <section className="account-logout">
        <div><h2>Cerrar sesión</h2><p>Saldrás de Verifik en este dispositivo.</p></div>
        <button type="button" onClick={onLogout}>Cerrar sesión</button>
      </section>
    </main>
  )
}

export default AccountPage
