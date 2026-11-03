class Produto {

    // Atributos privados
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        // Validação e sanitização do nome
        if (typeof nome !== "string" || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        this.nome = nome.trim();

        // Define preço e quantidade usando os setters
        this.preco = preco;
        this.quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {

        novoPreco = Number(novoPreco);

        if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser um número maior que zero.");
        }

        this.#preco = novoPreco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {

        novaQuantidade = Number(novaQuantidade);

        if (
            !Number.isSafeInteger(novaQuantidade) ||
            novaQuantidade <= 0
        ) {
            throw new Error(
                "A quantidade deve ser um número inteiro maior que zero."
            );
        }

        this.#quantidade = novaQuantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";
let indiceEdicao = null;
const formProduto = document.getElementById("produto-form");
const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const mensagemVazia = document.getElementById("mensagem-vazia");

function salvarNoLocalStorage() {

    // Transforma os produtos em objetos simples.
    // Isso permite salvar também os atributos privados.
    const dadosParaSalvar = listaDeProdutos.map(produto => ({
        nome: produto.nome,
        preco: produto.preco,
        quantidade: produto.quantidade
    }));

    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosParaSalvar)
    );
}

function carregarDoLocalStorage() {

    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {

        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            throw new Error("Os dados salvos não estão no formato esperado.");
        }

        produtosSalvos.forEach(produto => {

            // Recria cada produto e valida os dados carregados
            const novoProduto = new Produto(
                produto.nome,
                produto.preco,
                produto.quantidade
            );

            listaDeProdutos.push(novoProduto);
        });

    } catch (erro) {

        console.error("Erro ao carregar os produtos:", erro);

        listaDeProdutos.length = 0;

        alert(
            "Não foi possível carregar os produtos salvos. " +
            "Verifique o armazenamento do navegador."
        );
    }
}

function prepararEdicao(index) {

    // Busca o produto selecionado
    const produto = listaDeProdutos[index];

    // Se não existir, interrompe a função
    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    // Guarda o índice do produto que será alterado
    indiceEdicao = index;

    // Preenche o formulário com os dados existentes
    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;

    // Altera o texto do botão
    btnSalvar.textContent = "Salvar alterações";

    // Exibe o botão de cancelar
    btnCancelarEdicao.hidden = false;

    // Leva a tela até o formulário
    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    nomeInput.focus();
}

function restaurarModoCadastro() {

    // Sai do modo de edição
    indiceEdicao = null;

    // Limpa os campos
    formProduto.reset();

    // Restaura o texto original do botão
    btnSalvar.textContent = "Adicionar ao carrinho";

    // Esconde o botão de cancelar
    btnCancelarEdicao.hidden = true;
}

formProduto.addEventListener("submit", function(event) {

    // Impede o recarregamento da página
    event.preventDefault();

    const nome = nomeInput.value.trim();

    if (nome === "") {
        alert("Digite o nome do produto.");
        nomeInput.focus();
        return;
    }

    const precoTexto = precoInput.value.trim();
    const preco = Number(precoTexto);

    if (
        precoTexto === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        alert("O preço deve ser um número maior que zero.");
        precoInput.focus();
        return;
    }

    const quantidadeTexto = quantidadeInput.value.trim();
    const quantidade = Number(quantidadeTexto);

    if (
        quantidadeTexto === "" ||
        !Number.isSafeInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert(
            "A quantidade deve ser um número inteiro maior que zero."
        );
        quantidadeInput.focus();
        return;
    }

    try {

        // Cria o objeto com os dados validados
        const novoProduto = new Produto(
            nome,
            preco,
            quantidade
        );

        // -----------------------------
        // MODO DE EDIÇÃO OU INCLUSÃO
        // -----------------------------

        if (indiceEdicao === null) {

            // Modo de inclusão: adiciona um novo produto
            listaDeProdutos.push(novoProduto);

        } else {

            // Modo de edição: substitui o produto existente
            if (!listaDeProdutos[indiceEdicao]) {
                throw new Error(
                    "O produto que você está editando não foi encontrado."
                );
            }

            listaDeProdutos[indiceEdicao] = novoProduto;
        }

        // Salva os dados atualizados
        salvarNoLocalStorage();

        // Atualiza tabela e total
        atualizarInterface();

        // Restaura o formulário para o modo de cadastro
        restaurarModoCadastro();

    } catch (erro) {

        alert(erro.message);
    }
});

btnCancelarEdicao.addEventListener("click", function() {

    restaurarModoCadastro();

});

function removerProduto(index) {

    if (!listaDeProdutos[index]) {
        return;
    }

    // Se estiver editando o produto que será removido,
    // cancela a edição antes de removê-lo.
    if (indiceEdicao === index) {

        restaurarModoCadastro();

    } else if (indiceEdicao !== null && indiceEdicao > index) {

        // Ajusta o índice se um item anterior for removido
        indiceEdicao--;
    }

    // Remove o produto
    listaDeProdutos.splice(index, 1);

    // Salva a lista atualizada
    salvarNoLocalStorage();

    // Atualiza a tela
    atualizarInterface();
}

btnLimparTudo.addEventListener("click", function() {

    if (listaDeProdutos.length === 0) {
        alert("Não existem produtos para remover.");
        return;
    }

    const confirmar = confirm(
        "Tem certeza de que deseja excluir todos os produtos?"
    );

    if (!confirmar) {
        return;
    }

    // Esvazia a lista
    listaDeProdutos.length = 0;

    // Apaga os dados armazenados
    localStorage.removeItem(CHAVE_STORAGE);

    // Restaura o formulário, caso estivesse editando
    restaurarModoCadastro();

    // Atualiza a interface
    atualizarInterface();
});

function atualizarTotalEstoque() {

    const valorTotal = listaDeProdutos.reduce(
        (acumulador, produto) => {
            return acumulador + produto.calcularSubtotal();
        },
        0
    );

    // Formata o valor como moeda brasileira
    const valorFormatado = valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    totalEstoqueEl.textContent =
        `Total em estoque: ${valorFormatado}`;
}


function renderizarTabela() {

    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    // Limpa as linhas anteriores
    tabelaBody.innerHTML = "";

    // Percorre todos os produtos
    listaDeProdutos.forEach((produto, index) => {

        const linha = document.createElement("tr");

        // Cria as células de forma segura
        // usando textContent para exibir os dados.
        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = produto.preco.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        const celulaAcoes = document.createElement("td");
        celulaAcoes.classList.add("acoes");

        // Botão Editar
        const btnEditar = document.createElement("button");

        btnEditar.type = "button";
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");

        btnEditar.addEventListener("click", function() {
            prepararEdicao(index);
        });

        // Botão Remover
        const btnRemover = document.createElement("button");

        btnRemover.type = "button";
        btnRemover.textContent = "Remover";
        btnRemover.classList.add("btn-remover");

        btnRemover.addEventListener("click", function() {
            removerProduto(index);
        });

        // Adiciona os botões à célula de ações
        celulaAcoes.appendChild(btnEditar);
        celulaAcoes.appendChild(btnRemover);

        // Adiciona as células à linha
        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        // Adiciona a linha à tabela
        tabelaBody.appendChild(linha);
    });

    // Mostra uma mensagem quando não há produtos
    mensagemVazia.hidden = listaDeProdutos.length > 0;
}
function atualizarInterface() {

    renderizarTabela();

    atualizarTotalEstoque();
}

// Primeiro, carrega os produtos salvos
carregarDoLocalStorage();

// Depois, exibe os produtos na tela
atualizarInterface();
