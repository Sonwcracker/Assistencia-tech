let notaSelecionada = 0;

window.addEventListener('DOMContentLoaded', async () => {
  const db = firebase.firestore();
  const urlParams = new URLSearchParams(window.location.search);
  const profissionalId = urlParams.get('id');
  const pedidoId = urlParams.get('pedido');

  if (!profissionalId || !pedidoId) {
    document.getElementById('profissional-info').textContent = "Parâmetros inválidos na URL.";
    return;
  }

  try {
    const profDoc = await db.collection('usuarios').doc(profissionalId).get();
    const nomeProf = profDoc.exists ? (profDoc.data().nome || profissionalId) : profissionalId;
    document.getElementById('profissional-info').textContent = `Você está avaliando: ${nomeProf}`;
  } catch (e) {
    document.getElementById('profissional-info').textContent = "Erro ao buscar dados do profissional.";
  }

  // Verifica se já existe avaliação para este pedido
  const avaliacaoDoc = await db.collection('usuarios')
    .doc(profissionalId)
    .collection('avaliacoes')
    .doc(pedidoId)
    .get();

  if (avaliacaoDoc.exists) {
    document.querySelector('.container').innerHTML = `
      <h2>Avaliação já enviada</h2>
      <p>Você já avaliou esse profissional para esse pedido.</p>
      <a href="servicos.html">Voltar para meus serviços</a>
    `;
    return;
  }

  // habilita estrelas clicáveis
  const estrelas = document.querySelectorAll('.stars span');
  estrelas.forEach(estrela => {
    estrela.addEventListener('click', () => {
      notaSelecionada = parseInt(estrela.getAttribute('data-value'));
      estrelas.forEach(e => e.classList.remove('ativa'));
      for (let i = 0; i < notaSelecionada; i++) {
        estrelas[i].classList.add('ativa');
      }
    });
  });

  // Salva IDs globais
  window.profissionalId = profissionalId;
  window.pedidoId = pedidoId;
});

async function enviarAvaliacao() {
  const db = firebase.firestore();
  const comentario = document.getElementById('comentario').value;
  const mensagem = document.getElementById('mensagem');

  if (notaSelecionada === 0) {
    mensagem.textContent = "Por favor, selecione uma nota.";
    mensagem.style.color = "red";
    return;
  }

  try {
    console.log("Salvando avaliação em:", window.profissionalId, window.pedidoId);

    // Evita avaliação duplicada (checagem adicional)
    const avalRef = db.collection('usuarios')
      .doc(window.profissionalId)
      .collection('avaliacoes')
      .doc(window.pedidoId);

    const docSnapshot = await avalRef.get();
    if (docSnapshot.exists) {
      mensagem.textContent = "Você já avaliou este profissional.";
      mensagem.style.color = "orange";
      return;
    }

    // Salva avaliação
    await avalRef.set({
      nota: notaSelecionada,
      comentario: comentario.trim(),
      data: new Date()
    });

    mensagem.textContent = "Avaliação enviada com sucesso!";
    mensagem.style.color = "green";

    setTimeout(() => {
      window.location.href = "servicos.html";
    }, 1500);
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    mensagem.textContent = "Erro ao salvar avaliação.";
    mensagem.style.color = "red";
  }
}
