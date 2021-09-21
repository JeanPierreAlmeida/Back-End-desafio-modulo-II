const swaggerAutogen = require('swagger-autogen');

swaggerAutogen()('./swagger.json', ['./src/rotas/roteador.js']);
