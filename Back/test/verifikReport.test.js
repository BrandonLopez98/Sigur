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
