import { useEffect, useMemo, useState } from 'react'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import QueryCard from '../../components/QueryCard/QueryCard'
import { getQueries } from '../../services/queriesApi'
import './HistoryPage.css'

// Estado inicial para todos los filtros.
const INITIAL_FILTERS = {
  search: '',
  status: '',
  risk_level: '',
  document_type: '',
  date_from: '',
  date_to: '',
}

/**
 * Página que obtiene y presenta el historial de consultas del usuario.
 */
function HistoryPage({ token }) {
  const [queries, setQueries] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Solo estos filtros deben solicitar información nueva al backend.
  // La búsqueda por texto se realiza en el navegador para responder al instante.
  const apiFilters = useMemo(
    () => ({
      status: filters.status,
      risk_level: filters.risk_level,
      document_type: filters.document_type,
      date_from: filters.date_from,
      date_to: filters.date_to,
    }),
    [
      filters.status,
      filters.risk_level,
      filters.document_type,
      filters.date_from,
      filters.date_to,
    ]
  )

  /**
   * Carga consultas al iniciar y cada vez que cambian filtros del backend.
   */
  useEffect(() => {
    let cancelled = false

    async function loadQueries() {
      setLoading(true)
      setError('')

      try {
        const data = await getQueries(token, apiFilters)

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
  }, [token, apiFilters])

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
      </header>

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visibleQueries.length}
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
