import { useEffect, useMemo, useState } from 'react'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import QueryCard from '../../components/QueryCard/QueryCard'
import { getQueries } from '../../services/queriesApi'
import './HistoryPage.css'

// Temporal: este valor vendrá del usuario autenticado cuando hagamos login.
const CURRENT_USER_ID = 'c5f47e93-d3fe-4547-9061-982326dee426'

// Estado inicial para todos los filtros.
const INITIAL_FILTERS = {
  search: '',
  status: '',
  risk_level: '',
  document_type: '',
}

/**
 * Página que obtiene y presenta el historial de consultas del usuario.
 */
function HistoryPage() {
  const [queries, setQueries] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /**
   * Carga consultas al iniciar y cada vez que cambian filtros del backend.
   */
  useEffect(() => {
    let cancelled = false

    async function loadQueries() {
      setLoading(true)
      setError('')

      try {
        // search se aplica localmente; los demás filtros van al backend.
        const { search, ...apiFilters } = filters
        const data = await getQueries(CURRENT_USER_ID, apiFilters)

        if (!cancelled) {
          setQueries(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadQueries()

    return () => {
      cancelled = true
    }
  }, [filters.status, filters.risk_level, filters.document_type])

  /**
   * Busca por nombre o documento entre las consultas ya obtenidas.
   */
  const visibleQueries = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    if (!search) return queries

    return queries.filter((query) => {
      const name = query.search_name?.toLowerCase() || ''
      const document = query.document_number?.toLowerCase() || ''

      return name.includes(search) || document.includes(search)
    })
  }, [queries, filters.search])

  return (
    <main className="history-page">
      <header className="history-page__header">
        <div>
          <h1>Historial de consultas</h1>
          <p>{visibleQueries.length} resultados encontrados</p>
        </div>

        {/* La exportación se programará cuando definamos el formato del CSV. */}
        <button type="button" className="history-page__export">
          ↓ Exportar CSV
        </button>
      </header>

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loading && (
        <p className="history-page__message">Cargando consultas...</p>
      )}

      {!loading && error && (
        <p className="history-page__message history-page__message--error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="history-page__list">
          {visibleQueries.length === 0 ? (
            <p className="history-page__message">
              No se encontraron consultas.
            </p>
          ) : (
            visibleQueries.map((query) => (
              <QueryCard key={query.id} query={query} />
            ))
          )}
        </section>
      )}
    </main>
  )
}

export default HistoryPage