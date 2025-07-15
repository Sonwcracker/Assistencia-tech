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

      // Inicia os dados sem lat/lng
      const userData = {
        nome,
        email,
        tipo,
        cidade,
        estado,
        cep
      };

      // Tenta obter geolocalização
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Adiciona localização aos dados do usuário
          userData.lat = lat;
          userData.lng = lng;

          await db.collection('usuarios').doc(uid).set(userData);
          mensagem.textContent = "Usuário cadastrado com sucesso com localização!";
          formCadastro.reset();

        }, async (error) => {
          console.warn("⚠️ Geolocalização negada ou falhou:", error.message);

          // Salva sem lat/lng se localização não for obtida
          await db.collection('usuarios').doc(uid).set(userData);
          mensagem.textContent = "Usuário cadastrado, mas sem localização.";
        });
      } else {
        // Se o navegador não suportar
        await db.collection('usuarios').doc(uid).set(userData);
        mensagem.textContent = "Usuário cadastrado, mas sem suporte a localização.";
      }

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        mensagem.textContent = "Este e-mail já está cadastrado.";
      } else {
        mensagem.textContent = "Erro: " + error.message;
      }
    }
  });
});
