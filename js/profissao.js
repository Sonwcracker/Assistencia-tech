document.addEventListener("DOMContentLoaded", async () => {
  const db = firebase.firestore();

  const imagensProfissao = {
    eletricista: "https://institutodaconstrucao.com.br/wp-content/uploads/2019/09/Quais-sao-as-principais-funcoes-do-eletricista-Instituto-da-Construcao.jpg",
    encanador: "https://soscasacuritiba.com.br/wp-content/uploads/2023/09/Encanador.jpg",
    // Adicione mais profissões aqui conforme necessário
  };

  const urlParams = new URLSearchParams(window.location.search);
  const profissaoId = urlParams.get("profissao");

  if (!profissaoId) {
    alert("Profissão não especificada.");
    return;
  }

  try {
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

    const profissionaisSnapshot = await db
      .collection("profissoes")
      .doc(profissaoId)
      .collection("profissionais")
      .get();

    const lista = document.getElementById("lista-profissionais");
    lista.innerHTML = "";

    if (profissionaisSnapshot.empty) {
      lista.innerHTML = "<p>Nenhum profissional cadastrado ainda.</p>";
      return;
    }

    profissionaisSnapshot.forEach(doc => {
      const prof = doc.data();
      const profId = doc.id;

      const link = document.createElement("a");
      link.href = `profissional.html?profissao=${profissaoId}&id=${profId}`;
      link.className = "link-card";

      const card = document.createElement("li");
      card.className = "card-profissional";

      link.innerHTML = `
        <div>
          <h3>${prof.nome}</h3>
          <p>${prof.descricao || "Sem descrição"}</p>
          <p><strong>Nota:</strong> ${prof.avaliacao || "N/A"}</p>
          <p><strong>Preço:</strong> R$ ${prof.preco || "A combinar"}</p>
        </div>
      `;

      card.appendChild(link);
      lista.appendChild(card);
    });
  } catch (e) {
    console.error("Erro ao carregar profissão:", e);
  }
});

// ===== Modal de Login/Cadastro =====
function abrirModalLogin() {
  document.getElementById("modal-login").style.display = "block";
}

function fecharModal() {
  document.getElementById("modal-login").style.display = "none";
}

// ===== Formulário de Orçamento =====
function abrirFormOrcamento() {
  const user = firebase.auth().currentUser;
  const urlAtual = window.location.href;

  if (!user) {
    // Salva o link atual no localStorage para voltar depois do login
    localStorage.setItem('voltarPara', urlAtual);
    window.location.href = "login.html"; // ou "login.html?retorno=profissao"
    return;
  }

  const form = document.getElementById("form-orcamento");
  if (form) {
    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }
}


document.getElementById("formSolicitacaoProfissao").addEventListener("submit", async (e) => {
  e.preventDefault();

  const db = firebase.firestore();
  const auth = firebase.auth();
  const user = auth.currentUser;

  const urlParams = new URLSearchParams(window.location.search);
  const profissao = urlParams.get("profissao");

  if (!profissao) {
    alert("Profissão não especificada.");
    return;
  }

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

// ===== Login/Cadastro com Firebase Auth =====
const formLogin = document.getElementById("form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, senha);
      const uid = cred.user.uid;

      await firebase.firestore().collection("clientes").doc(uid).set({
        nome, telefone, email, tipo: "cliente"
      });

      alert("Cadastro realizado com sucesso!");
      fecharModal();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          await firebase.auth().signInWithEmailAndPassword(email, senha);
          alert("Login realizado com sucesso!");
          fecharModal();
        } catch (e) {
          document.getElementById("mensagem-login").textContent = "Senha incorreta.";
        }
      } else {
        document.getElementById("mensagem-login").textContent = err.message;
      }
    }
  });
}
