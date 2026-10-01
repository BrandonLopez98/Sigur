const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-enough-entropy'

const userRoutes = require('../src/routes/UserRoutes')

function getRoute(method) {
  return userRoutes.stack.find((layer) => (
    layer.route?.path === '/' && layer.route.methods[method]
  )).route
}

function runRoute(method, request = {}) {
  const route = getRoute(method)
  const req = {
    body: {},
    headers: {},
    query: {},
    ...request,
  }

  return new Promise((resolve, reject) => {
    let currentHandler = 0
    let statusCode = 200
    const res = {
      status(code) {
        statusCode = code
        return this
      },
      json(body) {
        resolve({ status: statusCode, body })
        return this
      },
    }

    function next(error) {
      if (error) return reject(error)

      const layer = route.stack[currentHandler]
      currentHandler += 1
      if (!layer) return reject(new Error('La ruta terminó sin responder.'))

      return Promise.resolve(layer.handle(req, res, next)).catch(reject)
    }

    next()
  })
}

test('impide consultar usuarios sin autenticación', async () => {
  const response = await runRoute('get')

  assert.equal(response.status, 401)
  assert.equal(response.body.error, 'Token de autenticación requerido.')
})

test('impide que un cliente consulte el directorio de usuarios', async () => {
  const token = jwt.sign(
    { userId: 'client-1', email: 'cliente@example.com', role: 'client' },
    process.env.JWT_SECRET
  )
  const response = await runRoute('get', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.status, 403)
})

test('rechaza registro masivo desde la ruta pública', async () => {
  const response = await runRoute('post', {
    body: [{ email: 'cliente@example.com', password: 'secret' }],
  })

  assert.equal(response.status, 400)
  assert.match(response.body.error, /registro masivo/i)
})

test('rechaza rol o estado enviados por el registro público', async () => {
  const response = await runRoute('post', {
    body: {
      email: 'atacante@example.com',
      password: 'secret',
      role: 'admin',
      status: 'active',
    },
  })

  assert.equal(response.status, 400)
  assert.match(response.body.error, /administrados por Verifik/i)
})

test('el historial siempre filtra las consultas por el usuario autenticado', async () => {
  const dbPath = require.resolve('../src/db')
  const controllerPath = require.resolve('../src/controllers/Query/getQuerys')
  const db = require(dbPath)
  const originalQuery = db.Query
  let receivedOptions

  db.Query = {
    async findAll(options) {
      receivedOptions = options
      return []
    },
  }
  delete require.cache[controllerPath]

  try {
    const getQuerys = require(controllerPath)
    await getQuerys('client-1')

    assert.deepEqual(receivedOptions.where, { user_id: 'client-1' })
    await assert.rejects(() => getQuerys(), /Usuario autenticado requerido/)
  } finally {
    db.Query = originalQuery
    delete require.cache[controllerPath]
  }
})
