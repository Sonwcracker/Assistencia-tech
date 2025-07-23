// js/footer.js
window.addEventListener('DOMContentLoaded', async () => {
  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;
});
