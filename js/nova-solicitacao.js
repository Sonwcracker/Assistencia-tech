window.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const form = document.getElementById('formSolicitacao');
  const mensagem = document.getElementById('mensagem');

  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const novaSolicitacao = {
        categoria: document.getElementById('categoria').value,
        tipo_aparelho: document.getElementById('tipo_aparelho').value,
        marca_aparelho: document.getElementById('marca_aparelho').value,
        descricao: document.getElementById('descricao').value,
        coleta: document.getElementById('coleta').value,
        cliente_id: user.uid,
        tecnico_id: "", // ainda não atribuído
        status: "aberta",
        data_criacao: new Date()
      };

      try {
        await db.collection('solicitacoes').add(novaSolicitacao);
        mensagem.textContent = "Solicitação enviada com sucesso!";
        form.reset();
      } catch (error) {
        mensagem.textContent = "Erro ao enviar: " + error.message;
      }
    });
  });
});
