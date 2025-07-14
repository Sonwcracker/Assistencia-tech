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
      await auth.signInWithEmailAndPassword(email, senha);
      mensagem.textContent = "Login realizado com sucesso!";
      window.location.href = "dashboard.html";
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
