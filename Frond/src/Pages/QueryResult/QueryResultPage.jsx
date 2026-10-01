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
const RISK_LABELS = {
  high: 'Alto riesgo',
  medium: 'Riesgo medio',
  low: 'Riesgo bajo',
  unknown: 'Sin clasificación',
}

function formatDateTime(date) {
  if (!date) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

function formatSourceName(source) {
  return String(source || 'Fuente verificada').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatValue(value) {
  if (value === true) return 'Sí'
  if (value === false) return 'No'
  if (value === null || value === undefined || value === '') return 'Sin información'
  return String(value)
}

function isPrimitive(value) {
  return value === null || typeof value !== 'object'
}

function DataTable({ rows }) {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 8)
  return (
    <div className="query-result__table-wrap">
      <table className="query-result__table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{columns.map((column) => <td key={column}>{formatValue(row[column])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportData({ value, depth = 0 }) {
  if (isPrimitive(value)) return <span className="query-result__value">{formatValue(value)}</span>

  if (Array.isArray(value)) {
    if (!value.length) return <span className="query-result__muted">Sin registros</span>
    if (value.every(isPrimitive)) {
      return <ul className="query-result__plain-list">{value.map((item, index) => <li key={index}>{formatValue(item)}</li>)}</ul>
    }
    if (value.every((item) => item && typeof item === 'object' && !Array.isArray(item) && Object.values(item).every(isPrimitive))) {
      return <DataTable rows={value} />
    }
    return (
      <div className="query-result__records">
        {value.map((item, index) => (
          <article key={index} className="query-result__record">
            <span className="query-result__record-number">Registro {index + 1}</span>
            <ReportData value={item} depth={depth + 1} />
          </article>
        ))}
      </div>
    )
  }

  const entries = Object.entries(value)
  const simpleEntries = entries.filter(([, item]) => isPrimitive(item))
  const nestedEntries = entries.filter(([, item]) => !isPrimitive(item))
  return (
    <div className="query-result__data-stack">
      {simpleEntries.length > 0 && (
        <dl className="query-result__data-grid">
          {simpleEntries.map(([key, item]) => <div key={key}><dt>{key}</dt><dd>{formatValue(item)}</dd></div>)}
        </dl>
      )}
      {nestedEntries.map(([key, item]) => (
        <section className="query-result__nested" key={key}>
          <h4>{key}</h4>
          {depth < 5 ? <ReportData value={item} depth={depth + 1} /> : <span className="query-result__muted">Detalle disponible en el registro original.</span>}
        </section>
      ))}
    </div>
  )
}

function ResultGroup({ group, findings }) {
  const [expanded, setExpanded] = useState(false)
  if (!findings.length) return null
  const visibleFindings = expanded ? findings : findings.slice(0, 3)
  return (
    <section className="query-result__finding-group">
      <div className="query-result__section-title"><h2>{group.label}</h2><span className={`query-result__count query-result__count--${group.tone}`}>{findings.length}</span></div>
      <div className="query-result__findings">
        {visibleFindings.map((finding, index) => (
          <article className={`query-result__finding query-result__finding--${group.tone}`} key={`${finding.Codigo || finding.codigo || finding.Hallazgo || finding.hallazgo}-${index}`}>
            <p className="query-result__finding-source">{formatSourceName(finding.Fuente || finding.fuente)}</p>
            <h3>{finding.Hallazgo || finding.hallazgo || 'Hallazgo identificado'}</h3>
            {(finding.Descripcion || finding.descripcion) && <p>{finding.Descripcion || finding.descripcion}</p>}
          </article>
        ))}
      </div>
      {findings.length > 3 && <button type="button" className="query-result__show-more" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Ver menos' : `Ver ${findings.length - 3} más`}</button>}
    </section>
  )
}

function SourceDirectory({ sources }) {
  const [filter, setFilter] = useState('')
  const normalizedFilter = filter.trim().toLocaleLowerCase('es')
  const filtered = sources.filter((source) => source.name.toLocaleLowerCase('es').includes(normalizedFilter))
  const labels = {
    finding: 'Con hallazgo',
    clear: 'Sin hallazgos',
    unavailable: 'No disponible',
    error: 'Error de consulta',
    unknown: 'Sin confirmar',
  }
  if (!sources.length) return null
  return (
    <section className="query-result__directory" id="fuentes">
      <div className="query-result__section-heading">
        <div><p className="query-result__eyebrow">COBERTURA</p><h2>Fuentes consultadas</h2></div>
        <label className="query-result__source-search"><span>Buscar fuente</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Ej. Registraduría" /></label>
      </div>
      <div className="query-result__source-grid">
        {filtered.map((source) => <div className="query-result__source" key={source.name}><span className={`query-result__source-dot query-result__source-dot--${source.status}`} aria-hidden="true" /><span>{source.name}</span><small>{labels[source.status] || 'Sin confirmar'}</small></div>)}
      </div>
      {!filtered.length && <p className="query-result__empty">No encontramos una fuente con ese nombre.</p>}
    </section>
  )
}

function SourceDetail({ section, initiallyOpen }) {
  const [open, setOpen] = useState(initiallyOpen)
  return (
    <article className={`query-result__source-detail${open ? ' query-result__source-detail--open' : ''}`}>
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span><small>FUENTE VERIFICADA</small><strong>{section.title}</strong></span>
        <span className="query-result__source-meta">{section.record_count} {section.record_count === 1 ? 'registro' : 'registros'} <b>{open ? '−' : '+'}</b></span>
      </button>
      {open && <div className="query-result__source-body"><ReportData value={section.data} /></div>}
    </article>
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
          if (!data.report_ready && refreshTick < MAX_AUTOMATIC_REPORT_REFRESHES) refreshTimeoutId = window.setTimeout(() => setRefreshTick((tick) => tick + 1), 5000)
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadResult()
    return () => { cancelled = true; window.clearTimeout(refreshTimeoutId) }
  }, [token, queryId, refreshTick])

  const groups = useMemo(() => {
    const findings = result?.findings || {}
    return GROUPS.map((group) => ({ ...group, findings: findings[group.key] || [] }))
  }, [result])
  const totalFindings = groups.reduce((total, group) => total + group.findings.length, 0)
  const failedSources = result?.failed_sources || []
  const sourceIssues = (result?.source_index || [])
    .filter((source) => ['error', 'unavailable', 'unknown'].includes(source.status))
    .map((source) => source.name)
  const coverageIssueSources = Array.from(new Set([...failedSources, ...sourceIssues]))
  const hasIncompleteCoverage = coverageIssueSources.length > 0
    || result?.summary?.coverage_complete === false
  const hasUncertainResult = hasIncompleteCoverage
    || !['low', 'medium', 'high'].includes(result?.risk_level)
  const reportIsDelayed = Boolean(result && !result.report_ready && refreshTick >= MAX_AUTOMATIC_REPORT_REFRESHES)

  async function handleRetry() {
    setRetrying(true)
    setError('')
    try { await retryFailedQuerySources(token, queryId); setRetryStarted(true) }
    catch (retryError) { setError(retryError.message) }
    finally { setRetrying(false) }
  }

  if (retryStarted) return <main className="query-result"><section className="query-result__retry-started"><span aria-hidden="true">↻</span><h1>Actualización iniciada</h1><p>Estamos revisando nuevamente las fuentes que no respondieron. No se descontaron créditos de tu cuenta.</p><button type="button" onClick={onBack}>Ver progreso en Historial</button></section></main>

  return (
    <main className="query-result">
      <div className="query-result__toolbar"><button type="button" className="query-result__back" onClick={onBack}>← Volver al historial</button>{result?.report_ready && <button type="button" className="query-result__print" onClick={() => window.print()}>Imprimir o guardar PDF</button>}</div>
      {loading && <p className="query-result__message">Cargando resultado...</p>}
      {!loading && error && <p className="query-result__message query-result__message--error">{error}</p>}
      {!loading && result && (
        <article className="query-result__report">
          <header className="query-result__report-header"><div className="query-result__brand"><span>V</span><strong>Verifi<b>k</b></strong></div><div className="query-result__report-meta"><span>Reporte #{String(result.id).slice(0, 8).toUpperCase()}</span><span>{formatDateTime(result.completed_at)}</span></div></header>
          <section className="query-result__hero" id="resumen"><div><p className="query-result__eyebrow">REPORTE DE VERIFICACIÓN</p><h1>{result.search_name || 'Consulta Verifik'}</h1><p className="query-result__document">{result.document_type} · {result.document_number}</p></div><span className={`query-result__risk query-result__risk--${result.risk_level || 'unknown'}`}>{RISK_LABELS[result.risk_level] || RISK_LABELS.unknown}</span></section>
          {result.profile?.length > 0 && <dl className="query-result__profile">{result.profile.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{formatValue(item.value)}</dd></div>)}</dl>}
          <nav className="query-result__report-nav" aria-label="Secciones del reporte"><a href="#resumen">Resumen</a><a href="#hallazgos">Hallazgos ({totalFindings})</a><a href="#fuentes">Fuentes ({result.source_index?.length || 0})</a><a href="#detalle">Detalle ({result.report_sections?.length || 0})</a></nav>
          <section className="query-result__summary" aria-label="Resumen de verificación"><div><span>Fuentes confirmadas</span><strong>{result.summary?.sources_checked ?? result.source_index?.filter((source) => ['finding', 'clear'].includes(source.status)).length ?? 0}</strong></div><div><span>Hallazgos</span><strong>{totalFindings || result.summary?.sources_with_findings || 0}</strong></div><div><span>Fuentes sin confirmar</span><strong className={hasIncompleteCoverage ? 'query-result__summary-alert' : ''}>{coverageIssueSources.length}</strong></div><div><span>Tiempo de análisis</span><strong>{result.summary?.provider_duration_seconds ? `${Math.round(result.summary.provider_duration_seconds)} s` : '—'}</strong></div></section>
          <section className="query-result__notice"><strong>Lectura recomendada:</strong> empieza por los hallazgos y confirma después cada dato en el detalle de fuentes. Un registro informativo no implica por sí solo una alerta.</section>
          {!result.report_ready && !reportIsDelayed && <section className="query-result__notice" role="status"><strong>Preparando el detalle del reporte.</strong> Verifik terminó la consulta y está organizando la información completa. Esta página se actualizará automáticamente.</section>}
          {reportIsDelayed && <section className="query-result__notice query-result__notice--delayed" role="status"><div><strong>El detalle está tardando más de lo habitual.</strong><p>La consulta está finalizada y puedes volver al historial. Reintentarlo no genera otra consulta ni descuenta créditos.</p></div><button type="button" onClick={() => setRefreshTick(0)}>↻ Recuperar reporte</button></section>}
          <section id="hallazgos" className="query-result__section-block"><div className="query-result__section-heading"><div><p className="query-result__eyebrow">RESUMEN EJECUTIVO</p><h2>Hallazgos y novedades</h2></div><p>{totalFindings ? `${totalFindings} registros clasificados por nivel de atención.` : hasUncertainResult ? 'No se identificaron hallazgos en las fuentes que respondieron. El resultado requiere revisión.' : 'No se identificaron hallazgos en las fuentes disponibles.'}</p></div>{groups.map((group) => <ResultGroup key={group.key} group={group} findings={group.findings} />)}</section>
          {hasIncompleteCoverage && <section className="query-result__source-failures"><div><p className="query-result__eyebrow">COBERTURA INCOMPLETA</p><h2>Fuentes sin confirmar</h2><p>Una o más fuentes fallaron, no respondieron o no entregaron un resultado concluyente.</p>{coverageIssueSources.length > 0 && <ul>{coverageIssueSources.map((source) => <li key={source}>{formatSourceName(source)}</li>)}</ul>}</div>{result.retry_available && <button type="button" onClick={handleRetry} disabled={retrying}>{retrying ? 'Actualizando fuentes...' : '↻ Actualizar fuentes'}<small>No consume créditos</small></button>}</section>}
          <SourceDirectory sources={result.source_index || []} />
          <section className="query-result__details" id="detalle"><div className="query-result__section-heading"><div><p className="query-result__eyebrow">INFORMACIÓN GENERAL</p><h2>Detalle por fuente</h2></div><p>Abre cada fuente para revisar sus registros de forma ordenada.</p></div>{(result.report_sections || []).map((section, index) => <SourceDetail key={section.id} section={section} initiallyOpen={index === 0} />)}{result.report_ready && !result.report_sections?.length && <p className="query-result__empty">El reporte no contiene datos adicionales para mostrar.</p>}</section>
          <footer className="query-result__footer"><strong>Verifik</strong><p>Este reporte organiza información obtenida de fuentes consultadas. Verifica los registros relevantes directamente con la entidad de origen antes de tomar decisiones.</p><span>Reporte privado · {formatDateTime(result.completed_at)}</span></footer>
        </article>
      )}
    </main>
  )
}

export default QueryResultPage
