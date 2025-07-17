window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('navbar-prof');
  if (container) {
    fetch("navbar-profissional.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;

        const auth = firebase.auth();
        const db = firebase.firestore();

        auth.onAuthStateChanged(user => {
          if (user) {
            db.collection("usuarios").doc(user.uid).get().then(doc => {
              const nome = doc.data()?.nome || "Técnico";
              document.getElementById("nomeTecnico").textContent = `Olá, ${nome}`;
            });
          }
        });
      });
  }
});
