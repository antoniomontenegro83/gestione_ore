/**
 * auth-check.js - Verifica accesso per pagine riservate
 */
import { Auth } from './main.js';

// Verifica ruolo utente all'avvio
(function() {
  // Verifica l'autenticazione e il ruolo
  if (!Auth.isAuthenticated() || !Auth.hasRole("superadmin")) {
    alert("Accesso riservato. Verrai reindirizzato.");
    window.location.href = "login.html";
  }
})();

// Inizializzazione al caricamento del DOM
document.addEventListener("DOMContentLoaded", function() {
  // Visualizza il ruolo dell'utente e configura logout
  Auth.displayUserRole();
  Auth.setupLogoutListener();
});

export default {}; // Esporta un oggetto vuoto per compatibilità con ES modules