window.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const form = document.getElementById('formSolicitacao');

  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const novaSolicitacao = {
        profissao_solicitada: document.getElementById('categoria').value,
        descricao: document.getElementById('descricao').value,
        coleta: document.getElementById('coleta').value,
        data_prevista: document.getElementById('data_prevista').value,
        cliente_id: user.uid,
        profissional_id: "",
        status: "aberta",
        data_criacao: new Date(),

        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cep: document.getElementById('cep').value
      };

      try {
        await db.collection('solicitacoes').add(novaSolicitacao);
        window.location.href = "sucesso.html";
      } catch (error) {
        const mensagem = document.getElementById('mensagem');
        mensagem.style.color = "red";
        mensagem.textContent = "Erro ao enviar: " + error.message;
      }
    });
  });
});
