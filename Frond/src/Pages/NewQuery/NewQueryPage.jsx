import { useState } from 'react'
import { createQuery } from '../../services/queriesApi'
import './NewQueryPage.css'

const CONSULTATION_TYPES = [
  { code: 'CC', label: 'Cédula', identifierLabel: 'Número de cédula', placeholder: 'Ej. 1020451823', requiresDate: true },
  { code: 'CE', label: 'Extranjería', identifierLabel: 'Número de cédula de extranjería', placeholder: 'Ej. 312456', requiresDate: true },
  { code: 'NIT', label: 'Empresa', identifierLabel: 'Número de NIT', placeholder: 'Ej. 900987654', requiresDate: false },
  { code: 'PP', label: 'Pasaporte', identifierLabel: 'Número de pasaporte', placeholder: 'Ej. AB987654', requiresName: true },
  { code: 'PPT', label: 'PPT', identifierLabel: 'Número PPT', placeholder: 'Ej. 900020700000', requiresDate: true },
  { code: 'INT', label: 'Internacional', identifierLabel: 'Número de documento', placeholder: 'Ej. XY4322211000', requiresName: true },
  { code: 'PLACA', label: 'Vehículo', identifierLabel: 'Placa del vehículo', placeholder: 'Ej. ABC123', isVehicle: true },
]

function NewQueryPage({ token, onQueryCreated }) {
  const [selectedType, setSelectedType] = useState(CONSULTATION_TYPES[0])
  const [documentNumber, setDocumentNumber] = useState('')
  const [expeditionDate, setExpeditionDate] = useState('')
  const [fullName, setFullName] = useState('')
  const [ownerDocumentType, setOwnerDocumentType] = useState('CC')
  const [ownerDocumentNumber, setOwnerDocumentNumber] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleTypeChange(type) {
    setSelectedType(type)
    setDocumentNumber('')
    setExpeditionDate('')
    setFullName('')
    setOwnerDocumentNumber('')
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!documentNumber.trim()) return setError(`Ingresa ${selectedType.identifierLabel.toLowerCase()}.`)
    if (selectedType.requiresDate && !expeditionDate) return setError('La fecha de expedición es obligatoria.')
    if (selectedType.requiresName && fullName.trim().length < 5) return setError('Ingresa el nombre completo del titular.')
    if (selectedType.isVehicle && !ownerDocumentNumber.trim()) return setError('Ingresa el documento del propietario.')
    if (!consentGiven) return setError('Debes aceptar la autorización para realizar la consulta.')

    setLoading(true)
    try {
      const query = await createQuery(token, {
        document_type: selectedType.code,
        document_number: selectedType.isVehicle ? documentNumber.trim().toUpperCase() : documentNumber.trim(),
        expedition_date: selectedType.requiresDate ? expeditionDate : null,
        full_name: selectedType.requiresName ? fullName.trim() : null,
        owner_document_type: selectedType.isVehicle ? ownerDocumentType : null,
        owner_document_number: selectedType.isVehicle ? ownerDocumentNumber.trim() : null,
        consent_given: true,
      })

      setSuccess('Consulta enviada. Estamos procesando el resultado.')
      if (onQueryCreated) onQueryCreated(query)
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
      <p className="new-query-page__description">Selecciona el tipo de validación e ingresa los datos solicitados.</p>
      <form className="new-query-form" onSubmit={handleSubmit}>
        <fieldset className="new-query-form__types">
          <legend>¿Qué deseas consultar?</legend>
          <div className="new-query-form__type-grid">
            {CONSULTATION_TYPES.map((type) => <button className={`new-query-form__type ${selectedType.code === type.code ? 'new-query-form__type--active' : ''}`} key={type.code} onClick={() => handleTypeChange(type)} type="button"><strong>{type.label}</strong><span>{type.code}</span></button>)}
          </div>
        </fieldset>
        <label className="new-query-form__field"><span>{selectedType.identifierLabel}</span><input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} placeholder={selectedType.placeholder} required /></label>
        {selectedType.requiresName && <label className="new-query-form__field"><span>Nombre completo</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ej. Juan Pérez García" required /></label>}
        {selectedType.requiresDate && <label className="new-query-form__field"><span>Fecha de expedición</span><input type="date" value={expeditionDate} onChange={(event) => setExpeditionDate(event.target.value)} required /></label>}
        {selectedType.isVehicle && <div className="new-query-form__owner"><label className="new-query-form__field"><span>Tipo de documento del propietario</span><select value={ownerDocumentType} onChange={(event) => setOwnerDocumentType(event.target.value)}><option>CC</option><option>CE</option><option>NIT</option><option>TI</option></select></label><label className="new-query-form__field"><span>Documento del propietario</span><input inputMode="numeric" value={ownerDocumentNumber} onChange={(event) => setOwnerDocumentNumber(event.target.value)} placeholder="Ej. 1020451823" required /></label></div>}
        <label className="new-query-form__consent"><input checked={consentGiven} onChange={(event) => setConsentGiven(event.target.checked)} type="checkbox" /><span>Confirmo que cuento con la autorización del titular para realizar esta consulta.</span></label>
        {error && <p className="new-query-form__message">{error}</p>}
        {success && <p className="new-query-form__message new-query-form__message--success">{success}</p>}
        <button className="new-query-form__submit" disabled={loading} type="submit">{loading ? 'Enviando consulta...' : 'Consultar'}</button>
      </form>
    </main>
  )
}

export default NewQueryPage
