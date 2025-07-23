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

      // Criar o card
      const card = document.createElement('div');
      card.classList.add('card');

      const categoria = document.createElement('h3');
      categoria.textContent = pedido.categoria;

      const cliente = document.createElement('p');
      cliente.innerHTML = `<strong>Cliente:</strong> ${nomeCliente}`;

      const problema = document.createElement('p');
      problema.innerHTML = `<strong>Problema:</strong> ${pedido.descricao}`;

      const dataDesejada = document.createElement('p');
      dataDesejada.innerHTML = `<strong>Data desejada:</strong> ${pedido.data_prevista || "Não informada"}`;

      // Adiciona os elementos ao card
      card.appendChild(categoria);
      card.appendChild(cliente);
      card.appendChild(problema);
      card.appendChild(dataDesejada);

      if (pedido.status === 'finalizado') {
        finalizadosEl.appendChild(card);
      } else {
        // Botão "Concluir serviço"
        const btn = document.createElement('button');
        btn.textContent = "Concluir serviço";
        btn.classList.add('btn-concluir');

        btn.addEventListener('click', async () => {
          try {
            await db.collection('solicitacoes').doc(doc.id).update({ status: 'finalizado' });

            card.remove();
            btn.remove();
            finalizadosEl.appendChild(card);
          } catch (e) {
            console.error("Erro ao concluir o pedido:", e);
            alert("Erro ao concluir o serviço. Tente novamente.");
          }
        });

        card.appendChild(btn);
        aceitosEl.appendChild(card);
      }
    }
  } catch (e) {
    console.error("Erro ao carregar pedidos:", e);
  }
});
