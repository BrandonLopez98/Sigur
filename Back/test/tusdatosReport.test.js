const test = require('node:test')
const assert = require('node:assert/strict')
const { buildResultSummary, getRiskLevel } = require('../src/services/tusdatosReport')

test('normaliza el riesgo de un reporte JSON reutilizado', () => {
  assert.equal(getRiskLevel({ hallazgos: 'medio' }), 'medium')
  assert.equal(getRiskLevel({ dict_hallazgos: { altos: [{ fuente: 'x' }] } }), 'high')
  assert.equal(getRiskLevel({ hallazgo: false }), 'low')
})

test('resume reportes JSON que no incluyen el mapa results', () => {
  const summary = buildResultSummary({
    hallazgos: 'medio',
    source_config: { listas: true, judicial: true },
    dict_hallazgos: { altos: [], medios: [{ fuente: 'x' }], bajos: [], infos: [] },
    errores: ['rut'],
  }, { reportId: 'report-1' })

  assert.equal(summary.has_findings, true)
  assert.equal(summary.sources_checked, 2)
  assert.equal(summary.sources_with_findings, 1)
  assert.equal(summary.provider_report_id, 'report-1')
  assert.deepEqual(summary.provider_source_errors, ['rut'])
})
