window.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const user = await new Promise(resolve => auth.onAuthStateChanged(resolve));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const pedidosContainer = document.getElementById('pedidos-container');
  const mensagem = document.getElementById('mensagem');

  try {
    // Verifica se o usuário é técnico
    const tecnicoDoc = await db.collection('usuarios').doc(user.uid).get();
    const tecnicoData = tecnicoDoc.data();

    if (!tecnicoData || tecnicoData.tipo !== 'tecnico') {
      mensagem.textContent = "Apenas técnicos podem acessar essa tela.";
      return;
    }

    const profissao = tecnicoData.profissao;
    const tecnicoLat = tecnicoData.lat;
    const tecnicoLng = tecnicoData.lng;

    if (!profissao) {
      mensagem.textContent = "Você ainda não definiu sua profissão.";
      return;
    }

    // Buscar solicitações compatíveis com a profissão
    const querySnapshot = await db.collection('solicitacoes')
      .where('profissao_solicitada', '==', profissao)
      .where('status', '==', 'aberta') // Apenas solicitações abertas
      .get();

    if (querySnapshot.empty) {
      mensagem.textContent = "Nenhum pedido encontrado para sua profissão.";
    } else {
      for (const doc of querySnapshot.docs) {
        const pedido = doc.data();
        let nomeCliente = "Não informado";
        let distancia = "Desconhecida";

        try {
          const clienteDoc = await db.collection('usuarios').doc(pedido.cliente_id).get();
          if (clienteDoc.exists) {
            const clienteData = clienteDoc.data();
            nomeCliente = clienteData.nome || "Não informado";

            if (clienteData.lat && clienteData.lng && tecnicoLat && tecnicoLng) {
              distancia = calcularDistancia(tecnicoLat, tecnicoLng, clienteData.lat, clienteData.lng);
            } else {
              distancia = "0.0 km";
            }
          }
        } catch (e) {
          console.error("Erro ao buscar cliente:", e);
        }

        // Card exibindo os dados
        pedidosContainer.innerHTML += `
          <div class="card" onclick="window.location.href='detalhe-pedido-cliente.html?id=${doc.id}'">
            <h3>${pedido.profissao_solicitada}</h3>
            <p><strong>Descrição:</strong> ${pedido.descricao}</p>
            <p><strong>Cliente:</strong> ${nomeCliente}</p>
            <p><strong>Distância:</strong> ${distancia}</p>
          </div>
        `;
      }
    }

  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    mensagem.textContent = "Erro ao buscar pedidos: " + error.message;
  }
});

// Função para calcular distância entre coordenadas
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1) + " km";
}

// Logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
