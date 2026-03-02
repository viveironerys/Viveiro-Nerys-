// Sistema Profissional Estação Verde

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
let carrinho = [];
let totalAtual = 0;
let numeroNota = Number(localStorage.getItem("numeroNota")) || 1;
let caixaAberto = false;
let valorCaixa = 0;

// ================= LOGIN =================
function login(){
    let login = document.getElementById("loginInput").value;
    let senha = document.getElementById("senhaInput").value;

    if(login==="viveiro" && senha==="2020"){
        document.getElementById("loginBox").classList.add("hidden");
        document.getElementById("sistema").classList.remove("hidden");
        atualizarProdutos();
        atualizarHistorico();
    }else{
        document.getElementById("loginMsg").innerText="Login ou senha incorretos!";
    }
}

// ================= ABAS =================
function abrir(sec){
    ["venda","produtos","historico","caixa"].forEach(id=>{
        document.getElementById(id).classList.add("hidden");
    });
    document.getElementById(sec).classList.remove("hidden");
}

// ================= PRODUTOS =================
function adicionarProduto(){
    let nome = document.getElementById("nomeProduto").value.trim();
    let estoque = parseInt(document.getElementById("estoqueProduto").value);
    let preco = parseFloat(document.getElementById("precoProduto").value);

    if(!nome || isNaN(estoque) || isNaN(preco)){
        alert("Preencha corretamente!");
        return;
    }

    produtos.push({nome, estoque, preco});
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarProdutos();

    document.getElementById("nomeProduto").value="";
    document.getElementById("estoqueProduto").value="";
    document.getElementById("precoProduto").value="";
}

function atualizarProdutos(){
    let lista = document.getElementById("listaProdutos");
    lista.innerHTML="";

    produtos.forEach((p, index)=>{
        lista.innerHTML += `
        <li>
            ${p.nome} | Estoque: ${p.estoque} | R$ ${p.preco.toFixed(2)}
            <button onclick="adicionarEstoque(${index})">+</button>
        </li>
        `;
    });
}

// BOTÃO + PARA ADICIONAR ESTOQUE
function adicionarEstoque(index){
    let quantidade = prompt("Quantas unidades deseja adicionar?");
    quantidade = parseInt(quantidade);

    if(isNaN(quantidade) || quantidade <= 0){
        alert("Quantidade inválida!");
        return;
    }

    produtos[index].estoque += quantidade;

    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarProdutos();
}

// ================= PESQUISA =================
document.addEventListener("DOMContentLoaded", function(){
    let campoPesquisa = document.getElementById("produtoPesquisa");

    if(campoPesquisa){
        campoPesquisa.addEventListener("input", ()=>{
            let query = campoPesquisa.value.toLowerCase();
            let listaSugestoes = document.getElementById("listaSugestoes");
            listaSugestoes.innerHTML="";

            produtos
                .filter(p=>p.nome.toLowerCase().includes(query))
                .forEach(p=>{
                    let li = document.createElement("li");
                    li.innerText=p.nome+" | R$ "+p.preco.toFixed(2);
                    li.onclick=()=>{
                        campoPesquisa.value=p.nome;
                        listaSugestoes.innerHTML="";
                    };
                    listaSugestoes.appendChild(li);
                });
        });
    }
});

// ================= CARRINHO =================
function adicionarItem(){
    let nome = document.getElementById("produtoPesquisa").value.trim();
    let qtd = parseInt(document.getElementById("quantidade").value);

    if(!nome || isNaN(qtd)){
        alert("Preencha corretamente!");
        return;
    }

    let prod = produtos.find(p=>p.nome===nome);

    if(!prod){
        alert("Produto não encontrado!");
        return;
    }

    if(qtd>prod.estoque){
        alert("Quantidade maior que estoque!");
        return;
    }

    let totalItem = qtd * prod.preco;

    carrinho.push({nome, quantidade:qtd, valor:totalItem});
    totalAtual += totalItem;

    prod.estoque -= qtd;

    localStorage.setItem("produtos", JSON.stringify(produtos));

    atualizarLista();
    atualizarProdutos();

    document.getElementById("produtoPesquisa").value="";
    document.getElementById("quantidade").value="";
}

function atualizarLista(){
    let lista = document.getElementById("lista");
    lista.innerHTML="";

    carrinho.forEach(item=>{
        lista.innerHTML += `
        <li>
            ${item.nome} | Qtd: ${item.quantidade} | R$ ${item.valor.toFixed(2)}
        </li>
        `;
    });

    document.getElementById("total").innerText=totalAtual.toFixed(2);
}

// ================= FINALIZAR VENDA =================
function finalizarVenda(){
    if(carrinho.length===0){
        alert("Venda vazia!");
        return;
    }

    let data = new Date().toLocaleString("pt-BR");

    let venda = {
        numero:"NF-"+String(numeroNota).padStart(4,"0"),
        cliente:document.getElementById("cliente").value,
        pagamento:document.getElementById("pagamento").value,
        data:data,
        itens:[...carrinho],
        total:totalAtual
    };

    vendas.push(venda);

    localStorage.setItem("vendas", JSON.stringify(vendas));

    numeroNota++;
    localStorage.setItem("numeroNota", numeroNota);

    carrinho=[];
    totalAtual=0;

    atualizarLista();
    atualizarHistorico();

    alert("Venda finalizada!");
}

// ================= HISTÓRICO =================
function atualizarHistorico(){
    let listaHistorico = document.getElementById("listaHistorico");
    listaHistorico.innerHTML="";

    vendas.forEach(v=>{
        listaHistorico.innerHTML += `
        <li>
            ${v.numero} - ${v.cliente} - ${v.data} - R$ ${v.total.toFixed(2)}
        </li>
        `;
    });
}

// ================= PDF =================
function gerarPDFHistorico(){
    if(vendas.length===0){
        alert("Sem vendas!");
        return;
    }

    const { jsPDF } = window.jspdf || {};
    if(!jsPDF){
        alert("PDF não suportado!");
        return;
    }

    let doc = new jsPDF();
    doc.text("ESTAÇÃO VERDE - TEREZÓPOLIS DE GOIÁS",10,10);

    let y=20;
    vendas.forEach(v=>{
        doc.text(v.numero+" - "+v.data+" - R$ "+v.total.toFixed(2),10,y);
        y+=8;
    });

    doc.save("historico.pdf");
}

// ================= CAIXA =================
function abrirCaixa(){
    if(caixaAberto){
        alert("Caixa já aberto!");
        return;
    }

    let valor = parseFloat(document.getElementById("valorInicial").value);

    if(isNaN(valor)){
        alert("Informe o valor inicial");
        return;
    }

    valorCaixa = valor;
    caixaAberto = true;

    document.getElementById("caixaInfo").innerText=
        "Caixa aberto: R$ "+valorCaixa.toFixed(2);
}

function fecharCaixa(){
    if(!caixaAberto){
        alert("Caixa não aberto!");
        return;
    }

    let totalVendas = vendas.reduce((a,b)=>a+b.total,0);

    caixaAberto=false;

    document.getElementById("caixaInfo").innerText=
        "Caixa fechado. Total do dia: R$ "+
        (valorCaixa+totalVendas).toFixed(2)+
        " em "+new Date().toLocaleString("pt-BR");
}

// ================= SAIR =================
function sair(){
    location.reload();
}