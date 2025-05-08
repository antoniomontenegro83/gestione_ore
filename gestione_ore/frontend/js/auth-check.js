/**
 * auth-check.js - Verifica accesso per pagine riservate
 */
(function() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.ruolo !== "superadmin") {
    alert("Accesso riservato. Verrai reindirizzato.");
    window.location.href = "login.html";
  }
  
  // Visualizza il ruolo dell'utente
  document.addEventListener("DOMContentLoaded", function() {
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userRoleDisplay) {
      userRoleDisplay.textContent = user.ruolo || 'sconosciuto';
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
})();