javascript
//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {

    // 🆕 Propriedades privadas
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        // Validação do nome
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        this.nome = nome;

        // O preço e a quantidade passam pelos setters
        this.preco = preco;
        this.quantidade = quantidade;
    }

    // Getter do preço
    get preco() {
        return this.#preco;
    }

    // Setter do preço
    set preco(novoPreco) {

        novoPreco = parseFloat(novoPreco);

        if (isNaN(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }

    // Getter da quantidade
    get quantidade() {
        return this.#quantidade;
    }

    // Setter da quantidade
    set quantidade(novaQuantidade) {

        novaQuantidade = parseInt(novaQuantidade);

        if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];


//
// FASE 2.1: Persistência com localStorage
//

// 🆕 Chave única usada para salvar e carregar os produtos
const CHAVE_STORAGE = "sistema_estoque_produtos";


// 1. Função para SALVAR os dados no navegador
function salvarNoLocalStorage() {

    // Converte o Array de objetos em uma String JSON
    const listaEmTexto = JSON.stringify(listaDeProdutos);

    // Salva os produtos no navegador
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}


// 2. Função para CARREGAR os dados salvos quando a página abrir
function carregarDoLocalStorage() {

    // Procura os dados salvos no navegador
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    // Se existirem dados salvos
    if (dadosSalvos) {

        // Converte a String JSON novamente para Array
        const produtosObjetos = JSON.parse(dadosSalvos);

        // Recria cada produto como uma instância da classe Produto
        produtosObjetos.forEach((prod) => {

            const produtoInstanciado = new Produto(
                prod.nome,
                prod.preco,
                prod.quantidade
            );

            listaDeProdutos.push(produtoInstanciado);
        });
    }
}


//
// FASE 3: Captura de Elementos do DOM
//

const formProduto = document.getElementById("produto-form");

const btnLimparTudo = document.getElementById("limpar-tabela");

const totalEstoqueEl = document.getElementById("total-estoque");


//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {

    // Impede o recarregamento da página
    event.preventDefault();

    // Captura os valores dos campos
    const nomeInput = document.getElementById("nome").value;

    const precoInput = document.getElementById("preco").value;

    const quantidadeInput = document.getElementById("quantidade").value;


    // 🆕 Try/catch para tratar erros de validação
    try {

        // Cria um novo produto
        const novoProduto = new Produto(
            nomeInput,
            precoInput,
            quantidadeInput
        );

        // Adiciona o produto à lista
        listaDeProdutos.push(novoProduto);

        // 🆕 Salva os produtos no localStorage
        salvarNoLocalStorage();

        // Atualiza a tabela e o total
        atualizarInterface();

        // Limpa o formulário
        formProduto.reset();

    } catch (erro) {

        // Mostra o erro para o usuário
        alert(erro.message);
    }
});


// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {

    // Verifica se a tabela já está vazia
    if (listaDeProdutos.length === 0) {

        alert("A tabela já está vazia!");

        return;
    }


    // Confirma antes de apagar
    if (confirm("Tem certeza que deseja remover todos os produtos?")) {

        // Esvazia a lista
        listaDeProdutos.length = 0;

        // 🆕 Remove os produtos salvos no navegador
        localStorage.removeItem(CHAVE_STORAGE);

        // Atualiza a interface
        atualizarInterface();
    }
});


//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// Função responsável por remover um único produto
function removerProduto(index) {

    // Remove o produto pelo índice
    listaDeProdutos.splice(index, 1);

    // 🆕 Salva a lista atualizada no localStorage
    salvarNoLocalStorage();

    // Atualiza a interface
    atualizarInterface();
}


// Função responsável por calcular o total geral do estoque
function atualizarTotalEstoque() {

    // Soma o subtotal de todos os produtos
    const total = listaDeProdutos.reduce((acc, produto) => {

        return acc + produto.calcularSubtotal();

    }, 0);


    // Mostra o total formatado em moeda brasileira
    totalEstoqueEl.textContent = `Total em Estoque: ${total.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    )}`;
}


// Função responsável por desenhar a tabela
function renderizarTabela() {

    // Seleciona o tbody da tabela
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    // Limpa a tabela antes de desenhar novamente
    tabelaBody.innerHTML = "";


    // Percorre todos os produtos
    listaDeProdutos.forEach((produto, index) => {

        // Cria uma nova linha
        const linha = document.createElement("tr");


        // Preenche a linha com os dados do produto
        linha.innerHTML = `
            <td>${produto.nome}</td>

            <td>R$ ${produto.preco.toFixed(2)}</td>

            <td>${produto.quantidade}</td>

            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>

            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;


        // Encontra o botão Remover
        const btnRemover = linha.querySelector(".btn-remover");


        // Adiciona o evento ao botão
        btnRemover.addEventListener("click", () => {

            removerProduto(index);

        });


        // Adiciona a linha na tabela
        tabelaBody.appendChild(linha);
    });
}


// Função principal que atualiza a interface
function atualizarInterface() {

    renderizarTabela();

    atualizarTotalEstoque();
}


//
// FASE 6: Inicialização da Aplicação
//

// 🆕 Carrega os produtos salvos no navegador
carregarDoLocalStorage();

// 🆕 Mostra os produtos carregados na tabela
atualizarInterface();
