import { useState } from 'react'
import { createQuery } from '../../services/queriesApi'
import './NewQueryPage.css'

const CONSULTATION_TYPES = [
  {
    code: 'CC',
    label: 'Persona',
    shortLabel: 'CC',
    identifierLabel: 'Número de cédula',
    placeholder: 'Ej. 1020451823',
    requiresExpeditionDate: true,
  },
  {
    code: 'CE',
    label: 'Extranjero',
    shortLabel: 'CE',
    identifierLabel: 'Número de cédula de extranjería',
    placeholder: 'Ej. 312456',
    requiresExpeditionDate: false,
  },
  {
    code: 'NIT',
    label: 'Empresa',
    shortLabel: 'NIT',
    identifierLabel: 'Número de identificación tributaria',
    placeholder: 'Ej. 900987654-3',
    requiresExpeditionDate: false,
  },
  {
    code: 'PAS',
    label: 'Pasaporte',
    shortLabel: 'PAS',
    identifierLabel: 'Número de pasaporte',
    placeholder: 'Ej. AB987654',
    requiresExpeditionDate: false,
  },
  {
    code: 'PLACA',
    label: 'Vehículo',
    shortLabel: 'Placa',
    identifierLabel: 'Placa del vehículo',
    placeholder: 'Ej. ABC123',
    requiresExpeditionDate: false,
  },
]

function NewQueryPage({ token, onQueryCreated }) {
  const [selectedType, setSelectedType] = useState(CONSULTATION_TYPES[0])
  const [documentNumber, setDocumentNumber] = useState('')
  const [expeditionDate, setExpeditionDate] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleTypeChange(type) {
    setSelectedType(type)
    setDocumentNumber('')
    setExpeditionDate('')
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!documentNumber.trim()) {
      setError(`Ingresa ${selectedType.identifierLabel.toLowerCase()}.`)
      return
    }

    if (selectedType.requiresExpeditionDate && !expeditionDate) {
      setError('La fecha de expedición es obligatoria para una cédula.')
      return
    }

    if (!consentGiven) {
      setError('Debes aceptar la autorización para realizar la consulta.')
      return
    }

    setLoading(true)

    try {
      const queryCreated = await createQuery(token, {
        document_type: selectedType.code,
        document_number:
          selectedType.code === 'PLACA'
            ? documentNumber.trim().toUpperCase()
            : documentNumber.trim(),
        expedition_date: selectedType.requiresExpeditionDate
          ? expeditionDate
          : null,
        consent_given: true,
      })

      setSuccess('Consulta creada correctamente. Estamos procesando el resultado.')
      setDocumentNumber('')
      setExpeditionDate('')
      setConsentGiven(false)

      if (onQueryCreated) {
        onQueryCreated(queryCreated)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="new-query-page">
      <p className="new-query-page__eyebrow">Nueva verificación</p>
      <h1>Nueva consulta</h1>
      <p className="new-query-page__description">
        Selecciona qué deseas consultar e ingresa los datos requeridos.
      </p>

      <form className="new-query-form" onSubmit={handleSubmit}>
        <fieldset className="new-query-form__types">
          <legend>¿Qué deseas consultar?</legend>

          <div className="new-query-form__type-grid">
            {CONSULTATION_TYPES.map((type) => (
              <button
                className={`new-query-form__type ${
                  selectedType.code === type.code
                    ? 'new-query-form__type--active'
                    : ''
                }`}
                key={type.code}
                onClick={() => handleTypeChange(type)}
                type="button"
              >
                <strong>{type.label}</strong>
                <span>{type.shortLabel}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="new-query-form__field">
          <span>{selectedType.identifierLabel}</span>
          <input
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
            placeholder={selectedType.placeholder}
            required
          />
        </label>

        {selectedType.requiresExpeditionDate && (
          <label className="new-query-form__field">
            <span>Fecha de expedición</span>
            <input
              type="date"
              value={expeditionDate}
              onChange={(event) => setExpeditionDate(event.target.value)}
              required
            />
          </label>
        )}

        <label className="new-query-form__consent">
          <input
            checked={consentGiven}
            onChange={(event) => setConsentGiven(event.target.checked)}
            type="checkbox"
          />
          <span>
            Confirmo que cuento con la autorización del titular para realizar
            esta consulta.
          </span>
        </label>

        {error && <p className="new-query-form__message">{error}</p>}

        {success && (
          <p className="new-query-form__message new-query-form__message--success">
            {success}
          </p>
        )}

        <button
          className="new-query-form__submit"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creando consulta...' : 'Consultar'}
        </button>
      </form>
    </main>
  )
}

export default NewQueryPage