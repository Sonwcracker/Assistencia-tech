'use strict';

window.addEventListener("DOMContentLoaded", async () => {
  const db = firebase.firestore();
  const container = document.getElementById("container-profissoes");
  const btnOutros = document.getElementById("btn-outros-servicos");
  const btnMenos = document.getElementById("btn-mostrar-menos");
  const containerMaisPopulares = document.getElementById("container-mais-populares");

  const imagensProfissao = {
    eletricista: "https://institutodaconstrucao.com.br/wp-content/uploads/2019/09/Quais-sao-as-principais-funcoes-do-eletricista-Instituto-da-Construcao.jpg",
    encanador: "https://soscasacuritiba.com.br/wp-content/uploads/2023/09/Encanador.jpg",
    marceneiro: "https://img.freepik.com/fotos-gratis/carpinteiro-cortando-placa-de-mdf-dentro-da-oficina_23-2149451066.jpg?semt=ais_hybrid&w=740",
    babá: "https://cptstatic.s3.amazonaws.com/imagens/enviadas/materias/materia14634/baba_cpt.JPG",
    cuidador: "https://media.istockphoto.com/id/1313904292/pt/foto/young-friendly-african-female-caregiver-talking-chatting-to-happy-senior-man-in-hallway-of.jpg?s=612x612&w=0&k=20&c=iklK81pJZTwqIzEd75HC_Nu4eOwqiCrBXQwc_VIocYI=",
    diarista: "https://www.verzani.com.br/wp-content/uploads/2021/09/post_thumbnail-ef6fab9b4739921af23999dbb581d1f8.jpeg",
    pedreiro: "https://thumbs.dreamstime.com/b/retrato-do-sorridente-jovem-pedreiro-usando-vestu%C3%A1rio-de-seguran%C3%A7a-em-p%C3%A9-perto-da-escadaria-um-local-constru%C3%A7%C3%A3o-incompleto-315767447.jpg",
    pintor: "https://institucional.politintas.com.br/wp-content/uploads/2016/11/dicas-contratar-bom-pintor.jpg",
    técnico_em_informática: "https://certificadocursosonline.com/blog/wp-content/uploads/2023/09/Quanto-Custa-um-Curso-Tecnico-de-Informatica-1200x805.jpg"
  };

  const profsExibidos = [];
  const cardsExtras = [];

  try {
    const snapshot = await db.collection("profissoes").get();
    let qtdMostrados = 0;

    for (const doc of snapshot.docs) {
      const profissao = doc.id;
      const nomeProfissao = doc.data().nome;
      const profsSnapshot = await db.collection("profissoes").doc(profissao).collection("profissionais").limit(1).get();

      if (!profsSnapshot.empty && qtdMostrados < 3) {
        const profDoc = profsSnapshot.docs[0];
        const prof = profDoc.data();
        const imagem = imagensProfissao[profissao] || "https://via.placeholder.com/300";
        const card = criarCard(profissao, nomeProfissao, imagem);
        container.appendChild(card);
        profsExibidos.push(profissao);
        qtdMostrados++;
      }
    }

    btnOutros.addEventListener("click", async () => {
      let novosCards = 0;

      for (const doc of snapshot.docs) {
        const profissao = doc.id;
        const nomeProfissao = doc.data().nome;

        if (profsExibidos.includes(profissao)) continue;

        const profsSnapshot = await db.collection("profissoes").doc(profissao).collection("profissionais").limit(1).get();

        if (!profsSnapshot.empty && novosCards < 3) {
          const profDoc = profsSnapshot.docs[0];
          const prof = profDoc.data();
          const imagem = imagensProfissao[profissao] || "https://via.placeholder.com/300";
          const card = criarCard(profissao, nomeProfissao, imagem);
          container.appendChild(card);
          profsExibidos.push(profissao);
          cardsExtras.push(card);
          novosCards++;
        }
      }

      if (profsExibidos.length === snapshot.docs.length) {
        btnOutros.style.display = "none";
      }

      btnMenos.style.display = "inline-block";
    });

    btnMenos.addEventListener("click", () => {
      cardsExtras.splice(-3).forEach(card => {
        container.removeChild(card);
        profsExibidos.pop();
      });

      btnOutros.style.display = "inline-block";
      if (cardsExtras.length === 0) {
        btnMenos.style.display = "none";
      }
    });

    // Carregar os mais populares
    const profissionais = [];
    for (const doc of snapshot.docs) {
      const profissao = doc.id;
      const nomeProfissao = doc.data().nome;

      const profsSnapshot = await db.collection("profissoes").doc(profissao).collection("profissionais").get();

      profsSnapshot.forEach(docProf => {
      const prof = docProf.data();
      prof.id = docProf.id; // <-- Aqui está o ponto crítico
      prof.profissao = profissao;
      prof.nomeProfissao = nomeProfissao;
      profissionais.push(prof);
});
    }

    const melhores = profissionais.filter(p => p.avaliacao).sort((a, b) => b.avaliacao - a.avaliacao).slice(0, 3);

    melhores.forEach(prof => {
      const imagem = imagensProfissao[prof.profissao] || "https://via.placeholder.com/300";
      const card = criarCardPopular(prof, imagem);
      if (containerMaisPopulares) containerMaisPopulares.appendChild(card);
    });

    function criarCard(profissao, nomeProfissao, imagem) {
  const card = document.createElement("li");

  card.innerHTML = `
    <a href="profissao.html?profissao=${profissao}">
      <div class="popular-card">
        <figure class="card-img">
          <img src="${imagem}" alt="${nomeProfissao}" loading="lazy">
        </figure>
        <div class="card-content">
          <h3 class="h3 card-title">${nomeProfissao}</h3>
        </div>
      </div>
    </a>
  `;

  return card;
}


function criarCardPopular(prof, imagem) {
  const card = document.createElement("li");
  card.classList.add("package-card-wrapper");

  // Monta a URL para o profissional.html com os parâmetros
  const link = `profissional.html?profissao=${prof.profissao}&id=${prof.id}`;

  card.innerHTML = `
    <div class="package-card">
      <figure class="card-banner">
        <img src="${imagem}" alt="${prof.nome}" loading="lazy">
      </figure>
      <div class="card-content">
        <h3 class="h3 card-title">${prof.nome}</h3>
        <p class="card-text">${prof.descricao}</p>
        <ul class="card-meta-list">
          <li class="card-meta-item">
            <div class="meta-box">
              <ion-icon name="time"></ion-icon>
              <p class="text">Disponível</p>
            </div>
          </li>
          <li class="card-meta-item">
            <div class="meta-box">
              <ion-icon name="briefcase"></ion-icon>
              <p class="text">${prof.nomeProfissao}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="card-price">
        <div class="wrapper">
          <p class="reviews">(${prof.avaliacoes || 0} avaliações)</p>
          <div class="card-rating">
            ${"★".repeat(Math.round(prof.avaliacao || 0))}
          </div>
        </div>
        <p class="price">R$ ${prof.preco || "A combinar"}</p>
        <a href="${link}" class="btn btn-secondary">Entre em contato</a>
      </div>
    </div>`;
    
  return card;
}

  } catch (error) {
    console.error("Erro ao carregar profissionais:", error);
    container.innerHTML = "<p>Erro ao carregar dados. Tente novamente.</p>";
  }
});
