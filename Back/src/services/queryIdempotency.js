const { Op } = require('sequelize')

const DEFAULT_WINDOW_MS = 60000

function getIdempotencyWindowMs() {
  const configured = Number(process.env.QUERY_IDEMPOTENCY_WINDOW_MS || DEFAULT_WINDOW_MS)
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_WINDOW_MS
}

function buildDuplicateQueryWhere({ userId, data, now = new Date() }) {
  const cutoff = new Date(now.getTime() - getIdempotencyWindowMs())

  return {
    user_id: userId,
    document_type: data.type,
    document_number: data.number,
    owner_document_type: data.ownerDocumentType,
    owner_document_number: data.ownerDocumentNumber,
    status: { [Op.ne]: 'failed' },
    created_at: { [Op.gte]: cutoff },
  }
}

async function findRecentDuplicateQuery({ Query, userId, data, transaction, now }) {
  if (getIdempotencyWindowMs() === 0) return null

  return Query.findOne({
    where: buildDuplicateQueryWhere({ userId, data, now }),
    order: [['created_at', 'DESC']],
    transaction,
  })
}

function markAsIdempotentReplay(query) {
  if (typeof query.setDataValue === 'function') {
    query.setDataValue('idempotent_replay', true)
  } else {
    query.idempotent_replay = true
  }
  return query
}

module.exports = {
  buildDuplicateQueryWhere,
  findRecentDuplicateQuery,
  getIdempotencyWindowMs,
  markAsIdempotentReplay,
}
