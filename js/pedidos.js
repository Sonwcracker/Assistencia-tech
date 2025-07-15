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
    // Obter dados do técnico logado
    const tecnicoDoc = await db.collection('usuarios').doc(user.uid).get();
    const tecnicoData = tecnicoDoc.data();

    if (!tecnicoData || tecnicoData.tipo !== 'tecnico') {
      mensagem.textContent = "Apenas técnicos podem acessar essa tela.";
      return;
    }

    const especialidades = tecnicoData.especialidades || [];
    const tecnicoLat = tecnicoData.lat;
    const tecnicoLng = tecnicoData.lng;

    if (especialidades.length === 0) {
      mensagem.textContent = "Você ainda não selecionou suas especialidades.";
      return;
    }

    // Buscar solicitações compatíveis com as especialidades
    const querySnapshot = await db.collection('solicitacoes')
      .where('categoria', 'in', especialidades)
      .get();

    if (querySnapshot.empty) {
      mensagem.textContent = "Nenhum pedido encontrado com suas especialidades.";
    } else {
      for (const doc of querySnapshot.docs) {
        const pedido = doc.data();

        // Buscar nome do cliente
        let nomeCliente = "Não informado";
        let distancia = "Desconhecida";

        try {
          const clienteDoc = await db.collection('usuarios').doc(pedido.cliente_id).get();
          if (clienteDoc.exists) {
            const clienteData = clienteDoc.data();
            nomeCliente = clienteData.nome || "Não informado";

            // Calcular distância
            if (clienteData.lat && clienteData.lng && tecnicoLat && tecnicoLng) {
              distancia = calcularDistancia(tecnicoLat, tecnicoLng, clienteData.lat, clienteData.lng);
            }
          }
        } catch (e) {
          console.error("Erro ao buscar cliente:", e);
        }

        // Exibir card do pedido
        pedidosContainer.innerHTML += `
          <div class="card">
            <h3>${pedido.categoria}</h3>
            <p><strong>Descrição:</strong> ${pedido.descricao}</p>
            <p><strong>Urgência:</strong> ${pedido.urgencia || "Normal"}</p>
            <p><strong>Cliente:</strong> ${nomeCliente}</p>
            <p><strong>Distância:</strong> ${distancia}</p>
          </div>
        `;
      }
    }

  } catch (error) {
    mensagem.textContent = "Erro ao buscar pedidos: " + error.message;
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// Fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d.toFixed(1) + " km";
}
