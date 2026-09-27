import { useEffect, useMemo, useState } from 'react'
import { getQueryResult, retryFailedQuerySources } from '../../services/queriesApi'
import './QueryResultPage.css'

const GROUPS = [
  { key: 'altos', label: 'Hallazgos de alto riesgo', tone: 'high' },
  { key: 'medios', label: 'Hallazgos de riesgo medio', tone: 'medium' },
  { key: 'bajos', label: 'Información de bajo impacto', tone: 'low' },
  { key: 'infos', label: 'Información adicional', tone: 'info' },
]
const MAX_AUTOMATIC_REPORT_REFRESHES = 12

function formatDateTime(date) {
  if (!date) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function formatSourceName(source) {
  return String(source || 'Fuente verificada')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function ResultGroup({ group, findings }) {
  const [expanded, setExpanded] = useState(false)
  if (!findings.length) return null

  const visibleFindings = expanded ? findings : findings.slice(0, 3)

  return (
    <section className="query-result__finding-group">
      <div className="query-result__section-title">
        <h2>{group.label}</h2>
        <span className={`query-result__count query-result__count--${group.tone}`}>
          {findings.length}
        </span>
      </div>

      <div className="query-result__findings">
        {visibleFindings.map((finding, index) => (
          <article className={`query-result__finding query-result__finding--${group.tone}`} key={`${finding.codigo || finding.hallazgo}-${index}`}>
            <p className="query-result__finding-source">
              {formatSourceName(finding.fuente)}
            </p>
            <h3>{finding.hallazgo || 'Hallazgo identificado'}</h3>
            {finding.descripcion && <p>{finding.descripcion}</p>}
          </article>
        ))}
      </div>

      {findings.length > 3 && (
        <button
          type="button"
          className="query-result__show-more"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Ver menos' : `Ver ${findings.length - 3} más`}
        </button>
      )}
    </section>
  )
}

function ResultImages({ images }) {
  const [unavailable, setUnavailable] = useState(new Set())
  const visibleImages = images.filter((image) => !unavailable.has(image.url))

  if (!visibleImages.length) return null

  return (
    <section className="query-result__images">
      <div className="query-result__section-title">
        <h2>Imágenes relacionadas</h2>
        <span className="query-result__count query-result__count--info">{visibleImages.length}</span>
      </div>
      <p>Selecciona una imagen para verla en tamaño completo.</p>
      <div className="query-result__image-grid">
        {visibleImages.map((image) => (
          <a key={image.url} href={image.url} target="_blank" rel="noreferrer" className="query-result__image-card">
            <img src={image.url} alt={image.label} loading="lazy" onError={() => setUnavailable((current) => new Set(current).add(image.url))} />
            <span>{image.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function QueryResultPage({ token, queryId, onBack }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [retryStarted, setRetryStarted] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    let refreshTimeoutId

    async function loadResult() {
      if (refreshTick === 0) setLoading(true)
      setError('')
      try {
        const data = await getQueryResult(token, queryId)
        if (!cancelled) {
          setResult(data)

          // Tusdatos puede publicar el JSON después del estado final. El
          // backend lo recupera en cada intento y la vista se actualiza sola.
          if (!data.report && refreshTick < MAX_AUTOMATIC_REPORT_REFRESHES) {
            refreshTimeoutId = window.setTimeout(() => {
              setRefreshTick((currentTick) => currentTick + 1)
            }, 5000)
          }
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResult()
    return () => {
      cancelled = true
      window.clearTimeout(refreshTimeoutId)
    }
  }, [token, queryId, refreshTick])

  const groups = useMemo(() => {
    const findings = result?.report?.dict_hallazgos || {}
    return GROUPS.map((group) => ({ ...group, findings: findings[group.key] || [] }))
  }, [result])

  const failedSources = result?.failed_sources || []
  const reportIsDelayed = Boolean(
    result && !result.report && refreshTick >= MAX_AUTOMATIC_REPORT_REFRESHES
  )

  async function handleRetry() {
    setRetrying(true)
    setError('')

    try {
      await retryFailedQuerySources(token, queryId)
      setRetryStarted(true)
    } catch (retryError) {
      setError(retryError.message)
    } finally {
      setRetrying(false)
    }
  }

  if (retryStarted) {
    return (
      <main className="query-result">
        <section className="query-result__retry-started">
          <span aria-hidden="true">↻</span>
          <h1>Actualización iniciada</h1>
          <p>Estamos revisando nuevamente las fuentes que no respondieron. No se descontaron créditos de tu cuenta.</p>
          <button type="button" onClick={onBack}>Ver progreso en Historial</button>
        </section>
      </main>
    )
  }

  return (
    <main className="query-result">
      <button type="button" className="query-result__back" onClick={onBack}>
        ← Volver al historial
      </button>

      {loading && <p className="query-result__message">Cargando resultado...</p>}
      {!loading && error && <p className="query-result__message query-result__message--error">{error}</p>}

      {!loading && result && (
        <>
          <header className="query-result__hero">
            <div>
              <p className="query-result__eyebrow">RESULTADO DE VERIFICACIÓN</p>
              <h1>{result.search_name || 'Consulta Verifik'}</h1>
              <p className="query-result__document">
                {result.document_type} · {result.document_number} · Finalizada {formatDateTime(result.completed_at)}
              </p>
            </div>
            <span className={`query-result__risk query-result__risk--${result.risk_level}`}>
              {result.risk_level === 'high' ? 'Alto riesgo' : result.risk_level === 'medium' ? 'Riesgo medio' : 'Bajo riesgo'}
            </span>
          </header>

          <section className="query-result__summary" aria-label="Resumen de verificación">
            <div><span>Fuentes consultadas</span><strong>{result.summary?.sources_checked || 0}</strong></div>
            <div><span>Hallazgos identificados</span><strong>{result.summary?.sources_with_findings || 0}</strong></div>
            <div><span>Fuentes con falla</span><strong className={failedSources.length ? 'query-result__summary-alert' : ''}>{failedSources.length}</strong></div>
            <div><span>Tiempo de análisis</span><strong>{result.summary?.provider_duration_seconds ? `${Math.round(result.summary.provider_duration_seconds)} s` : '—'}</strong></div>
          </section>

          <section className="query-result__notice">
            <strong>Cómo leer este resultado:</strong> revisa primero los hallazgos de alto riesgo. La información de bajo impacto es contextual y no representa por sí sola una alerta.
          </section>

          {!result.report && !reportIsDelayed && (
            <section className="query-result__notice" role="status">
              <strong>Preparando el detalle del reporte.</strong> Tusdatos ya terminó la consulta; estamos recuperando la información completa. Esta página se actualizará automáticamente.
            </section>
          )}

          {reportIsDelayed && (
            <section className="query-result__notice query-result__notice--delayed" role="status">
              <div>
                <strong>El detalle está tardando más de lo habitual.</strong>
                <p>La consulta está finalizada y puedes volver al historial. Reintentarlo no genera otra consulta ni descuenta créditos.</p>
              </div>
              <button type="button" onClick={() => setRefreshTick(0)}>
                ↻ Intentar recuperar el reporte
              </button>
            </section>
          )}

          <ResultImages images={result.images || []} />

          {failedSources.length > 0 && (
            <section className="query-result__source-failures">
              <div>
                <p className="query-result__eyebrow">COBERTURA INCOMPLETA</p>
                <h2>Algunas fuentes no respondieron</h2>
                <p>El resultado está disponible, pero estas fuentes no pudieron verificarse:</p>
                <ul>{failedSources.map((source) => <li key={source}>{formatSourceName(source)}</li>)}</ul>
              </div>
              {result.retry_available && (
                <button type="button" onClick={handleRetry} disabled={retrying}>
                  {retrying ? 'Actualizando fuentes...' : '↻ Actualizar fuentes con falla'}
                  <small>No consume créditos</small>
                </button>
              )}
            </section>
          )}

          {groups.map((group) => <ResultGroup key={group.key} group={group} findings={group.findings} />)}
        </>
      )}
    </main>
  )
}

export default QueryResultPage
