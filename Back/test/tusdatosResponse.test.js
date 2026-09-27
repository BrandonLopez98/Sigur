const test = require('node:test')
const assert = require('node:assert/strict')
const {
  classifyTusdatosLaunchResponse,
  getStoredTusdatosReportId,
} = require('../src/services/tusdatosResponse')

test('clasifica una consulta nueva mediante jobid', () => {
  assert.deepEqual(
    classifyTusdatosLaunchResponse({ jobid: 'job-123', estado: 'procesando' }),
    {
      kind: 'processing',
      jobId: 'job-123',
      reportId: null,
      status: 'procesando',
      message: '',
    }
  )
})

test('clasifica un documento previamente consultado mediante id de reporte', () => {
  const classified = classifyTusdatosLaunchResponse({
    id: 'report-123',
    error: 'Documento consultado previamente',
  })

  assert.equal(classified.kind, 'report_ready')
  assert.equal(classified.reportId, 'report-123')
})

test('acepta aliases conocidos del contrato del proveedor', () => {
  assert.equal(
    classifyTusdatosLaunchResponse({ job_id: 456 }).jobId,
    '456'
  )
  assert.equal(
    classifyTusdatosLaunchResponse({ report_id: 'report-456' }).reportId,
    'report-456'
  )
})

test('rechaza respuestas sin identificador recuperable', () => {
  assert.equal(
    classifyTusdatosLaunchResponse({ estado: 'ok' }).kind,
    'invalid'
  )
  assert.equal(classifyTusdatosLaunchResponse(null).kind, 'invalid')
})

test('recupera un reportId guardado en respuestas antiguas', () => {
  assert.equal(
    getStoredTusdatosReportId({ provider_response: { id: 'legacy-report' } }),
    'legacy-report'
  )
  assert.equal(
    getStoredTusdatosReportId({ provider_response: { result: { reportId: 'nested-report' } } }),
    'nested-report'
  )
})
