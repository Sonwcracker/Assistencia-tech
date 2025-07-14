window.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.getElementById('cadastroForm');
  const mensagem = document.getElementById('mensagem');

  if (!formCadastro) {
    console.error('⚠️ Formulário de cadastro não encontrado!');
    return;
  }

  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const cep = document.getElementById('cep').value;

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, senha);
      const uid = cred.user.uid;

      await db.collection('usuarios').doc(uid).set({
        nome,
        email,
        tipo,
        cidade,
        estado,
        cep
      });

      mensagem.textContent = "Usuário cadastrado com sucesso!";
      formCadastro.reset();
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        mensagem.textContent = "Este e-mail já está cadastrado.";
      } else {
        mensagem.textContent = "Erro: " + error.message;
      }
    }
  });
});
