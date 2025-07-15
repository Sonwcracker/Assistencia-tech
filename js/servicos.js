window.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const user = await new Promise(resolve => {
    auth.onAuthStateChanged(resolve);
  });

  const titulo = document.getElementById('titulo-listagem');
  const lista = document.getElementById('lista');
  const mensagem = document.getElementById('mensagem');

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Busca o tipo de usuário
    const doc = await db.collection('usuarios').doc(user.uid).get();
    const dados = doc.data();

    console.log("UID logado:", user.uid);
    console.log("Tipo de usuário:", dados.tipo);

    if (dados.tipo === 'tecnico') {
      titulo.textContent = "Meus Serviços";
      const querySnapshot = await db.collection('servicos')
        .where('tecnico_id', '==', user.uid)
        .get();

      console.log("Serviços encontrados:", querySnapshot.size);

      if (querySnapshot.empty) {
        mensagem.textContent = "Você ainda não cadastrou nenhum serviço.";
      } else {
        querySnapshot.forEach(doc => {
          const servico = doc.data();
          console.log("Serviço:", servico);

          lista.innerHTML += `
            <div class="card">
              <h3>${servico.categoria}</h3>
              <p>${servico.descricao}</p>
              <p><strong>Preço médio:</strong> R$ ${servico.preco_medio}</p>
            </div>
          `;
        });
      }

    } else {
      titulo.textContent = "Minhas Solicitações";
      const querySnapshot = await db.collection('solicitacoes')
        .where('cliente_id', '==', user.uid)
        .get();

      console.log("Solicitações encontradas:", querySnapshot.size);

      if (querySnapshot.empty) {
        mensagem.textContent = "Você ainda não fez nenhuma solicitação.";
      } else {
        querySnapshot.forEach(doc => {
          const solic = doc.data();
          console.log("Solicitação:", solic);

          lista.innerHTML += `
            <div class="card">
              <h3>${solic.categoria}</h3>
              <p>${solic.descricao}</p>
              <p><strong>Status:</strong> ${solic.status}</p>
            </div>
          `;
        });
      }
    }

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    mensagem.textContent = "Erro ao buscar dados: " + error.message;
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
