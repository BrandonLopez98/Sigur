const { Query, User, conn } = require('../../db')
const { applyCreditMovement } = require('../../services/creditMovements')
const { refundQueryCredit } = require('../../services/refundQueryCredit')
const {
  launchTusdatosQuery,
  launchTusdatosVehicleQuery,
} = require('../../services/tusdatosApi')
const {
  registerTusdatosLaunchResponse,
} = require('../../services/tusdatosQueryLifecycle')
const {
  findRecentDuplicateQuery,
  markAsIdempotentReplay,
} = require('../../services/queryIdempotency')
const { incrementMetric, logEvent } = require('../../services/observability')

const DOCUMENT_TYPES = ['CC', 'CE', 'NIT', 'PP', 'PPT', 'INT']
const VEHICLE_OWNER_TYPES = ['CC', 'CE', 'NIT', 'TI']

function createHttpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function formatTusdatosIssueDate(date) {
  if (!date) return undefined

  const [year, month, day] = String(date).split('-')

  if (!year || !month || !day) {
    throw createHttpError('La fecha debe usar el formato YYYY-MM-DD.', 400)
  }

  return `${day}/${month}/${year}`
}

function validateInput({
  document_type,
  document_number,
  expedition_date,
  full_name,
  owner_document_type,
  owner_document_number,
  consent_given,
}) {
  const type = document_type?.trim().toUpperCase()
  const number = document_number?.trim()

  if (!type || !number) {
    throw createHttpError(
      'Tipo de consulta y número de documento o placa son obligatorios.',
      400
    )
  }

  if (!consent_given) {
    throw createHttpError(
      'Debes confirmar la autorización del titular para realizar la consulta.',
      400
    )
  }

  if (type === 'PLACA') {
    const plate = number.toUpperCase()
    const ownerType = owner_document_type?.trim().toUpperCase()
    const ownerNumber = owner_document_number?.trim()

    if (!/^[A-Z0-9]{6}$/.test(plate)) {
      throw createHttpError('La placa debe contener seis caracteres.', 400)
    }

    if (
      !VEHICLE_OWNER_TYPES.includes(ownerType) ||
      !/^\d+$/.test(ownerNumber || '')
    ) {
      throw createHttpError(
        'Indica el tipo y número de documento numérico del propietario.',
        400
      )
    }

    return {
      type,
      number: plate,
      expeditionDate: null,
      fullName: null,
      ownerDocumentType: ownerType,
      ownerDocumentNumber: ownerNumber,
    }
  }

  if (!DOCUMENT_TYPES.includes(type)) {
    throw createHttpError('El tipo de documento no es válido.', 400)
  }

  if (['CE', 'PPT'].includes(type) && !expedition_date) {
    throw createHttpError(
      'La fecha de expedición es obligatoria para CE y PPT.',
      400
    )
  }

  const fullName = full_name?.trim()

  if (['PP', 'INT'].includes(type) && (!fullName || fullName.length < 5)) {
    throw createHttpError(
      'El nombre completo es obligatorio para pasaporte y documento internacional.',
      400
    )
  }

  return {
    type,
    number,
    expeditionDate: expedition_date || null,
    fullName: fullName || null,
    ownerDocumentType: null,
    ownerDocumentNumber: null,
  }
}

/**
 * Descuenta un crédito, registra el movimiento y lanza la consulta.
 * Si Tusdatos no acepta el lanzamiento, el crédito se reintegra.
 */
module.exports = async (input) => {
  const { user_id, request_id } = input
  const data = validateInput(input)

  if (!user_id) {
    throw createHttpError('El usuario autenticado es obligatorio.', 401)
  }

  const creation = await conn.transaction(async (transaction) => {
    const user = await User.findByPk(user_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })

    if (!user) {
      throw createHttpError('El usuario no existe.', 404)
    }

    const duplicateQuery = await findRecentDuplicateQuery({
      Query,
      userId: user_id,
      data,
      transaction,
    })

    if (duplicateQuery) {
      return { query: markAsIdempotentReplay(duplicateQuery), replayed: true }
    }

    const createdQuery = await Query.create(
      {
        user_id,
        document_type: data.type,
        document_number: data.number,
        owner_document_type: data.ownerDocumentType,
        owner_document_number: data.ownerDocumentNumber,
        expedition_date: data.expeditionDate,
        search_name: data.fullName,
        consent_given: true,
        consented_at: new Date(),
        credit_charged_at: new Date(),
        status: 'pending',
        risk_level: 'unknown',
        provider: 'tusdatos',
      },
      { transaction }
    )

    await applyCreditMovement({
      transaction,
      userId: user_id,
      type: 'query_charge',
      amount: -1,
      sourceType: 'query',
      sourceId: createdQuery.id,
      reference: createdQuery.id,
      description: 'Crédito descontado por consulta de Verifik.',
      metadata: {
        document_type: data.type,
        document_number: data.number,
      },
    })

    return { query: createdQuery, replayed: false }
  })

  const { query, replayed } = creation

  if (replayed) {
    incrementMetric('query_idempotent_replays')
    logEvent('info', 'query.idempotent_replay', {
      query_id: query.id,
      user_id: user_id,
      request_id,
      status: query.status,
    })
    return query
  }

  try {
    const providerResponse =
      data.type === 'PLACA'
        ? await launchTusdatosVehicleQuery({
            licensePlate: data.number,
            ownerDocumentNumber: data.ownerDocumentNumber,
            ownerDocumentType: data.ownerDocumentType,
          })
        : await launchTusdatosQuery({
            documentNumber: data.number,
            documentType: data.type,
            issueDate: formatTusdatosIssueDate(data.expeditionDate),
            fullName: data.fullName,
            webhookReference: `verifik-query:${query.id}`,
          })

    const outcome = await registerTusdatosLaunchResponse(query, providerResponse)
    incrementMetric('query_launch_success')
    logEvent('info', 'query.launch_registered', {
      query_id: query.id,
      user_id,
      request_id,
      state: outcome.state,
      has_job_id: Boolean(outcome.query.provider_request_id),
      has_report_id: Boolean(outcome.query.provider_report_id),
    })
    return outcome.query
  } catch (providerError) {
    await refundQueryCredit({
      queryId: query.id,
      reason: providerError.message,
      providerResponse: providerError.providerResponse || null,
    })

    incrementMetric('query_launch_failure')
    logEvent('error', 'query.launch_failed', {
      query_id: query.id,
      user_id,
      request_id,
      status_code: providerError.status || 502,
      error: providerError,
    })

    throw createHttpError(
      'No fue posible iniciar la consulta. Tu crédito fue reintegrado.',
      providerError.status || 502
    )
  }
}
