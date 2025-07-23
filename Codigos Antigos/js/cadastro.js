window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const msg = document.getElementById('mensagem');

  if (!form) {
    console.error('❌ Formulário não encontrado.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Coleta os dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value;
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const profissao = document.getElementById('profissao')?.value;

    try {
      // Cria o usuário no Firebase Auth
      const cred = await auth.createUserWithEmailAndPassword(email, senha);
      const uid = cred.user.uid;

      // Monta os dados do usuário
      const dadosUsuario = {
        nome,
        email,
        tipo,
        cidade,
        estado,
        cep,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (tipo === 'tecnico' && profissao) {
        dadosUsuario.profissao = profissao;
      }

      const salvarNoFirestore = async (dados) => {
        await db.collection('usuarios').doc(uid).set(dados);
        msg.textContent = '✅ Cadastro realizado com sucesso!';

        // Redirecionamento após cadastro
        if (tipo === 'tecnico') {
          window.location.href = 'Zlogin/cadastro-perfil.html';
        } else {
          window.location.href = 'servicos.html';
        }
      };

      // Tentativa de obter localização
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            dadosUsuario.lat = position.coords.latitude;
            dadosUsuario.lng = position.coords.longitude;
            await salvarNoFirestore(dadosUsuario);
          },
          async (error) => {
            console.warn('⚠️ Erro ao obter localização:', error.message);
            await salvarNoFirestore(dadosUsuario);
          }
        );
      } else {
        await salvarNoFirestore(dadosUsuario);
      }
    } catch (erro) {
      console.error(erro);
      if (erro.code === 'auth/email-already-in-use') {
        msg.textContent = '❌ Este e-mail já está em uso.';
      } else {
        msg.textContent = '❌ Erro ao cadastrar: ' + erro.message;
      }
    }
  });
});
