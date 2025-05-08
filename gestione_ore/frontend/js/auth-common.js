/**
 * auth-common.js - Funzionalità di autenticazione comuni
 */
document.addEventListener("DOMContentLoaded", function() {
  // Visualizza il ruolo dell'utente
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const roleDisplay = document.getElementById('userRoleDisplay');
  if (roleDisplay) {
    roleDisplay.textContent = currentUser.ruolo || 'sconosciuto';
  }
  
  // Gestione logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
});