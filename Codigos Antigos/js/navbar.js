// navbar.js
window.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('navbar-placeholder');
  const auth = firebase.auth();
  const db = firebase.firestore();

  const html = await fetch('navbar.html').then(res => res.text());
  placeholder.innerHTML = html;

  const userDiv = document.getElementById("usuario-logado");
  if (!userDiv) return;

  auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    try {
      const doc = await db.collection("usuarios").doc(user.uid).get();
      const dados = doc.data();
      const nome = dados.nome || "Usuário";
      const tipo = dados.tipo;

      let menuHTML = "";

      if (tipo === 'cliente') {
        menuHTML = `
          <a href="servicos.html" class="item-menu">Ver meus serviços</a>
        `;
      } else if (tipo === 'tecnico' || tipo === 'profissional') {
        menuHTML = `
          <a href="orcamentos.html" class="item-menu">Orçamentos</a>
          <a href="pedidos.html" class="item-menu">Pedidos </a>
        `;
      }

      userDiv.innerHTML = `
        <div class="user-dropdown">
          <button class="user-button-nome"><strong style="color: white;">${nome}</strong></button>
          <div class="user-menu">
            ${menuHTML}
            <a href="#" class="item-menu sair" onclick="logout()">
              <i class="ri-logout-box-line"></i> Sair
            </a>
          </div>
        </div>
      `;

      // Toggle do menu
      const btn = document.querySelector('.user-button-nome');
      const menu = document.querySelector('.user-menu');
      btn.addEventListener('click', () => {
        menu.classList.toggle('open');
      });

    } catch (e) {
      console.error("Erro ao montar menu do usuário:", e);
    }
  });
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "home.html";
  });
}
