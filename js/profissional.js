window.addEventListener("DOMContentLoaded", async () => {
  const db = firebase.firestore();
  const container = document.getElementById("perfil-container");

  const params = new URLSearchParams(window.location.search);
  const profissao = params.get("profissao");
  const id = params.get("id");

  if (!profissao || !id) {
    container.innerHTML = "<p>Profissional não encontrado.</p>";
    return;
  }

  try {
    const doc = await db.collection("profissoes").doc(profissao).collection("profissionais").doc(id).get();

    if (!doc.exists) {
      container.innerHTML = "<p>Profissional não encontrado.</p>";
      return;
    }

    const prof = doc.data();
    const imagem = prof.foto || "https://via.placeholder.com/300";
    const nome = prof.nome;
    const descricao = prof.descricao || "Descrição não informada.";
    const avaliacao = prof.avaliacao || 0;
    const preco = prof.preco || "A combinar";
    const email = prof.email || "email@email.com";
    const idade = prof.idade || "Não informada";
    const localizacao = prof.localizacao || "Local não informado";

    container.innerHTML = `
      <h1>Perfil</h1>
      <p class="subtitulo">Sou um profissional especializado em ${profissao}</p>

      <div class="perfil-conteudo">
        <div class="perfil-box">
          <h3>Sobre mim</h3>
          <p>${descricao}</p>
          <p><small><i>${prof.nomeProfissao || profissao}</i></small></p>
        </div>

        <div class="perfil-box">
          <img src="${imagem}" alt="${nome}" class="perfil-foto">
        </div>

        <div class="perfil-box">
          <h3>Detalhes</h3>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Idade:</strong> ${idade}</p>
          <p><strong>Localização:</strong> ${localizacao}</p>
          <p><strong>Avaliação:</strong> ${avaliacao} ★</p>
          <p><strong>Preço:</strong> R$ ${preco}</p>
          <button class="btn-contato" onclick="window.location.href='mailto:${email}'">Entrar em contato</button>
          <div class="redes-sociais">
            <ion-icon name="logo-facebook"></ion-icon>
            <ion-icon name="logo-twitter"></ion-icon>
            <ion-icon name="logo-instagram"></ion-icon>
          </div>
        </div>
      </div>

      <div class="avaliar-container">
        <p>Quer deixar sua avaliação?</p>
        <button class="btn-login-acesso" onclick="mostrarLoginCard()">Avaliar este profissional</button>
      </div>

      <div class="box-login-rapido" id="card-login" style="display: none;">
        <h3>Faça login para avaliar ou entrar em contato</h3>
        <input type="text" id="nome" placeholder="Nome completo" required>
        <input type="tel" id="telefone" placeholder="Telefone" required>
        <input type="email" id="email" placeholder="E-mail" required>
        <input type="password" id="senha" placeholder="Senha" required>
        <button class="btn-login-acesso" onclick="realizarLogin()">Entrar / Cadastrar</button>
        <p id="mensagem-login" style="color: red; margin-top: 10px;"></p>
      </div>
    `;
  } catch (error) {
    console.error("Erro ao carregar profissional:", error);
    container.innerHTML = "<p>Erro ao carregar dados do profissional.</p>";
  }
});

// Exibir o card de login ao clicar no botão
function mostrarLoginCard() {
  const loginCard = document.getElementById("card-login");
  if (loginCard) loginCard.style.display = "block";
}

// Função de login/cadastro
function realizarLogin() {
  const auth = firebase.auth();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const mensagem = document.getElementById("mensagem-login");

  if (!nome || !telefone || !email || !senha) {
    mensagem.textContent = "Preencha todos os campos.";
    return;
  }

  auth.createUserWithEmailAndPassword(email, senha)
    .then(userCredential => {
      const user = userCredential.user;
      return firebase.firestore().collection("usuarios").doc(user.uid).set({
        nome,
        telefone,
        email,
        tipo: "cliente",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => {
      if (error.code === "auth/email-already-in-use") {
        return auth.signInWithEmailAndPassword(email, senha);
      } else {
        throw error;
      }
    })
    .then(() => {
      mensagem.style.color = "green";
      mensagem.textContent = "Login realizado com sucesso!";
    })
    .catch(error => {
      mensagem.style.color = "red";
      mensagem.textContent = "Erro: " + error.message;
    });
}
