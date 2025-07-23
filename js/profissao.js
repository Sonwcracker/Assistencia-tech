document.addEventListener("DOMContentLoaded", async () => {
  const db = firebase.firestore();
  const auth = firebase.auth();

  const imagensProfissao = {
    eletricista: "https://institutodaconstrucao.com.br/wp-content/uploads/2019/09/Quais-sao-as-principais-funcoes-do-eletricista-Instituto-da-Construcao.jpg",
    encanador: "https://soscasacuritiba.com.br/wp-content/uploads/2023/09/Encanador.jpg",
    // Adicione mais se quiser
  };

  const urlParams = new URLSearchParams(window.location.search);
  const profissaoId = urlParams.get("profissao");

  if (!profissaoId) {
    alert("Profissão não especificada.");
    return;
  }

  try {
    // Carregar dados da profissão
    const doc = await db.collection("profissoes").doc(profissaoId).get();
    if (!doc.exists) {
      document.getElementById("titulo-profissao").textContent = "Profissão não encontrada";
      return;
    }

    const data = doc.data();
    document.getElementById("titulo-profissao").textContent = data.nome;
    document.getElementById("descricao-profissao").textContent = data.descricao || "Confira os melhores profissionais!";
    document.getElementById("texto-profissao").textContent = data.texto || "Informações completas serão exibidas aqui.";
    document.getElementById("imagem-profissao").src = imagensProfissao[profissaoId] || "https://via.placeholder.com/600";

    const lista = document.getElementById("lista-profissionais");
    lista.innerHTML = "";

    // Buscar profissionais da subcoleção
    const profissionaisSub = await db
      .collection("profissoes")
      .doc(profissaoId)
      .collection("profissionais")
      .get();

    profissionaisSub.forEach(doc => {
      const prof = doc.data();
      const profId = doc.id;
      const card = criarCardProfissional(prof, profissaoId, profId);
      lista.appendChild(card);
    });

    // Buscar profissionais da coleção usuarios
    const profissionaisUsuarios = await db
      .collection("usuarios")
      .where("tipo", "==", "tecnico")
      .where("profissao", "==", profissaoId)
      .get();

    profissionaisUsuarios.forEach(doc => {
      const prof = doc.data();
      const profId = doc.id;
      const card = criarCardProfissional(prof, profissaoId, profId);
      lista.appendChild(card);
    });

    if (lista.children.length === 0) {
      lista.innerHTML = "<p>Nenhum profissional cadastrado ainda.</p>";
    }

  } catch (e) {
    console.error("Erro ao carregar profissão:", e);
  }
});

// Cria um card para o profissional com avaliação
function criarCardProfissional(prof, profissaoId, profId) {
  const link = document.createElement("a");
  link.href = `profissional.html?profissao=${profissaoId}&id=${profId}`;
  link.className = "link-card";

  const card = document.createElement("li");
  card.className = "card-profissional";

  const conteudo = document.createElement("div");
  conteudo.innerHTML = `
    <h3>${prof.nome}</h3>
    <p>${prof.descricao || "Sem descrição"}</p>
    <p><strong>Preço:</strong> R$ ${prof.preco || "A combinar"}</p>
    <div class="avaliacoes-prof-card" id="avaliacoes-${profId}"><em>Carregando avaliações...</em></div>
  `;

  link.appendChild(conteudo);
  card.appendChild(link);

  // Buscar avaliações
  firebase.firestore()
    .collection("usuarios")
    .doc(profId)
    .collection("avaliacoes")
    .orderBy("data", "desc")
    .get()
    .then(async (snapshot) => {
      const avalDiv = document.getElementById(`avaliacoes-${profId}`);
      if (snapshot.empty) {
        avalDiv.innerHTML = "<p><strong>Nota:</strong> Ainda sem avaliações</p>";
        return;
      }

      let somaNotas = 0;
      let avaliadores = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        somaNotas += data.nota || 0;

        // Buscar nome de quem avaliou
        const clienteRef = await firebase.firestore().collection("usuarios").doc(data.usuarioId).get();
        const nomeCliente = clienteRef.exists ? clienteRef.data().nome : "Anônimo";
        avaliadores.push(nomeCliente);
      }

      const media = (somaNotas / snapshot.size).toFixed(1);
      avalDiv.innerHTML = `
        <p><strong>Nota:</strong> ${media} ★ (${snapshot.size} avaliações)</p>
        <p><strong>Avaliado por:</strong> ${avaliadores.join(", ")}</p>
      `;
    })
    .catch(err => {
      console.error("Erro ao carregar avaliações:", err);
    });

  return card;
}

// Exibir formulário de orçamento
function abrirFormOrcamento() {
  const user = firebase.auth().currentUser;
  const urlAtual = window.location.href;

  if (!user) {
    localStorage.setItem('voltarPara', urlAtual);
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("form-orcamento");
  if (form) {
    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }
}

// Enviar orçamento
document.getElementById("formSolicitacaoProfissao").addEventListener("submit", async (e) => {
  e.preventDefault();

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  const urlParams = new URLSearchParams(window.location.search);
  const profissao = urlParams.get("profissao");

  const novaSolicitacao = {
    profissao_solicitada: profissao,
    descricao: document.getElementById("descricao").value,
    data_prevista: document.getElementById("data_prevista").value,
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    cep: document.getElementById("cep").value,
    status: "aberta",
    data_criacao: new Date(),
    cliente_id: user ? user.uid : null,
    profissional_id: ""
  };

  try {
    await db.collection("solicitacoes").add(novaSolicitacao);
    document.getElementById("mensagem-form").textContent = "Orçamento enviado com sucesso!";
    document.getElementById("formSolicitacaoProfissao").reset();
  } catch (err) {
    document.getElementById("mensagem-form").textContent = "Erro ao enviar: " + err.message;
  }
});
