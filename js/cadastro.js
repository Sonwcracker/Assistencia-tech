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

      const userData = {
        nome,
        email,
        tipo,
        cidade,
        estado,
        cep
      };

      // Tenta obter localização
      const salvarDadosUsuario = async (dados) => {
        await db.collection('usuarios').doc(uid).set(dados);
        mensagem.textContent = "Usuário cadastrado com sucesso!";

        // ✅ Redirecionamento com base no tipo
        if (tipo === 'tecnico') {
          window.location.href = 'especialidades.html';
        } else {
          window.location.href = 'servicos.html'; // ou outra página cliente
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          userData.lat = position.coords.latitude;
          userData.lng = position.coords.longitude;
          await salvarDadosUsuario(userData);
        }, async (error) => {
          console.warn("⚠️ Geolocalização falhou:", error.message);
          await salvarDadosUsuario(userData);
        });
      } else {
        await salvarDadosUsuario(userData);
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
