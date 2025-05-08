/**
 * dashboard.js - Logica per la dashboard principale
 * Versione modularizzata
 */

// Funzione principale che viene eseguita al caricamento della pagina
window.onload = function() {
  // Ottieni l'utente corrente
  const user = Auth.getCurrentUser();
  
  // Debug - Mostra ruolo utente nella console
  console.log("DEBUG - Ruolo utente:", user?.ruolo);

  // Crea e aggiungi il badge utente
  const badge = Auth.createUserBadge("role-badge");
  document.body.appendChild(badge);

  // Mostra il card dei privilegi solo per superadmin
  if (Auth.hasRole("superadmin")) {
    const card = document.getElementById("card-privilegi");
    if (card) card.classList.remove("d-none");
  }

  // Setup del listener per il logout
  Auth.setupLogoutListener();
};