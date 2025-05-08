/**
 * admin-login.js - Gestione login amministratore
 */

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("adminLoginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("../backend_gestione_ore/admin-auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    if (result.success && result.user.ruolo === "superadmin") {
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = "../frontend/users-management.html";
    } else {
      const err = document.getElementById("loginError");
      err.textContent = result.message || "Accesso negato";
      err.style.display = "block";
    }
  });
});