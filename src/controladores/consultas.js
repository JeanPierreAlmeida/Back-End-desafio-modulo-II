const { contas, saques, depositos, transferencias }  = require('../bancodedados');

let transferenciaEnviada = false;
let transferenciaRecebida = false;

function isNotEmpty(body) { 
    for (let x in body) {
        return true;
    }

    return false;
}


function buscarConta(numero_conta) {
    const conta = contas.find(conta => conta.numero_conta === numero_conta);
    return conta;
}

function validarSenhaParaConta(conta, senhaInformada) {
    return conta.usuario.senha === senhaInformada ? true : false;
}

function validarParametroDeQuery(req, res) {
    if (!isNotEmpty(req.query)) {
        res.status(400);
        res.json({mensagem: "Informar numero da conta e senha na url!"});
        return;
    }

    if (!req.query.numero_conta) {
        res.status(400);
        res.json({mensagem: "Informar numero da conta na url!"});
        return false;
    }

    if (!req.query.senha) {
        res.status(400);
        res.json({mensagem: "Informar uma senha na url!"});
        return false;
    }

    const conta = buscarConta(req.query.numero_conta);
    if (!conta) {
        res.status(404);
        res.json({mensagem:  "conta " + req.query.numero_conta + " não existe"});
        return false;
    }

    const senhaValida = validarSenhaParaConta(conta, req.query.senha.toString());
    if (!senhaValida) {
        res.status(401);
        res.json({mensagem: "Senha errada, informe uma senha válida!"});
        return false;
    }

    return conta;
}

function encontrarTransacao(arrayDeRegistro, numero_conta) {
    if (transferenciaEnviada){
        return arrayDeRegistro.filter(transacao => transacao.numero_conta_origem.toString() === numero_conta);
    } else if (transferenciaRecebida){
        return arrayDeRegistro.filter(transacao => transacao.numero_conta_destino.toString() === numero_conta);
    } else {
        return arrayDeRegistro.filter(transacao => transacao.numero_conta.toString() === numero_conta);
    }
}

const saldo = async (req, res) => {
    const conta = validarParametroDeQuery(req, res);
    if (!conta) {
        return;
    }
    res.json({saldo: conta.saldo});
}

const extrato = async (req, res) => {
    const conta = validarParametroDeQuery(req, res);
    if (!conta) {
        return;
    }
    const depositosNaConta = encontrarTransacao(depositos, req.query.numero_conta);
    const saquesNaConta = encontrarTransacao(saques, req.query.numero_conta);
    
    transferenciaEnviada = true;
    const transferenciasEnviadas = encontrarTransacao(transferencias, req.query.numero_conta);
    transferenciaEnviada = false;

    transferenciaRecebida = true;
    const transferenciasRecebidas = transferencias.filter(transferencia => transferencia.numero_conta_destino.toString() === req.query.numero_conta);
    transferenciaRecebida = false;
    
    res.json({
        depositos: depositosNaConta, 
        saques: saquesNaConta, 
        transferenciasEnviadas,
        transferenciasRecebidas 
    });
    return;
}

module.exports = {
    saldo,
    extrato
}