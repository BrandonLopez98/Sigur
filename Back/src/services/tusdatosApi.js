/** Cliente interno de Tusdatos; las credenciales nunca salen del backend. */
const TUSDATOS_BASE_URL = process.env.TUSDATOS_BASE_URL?.replace(/\/$/, '')
const TUSDATOS_API_TOKEN = process.env.TUSDATOS_API_TOKEN
const TUSDATOS_AUTH_MODE = process.env.TUSDATOS_AUTH_MODE || 'bearer'
const TUSDATOS_USERNAME = process.env.TUSDATOS_USERNAME
const TUSDATOS_PASSWORD = process.env.TUSDATOS_PASSWORD

function createProviderError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

function getTusdatosConfig() {
  if (!TUSDATOS_BASE_URL) {
    throw createProviderError('Falta TUSDATOS_BASE_URL en las variables de entorno.')
  }

  if (TUSDATOS_AUTH_MODE === 'basic') {
    if (!TUSDATOS_USERNAME || !TUSDATOS_PASSWORD) {
      throw createProviderError(
        'Faltan TUSDATOS_USERNAME o TUSDATOS_PASSWORD para Basic Auth.'
      )
    }

    return {
      baseUrl: TUSDATOS_BASE_URL,
      authorization: `Basic ${Buffer.from(
        `${TUSDATOS_USERNAME}:${TUSDATOS_PASSWORD}`
      ).toString('base64')}`,
    }
  }

  if (!TUSDATOS_API_TOKEN) {
    throw createProviderError('Falta TUSDATOS_API_TOKEN para autenticación Bearer.')
  }

  return {
    baseUrl: TUSDATOS_BASE_URL,
    authorization: `Bearer ${TUSDATOS_API_TOKEN}`,
  }
}

async function readTusdatosResponse(response, fallbackMessage) {
  const responseText = await response.text()
  let data

  try {
    data = responseText ? JSON.parse(responseText) : null
  } catch {
    data = responseText
  }

  if (!response.ok) {
    const error = createProviderError(
      data?.message || data?.detail || fallbackMessage,
      response.status
    )
    error.providerResponse = data
    throw error
  }

  return data
}

async function postTusdatos(path, payload, fallbackMessage) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return readTusdatosResponse(response, fallbackMessage)
}

/** Lanza una consulta de persona, empresa, pasaporte o documento internacional. */
async function launchTusdatosQuery({
  documentNumber,
  documentType,
  issueDate,
  fullName,
  webhookReference,
}) {
  const payload = {
    doc: String(documentNumber).trim(),
    typedoc: documentType === 'PAS' ? 'PP' : documentType,
    force: false,
  }

  if (issueDate) payload.fechaE = issueDate
  if (fullName) payload.name = fullName.trim()
  if (webhookReference) payload.webhook_reference = webhookReference

  return postTusdatos('/api/launch', payload, 'Tusdatos no pudo iniciar la consulta.')
}

/** Tusdatos exige placa y documento/tipo de documento del propietario. */
async function launchTusdatosVehicleQuery({
  licensePlate,
  ownerDocumentNumber,
  ownerDocumentType,
}) {
  return postTusdatos(
    '/api/launch/car',
    {
      placa: licensePlate.trim().toUpperCase(),
      doc: Number(ownerDocumentNumber),
      tdoc: ownerDocumentType,
    },
    'Tusdatos no pudo iniciar la consulta del vehículo.'
  )
}

async function getTusdatosQueryResult(jobId) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const response = await fetch(
    `${baseUrl}/api/results/${encodeURIComponent(jobId)}`,
    { headers: { Authorization: authorization, Accept: 'application/json' } }
  )

  return readTusdatosResponse(
    response,
    'No fue posible consultar el resultado en Tusdatos.'
  )
}

async function getTusdatosReportJson(reportId) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const response = await fetch(`${baseUrl}/api/report_json/${encodeURIComponent(reportId)}`, {
    headers: { Authorization: authorization, Accept: 'application/json' },
  })
  return readTusdatosResponse(response, 'No fue posible obtener el reporte JSON.')
}

async function getTusdatosReportPdf(reportId, documentType) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const reportPath = documentType === 'PLACA'
    ? '/api/v2/report_car_pdf/'
    : documentType === 'NIT'
      ? '/api/v2/report_nit_pdf/'
      : '/api/v2/report_pdf/'
  const response = await fetch(`${baseUrl}${reportPath}${encodeURIComponent(reportId)}`, {
    headers: { Authorization: authorization, Accept: 'application/pdf' },
  })
  if (!response.ok) throw createProviderError('No fue posible obtener el PDF.', response.status)
  return Buffer.from(await response.arrayBuffer())
}

module.exports = {
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
  getTusdatosQueryResult,
  getTusdatosReportJson,
  getTusdatosReportPdf,
}
