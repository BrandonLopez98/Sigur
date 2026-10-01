const test = require('node:test')
const assert = require('node:assert/strict')
const { buildVerifikReport, sanitizeText } = require('../src/services/verifikReport')

test('reemplaza la marca del proveedor en cualquier texto visible', () => {
  assert.equal(sanitizeText('Reporte Tusdatos.co'), 'Reporte Verifik')
  assert.equal(sanitizeText('TUSDATOS terminó'), 'Verifik terminó')
})

test('crea una vista legible sin URLs ni metadatos internos', () => {
  const view = buildVerifikReport({
    nombre: 'Persona de prueba',
    dict_hallazgos: { medios: [{ fuente: 'Tusdatos', hallazgo: 'Registro' }] },
    results: { registraduria: true, listas: false },
    registraduria: {
      estado: 'Vigente',
      evidencia_url: 'https://dash-board.tusdatos.co/evidencia',
      nota: 'Validado por Tusdatos.co',
    },
    provider_report_id: 'secreto',
    logo: 'https://tusdatos.co/logo.png',
  })

  assert.deepEqual(view.profile, [{ label: 'Nombre', value: 'Persona de prueba' }])
  assert.equal(view.report_sections.length, 1)
  assert.equal(view.report_sections[0].title, 'Registraduria')
  assert.equal(view.report_sections[0].data.Nota, 'Validado por Verifik')
  assert.equal(JSON.stringify(view).toLowerCase().includes('tusdatos'), false)
  assert.equal(JSON.stringify(view).includes('https://'), false)
  assert.deepEqual(view.source_index.map((source) => source.status), ['clear', 'finding'])
})

test('diferencia fuentes limpias, fallidas, no disponibles y desconocidas', () => {
  const view = buildVerifikReport({
    source_config: { configurada_sin_respuesta: true },
    results: {
      con_hallazgo: true,
      sin_hallazgo: false,
      con_error: 'Error',
      no_disponible: 'No disponible',
      sin_confirmar: null,
    },
    errores: ['fuente_caida'],
  })
  const statuses = Object.fromEntries(
    view.source_index.map((source) => [source.name, source.status])
  )

  assert.deepEqual(statuses, {
    'Con error': 'error',
    'Con hallazgo': 'finding',
    'Configurada sin respuesta': 'unknown',
    'Fuente caida': 'unavailable',
    'No disponible': 'unavailable',
    'Sin confirmar': 'unknown',
    'Sin hallazgo': 'clear',
  })
})
