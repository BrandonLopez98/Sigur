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
