const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors'); // Asegúrate de haber instalado el paquete 'cors'
const routes = require('./routes/index.js');
require('dotenv').config(); // Asegúrate de haber creado un archivo .env

const server = express();

server.name = 'API';

server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

// Configurar CORS usando el middleware cors
server.use(cors({
  origin: 'http://localhost:3000', // Actualiza el dominio para que coincida con tu aplicación front-end
  credentials: true,
  methods: 'GET, POST, OPTIONS, PUT, DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
}));

server.use('/', routes);

// Middleware para manejo de errores
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err); // Imprimir el error en la consola
  res.status(status).send(message);
});

module.exports = server;