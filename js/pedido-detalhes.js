window.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID do pedido não encontrado.");
    window.location.href = "servicos.html";
    return;
  }

  const user = await new Promise(resolve => auth.onAuthStateChanged(resolve));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const doc = await db.collection("solicitacoes").doc(id).get();

    if (!doc.exists) {
      alert("Pedido não encontrado.");
      return;
    }

    const dados = doc.data();

    // Preencher campos principais
    document.getElementById("categoria").textContent = `Assistência Técnica - ${dados.categoria || "N/D"}`;
    document.getElementById("cat").textContent = dados.categoria || "N/D";
    document.getElementById("marca").textContent = dados.marca_aparelho || "N/D";
    document.getElementById("descricao").textContent = dados.descricao || "N/D";
    document.getElementById("garantia").textContent = dados.garantia ? "Sim" : "Não";
    document.getElementById("coleta").textContent = dados.coleta || "N/D";
    document.getElementById("data_prevista").textContent = dados.data_prevista || "N/D";

    const statusEl = document.getElementById("status");
    statusEl.textContent = dados.status === "aberta" ? "Buscando Profissionais" : dados.status;

    // Adiciona seção "Profissionais encontrados" se houver técnico atribuído
    if (dados.tecnico_id) {
      const tecnicoRef = await db.collection("usuarios").doc(dados.tecnico_id).get();
      if (tecnicoRef.exists) {
        const tecnico = tecnicoRef.data();

        const container = document.createElement("div");
        container.style.marginTop = "40px";
        container.innerHTML = `
          <h3 style="font-size: 22px; display: flex; align-items: center; gap: 10px;">
            <img src="img/profissional-icon.png" alt="ícone" width="26">
            Profissionais encontrados
          </h3>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p><strong>Nome:</strong> ${tecnico.nome || "N/D"}</p>
            <p><strong>Especialidade:</strong> ${Array.isArray(tecnico.especialidades) ? tecnico.especialidades.join(", ") : "N/D"}</p>
          </div>
        `;

        document.querySelector(".container").appendChild(container);
      }
    }

  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
    alert("Erro ao carregar dados do pedido.");
  }
});
