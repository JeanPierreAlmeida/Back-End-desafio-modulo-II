const express = require('express');
const swaggerUI = require('swagger-ui-express');
const roteador = require('./rotas/roteador');

const app = express();

app.use(express.json());

app.use(roteador);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(require('../swagger.json')));

module.exports = app;
