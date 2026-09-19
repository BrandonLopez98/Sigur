import { useEffect, useMemo, useState } from 'react'
import {
  downloadQueryReportPdf,
  getQueryResult,
} from '../../services/queriesApi'
import './QueryResultPage.css'

const GROUPS = [
  { key: 'altos', label: 'Hallazgos de alto riesgo', tone: 'high' },
  { key: 'medios', label: 'Hallazgos de riesgo medio', tone: 'medium' },
  { key: 'bajos', label: 'Hallazgos de bajo riesgo', tone: 'low' },
  { key: 'infos', label: 'Información relevante', tone: 'info' },
]

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

function getEvidenceEntries(report) {
  const skippedKeys = new Set(['dict_hallazgos', 'dest'])

  return Object.entries(report || {}).filter(([key, value]) => {
    if (skippedKeys.has(key) || value === false || value === null) return false
    if (Array.isArray(value)) return value.length > 0
    return typeof value === 'object' || value === true || typeof value === 'string'
  })
}

function ResultGroup({ group, findings }) {
  if (!findings.length) return null

  return (
    <section className="query-result__finding-group">
      <div className="query-result__section-title">
        <h2>{group.label}</h2>
        <span className={`query-result__count query-result__count--${group.tone}`}>
          {findings.length}
        </span>
      </div>

      <div className="query-result__findings">
        {findings.map((finding, index) => (
          <article className={`query-result__finding query-result__finding--${group.tone}`} key={`${finding.codigo || finding.hallazgo}-${index}`}>
            <p className="query-result__finding-source">
              {formatSourceName(finding.fuente)}
            </p>
            <h3>{finding.hallazgo || 'Hallazgo identificado'}</h3>
            {finding.descripcion && <p>{finding.descripcion}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

function QueryResultPage({ token, queryId, onBack }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadResult() {
      setLoading(true)
      setError('')
      try {
        const data = await getQueryResult(token, queryId)
        if (!cancelled) setResult(data)
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResult()
    return () => { cancelled = true }
  }, [token, queryId])

  const groups = useMemo(() => {
    const findings = result?.report?.dict_hallazgos || {}
    return GROUPS.map((group) => ({ ...group, findings: findings[group.key] || [] }))
  }, [result])

  const evidenceEntries = useMemo(
    () => getEvidenceEntries(result?.report),
    [result]
  )

  async function handleDownload() {
    setDownloading(true)
    setError('')
    try {
      await downloadQueryReportPdf(token, queryId)
    } catch (downloadError) {
      setError(downloadError.message)
    } finally {
      setDownloading(false)
    }
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
            <div><span>Fuentes con hallazgos</span><strong>{result.summary?.sources_with_findings || 0}</strong></div>
            <div><span>Tiempo de análisis</span><strong>{result.summary?.provider_duration_seconds ? `${Math.round(result.summary.provider_duration_seconds)} s` : '—'}</strong></div>
            {result.can_download_pdf && (
              <button type="button" className="query-result__download" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Descargando...' : '↓ Descargar PDF'}
              </button>
            )}
          </section>

          <section className="query-result__notice">
            <strong>Lectura recomendada:</strong> revisa primero los hallazgos de alto riesgo y consulta las evidencias antes de tomar una decisión.
          </section>

          {groups.map((group) => <ResultGroup key={group.key} group={group} findings={group.findings} />)}

          <section className="query-result__evidence">
            <div className="query-result__section-title">
              <h2>Evidencias por fuente</h2>
              <span className="query-result__count query-result__count--info">{evidenceEntries.length}</span>
            </div>
            <p>Información técnica recibida de Tusdatos para esta consulta.</p>
            <div className="query-result__evidence-list">
              {evidenceEntries.map(([source, value]) => (
                <details key={source} className="query-result__evidence-item">
                  <summary>{formatSourceName(source)}</summary>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default QueryResultPage
