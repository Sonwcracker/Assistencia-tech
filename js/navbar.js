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

      userDiv.innerHTML = `
        <div class="user-dropdown">
          <button class="user-button-nome">${nome}</button>
          <div class="user-menu">
            ${tipo === 'cliente' 
              ? `<a href="servicos.html" class="item-menu">Ver meus serviços</a>`
              : `<a href="meus-pedidos.html" class="item-menu">Meus Pedidos</a>`}
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
