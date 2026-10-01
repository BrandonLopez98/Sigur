const test = require('node:test')
const assert = require('node:assert/strict')
const { buildResultSummary, getRiskLevel } = require('../src/services/tusdatosReport')
const { serializeQueryProgress } = require('../src/controllers/Query/serializers/queryProgress')

test('normaliza el riesgo de un reporte JSON reutilizado', () => {
  assert.equal(getRiskLevel({ hallazgos: 'medio' }), 'medium')
  assert.equal(getRiskLevel({ dict_hallazgos: { altos: [{ fuente: 'x' }] } }), 'high')
  assert.equal(getRiskLevel({ hallazgo: false }), 'low')
})

test('mantiene riesgo desconocido cuando la cobertura es incompleta', () => {
  assert.equal(getRiskLevel({}), 'unknown')
  assert.equal(getRiskLevel({ hallazgo: false, results: { listas: 'Error' } }), 'unknown')
  assert.equal(getRiskLevel({ hallazgo: false, results: { listas: null } }), 'unknown')
  assert.equal(getRiskLevel({ hallazgo: false, results: 'Error' }), 'unknown')
  assert.equal(getRiskLevel({ hallazgos: 'bajo', errores: ['registraduria'] }), 'unknown')
  assert.equal(getRiskLevel({ results: { listas: false, judicial: false } }), 'low')
})

test('corrige al presentar una consulta antigua clasificada como riesgo bajo', () => {
  const serialized = serializeQueryProgress({
    id: 'query-legacy',
    status: 'completed',
    risk_level: 'low',
    provider_response: {
      report: { hallazgo: false, results: { listas: 'Error' } },
    },
  })

  assert.equal(serialized.risk_level, 'unknown')
  assert.equal(serialized.provider_response, undefined)
})

test('resume reportes JSON que no incluyen el mapa results', () => {
  const summary = buildResultSummary({
    hallazgos: 'medio',
    source_config: { listas: true, judicial: true },
    dict_hallazgos: { altos: [], medios: [{ fuente: 'x' }], bajos: [], infos: [] },
    errores: ['rut'],
  }, { reportId: 'report-1' })

  assert.equal(summary.has_findings, true)
  assert.equal(summary.sources_requested, 2)
  assert.equal(summary.sources_checked, 0)
  assert.equal(summary.sources_with_findings, 1)
  assert.equal(summary.sources_unknown, 2)
  assert.equal(summary.sources_unavailable, 1)
  assert.equal(summary.coverage_complete, false)
  assert.equal(summary.provider_report_id, 'report-1')
  assert.deepEqual(summary.provider_source_errors, ['rut'])
})
