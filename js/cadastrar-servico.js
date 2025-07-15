window.addEventListener('DOMContentLoaded', () => {
  const user = firebase.auth().currentUser;
  const categoria = document.getElementById('categoria');
  const subcategoria = document.getElementById('subcategoria');
  const form = document.getElementById('formServico');
  const mensagem = document.getElementById('mensagem');

  const opcoes = {
    "Aparelhos Eletrônicos": [
      "Aparelho de Som", "Aquecedor a Gás", "Ar Condicionado", "Câmera",
      "Home Theater", "Televisão", "Video Game"
    ],
    "Eletrodomésticos": [
      "Adega Climatizada", "Fogão e Cooktop", "Geladeira e Freezer", "Lava Louça",
      "Máquina de Lavar", "Microondas", "Secadora de Roupas"
    ],
    "Informática e Telefonia": [
      "Cabeamento e Redes", "Celular", "Computador Desktop", "Notebook", "Tablet", "Impressora"
    ]
  };

  categoria.addEventListener('change', () => {
    const selecionado = categoria.value;
    subcategoria.innerHTML = '<option value="">Selecione</option>';
    if (opcoes[selecionado]) {
      opcoes[selecionado].forEach(servico => {
        const option = document.createElement('option');
        option.value = servico;
        option.textContent = servico;
        subcategoria.appendChild(option);
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) return window.location.href = "login.html";

    const tecnico_id = user.uid;
    const categoriaSelecionada = categoria.value;
    const servico = subcategoria.value;
    const descricao = document.getElementById('descricao').value;
    const preco = parseFloat(document.getElementById('preco').value);

    try {
      await db.collection("servicos").add({
        tecnico_id,
        categoria: categoriaSelecionada,
        servico,
        descricao,
        preco_medio: preco
      });

      mensagem.textContent = "✅ Serviço cadastrado com sucesso!";
      form.reset();
      subcategoria.innerHTML = '<option value="">Selecione a categoria primeiro</option>';
    } catch (error) {
      mensagem.textContent = "Erro: " + error.message;
    }
  });
});
