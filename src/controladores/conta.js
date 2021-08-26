const {banco: {senha: senhaGerente}, contas}  = require('../bancodedados');

function isNotEmpty(body) { 
    for (let x in body) {
        return true;
    }

    return false;
 }

function validarCliente(cliente){
	if (!cliente.nome) {
		return "O campo 'nome' é obrigatório!";
	}

	if (!cliente.cpf) {
		return "O campo 'CPF' é obrigatório!";
	}

	if (!cliente.data_nascimento) {
		return "O campo 'Data de nascimento' é obrigatório!";
	}

    if (!cliente.telefone) {
		return "O campo 'telefone' é obrigatório!";
	}

    if (!cliente.email) {
		return "O campo 'email' é obrigatório!";
	}

    if (!cliente.senha) {
		return "O campo 'senha' é obrigatório!";
	}

	if(typeof cliente.nome !== 'string'){
		return "O campo 'nome' deve ser um texto!";
	}

    if(typeof cliente.cpf !== 'string'){
		return "O campo 'cpf' deve ser um texto!";
	}

    if(typeof cliente.data_nascimento !== 'string'){
		return "O campo 'Data de nascimento' deve ser um texto!";
	}

    if(typeof cliente.telefone !== 'string'){
		return "O campo telefone deve ser um texto!";
	}

	if(typeof cliente.email !== 'string'){
		return "O campo 'email' deve ser um texto!";
	}

	if(typeof cliente.senha !== 'string'){
		return "O campo 'senha' deve ser um texto!";
	}
}

function numeroDeContaInvalida(numeroConta) {
    if (numeroConta === '' || numeroConta === ' ' || isNaN(numeroConta) || (Number(numeroConta) % 1 !== 0)){
        return true;
    }

    return false;
}

function dadosJaExiste(requisicao) {

    if (contas.length !== 0) {
        for (let conta of contas) {
            const {usuario: {cpf, email}} = conta;
        
            if (cpf === requisicao.body.cpf){
                if (requisicao.method === 'POST') {    
                    return "CPF informado já existe.";
                }
                else if (requisicao.method === 'PUT') {
                    if (requisicao.params.numeroConta !== conta.numero_conta) {
                        return "CPF informado já existe.";
                    }
                }

            }
            else if (email === requisicao.body.email) {
                if (requisicao.method === 'POST') {
                    return "EMAIL informado já existe.";
                }
                else if (requisicao.method === 'PUT') {
                    if (requisicao.params.numeroConta !== conta.numero_conta) {
                        return "EMAIL informado já existe.";
                    }
                }
            }
        }
    }
}

const listarContas = async (req, res) => {
    if (!req.query.senha) {
        res.status(401);
        res.json({mensagem: "Informe uma senha na url"});
        return;
    } else if (req.query.senha !== senhaGerente) {
        res.status(401);
        res.json({mensagem: "senha incorreta!"});
        return;
    }

    res.json(contas);
}

const criarConta = async (req, res) => {
    const erro = validarCliente(req.body);

    if (erro) {
        res.status(400);
        res.json({mensagem: erro});
        return;
    }

    const mensagem = dadosJaExiste(req);

    if (mensagem) {
        res.status(400);
        res.json({mensagem});
        return;
    }

    const novoCliente = {
        numero_conta: (contas.length + 1).toString(),
        saldo: 0,
        usuario: req.body
    }

    contas.push(novoCliente);
    res.json(novoCliente);
    return;
}

const atualizarUsuarioConta = async (req, res) => {
    
    if (!isNotEmpty(req.body)) {
        res.status(400);
        res.json({mensagem: "Corpo da requisição não pode ser vazia!"});
        return;
    }

    if (numeroDeContaInvalida(req.params.numeroConta)){
        res.status(404);
        res.json({mensagem: "número de conta inválida."});
        return;
    }

    const cliente = contas.find(conta => conta.numero_conta === req.params.numeroConta);
    
    if (!cliente) {
        res.status(404);
        res.json({erro: "conta " + req.params.numeroConta + " não existe"});
        return;
    }

    const erro = validarCliente({
        nome: req.body.nome !== undefined ? req.body.nome : cliente.nome,
        cpf: req.body.cpf !== undefined ? req.body.cpf : cliente.usuario.cpf,
        data_nascimento: req.body.data_nascimento !== undefined ? req.body.data_nascimento : cliente.usuario.data_nascimento,
        telefone: req.body.telefone !== undefined ? req.body.telefone : cliente.usuario.telefone,
        email: req.body.email !== undefined ? req.body.email : cliente.usuario.email,
        senha: req.body.senha !== undefined ? req.body.senha : cliente.usuario.senha
    });

    if (erro) {
        res.status(400);
        res.json({mensagem: erro});
        return;
    }

    const mensagem = dadosJaExiste(req);

    if (mensagem) {
        res.status(400);
        res.json({mensagem});
        return;
    }

    if (req.body.nome) {
        cliente.usuario.nome = req.body.nome;
    }

    if (req.body.cpf) {
        cliente.usuario.cpf = req.body.cpf;
    }

    if (req.body.data_nascimento) {
        cliente.usuario.data_nascimento = req.body.data_nascimento;
    }

    if (req.body.telefone) {
        cliente.usuario.telefone = req.body.telefone;
    }

    if (req.body.email) {
        cliente.usuario.email = req.body.email;
    }

    if (req.body.senha) {
        cliente.usuario.senha = req.body.senha;
    }

    res.json({mensagem: "Conta atualizada com sucesso!"});
    return;
}

const excluirConta = async (req, res) => {
    
    if (numeroDeContaInvalida(req.params.numeroConta)){
        res.status(404);
        res.json({mensagem: "número de conta inválida."});
        return;
    }

    let posicaoDaConta;

    const cliente = contas.find((conta, index) => {
        if (conta.numero_conta === req.params.numeroConta) {
            posicaoDaConta = index;
            return conta;
        }
    });
    
    if (!cliente) {
        res.status(404);
        res.json({erro: "conta " + req.params.numeroConta + " não existe"});
        return;
    }

    if (cliente.saldo !== 0) {
        res.status(400);
        res.json({mensagem: "conta não pode ser excluída, pois contém saldo."});
        return;
    }

    contas.splice(posicaoDaConta, 1);
    res.json({mensagem: "conta excluída com sucesso."});
    return;
}

module.exports = {
    listarContas,
    criarConta,
    atualizarUsuarioConta,
    excluirConta
};