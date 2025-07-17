window.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const user = await new Promise(resolve => auth.onAuthStateChanged(resolve));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const aceitosEl = document.getElementById('pedidos-aceitos');
  const finalizadosEl = document.getElementById('pedidos-finalizados');

  try {
    const snapshot = await db.collection('solicitacoes')
      .where('tecnico_id', '==', user.uid)
      .get();

    for (const doc of snapshot.docs) {
      const pedido = doc.data();

      // Buscar nome do cliente
      let nomeCliente = "Não informado";
      try {
        const clienteDoc = await db.collection('usuarios').doc(pedido.cliente_id).get();
        if (clienteDoc.exists) {
          nomeCliente = clienteDoc.data().nome || "Não informado";
        }
      } catch (e) {
        console.error("Erro ao buscar cliente:", e);
      }

      const card = `
        <div class="card">
          <h3>${pedido.categoria}</h3>
          <p><strong>Cliente:</strong> ${nomeCliente}</p>
          <p><strong>Problema:</strong> ${pedido.descricao}</p>
          <p><strong>Data desejada:</strong> ${pedido.data_prevista || "Não informada"}</p>
        </div>
      `;

      if (pedido.status === 'finalizado') {
        finalizadosEl.innerHTML += card;
      } else {
        aceitosEl.innerHTML += card;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar pedidos:", e);
  }
});
