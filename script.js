// ==================================================
// FASE 1: MODELAGEM DOS DADOS (Classe Base)
// ==================================================
// A classe funciona como um "molde" ou "planta baixa" para criar produtos.
class Produto {
    constructor(nome, preco, quantidade) {
        // Propriedades do objeto recebidas no momento da criação
        this.nome = nome;
        this.preco = parseFloat(preco); // Converte o texto do input para número decimal
        this.quantidade = parseInt(quantidade); // Converte o texto do input para número inteiro
    }

    // Método que calcula o subtotal deste produto específico
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

// ==================================================
// FASE 2: GERENCIAMENTO DE ESTADO (Memória)
// ==================================================

// Array global que guardará todas as instâncias da classe Produto
const listaDeProdutos = [];

// ==================================================
// FASE 3: ESCUTA DE EVENTOS DO DOM
// ==================================================

// Selecionamos o formulário do HTML pelo ID
const formProduto = document.getElementById("produto-form");

// Adicionamos um escutador de eventos para quando o formulário for enviado (submit)
formProduto.addEventListener("submit", function(event) {
    // Impede que a página recarregue ao enviar o formulário
    event.preventDefault();

    // 1. Captura os valores digitados nos campos de input do HTML
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    // 2. Cria uma nova instância da classe Produto (Instanciação)
    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);

    // 3. Adiciona o novo produto ao nosso Array de memória
    listaDeProdutos.push(novoProduto);

    // 4. Atualiza a exibição da tabela e limpa o formulário
    renderizarTabela();
    formProduto.reset();
});

// ==================================================
// FASE 4: RENDERIZAÇÃO DA INTERFACE (DOM)
// ==================================================

// Função responsável por desenhar na tela o estado atual do Array listaDeProdutos
function renderizarTabela() {
    // Seleciona o corpo da tabela (tbody)
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    // Limpa o conteúdo anterior da tabela para evitar duplicações
    tabelaBody.innerHTML = "";

    // Percorre o Array de produtos usando forEach
    listaDeProdutos.forEach((produto) => {
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
    });
}
