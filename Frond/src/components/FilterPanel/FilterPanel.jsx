import { useState } from 'react'
import './FilterPanel.css'

/**
 * Panel para buscar y aplicar filtros al historial de consultas.
 *
 * @param {Object} props
 * @param {Object} props.filters - Valores activos de los filtros.
 * @param {Function} props.onFiltersChange - Actualiza los filtros en la página padre.
 */
function FilterPanel({ filters, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Actualiza un filtro sin eliminar los otros valores seleccionados.
   */
  function handleChange(event) {
    const { name, value } = event.target

    onFiltersChange({
      ...filters,
      [name]: value,
    })
  }

  /**
   * Elimina todos los filtros activos.
   */
  function clearFilters() {
    onFiltersChange({
      search: '',
      status: '',
      risk_level: '',
      document_type: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <section className="filter-panel">
      <div className="filter-panel__top">
        <label className="filter-panel__search">
          <span aria-hidden="true">⌕</span>

          <input
            name="search"
            type="search"
            placeholder="Buscar por nombre o número de documento..."
            value={filters.search}
            onChange={handleChange}
          />
        </label>

        <button
          type="button"
          className="filter-panel__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          ⌄ Filtros
        </button>
      </div>

      {isOpen && (
        <div className="filter-panel__options">
          <label>
            Tipo de documento

            <select
              name="document_type"
              value={filters.document_type}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PAS">PAS</option>
            </select>
          </label>

          <label>
            Estado

            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="completed">Completada</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallida</option>
            </select>
          </label>

          <label>
            Nivel de riesgo

            <select
              name="risk_level"
              value={filters.risk_level}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="low">Bajo riesgo</option>
              <option value="medium">Riesgo medio</option>
              <option value="high">Alto riesgo</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className="filter-panel__clear"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default FilterPanel