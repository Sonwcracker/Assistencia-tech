window.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const auth = firebase.auth();

  const form = document.getElementById("perfilForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const sobre = document.getElementById("sobre").value.trim(); // campo do formulário
    const localizacao = document.getElementById("localizacao").value.trim();
    const linkedin = document.getElementById("linkedin").value.trim();

    const user = auth.currentUser;

    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    try {
      await db.collection("usuarios").doc(user.uid).update({
        nome,
        idade,
        descricao: sobre, // salva como 'descricao' no banco
        localizacao,
        linkedin,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Perfil salvo com sucesso!");
      window.location.href = "/profissional.html?profissao=" + encodeURIComponent("profissao") + "&id=" + user.uid;
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    }
  });
});
