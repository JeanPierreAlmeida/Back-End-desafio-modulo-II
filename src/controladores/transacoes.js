const { contas, saques, depositos, transferencias }  = require('../bancodedados');
const { format } = require('date-fns-tz');


let validarSenha = false;
let transferencia = false;
let validarContaDestino = false;

function validarCamposDoCorpo(body) {
    if (!body.numero_conta) {
        return "Informe o número da conta no corpo da requisição!";
    }

    if (!body.valor) {
        return "Informe o valor da transação no corpo da requisição!";
    }

    if (typeof body.valor !== 'number' || body.valor <= 0 || (body.valor % 1 !== 0)){
        return "O campo 'valor' deve ser número inteiro maior que 0 (zero)!";
    }

    if (validarSenha) {
        if (!body.senha) {
            return "Informe a senha da sua conta no corpo da requisição!";
        }
    }

    if (validarContaDestino) {
        if (!body.numero_conta_destino) {
            return "Informe o número da conta de destino!";
        }
    }
}

function isNotEmpty(body) { 
    for (let x in body) {
        return true;
    }

    return false;
}

function getDate() {
    let date = new Date();
    const pattern = 'yyyy-MM-dd HH:mm:ss';

    date = format(date, pattern);
    return date;
}

function validarSenhaParaConta(conta, senhaInformada) {
    return conta.usuario.senha === senhaInformada ? true : false;
}

function verificarSaldo(conta, valor) {
    return conta.saldo >= valor ? true : false;
}

function registrarTransacoes(body, arrayDeRegistro) {
    const dataDeTransacao = getDate();

    if (transferencia) {
        arrayDeRegistro.push({
            data: dataDeTransacao,
            numero_conta_origem: body.numero_conta,
            numero_conta_destino: body.numero_conta_destino,
            valor: body.valor
        });
    } else {
        arrayDeRegistro.push({
            data: dataDeTransacao,
            numero_conta: body.numero_conta,
            valor: body.valor
        });
    }
}

function verificarCorpoVazio(corpo) {
    if (!isNotEmpty(corpo)) {
        return "Corpo da requisição não pode ser vazia!";
    }
}

function buscarConta(numero_conta) {
    const conta = contas.find(conta => conta.numero_conta === numero_conta.toString());
    return conta;
}

const depositar = async (req, res) => {
    const corpoNaoExiste = verificarCorpoVazio(req.body);

    if (corpoNaoExiste) {
        res.status(400);
        res.json({mensagem: corpoNaoExiste});
        return;
    }

    const erro = validarCamposDoCorpo(req.body);

    if (erro) {
        res.status(400);
        res.json({erro});
        return;
    }

    const conta = buscarConta(req.body.numero_conta);
    if (!conta) {
        res.status(404);
        res.json({mensagem: "conta " + req.body.numero_conta + " não existe"});
        return;
    }

    conta.saldo += req.body.valor;

    registrarTransacoes(req.body, depositos);
    
    res.json({mensagem: "Depósito realizado com sucesso!"});
    return;
}

const sacar = async (req, res) => {
    const corpoNaoExiste = verificarCorpoVazio(req.body);

    if (corpoNaoExiste) {
        res.status(400);
        res.json({mensagem: corpoNaoExiste});
        return;
    }

    validarSenha = true;
    const erro = validarCamposDoCorpo(req.body);
    validarSenha = false;

    if (erro) {
        res.status(400);
        res.json({mensagem: erro});
        return;
    }

    const conta = buscarConta(req.body.numero_conta);
    if (!conta) {
        res.status(404);
        res.json({mensagem: "conta " + req.body.numero_conta + " não existe"});
        return;
    }

    const senhaValida = validarSenhaParaConta(conta, req.body.senha.toString());
    if (!senhaValida) {
        res.status(401);
        res.json({mensagem: "Senha errada, informe uma senha válida!"});
        return;
    }

    const temSaldo = verificarSaldo(conta, req.body.valor);
    if (!temSaldo) {
        res.status(404);
        res.json({mensagem: "operação não pode ser realizado, saldo insuficiente na conta."});
        return;
    }

    conta.saldo -= req.body.valor;
    registrarTransacoes(req.body, saques);

    res.json({mensagem: "saque realizado com sucesso!"});
}

const tranferir = async (req, res) => {
    const corpoNaoExiste = verificarCorpoVazio(req.body);

    if (corpoNaoExiste) {
        res.status(400);
        res.json({mensagem: corpoNaoExiste});
        return;
    }

    validarContaDestino = true;
    validarSenha = true;
    const erro = validarCamposDoCorpo(req.body);
    validarContaDestino = false;
    validarSenha = false;

    if (erro) {
        res.status(400);
        res.json({mensagem: erro});
        return;
    }

    const conta = buscarConta(req.body.numero_conta);
    if (!conta) {
        res.status(404);
        res.json({mensagem: "conta de origem " + req.body.numero_conta + " não existe"});
        return;
    }

    const contaDestino = buscarConta(req.body.numero_conta_destino);
    if (!contaDestino) {
        res.status(404);
        res.json({mensagem: "conta de destino " + req.body.numero_conta_destino + " não existe"});
        return;
    }

    const senhaValida = validarSenhaParaConta(conta, req.body.senha.toString());
    if (!senhaValida) {
        res.status(401);
        res.json({mensagem: "Senha errada, informe uma senha válida!"});
        return;
    }

    const temSaldo = verificarSaldo(conta, req.body.valor);
    if (!temSaldo) {
        res.status(404);
        res.json({mensagem: "operação não pode ser realizado, saldo insuficiente na conta."});
        return;
    }

    conta.saldo -= req.body.valor;
    contaDestino.saldo += req.body.valor;

    transferencia = true;
    registrarTransacoes(req.body, transferencias);
    transferencia = false;

    res.json({mensagem: "transferência realizado com sucesso!"});
    return;
}

module.exports = {
    depositar,
    sacar,
    tranferir
}