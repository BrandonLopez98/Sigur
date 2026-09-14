import { useState } from 'react'
import './FilterPanel.css'

const DOCUMENT_TYPES = ['CC', 'CE', 'NIT', 'PAS']

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'failed', label: 'Fallida' },
]

const RISK_OPTIONS = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

/**
 * Grupo reutilizable de botones para seleccionar un filtro.
 */
function FilterGroup({ title, options, value, onSelect }) {
  return (
    <div className="filter-panel__group">
      <span className="filter-panel__label">{title}</span>

      <div className="filter-panel__chips">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          const isActive = value === optionValue

          return (
            <button
              key={optionValue}
              type="button"
              className={isActive ? 'filter-panel__chip filter-panel__chip--active' : 'filter-panel__chip'}
              onClick={() => onSelect(isActive ? '' : optionValue)}
              aria-pressed={isActive}
            >
              {optionLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Panel para buscar y filtrar las consultas del historial.
 */
function FilterPanel({ filters, onFiltersChange, resultCount }) {
  const [isOpen, setIsOpen] = useState(true)

  // Cuenta filtros, sin contar el buscador de texto.
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && Boolean(value)
  ).length

  /**
   * Cambia el valor de un filtro sin borrar los demás.
   */
  function updateFilter(name, value) {
    onFiltersChange({
      ...filters,
      [name]: value,
    })
  }

  /**
   * Restablece todos los filtros.
   */
  function clearFilters() {
    onFiltersChange({
      search: '',
      status: '',
      risk_level: '',
      document_type: '',
      date_from: '',
      date_to: '',
    })
  }

  return (
    <section className="filter-panel">
      <div className="filter-panel__top">
        <label className="filter-panel__search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Buscar por nombre o número de documento..."
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </label>

        <button
          type="button"
          className="filter-panel__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          ⚑ Filtros
          {activeFilterCount > 0 && (
            <span className="filter-panel__counter">{activeFilterCount}</span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            className="filter-panel__clear"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="filter-panel__content">
          <div className="filter-panel__groups">
            <FilterGroup
              title="Tipo de documento"
              options={DOCUMENT_TYPES}
              value={filters.document_type}
              onSelect={(value) => updateFilter('document_type', value)}
            />

            <FilterGroup
              title="Estado"
              options={STATUS_OPTIONS}
              value={filters.status}
              onSelect={(value) => updateFilter('status', value)}
            />

            <FilterGroup
              title="Nivel de riesgo"
              options={RISK_OPTIONS}
              value={filters.risk_level}
              onSelect={(value) => updateFilter('risk_level', value)}
            />
          </div>

          <div className="filter-panel__bottom">
            <label className="filter-panel__date">
              <span>Fecha desde</span>
              <input
                type="date"
                value={filters.date_from}
                onChange={(event) => updateFilter('date_from', event.target.value)}
              />
            </label>

            <label className="filter-panel__date">
              <span>Fecha hasta</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(event) => updateFilter('date_to', event.target.value)}
              />
            </label>

            <div className="filter-panel__result-count">
              <strong>{resultCount}</strong>
              <span>resultados encontrados</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default FilterPanel