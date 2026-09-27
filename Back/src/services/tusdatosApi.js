/** Cliente interno de Tusdatos; las credenciales nunca salen del backend. */
const TUSDATOS_BASE_URL = process.env.TUSDATOS_BASE_URL?.replace(/\/$/, '')
const TUSDATOS_API_TOKEN = process.env.TUSDATOS_API_TOKEN
const TUSDATOS_AUTH_MODE = (process.env.TUSDATOS_AUTH_MODE || 'bearer').toLowerCase()
const TUSDATOS_USERNAME = process.env.TUSDATOS_USERNAME
const TUSDATOS_PASSWORD = process.env.TUSDATOS_PASSWORD
const REQUEST_TIMEOUT_MS = Number(process.env.TUSDATOS_REQUEST_TIMEOUT_MS || 15000)
const MIN_LAUNCH_INTERVAL_MS = Number(process.env.TUSDATOS_MIN_LAUNCH_INTERVAL_MS || 5000)

// Tusdatos exige cinco segundos entre lanzamientos. Esta cola protege cada
// instancia de Node; en una implementación multi-servidor deberá reemplazarse
// por una cola compartida (Redis, SQS, etc.).
let launchQueue = Promise.resolve()
let nextLaunchAt = 0

function createProviderError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function getTusdatosConfig() {
  if (!TUSDATOS_BASE_URL) {
    throw createProviderError('Falta TUSDATOS_BASE_URL en las variables de entorno.')
  }

  let baseUrl
  try {
    baseUrl = new URL(TUSDATOS_BASE_URL)
  } catch {
    throw createProviderError('TUSDATOS_BASE_URL no tiene una URL válida.')
  }

  if (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:') {
    throw createProviderError('TUSDATOS_BASE_URL debe usar HTTPS en producción.')
  }

  if (TUSDATOS_AUTH_MODE === 'basic') {
    if (!TUSDATOS_USERNAME || !TUSDATOS_PASSWORD) {
      throw createProviderError('Faltan TUSDATOS_USERNAME o TUSDATOS_PASSWORD para Basic Auth.')
    }

    return {
      baseUrl: baseUrl.toString().replace(/\/$/, ''),
      authorization: `Basic ${Buffer.from(`${TUSDATOS_USERNAME}:${TUSDATOS_PASSWORD}`).toString('base64')}`,
    }
  }

  if (TUSDATOS_AUTH_MODE !== 'bearer') {
    throw createProviderError('TUSDATOS_AUTH_MODE debe ser basic o bearer.')
  }

  if (!TUSDATOS_API_TOKEN) {
    throw createProviderError('Falta TUSDATOS_API_TOKEN para autenticación Bearer.')
  }

  return {
    baseUrl: baseUrl.toString().replace(/\/$/, ''),
    authorization: `Bearer ${TUSDATOS_API_TOKEN}`,
  }
}

/** Las recargas de fuentes usan Basic Auth según el contrato del proveedor. */
function getTusdatosRetryAuthorization() {
  if (!TUSDATOS_USERNAME || !TUSDATOS_PASSWORD) {
    throw createProviderError(
      'Faltan las credenciales de recarga. Configura TUSDATOS_USERNAME y TUSDATOS_PASSWORD.'
    )
  }

  return `Basic ${Buffer.from(`${TUSDATOS_USERNAME}:${TUSDATOS_PASSWORD}`).toString('base64')}`
}

function hasTusdatosConfiguration() {
  try {
    getTusdatosConfig()
    return true
  } catch {
    return false
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
    const error = createProviderError(data?.message || data?.detail || fallbackMessage, response.status)
    error.providerResponse = data
    throw error
  }

  return data
}

async function requestTusdatos(path, options, fallbackMessage) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    return await readTusdatosResponse(response, fallbackMessage)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createProviderError('Tusdatos tardó demasiado en responder.', 504)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function scheduleLaunch(task) {
  const scheduled = launchQueue.then(async () => {
    const waitTime = Math.max(0, nextLaunchAt - Date.now())
    if (waitTime > 0) await wait(waitTime)
    nextLaunchAt = Date.now() + MIN_LAUNCH_INTERVAL_MS
    return task()
  })

  launchQueue = scheduled.catch(() => undefined)
  return scheduled
}

function postTusdatos(path, payload, fallbackMessage, { throttleLaunch = false } = {}) {
  const request = () => requestTusdatos(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    fallbackMessage
  )

  return throttleLaunch ? scheduleLaunch(request) : request()
}

/** Lanza una consulta de persona, empresa, pasaporte o documento internacional. */
function launchTusdatosQuery({
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

  return postTusdatos('/api/launch', payload, 'Tusdatos no pudo iniciar la consulta.', {
    throttleLaunch: true,
  })
}

/** Tusdatos exige placa y documento/tipo de documento del propietario. */
function launchTusdatosVehicleQuery({
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
    'Tusdatos no pudo iniciar la consulta del vehículo.',
    { throttleLaunch: true }
  )
}

function getTusdatosQueryResult(jobId) {
  return requestTusdatos(
    `/api/results/${encodeURIComponent(jobId)}`,
    { method: 'GET' },
    'No fue posible consultar el resultado en Tusdatos.'
  )
}

/**
 * Recarga exclusivamente las fuentes que fallaron en un reporte finalizado.
 * Este endpoint no crea una consulta nueva ni consume créditos del plan.
 */
function retryTusdatosQuery({ reportId, documentType }) {
  const type = String(documentType || '').trim().toUpperCase()
  const endpoint = type === 'NIT' ? '/api/retry_nit/' : '/api/retry/'
  const query = new URLSearchParams({ typedoc: type })

  return requestTusdatos(
    `${endpoint}${encodeURIComponent(reportId)}?${query.toString()}`,
    {
      method: 'GET',
      // No se usa Bearer aquí: la API documenta explícitamente HTTP Basic
      // para que sea una recarga del reporte existente y no un lanzamiento.
      headers: { Authorization: getTusdatosRetryAuthorization() },
    },
    'No fue posible actualizar las fuentes con falla.'
  )
}

function getTusdatosReportJson(reportId) {
  return requestTusdatos(
    `/api/report_json/${encodeURIComponent(reportId)}`,
    { method: 'GET' },
    'No fue posible obtener el reporte JSON.'
  )
}

/** Lee el HTML del reporte ya generado; no inicia ni cobra una consulta. */
function getTusdatosReportHtml(reportId) {
  return requestTusdatos(
    `/api/v2/report/${encodeURIComponent(reportId)}`,
    { method: 'GET', headers: { Accept: 'text/html' } },
    'No fue posible obtener las imágenes del resultado.'
  )
}

async function getTusdatosReportPdf(reportId, documentType) {
  const { baseUrl, authorization } = getTusdatosConfig()
  const reportPath = documentType === 'PLACA'
    ? '/api/v2/report_car_pdf/'
    : documentType === 'NIT'
      ? '/api/v2/report_nit_pdf/'
      : '/api/v2/report_pdf/'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${reportPath}${encodeURIComponent(reportId)}`, {
      headers: { Authorization: authorization, Accept: 'application/pdf' },
      signal: controller.signal,
    })
    if (!response.ok) throw createProviderError('No fue posible obtener el PDF.', response.status)
    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createProviderError('Tusdatos tardó demasiado en entregar el PDF.', 504)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function isTerminalTusdatosError(error) {
  if ([404, 500].includes(error?.status)) return true
  const providerStatus = String(error?.providerResponse?.estado || '').toLowerCase()
  return providerStatus.startsWith('error') || providerStatus === 'fallido'
}

module.exports = {
  getTusdatosConfig,
  hasTusdatosConfiguration,
  isTerminalTusdatosError,
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
  getTusdatosQueryResult,
  retryTusdatosQuery,
  getTusdatosReportJson,
  getTusdatosReportHtml,
  getTusdatosReportPdf,
}
