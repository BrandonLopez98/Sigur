const { Query } = require('../../db')
const { getTusdatosReportHtml } = require('../../services/tusdatosApi')

const IMAGE_URL_PATTERN = /\.(?:png|jpe?g|webp|gif|avif)(?:[?#].*)?$/i
const IMAGE_KEY_PATTERN = /(?:foto|fotografia|imagen|image|photo|selfie|rostro|firma|avatar)/i
const MAX_REPORT_IMAGES = 12
const REPORT_IMAGE_EXCLUSIONS = /(?:tusdatos|ultradatus|btn-special|logo)/i

function formatImageLabel(path) {
  return path
    .map((part) => String(part).replaceAll('_', ' '))
    .filter(Boolean)
    .join(' · ') || 'Imagen del resultado'
}

function isSafeImage(value, path) {
  if (typeof value !== 'string') return false
  const context = path.join(' ')
  const isDataImage = value.startsWith('data:image/') && value.length <= 5_000_000
  const isRawBase64Image = IMAGE_KEY_PATTERN.test(context)
    && /^[A-Za-z0-9+/=]+$/.test(value)
    && value.length > 100
    && value.length <= 5_000_000
  const isHttpsImage = value.startsWith('https://')
    && !/\.pdf(?:[?#].*)?$/i.test(value)
    && (IMAGE_URL_PATTERN.test(value) || IMAGE_KEY_PATTERN.test(context))
  return isDataImage || isHttpsImage || isRawBase64Image
}

/** Extrae imágenes del reporte sin exponer el resto de sus URLs técnicas. */
function getReportImages(report) {
  const images = []
  const seen = new Set()

  function visit(value, path = [], depth = 0) {
    if (images.length >= MAX_REPORT_IMAGES || depth > 6 || value === null || value === undefined) return

    if (typeof value === 'string') {
      if (isSafeImage(value, path)) {
        const imageUrl = /^[A-Za-z0-9+/=]+$/.test(value) && !value.startsWith('data:image/') && !value.startsWith('https://')
          ? `data:image/jpeg;base64,${value}`
          : value

        if (seen.has(imageUrl)) return
        seen.add(imageUrl)
        images.push({ url: imageUrl, label: formatImageLabel(path) })
      }
      return
    }

    if (Array.isArray(value)) {
      value.slice(0, 30).forEach((item, index) => visit(item, [...path, index + 1], depth + 1))
      return
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => visit(item, [...path, key], depth + 1))
    }
  }

  visit(report)
  return images
}

/** Obtiene las evidencias visuales que el proveedor inserta solo en el HTML. */
function getHtmlReportImages(html) {
  if (typeof html !== 'string') return []

  const images = []
  const seen = new Set()
  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)

  for (const match of matches) {
    if (images.length >= MAX_REPORT_IMAGES) break

    const rawUrl = match[1]
    if (rawUrl.startsWith('data:') || REPORT_IMAGE_EXCLUSIONS.test(rawUrl)) continue

    let imageUrl
    try {
      imageUrl = new URL(rawUrl, 'https://dash-board.tusdatos.co').toString()
    } catch {
      continue
    }

    if (imageUrl.protocol !== 'https:' || !IMAGE_URL_PATTERN.test(imageUrl) || seen.has(imageUrl)) continue
    seen.add(imageUrl)

    const fileName = decodeURIComponent(imageUrl.pathname.split('/').pop() || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replaceAll(/[-_]/g, ' ')

    images.push({ url: imageUrl, label: formatImageLabel([fileName]) })
  }

  return images
}

/**
 * Entrega el resultado persistido únicamente al usuario que creó la consulta.
 * El frontend usa esta ruta para construir la vista detallada de Verifik.
 */
module.exports = async (req, res, next) => {
  try {
    const query = await Query.findOne({
      where: {
        id: req.params.queryId,
        user_id: req.user.userId,
      },
    })

    if (!query) {
      return res.status(404).json({ error: 'Consulta no encontrada.' })
    }

    if (query.status !== 'completed') {
      return res.status(409).json({
        error: 'El resultado todavía no está disponible.',
        status: query.status,
      })
    }

    const failedSources = query.result_summary?.provider_source_errors
      || query.provider_response?.result?.errores
      || []

    let images = getReportImages(query.provider_response?.report)

    // El JSON contiene los datos, pero las capturas de fuentes se incluyen en
    // el HTML del reporte. Solo se consultan al abrir un resultado terminado.
    if (!images.length && query.provider_report_id) {
      try {
        const reportHtml = await getTusdatosReportHtml(query.provider_report_id)
        images = getHtmlReportImages(reportHtml)
      } catch (imageError) {
        console.warn('No fue posible cargar imágenes del reporte:', imageError.message)
      }
    }

    return res.status(200).json({
      id: query.id,
      document_type: query.document_type,
      document_number: query.document_number,
      search_name: query.search_name,
      status: query.status,
      risk_level: query.risk_level,
      completed_at: query.completed_at,
      summary: query.result_summary,
      report: query.provider_response?.report || null,
      images,
      failed_sources: Array.isArray(failedSources) ? failedSources : [],
      retry_available: query.document_type !== 'PLACA' && Array.isArray(failedSources) && failedSources.length > 0,
    })
  } catch (error) {
    return next(error)
  }
}
