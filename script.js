// =====================================================
// FASE 1: MODELAGEM DOS DADOS - CLASSE PRODUTO
// =====================================================

class Produto {

    // Atributos privados
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        // Validação do nome
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        // Nome do produto
        this.nome = nome;

        // Define preço e quantidade usando os setters
        this.preco = preco;
        this.quantidade = quantidade;
    }


    // =================================================
    // GETTER E SETTER DO PREÇO
    // =================================================

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {

        novoPreco = parseFloat(novoPreco);

        if (isNaN(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }


    // =================================================
    // GETTER E SETTER DA QUANTIDADE
    // =================================================

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {

        novaQuantidade = parseInt(novaQuantidade);

        if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }


    // =================================================
    // CALCULAR SUBTOTAL
    // =================================================

    calcularSubtotal() {

        return this.preco * this.quantidade;
    }
}


// =====================================================
// FASE 2: GERENCIAMENTO DOS PRODUTOS
// =====================================================

// Lista que guarda os produtos
const listaDeProdutos = [];

// Nome usado para salvar os dados no navegador
const CHAVE_STORAGE = "sistema_estoque_produtos";


// =====================================================
// FASE 3: SALVAR NO LOCALSTORAGE
// =====================================================

function salvarNoLocalStorage() {

    // Cria objetos simples para conseguir salvar
    // também os atributos privados
    const dadosParaSalvar = listaDeProdutos.map(produto => {

        return {
            nome: produto.nome,
            preco: produto.preco,
            quantidade: produto.quantidade
        };

    });

    // Converte para texto e salva no navegador
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosParaSalvar)
    );
}


// =====================================================
// FASE 4: CARREGAR DO LOCALSTORAGE
// =====================================================

function carregarDoLocalStorage() {

    // Pega os dados salvos
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    // Se não tiver nada salvo, não faz nada
    if (!dadosSalvos) {
        return;
    }

    try {

        // Converte o texto para objetos
        const produtosSalvos = JSON.parse(dadosSalvos);

        // Cria novamente cada produto
        produtosSalvos.forEach(produto => {

            const novoProduto = new Produto(
                produto.nome,
                produto.preco,
                produto.quantidade
            );

            listaDeProdutos.push(novoProduto);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar os produtos:",
            erro
        );
    }
}


// =====================================================
// FASE 5: PEGAR ELEMENTOS DO HTML
// =====================================================

const formProduto =
    document.getElementById("produto-form");

const btnLimparTudo =
    document.getElementById("limpar-tabela");

const totalEstoqueEl =
    document.getElementById("total-estoque");


// =====================================================
// FASE 6: ADICIONAR PRODUTO
// =====================================================

formProduto.addEventListener("submit", function(event) {

    // Impede a página de recarregar
    event.preventDefault();

    try {

        // Pega os valores dos campos
        const nomeInput =
            document.getElementById("nome").value;

        const precoInput =
            document.getElementById("preco").value;

        const quantidadeInput =
            document.getElementById("quantidade").value;


        // Cria o produto
        const novoProduto = new Produto(
            nomeInput,
            precoInput,
            quantidadeInput
        );


        // Adiciona na lista
        listaDeProdutos.push(novoProduto);


        // SALVA AUTOMATICAMENTE NO NAVEGADOR
        salvarNoLocalStorage();


        // Atualiza a tela
        atualizarInterface();


        // Limpa os campos do formulário
        formProduto.reset();

    } catch (erro) {

        // Mostra o erro
        alert(erro.message);
    }
});


// =====================================================
// FASE 7: REMOVER UM PRODUTO
// =====================================================

function removerProduto(index) {

    // Remove o produto da lista
    listaDeProdutos.splice(index, 1);


    // Salva a lista atualizada
    salvarNoLocalStorage();


    // Atualiza a tela
    atualizarInterface();
}


// =====================================================
// FASE 8: LIMPAR TODOS OS PRODUTOS
// =====================================================

btnLimparTudo.addEventListener("click", function() {

    // Apaga todos os produtos da lista
    listaDeProdutos.length = 0;


    // Apaga os produtos salvos no navegador
    localStorage.removeItem(CHAVE_STORAGE);


    // Atualiza a tela imediatamente
    atualizarInterface();
});


// =====================================================
// FASE 9: CALCULAR TOTAL DO ESTOQUE
// =====================================================

function atualizarTotalEstoque() {

    const valorTotal = listaDeProdutos.reduce(
        (acumulador, produto) => {

            return acumulador +
                produto.calcularSubtotal();

        },
        0
    );


    // Formata para moeda brasileira
    const valorFormatado =
        valorTotal.toLocaleString("pt-BR", {

            style: "currency",

            currency: "BRL"
        });


    // Mostra o total
    totalEstoqueEl.textContent =
        `Total em Estoque: ${valorFormatado}`;
}


// =====================================================
// FASE 10: RENDERIZAR TABELA
// =====================================================

function renderizarTabela() {

    // Pega o corpo da tabela
    const tabelaBody =
        document.querySelector("#tabela-produtos tbody");


    // Limpa a tabela antes de desenhar novamente
    tabelaBody.innerHTML = "";


    // Percorre todos os produtos
    listaDeProdutos.forEach((produto, index) => {

        // Cria uma nova linha
        const linha = document.createElement("tr");


        // Coloca os dados dentro da linha
        linha.innerHTML = `
            <td>${produto.nome}</td>

            <td>
                R$ ${produto.preco.toFixed(2)}
            </td>

            <td>
                ${produto.quantidade}
            </td>

            <td>
                R$ ${produto.calcularSubtotal().toFixed(2)}
            </td>

            <td>
                <button class="btn-remover">
                    Remover
                </button>
            </td>
        `;


        // Pega o botão remover
        const btnRemover =
            linha.querySelector(".btn-remover");


        // Adiciona a função ao botão
        btnRemover.addEventListener(
            "click",
            function() {

                removerProduto(index);

            }
        );


        // Coloca a linha na tabela
        tabelaBody.appendChild(linha);
    });
}


// =====================================================
// FASE 11: ATUALIZAR A INTERFACE
// =====================================================

function atualizarInterface() {

    // Atualiza a tabela
    renderizarTabela();

    // Atualiza o valor total
    atualizarTotalEstoque();
}


// =====================================================
// FASE 12: INICIAR O SISTEMA
// =====================================================

// Primeiro carrega os produtos salvos
carregarDoLocalStorage();

// Depois mostra os produtos na tela
atualizarInterface();