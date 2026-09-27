import './QueryCard.css'

/**
 * Convierte una fecha ISO al formato dd/mm/aaaa.
 *
 * @param {string|null} date - Fecha recibida desde el backend.
 * @returns {string|null} Fecha formateada.
 */
function formatDate(date) {
  if (!date) return null

  const [year, month, day] = date.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/**
 * Representa una consulta individual dentro del historial.
 *
 * @param {Object} props
 * @param {Object} props.query - Datos de la consulta obtenidos desde el backend.
 */
function QueryCard({ query, onOpenResult }) {
  // Etiquetas legibles para valores que devuelve el backend.
  const statusLabels = {
    completed: 'Completada',
    pending: 'Pendiente',
    failed: 'Fallida',
    processing: 'Procesando',
  }

  const riskLabels = {
    low: 'Bajo riesgo',
    medium: 'Riesgo medio',
    high: 'Alto riesgo',
  }

  const isInProgress = ['pending', 'processing'].includes(query.status)
  const progress = query.progress || {
    percentage: query.status === 'processing' ? 15 : 5,
    estimated: true,
    label: 'Actualización automática en curso',
  }

  return (
    <article className="query-card">
      <div className="query-card__document-type">
        {query.document_type}
      </div>

      <div className="query-card__details">
        <h2>{query.search_name || 'Sin nombre'}</h2>

        <p>
          {query.document_number}

          {query.expedition_date && (
            <> · Expedición: {formatDate(query.expedition_date)}</>
          )}
        </p>

        {isInProgress && (
          <div className="query-card__progress" aria-live="polite">
            <div className="query-card__progress-copy">
              <small>{progress.label}</small>
              {!progress.estimated && <strong>{progress.percentage}%</strong>}
            </div>
            <div
              className="query-card__progress-track"
              role="progressbar"
              aria-label="Progreso de la verificación"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={progress.percentage}
              aria-valuetext={progress.label}
            >
              <span
                className={progress.estimated ? 'query-card__progress-bar query-card__progress-bar--estimated' : 'query-card__progress-bar'}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="query-card__tags">
        <span className={`query-card__status query-card__status--${query.status}`}>
          {statusLabels[query.status] || query.status}
        </span>

        {query.risk_level !== 'unknown' && (
          <span className={`query-card__risk query-card__risk--${query.risk_level}`}>
            {riskLabels[query.risk_level]}
          </span>
        )}

        {query.status === 'completed' && onOpenResult && (
          <button
            type="button"
            className="query-card__result"
            onClick={() => onOpenResult(query.id)}
          >
            Ver resultado
          </button>
        )}
      </div>
    </article>
  )
}

export default QueryCard
