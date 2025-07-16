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

      const marcaSelecionada = document.getElementById('marca_aparelho').value;
      const marcaOutro = document.getElementById('marca_outro').value;
      const marca = marcaSelecionada === 'Outros' ? marcaOutro : marcaSelecionada;

      const novaSolicitacao = {
        categoria: document.getElementById('categoria').value,
        tipo_aparelho: document.getElementById('categoria').value.toLowerCase(),
        marca_aparelho: marca,
        descricao: document.getElementById('descricao').value,
        coleta: document.getElementById('coleta').value,
        data_prevista: document.getElementById('data_prevista').value,
        cliente_id: user.uid,
        tecnico_id: "",
        status: "aberta",
        data_criacao: new Date(),

        garantia: document.getElementById('garantia').value === "true",
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cep: document.getElementById('cep').value
      };

      try {
        await db.collection('solicitacoes').add(novaSolicitacao);
        // Redireciona para tela de sucesso após envio
        window.location.href = "sucesso.html";
      } catch (error) {
        const mensagem = document.getElementById('mensagem');
        mensagem.style.color = "red";
        mensagem.textContent = "Erro ao enviar: " + error.message;
      }
    });
  });
});
