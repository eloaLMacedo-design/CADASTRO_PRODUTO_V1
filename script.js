
//
// FASE 1: MODELAGEM DOS DADOS - CLASSE PRODUTO
//

class Produto {

    // Atributos privados
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        // Validação do nome
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        this.nome = nome.trim();

        // Utiliza os setters para validar os valores
        this.preco = preco;
        this.quantidade = quantidade;
    }


    // GETTER E SETTER DO PREÇO

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {

        novoPreco = Number(novoPreco);

        if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }


    // GETTER E SETTER DA QUANTIDADE

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {

        novaQuantidade = Number(novaQuantidade);

        if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser um número inteiro maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }


    // CALCULAR SUBTOTAL

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


//
// FASE 2: GERENCIAMENTO DE ESTADO
//

const listaDeProdutos = [];

const CHAVE_STORAGE = "sistema_estoque_produtos";

// null = modo cadastro
// número = modo edição
let indiceEdicao = null;


//
// FASE 3: SALVAR NO LOCALSTORAGE
//

function salvarNoLocalStorage() {

    const dadosParaSalvar = listaDeProdutos.map(produto => {

        return {
            nome: produto.nome,
            preco: produto.preco,
            quantidade: produto.quantidade
        };

    });

    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosParaSalvar)
    );
}


//
// FASE 4: CARREGAR DO LOCALSTORAGE
//

function carregarDoLocalStorage() {

    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {

        const produtosSalvos = JSON.parse(dadosSalvos);

        produtosSalvos.forEach(produto => {

            const novoProduto = new Produto(
                produto.nome,
                produto.preco,
                produto.quantidade
            );

            listaDeProdutos.push(novoProduto);

        });

    } catch (erro) {

        console.error("Erro ao carregar os produtos:", erro);

        alert("Não foi possível carregar os produtos salvos.");
    }
}


//
// FASE 5: PEGAR ELEMENTOS DO HTML
//

const formProduto = document.getElementById("produto-form");

const btnLimparTudo = document.getElementById("limpar-tabela");

const totalEstoqueEl = document.getElementById("total-estoque");

const nomeEl = document.getElementById("nome");

const precoEl = document.getElementById("preco");

const quantidadeEl = document.getElementById("quantidade");

const btnPrincipal = document.querySelector(".btn-primary");


// Guarda o texto original do botão
const textoBotaoOriginal = btnPrincipal.textContent.trim();


//
// FASE 6: PREPARAR EDIÇÃO
//

function prepararEdicao(index) {

    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }
    nomeEl.value = produto.nome;
    precoEl.value = produto.preco;
    quantidadeEl.value = produto.quantidade;
    // Ativa o modo edição
    indiceEdicao = index;
    // Altera o texto do botão
    btnPrincipal.textContent = "Salvar Alterações";

    // Leva o formulário para a tela
    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    nomeEl.focus();
}


//
// FASE 7: CANCELAR EDIÇÃO
//

function cancelarEdicao() {

    // Volta para o modo cadastro
    indiceEdicao = null;

    // Limpa os campos
    formProduto.reset();

    // Restaura o texto do botão
    btnPrincipal.textContent = textoBotaoOriginal;
}


//
// FASE 8: VALIDAÇÃO E ENVIO DO FORMULÁRIO
//

formProduto.addEventListener("submit", function(event) {

    // Impede o recarregamento da página
    event.preventDefault();


    // SANITIZAÇÃO COM TRIM()

    const nome = nomeEl.value.trim();

    const preco = Number(precoEl.value);

    const quantidade = Number(quantidadeEl.value);


    // GUARD CLAUSE: VALIDAÇÃO DO NOME

    if (!nome) {

        alert("Por favor, informe um nome válido para o produto.");

        nomeEl.focus();

        return;
    }


    // GUARD CLAUSE: VALIDAÇÃO DO PREÇO E QUANTIDADE

    if (
        precoEl.value.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        quantidadeEl.value.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {

        alert("O preço e a quantidade devem ser valores numéricos maiores que zero. A quantidade deve ser inteira.");

        return;
    }


    try {

        // Cria o produto somente depois das validações
        const novoProduto = new Produto(
            nome,
            preco,
            quantidade
        );


        // LÓGICA DE INCLUSÃO OU EDIÇÃO

        if (indiceEdicao === null) {

            // MODO INCLUSÃO
            // Adiciona um novo produto
            listaDeProdutos.push(novoProduto);

        } else {

            // MODO EDIÇÃO
            // Verifica se o produto ainda existe
            if (!listaDeProdutos[indiceEdicao]) {

                alert("O produto selecionado não foi encontrado.");

                cancelarEdicao();

                return;
            }

            // Substitui o produto antigo pelo atualizado
            listaDeProdutos[indiceEdicao] = novoProduto;
        }


        // SALVA NO LOCALSTORAGE
        salvarNoLocalStorage();


        // ATUALIZA A INTERFACE
        atualizarInterface();


        // RESTAURA O ESTADO
        cancelarEdicao();

    } catch (erro) {

        alert(erro.message);
    }

});


//
// FASE 9: REMOVER UM PRODUTO
//

function removerProduto(index) {

    if (!listaDeProdutos[index]) {
        alert("Produto não encontrado.");
        return;
    }

    // Se o produto removido estiver sendo editado,
    // cancela o modo edição
    if (indiceEdicao === index) {

        cancelarEdicao();

    } else if (indiceEdicao !== null && indiceEdicao > index) {

        // Ajusta o índice caso um produto anterior seja removido
        indiceEdicao--;
    }

    // Remove o produto
    listaDeProdutos.splice(index, 1);

    // Salva e atualiza
    salvarNoLocalStorage();

    atualizarInterface();
}


//
// FASE 10: LIMPAR TODOS OS PRODUTOS
//

btnLimparTudo.addEventListener("click", function() {

    const confirmar = confirm(
        "Tem certeza que deseja remover todos os produtos?"
    );

    if (!confirmar) {
        return;
    }

    // Esvazia a lista
    listaDeProdutos.length = 0;

    // Cancela qualquer edição
    cancelarEdicao();

    // Apaga os dados salvos
    localStorage.removeItem(CHAVE_STORAGE);

    // Atualiza a tela
    atualizarInterface();
});


//
// FASE 11: CALCULAR TOTAL DO ESTOQUE
//

function atualizarTotalEstoque() {

    const valorTotal = listaDeProdutos.reduce(
        (acumulador, produto) => {

            return acumulador + produto.calcularSubtotal();

        },
        0
    );

    const valorFormatado = valorTotal.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

    totalEstoqueEl.textContent =
        `Total em Estoque: ${valorFormatado}`;
}


//
// FASE 12: RENDERIZAR TABELA
//

function renderizarTabela() {

    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    // Limpa a tabela
    tabelaBody.innerHTML = "";

    // Percorre os produtos
    listaDeProdutos.forEach((produto, index) => {

        const linha = document.createElement("tr");


        // Cria as células
        const celulaNome = document.createElement("td");
        const celulaPreco = document.createElement("td");
        const celulaQuantidade = document.createElement("td");
        const celulaSubtotal = document.createElement("td");
        const celulaAcoes = document.createElement("td");


        // Preenche os dados
        celulaNome.textContent = produto.nome;

        celulaPreco.textContent =
            produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        celulaQuantidade.textContent = produto.quantidade;

        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });


        // BOTÃO EDITAR
        const btnEditar = document.createElement("button");

        btnEditar.textContent = "Editar";

        btnEditar.classList.add("btn-editar");

        btnEditar.addEventListener("click", function() {

            prepararEdicao(index);

        });


        // BOTÃO REMOVER
        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";

        btnRemover.classList.add("btn-remover");

        btnRemover.addEventListener("click", function() {

            removerProduto(index);

        });


        // Adiciona os botões à célula
        celulaAcoes.appendChild(btnEditar);

        celulaAcoes.appendChild(btnRemover);

        celulaAcoes.classList.add("acoes");


        // Monta a linha
        linha.appendChild(celulaNome);

        linha.appendChild(celulaPreco);

        linha.appendChild(celulaQuantidade);

        linha.appendChild(celulaSubtotal);

        linha.appendChild(celulaAcoes);


        // Adiciona à tabela
        tabelaBody.appendChild(linha);

    });
}


//
// FASE 13: ATUALIZAR A INTERFACE
//

function atualizarInterface() {

    // Atualiza a tabela
    renderizarTabela();

    // Atualiza o total
    atualizarTotalEstoque();
}


//
// FASE 14: INICIAR O SISTEMA
//

// Carrega os produtos salvos
carregarDoLocalStorage();

// Mostra os produtos na tela
atualizarInterface();
