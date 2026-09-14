const { Query, User } = require('../../db')

module.exports = async ({
  user_id,
  document_type,
  document_number,
  expedition_date,
  consent_given,
}) => {
  try {
    if (!user_id) {
      throw new Error('El usuario autenticado es obligatorio.')
    }

    const normalizedDocumentType = document_type?.trim().toUpperCase()
    const normalizedDocumentNumber = document_number?.trim()

    if (!normalizedDocumentType || !normalizedDocumentNumber) {
      throw new Error(
        'Tipo de documento y número de documento son obligatorios.'
      )
    }

    const validDocumentTypes = ['CC', 'CE', 'NIT', 'PAS']

    if (!validDocumentTypes.includes(normalizedDocumentType)) {
      throw new Error('El tipo de documento no es válido.')
    }

    // Para una cédula colombiana, la fecha será obligatoria.
    if (normalizedDocumentType === 'CC' && !expedition_date) {
      throw new Error(
        'La fecha de expedición es obligatoria para una cédula de ciudadanía.'
      )
    }

    if (!consent_given) {
      throw new Error(
        'Debes confirmar la autorización del titular para realizar la consulta.'
      )
    }

    const userExists = await User.findByPk(user_id)

    if (!userExists) {
      throw new Error('El usuario no existe en la base de datos.')
    }

    const nuevaQuery = await Query.create({
      user_id,
      document_type: normalizedDocumentType,
      document_number: normalizedDocumentNumber,
      expedition_date: expedition_date || null,
      consent_given: true,
      consented_at: new Date(),
      status: 'pending',
      risk_level: 'unknown',
      provider: 'tusdatos',
    })

    return nuevaQuery
  } catch (error) {
    throw new Error(`Error al crear la consulta: ${error.message}`)
  }
}