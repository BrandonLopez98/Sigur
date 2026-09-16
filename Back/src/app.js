const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index.js');

require('dotenv').config();

const server = express();
server.name = 'API';

// Middlewares para leer bodies, cookies y registrar peticiones.
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

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
