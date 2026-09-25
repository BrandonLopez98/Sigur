import { useEffect, useMemo, useState } from 'react'
import { getCreditMovements } from '../../services/creditsApi'
import { getQueries } from '../../services/queriesApi'
import './DashboardPage.css'

function formatDateTime(value) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getName(user) {
  const name = user?.profile?.first_name?.trim()
  return name || user?.email?.split('@')[0] || 'usuario'
}

function DashboardPage({ token, user, onNavigate }) {
  const [queries, setQueries] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [queriesData, movementsData] = await Promise.all([
          getQueries(token),
          getCreditMovements(token, 1, 5),
        ])

        if (!cancelled) {
          setQueries(queriesData)
          setMovements(movementsData.movements)
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => { cancelled = true }
  }, [token])

  const summary = useMemo(() => {
    const completed = queries.filter((query) => query.status === 'completed')
    const highRisk = completed.filter((query) => query.risk_level === 'high')
    const processing = queries.filter((query) =>
      ['pending', 'processing'].includes(query.status)
    )

    return {
      balance: movements[0]?.balance_after ?? user?.wallet?.balance ?? 0,
      completed: completed.length,
      highRisk: highRisk.length,
      processing: processing.length,
    }
  }, [queries, movements, user])

  const recentQueries = useMemo(() => queries.slice(0, 5), [queries])

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">PANEL DE CONTROL</p>
          <h1>Hola, {getName(user)}</h1>
          <p>Este es el estado actual de tus verificaciones en Verifik.</p>
        </div>
        <button
          type="button"
          className="dashboard-page__primary-action"
          onClick={() => onNavigate('new-query')}
        >
          + Nueva consulta
        </button>
      </header>

      {loading && <p className="dashboard-page__message">Cargando tu información...</p>}
      {!loading && error && <p className="dashboard-page__message dashboard-page__message--error">{error}</p>}

      {!loading && !error && (
        <>
          {(summary.highRisk > 0 || summary.processing > 0) && (
            <section className="dashboard-alerts" aria-label="Alertas">
              {summary.highRisk > 0 && (
                <button type="button" onClick={() => onNavigate('history')}>
                  <span>!</span>
                  Tienes {summary.highRisk} {summary.highRisk === 1 ? 'consulta de alto riesgo' : 'consultas de alto riesgo'} para revisar.
                </button>
              )}
              {summary.processing > 0 && (
                <button type="button" onClick={() => onNavigate('history')}>
                  <span>◌</span>
                  {summary.processing} {summary.processing === 1 ? 'consulta está en proceso.' : 'consultas están en proceso.'}
                </button>
              )}
            </section>
          )}

          <section className="dashboard-stats" aria-label="Resumen de cuenta">
            <article className="dashboard-stats__balance">
              <span>Saldo disponible</span>
              <strong>◎ {summary.balance}</strong>
              <button type="button" onClick={() => onNavigate('credits')}>Ver movimientos</button>
            </article>
            <article>
              <span>Consultas completadas</span>
              <strong>{summary.completed}</strong>
              <button type="button" onClick={() => onNavigate('history')}>Ver historial</button>
            </article>
            <article>
              <span>Alto riesgo</span>
              <strong className={summary.highRisk > 0 ? 'dashboard-stats__risk' : ''}>{summary.highRisk}</strong>
              <button type="button" onClick={() => onNavigate('history')}>Revisar alertas</button>
            </article>
            <article>
              <span>En proceso</span>
              <strong>{summary.processing}</strong>
              <button type="button" onClick={() => onNavigate('history')}>Ver estado</button>
            </article>
          </section>

          <div className="dashboard-page__grid">
            <section className="dashboard-panel">
              <div className="dashboard-panel__heading">
                <div>
                  <p>ACTIVIDAD RECIENTE</p>
                  <h2>Últimas consultas</h2>
                </div>
                <button type="button" onClick={() => onNavigate('history')}>Ver todas</button>
              </div>

              {recentQueries.length === 0 ? (
                <div className="dashboard-panel__empty">
                  <span>⌕</span>
                  <p>Aún no has realizado consultas.</p>
                  <button type="button" onClick={() => onNavigate('new-query')}>Crear primera consulta</button>
                </div>
              ) : (
                <div className="dashboard-queries">
                  {recentQueries.map((query) => (
                    <button
                      type="button"
                      className="dashboard-query"
                      key={query.id}
                      onClick={() => onNavigate('history')}
                    >
                      <span className="dashboard-query__type">{query.document_type}</span>
                      <span className="dashboard-query__body">
                        <strong>{query.search_name || 'Procesando consulta'}</strong>
                        <small>{query.document_number} · {formatDateTime(query.created_at)}</small>
                      </span>
                      <span className={`dashboard-query__status dashboard-query__status--${query.status}`}>
                        {query.status === 'completed' ? 'Completada' : query.status === 'failed' ? 'Fallida' : 'En proceso'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <aside className="dashboard-panel dashboard-panel--actions">
              <div className="dashboard-panel__heading">
                <div>
                  <p>ACCESOS RÁPIDOS</p>
                  <h2>¿Qué deseas hacer?</h2>
                </div>
              </div>
              <button type="button" onClick={() => onNavigate('new-query')}>
                <span>⌕</span> Consultar persona, empresa o vehículo
              </button>
              <button type="button" onClick={() => onNavigate('packages')}>
                <span>◎</span> Comprar créditos
              </button>
              <button type="button" onClick={() => onNavigate('credits')}>
                <span>↕</span> Revisar movimientos de créditos
              </button>
            </aside>
          </div>
        </>
      )}
    </main>
  )
}

export default DashboardPage
