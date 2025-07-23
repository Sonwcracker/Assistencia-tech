window.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('loginForm');
  const mensagem = document.getElementById('mensagem');

  if (!formLogin) {
    console.error('⚠️ Formulário de login não encontrado!');
    return;
  }

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const cred = await auth.signInWithEmailAndPassword(email, senha);
      const uid = cred.user.uid;

      const doc = await db.collection('usuarios').doc(uid).get();

      if (!doc.exists) {
        mensagem.textContent = "Usuário não encontrado no banco de dados.";
        return;
      }

      const dados = doc.data();
      const nome = dados.nome || 'Usuário';
      const tipo = dados.tipo || 'cliente';

      // Salva no localStorage para uso na navbar
      localStorage.setItem("usuarioNome", nome);
      localStorage.setItem("usuarioTipo", tipo);

      // Verifica se há uma página para voltar após login
      const voltarPara = localStorage.getItem("voltarPara");

      // Geolocalização
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          await db.collection('usuarios').doc(uid).update({ lat, lng });

          mensagem.textContent = "Login realizado com sucesso!";
          if (voltarPara) {
            localStorage.removeItem("voltarPara");
            window.location.href = voltarPara;
          } else {
            window.location.href = "home.html"; // Redireciona para a home
          }

        }, async (error) => {
          console.warn("⚠️ Geolocalização negada ou falhou:", error.message);

          mensagem.textContent = "Login realizado (sem localização).";
          if (voltarPara) {
            localStorage.removeItem("voltarPara");
            window.location.href = voltarPara;
          } else {
            window.location.href = "home.html"; // Mesmo sem localização, vai para a home
          }
        });
      } else {
        mensagem.textContent = "Login realizado (sem suporte de localização).";
        if (voltarPara) {
          localStorage.removeItem("voltarPara");
          window.location.href = voltarPara;
        } else {
          window.location.href = "home.html";
        }
      }

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        mensagem.textContent = "Usuário não encontrado.";
      } else if (error.code === 'auth/wrong-password') {
        mensagem.textContent = "Senha incorreta.";
      } else {
        mensagem.textContent = "Erro: " + error.message;
      }
    }
  });
});
