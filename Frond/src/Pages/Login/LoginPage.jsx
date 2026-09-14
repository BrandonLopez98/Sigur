import { useState } from 'react';
import { login } from '../../services/authApi';
import './LoginPage.css';

/**
 * Página de inicio de sesión.
 *
 * @param {Object} props
 * @param {Function} props.onLogin - Recibe la sesión cuando el login es exitoso.
 */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Envía las credenciales al backend.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await login({ email, password });

      // App recibirá token y usuario para guardar la sesión.
      onLogin(session);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__intro">
        <div className="login-page__brand">
          <span className="login-page__logo">V</span>
          <strong>Verifi<span>k</span></strong>
        </div>

        <div className="login-page__intro-content">
          <p className="login-page__eyebrow">CONSULTAS CONFIABLES</p>
          <h1>Información clara para decisiones seguras.</h1>
          <p>
            Consulta personas y empresas, revisa el nivel de riesgo
            y conserva el historial de tus resultados.
          </p>
        </div>
      </section>

      <section className="login-page__form-section">
        <form className="login-page__form" onSubmit={handleSubmit}>
          <div>
            <p className="login-page__welcome">Bienvenido a Verifik</p>
            <h2>Inicia sesión</h2>
            <p className="login-page__subtitle">
              Ingresa para consultar tu historial y créditos.
            </p>
          </div>

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-page__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="login-page__register">
            ¿Aún no tienes cuenta? <button type="button">Regístrate</button>
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;