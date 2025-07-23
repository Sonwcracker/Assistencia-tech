document.addEventListener("DOMContentLoaded", () => {
  const btnCliente = document.querySelector(".tab.cliente");
  const btnEspecialista = document.querySelector(".tab.especialista");
  const containerCliente = document.getElementById("passos-cliente");
  const containerEspecialista = document.getElementById("passos-especialista");
  const titulo = document.getElementById("titulo-linha");
  const tituloVantagens = document.getElementById("titulo-vantagens");
  const root = document.documentElement;
  const indicador = document.querySelector(".indicador");
  const perfilContainer = document.querySelector(".perfil-container");
  const linhaCentral = document.querySelector(".linha-central");
  const numeros = document.querySelectorAll(".etapa .numero");
  const h2s = document.querySelectorAll(".etapa .conteudo h2");

  const vantagensCliente = document.getElementById("vantagens-cliente");
  const vantagensEspecialista = document.getElementById("vantagens-especialista");

  function mudarTema(cor) {
    perfilContainer.style.backgroundColor = cor;
    indicador.style.backgroundColor = cor;
    indicador.style.setProperty("--indicador-cor", cor);
    linhaCentral.style.backgroundColor = cor;

    numeros.forEach(el => el.style.color = cor);
    h2s.forEach(el => el.style.color = cor);
  }

  btnCliente.addEventListener("click", () => {
    btnCliente.classList.add("active");
    btnEspecialista.classList.remove("active");
    containerCliente.classList.remove("hidden");
    containerEspecialista.classList.add("hidden");
    titulo.innerHTML = `Quer começar a contratar especialistas? <br> É muito simples!`;
    tituloVantagens.innerHTML = `Muito mais vantagens na hora de contratar!`;
    mudarTema(getComputedStyle(root).getPropertyValue('--cliente-cor').trim());

    vantagensCliente.classList.remove("hidden");
    vantagensEspecialista.classList.add("hidden");
  });

  btnEspecialista.addEventListener("click", () => {
    btnEspecialista.classList.add("active");
    btnCliente.classList.remove("active");
    containerCliente.classList.add("hidden");
    containerEspecialista.classList.remove("hidden");
    titulo.innerHTML = `Quer começar a receber trabalhos? <br> É muito simples!`;
    tituloVantagens.innerHTML = `Muito mais vantagens na hora de trabalhar!`;
    mudarTema(getComputedStyle(root).getPropertyValue('--especialista-cor').trim());

    vantagensCliente.classList.add("hidden");
    vantagensEspecialista.classList.remove("hidden");
  });
});
