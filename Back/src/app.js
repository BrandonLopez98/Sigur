const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const crypto = require('crypto');
const routes = require('./routes/index.js');
const { runWithLogContext } = require('./services/observability')

require('dotenv').config();

const server = express();
server.name = 'API';

// Identificador de correlación para seguir una petición entre logs y proveedor.
server.use((req, res, next) => {
  const receivedId = req.headers['x-request-id']
  req.requestId = typeof receivedId === 'string' && /^[a-zA-Z0-9._:-]{8,100}$/.test(receivedId)
    ? receivedId
    : crypto.randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  runWithLogContext({ request_id: req.requestId }, next)
})

// Middlewares para leer bodies, cookies y registrar peticiones.
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
morgan.token('request-id', (req) => req.requestId)
server.use(morgan(':method :url :status :response-time ms request_id=:request-id'));

// Permite que React en Vite consuma la API.
server.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-Id',
  ],
}));

// Rutas de la API: /Auth, /Query y /User.
server.use('/', routes);

// Manejo centralizado de errores.
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(err);
  res.status(status).json({ error: message });
});

module.exports = server;
