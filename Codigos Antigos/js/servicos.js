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
    const doc = await db.collection('usuarios').doc(user.uid).get();
    const dados = doc.data();

    if (dados.tipo === 'tecnico') {
      // === Parte do Técnico ===
      titulo.textContent = "Meus Serviços";

      const querySnapshot = await db.collection('servicos')
        .where('tecnico_id', '==', user.uid)
        .orderBy('categoria')
        .get();

      if (querySnapshot.empty) {
        mensagem.textContent = "Você ainda não cadastrou nenhum serviço.";
      } else {
        querySnapshot.forEach(doc => {
          const servico = doc.data();

          lista.innerHTML += `
            <div class="pedido-card">
              <p class="data-pedido">Categoria: ${servico.categoria}</p>
              <div class="card-conteudo">
                <div class="info-pedido">
                  <p class="categoria">Descrição</p>
                  <h3 class="marca">${servico.descricao}</h3>
                  <p class="status"><span class="icone-status">💰</span> Preço médio: R$ ${servico.preco_medio}</p>
                </div>
                <div class="seta">›</div>
              </div>
            </div>
          `;
        });
      }

    } else {
      // === Parte do Cliente ===
      titulo.textContent = "Meus Pedidos";

      const querySnapshot = await db.collection('solicitacoes')
        .where('cliente_id', '==', user.uid)
        .orderBy('data_criacao', 'desc')
        .get();

      if (querySnapshot.empty) {
        mensagem.textContent = "Você ainda não fez nenhuma solicitação.";
      } else {
        querySnapshot.forEach(doc => {
          const solic = doc.data();
          const solicId = doc.id;

          const data = solic.data_criacao?.toDate?.().toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
          }) || 'Data não disponível';

          const status = solic.status || "aberta";

          const bolinhaStatus = status === "em_andamento"
            ? `<div class="notificacao"></div>`
            : '';

          let textoStatus = "";
          if (status === "em_andamento") {
            textoStatus = `<strong class="status-andamento">Em andamento</strong>`;
          } else if (status === "finalizado") {
            textoStatus = `<strong class="status-finalizado">Pedido finalizado</strong>`;
          } else {
            textoStatus = 'Aguardando, estamos buscando profissionais';
          }

          const profissionais = solic.profissionais_encontrados || 0;
          const imagemProf = profissionais > 0
            ? `<img src="img/profissional-exemplo.png" class="img-prof">`
            : '';

          const cardHTML = `
            <div class="pedido-card">
              ${bolinhaStatus}
              <p class="data-pedido">${data}</p>
              <div class="card-conteudo">
                <div class="info-pedido">
                  <p class="categoria">Área Solicitada</p>
                  <h3 class="marca">${solic.profissao_solicitada || "Não informada"}</h3>
                  <p class="encontrado">${textoStatus}</p>
                  ${imagemProf}
                </div>
                <div class="seta">›</div>
              </div>
            </div>
          `;

          const wrapper = document.createElement('div');
          wrapper.innerHTML = cardHTML;
          const cardEl = wrapper.firstElementChild;

          // Se o pedido estiver finalizado e tiver profissional aceito, mostra botão de avaliação
          if (status === "finalizado" && solic.profissional_aceito_id) {
            const btnAvaliar = document.createElement('button');
            btnAvaliar.textContent = "Avaliar profissional";
            btnAvaliar.classList.add('btn-avaliar');

            btnAvaliar.addEventListener('click', () => {
              window.location.href = `avaliar.html?id=${solic.profissional_aceito_id}&pedido=${solicId}`;
            });

            cardEl.appendChild(btnAvaliar);
          }

          const link = document.createElement('a');
          link.href = `pedido-detalhes.html?id=${solicId}`;
          link.classList.add('link-card');
          link.appendChild(cardEl);

          lista.appendChild(link);
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
