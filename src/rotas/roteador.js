const express = require('express');
const roteador = express();

const contas = require('../controladores/conta');
const transacoes = require('../controladores/transacoes');
const consultas = require('../controladores/consultas');

roteador.get('/contas', contas.listarContas);
roteador.post('/contas', contas.criarConta);
roteador.put('/contas/:numeroConta/usuario', contas.atualizarUsuarioConta);
roteador.delete('/contas/:numeroConta', contas.excluirConta);

roteador.post('/transacoes/depositar', transacoes.depositar);
roteador.post('/transacoes/sacar', transacoes.sacar);
roteador.post('/transacoes/transferir', transacoes.tranferir);

roteador.get('/contas/saldo', consultas.saldo);
roteador.get('/contas/extrato', consultas.extrato);

module.exports = roteador;