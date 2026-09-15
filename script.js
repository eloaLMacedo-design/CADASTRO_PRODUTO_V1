// 
// FASE 1: MODELAGEM DOS DADOS (Classe Base) 
// 
// A classe funciona como um "molde" ou "planta baixa" para criar produtos. 
class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        //validação do nome
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }
        // Propriedades do objeto recebidas no momento da criação 
        this.nome = nome;
        // Converte o texto do input para número decimal
        this.preco = parseFloat(preco);
        // Converte o texto do input para número inteiro
        this.quantidade = parseInt(quantidade);
        //validação do preço
        if (this.#preco <= 0 || isNaN(this.#preco)) {
            throw new Error("O preço deve ser maior que zero.");
        }
        //validação da quantidade
        if (this.#quantidade <= 0 || isNaN(this.#quantidade)) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
    }
    //getter do preço
    get preco() {
        return this.#preco;
    }
    //setter do preço
    set preco(novoPreco) {

        novoPreco = parseFloat(novoPreco);

        if (isNaN(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }
    //getter da quantidade
    get quantidade() {
        return this.#quantidade;
    }
    //setter da quantidade
    set quantidade(novaQuantidade) {

        novaQuantidade = parseInt(novaQuantidade);

        if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }
    // Método que calcula o subtotal deste produto específico 
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}
//
// FASE 2: GERENCIAMENTO DE ESTADO (Memória) 
// Array global que guardará todas as instâncias da classe Produto 
const listaDeProdutos = [];
//
// FASE 3: ESCUTA DE EVENTOS DO DOM 
// Selecionamos o formulário do HTML pelo ID 
const formProduto = document.getElementById("produto-form");

// Adicionamos um escutador de eventos para quando o formulário for enviado (submit) 
formProduto.addEventListener("submit", function (event) {

    // Impede que a página recarregue ao enviar o formulário 
    event.preventDefault();

    // 1. Captura os valores digitados nos campos de input do HTML 
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    //try/catch para tratar os erros
    try {
        // 2. Cria uma nova instância da classe Produto (Instanciação) 
        const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
        // 3. Adiciona o novo produto ao nosso Array de memória 
        listaDeProdutos.push(novoProduto);
        // 4. Atualiza a exibição da tabela e limpa o formulário 
        renderizarTabela();
        formProduto.reset();
        //atualiza o total do estoque
        atualizarTotalEstoque();
    } catch (erro) {
        //mostra o erro para o usuário
        alert(erro.message);
    }
});
//
// FASE 4: RENDERIZAÇÃO DA INTERFACE (DOM) 
//
// Função responsável por desenhar na tela o estado atual do Array listaDeProdutos 
function renderizarTabela() {
    // Seleciona o corpo da tabela (tbody) 
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    // Limpa o conteúdo anterior da tabela para evitar duplicações 
    tabelaBody.innerHTML = "";
    // Percorre o Array de produtos usando forEach 
    listaDeProdutos.forEach((produto, index) => {

        // Cria um elemento <tr> (linha da tabela) 
        const linha = document.createElement("tr");

        // Preenche o conteúdo interno da linha com os dados do objeto 
        linha.innerHTML = ` 
            <td>${produto.nome}</td> 
            <td>R$ ${produto.preco.toFixed(2)}</td> 
            <td>${produto.quantidade}</td> 
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td> 
            <td> 
                <button class="btn-remover">Remover</button> 
            </td> 
        `;

        // Insere a linha criada dentro do tbody da tabela 
        tabelaBody.appendChild(linha);

        //botão Remover
        const botaoRemover = linha.querySelector(".btn-remover");

        botaoRemover.addEventListener("click", function () {

            // Passa o índice do produto que será removido
            removerProduto(index);

        });
    });
}
// DESAFIO 2: TOTAL DO ESTOQUE
// Função responsável por calcular o valor total do estoque
function atualizarTotalEstoque() {

    // Usa o reduce para somar todos os subtotais
    const total = listaDeProdutos.reduce((acumulador, produto) => {

        return acumulador + produto.calcularSubtotal();

    }, 0);

    // Seleciona o elemento HTML que mostra o total
    const totalEstoque = document.getElementById("total-estoque");

    // Formata o valor como moeda brasileira
    totalEstoque.textContent = `Total do estoque: ${total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}`;
}
// DESAFIO 3: REMOVER PRODUTO
function removerProduto(index) {
    // Remove 1 produto a partir do índice recebido
    listaDeProdutos.splice(index, 1);
    // Atualiza a tabela
    renderizarTabela();
    // Atualiza o valor total do estoque
    atualizarTotalEstoque();
}
// DESAFIO 3: LIMPAR TODO O ESTOQUE
// Seleciona o botão de limpar a tabela
const botaoLimpar = document.getElementById("limpar-tabela");
// Adiciona um evento de clique no botão
botaoLimpar.addEventListener("click", function () {
    // Esvazia o array
    listaDeProdutos.length = 0;

    // Atualiza a tabela
    renderizarTabela();

    // Atualiza o total
    atualizarTotalEstoque();
});