import inquirer from 'inquirer';
import fs from 'fs';

const ARQUIVO_DB = 'database.json';

// --- FUNÇÕES DE DADOS (JSON) ---
function carregarDados() {
    try {
        if (fs.existsSync(ARQUIVO_DB)) {
            const dados = fs.readFileSync(ARQUIVO_DB, 'utf-8');
            return JSON.parse(dados);
        }
        return [];
    } catch (error) {
        return [];
    }
}

function salvarDados(produtos) {
    fs.writeFileSync(ARQUIVO_DB, JSON.stringify(produtos, null, 2));
}

let produtos = carregarDados();

// --- MENU PRINCIPAL ---
async function menuPrincipal() {
    // console.clear(); // Tirei o clear para você ver os erros se acontecerem
    
    const resposta = await inquirer.prompt([
        {
            type: 'list',
            name: 'opcao',
            message: 'AgilStore - Gerenciamento de Estoque:',
            choices: [
                { name: '1. Adicionar Produto', value: 'adicionar' },
                { name: '2. Listar Produtos', value: 'listar' },
                { name: '3. Atualizar Produto', value: 'atualizar' },
                { name: '4. Excluir Produto', value: 'excluir' },
                { name: '5. Buscar Produto', value: 'buscar' },
                { name: 'Sair', value: 'sair' }
            ]
        }
    ]);

    // O switch verifica o "value" ('adicionar'), não o texto inteiro
    switch (resposta.opcao) {
        case 'adicionar':
            await adicionarProduto();
            break;
        case 'listar':
            listarProdutos();
            await esperarEnter();
            break;
        case 'atualizar':
            await atualizarProduto();
            break;
        case 'excluir':
            await excluirProduto();
            break;
        case 'buscar':
            await buscarProduto();
            break;
        case 'sair':
            console.log("Saindo...");
            process.exit(0);
        default:
            console.log("Opção inválida!"); // Caso algo estranho aconteça
            break;
    }

    menuPrincipal(); // Volta ao menu
}

// --- FUNÇÕES DO SISTEMA ---

async function adicionarProduto() {
    console.log('\n--- Novo Produto ---');
    const dados = await inquirer.prompt([
        { name: 'nome', message: 'Nome do Produto:' },
        { name: 'categoria', message: 'Categoria:' },
        { 
            name: 'quantidade', 
            message: 'Quantidade em Estoque:', 
            validate: value => !isNaN(value) ? true : "Digite um número válido" 
        },
        { 
            name: 'preco', 
            message: 'Preço:', 
            validate: value => !isNaN(value) ? true : "Digite um número válido" 
        }
    ]);

    // Gera ID baseado no último existente + 1
    const novoId = produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1;

    const novoProduto = {
        id: novoId,
        nome: dados.nome,
        categoria: dados.categoria,
        quantidade: parseInt(dados.quantidade),
        preco: parseFloat(dados.preco)
    };

    produtos.push(novoProduto);
    salvarDados(produtos);
    console.log(' Produto adicionado com sucesso!');
    await esperarEnter();
}

function listarProdutos() {
    console.log('\n--- Estoque Atual ---');
    if (produtos.length === 0) {
        console.log('Nenhum produto cadastrado.');
    } else {
        console.table(produtos);
    }
}

async function atualizarProduto() {
    listarProdutos();
    const { idInput } = await inquirer.prompt([
        { name: 'idInput', message: 'Digite o ID do produto para atualizar:' }
    ]);

    const index = produtos.findIndex(p => p.id == idInput);

    if (index === -1) {
        console.log(' Produto não encontrado!');
        await esperarEnter();
        return;
    }

    const atualizacao = await inquirer.prompt([
        { name: 'nome', message: `Nome (${produtos[index].nome}):` },
        { name: 'categoria', message: `Categoria (${produtos[index].categoria}):` },
        { name: 'quantidade', message: `Quantidade (${produtos[index].quantidade}):` },
        { name: 'preco', message: `Preço (${produtos[index].preco}):` }
    ]);

    if (atualizacao.nome) produtos[index].nome = atualizacao.nome;
    if (atualizacao.categoria) produtos[index].categoria = atualizacao.categoria;
    if (atualizacao.quantidade) produtos[index].quantidade = parseInt(atualizacao.quantidade);
    if (atualizacao.preco) produtos[index].preco = parseFloat(atualizacao.preco);

    salvarDados(produtos);
    console.log(' Produto atualizado!');
    await esperarEnter();
}

async function excluirProduto() {
    listarProdutos();
    const { idInput } = await inquirer.prompt([
        { name: 'idInput', message: 'Digite o ID do produto para excluir:' }
    ]);

    const index = produtos.findIndex(p => p.id == idInput);

    if (index === -1) {
        console.log(' ID não encontrado.');
        await esperarEnter();
        return;
    }

    const { confirmar } = await inquirer.prompt([
        { type: 'confirm', name: 'confirmar', message: 'Tem certeza?' }
    ]);

    if (confirmar) {
        produtos.splice(index, 1);
        salvarDados(produtos);
        console.log(' Produto removido.');
    }
    await esperarEnter();
}

async function buscarProduto() {
    const { termo } = await inquirer.prompt([
        { name: 'termo', message: 'Digite o ID ou Nome para buscar:' }
    ]);

    const resultado = produtos.filter(p => 
        p.id == termo || 
        p.nome.toLowerCase().includes(termo.toLowerCase())
    );

    if (resultado.length > 0) {
        console.table(resultado);
    } else {
        console.log(' Nenhum produto encontrado.');
    }
    await esperarEnter();
}

async function esperarEnter() {
    await inquirer.prompt([{ name: 'enter', message: 'Pressione ENTER para continuar...' }]);
}

// Inicia o app

menuPrincipal();