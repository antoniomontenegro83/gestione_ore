/**
 * login.js - Gestione login utente standard
 */

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("../backend_gestione_ore/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = "dashboard.html";
    } else {
      const err = document.getElementById("loginError");
      err.textContent = result.message || "Credenziali non valide";
      err.style.display = "block";
    }
  });
});