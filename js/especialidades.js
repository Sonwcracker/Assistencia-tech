window.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const form = document.getElementById('especialidadesForm');
  const mensagem = document.getElementById('mensagem');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      mensagem.textContent = "Usuário não autenticado.";
      return;
    }

    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    const especialidades = Array.from(checkboxes).map(cb => cb.value);

    if (especialidades.length === 0) {
      mensagem.textContent = "Selecione pelo menos uma especialidade.";
      return;
    }

    try {
      await db.collection("usuarios").doc(user.uid).update({
        especialidades: especialidades
      });

      mensagem.textContent = "Especialidades salvas com sucesso!";
      window.location.href = "pedidos.html";
    } catch (error) {
      mensagem.textContent = "Erro ao salvar especialidades: " + error.message;
    }
  });
});
