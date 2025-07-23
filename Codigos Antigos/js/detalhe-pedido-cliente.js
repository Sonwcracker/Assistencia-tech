window.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID do pedido não encontrado.");
    window.location.href = "pedidos.html";
    return;
  }

  const user = await new Promise(resolve => auth.onAuthStateChanged(resolve));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const aceitarBtn = document.getElementById("aceitar-btn");

  try {
    const pedidoDoc = await db.collection("solicitacoes").doc(id).get();
    if (!pedidoDoc.exists) {
      alert("Pedido não encontrado.");
      return;
    }

    const pedido = pedidoDoc.data();

    // Verifica se já foi aceito por outro técnico
    if (pedido.tecnico_id && pedido.tecnico_id !== user.uid) {
      aceitarBtn.style.display = "none";

      const aviso = document.createElement("p");
      aviso.style.color = "red";
      aviso.style.marginTop = "10px";
      aviso.textContent = "❌ Este pedido já foi aceito por outro técnico.";
      document.querySelector(".container").appendChild(aviso);

    } else if (pedido.tecnico_id === user.uid) {
      // Se foi aceito pelo próprio técnico logado
      aceitarBtn.style.display = "none";

      const aviso = document.createElement("p");
      aviso.style.color = "green";
      aviso.style.marginTop = "10px";
      aviso.textContent = "✅ Você já aceitou esse serviço.";
      document.querySelector(".container").appendChild(aviso);
    }

    // Preencher dados do pedido
    document.getElementById("categoria").textContent = `${pedido.categoria} - ${pedido.marca_aparelho}`;
    document.getElementById("urgencia").textContent = pedido.urgencia || "Normal";
    document.getElementById("descricao").textContent = pedido.descricao || "-";
    document.getElementById("garantia").textContent = pedido.garantia ? "Sim" : "Não";
    document.getElementById("coleta").textContent = pedido.coleta || "-";
    document.getElementById("data-prevista").textContent = pedido.data_prevista || "-";

    // Dados do cliente
    const clienteDoc = await db.collection("usuarios").doc(pedido.cliente_id).get();
    const cliente = clienteDoc.data();
    document.getElementById("nome-cliente").textContent = cliente.nome || "Cliente";
    document.getElementById("local").textContent = cliente.endereco || "Endereço não informado";

    // Calcular distância
    const tecnicoDoc = await db.collection("usuarios").doc(user.uid).get();
    const tecnico = tecnicoDoc.data();

    if (cliente.lat && cliente.lng && tecnico.lat && tecnico.lng) {
      const distancia = calcularDistancia(tecnico.lat, tecnico.lng, cliente.lat, cliente.lng);
      document.getElementById("distancia").textContent = distancia;
    } else {
      document.getElementById("distancia").textContent = "Desconhecida";
    }

    // Ação do botão aceitar
    aceitarBtn.addEventListener("click", async () => {
      await db.collection("solicitacoes").doc(id).update({
        tecnico_id: user.uid,
        status: "em_andamento"
      });
      alert("Pedido aceito com sucesso!");
      window.location.href = "pedidos.html";
    });

  } catch (error) {
    console.error("Erro ao carregar pedido:", error);
    alert("Erro ao carregar pedido.");
  }
});

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1) + " km";
}
