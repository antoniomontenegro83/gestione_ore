/**
 * auth-check.js - Verifica accesso per pagine riservate
 */
import { Auth } from './main.js';
import AuthCommon from './auth-common.js';

// Variabile per tracciare lo stato di inizializzazione
let isInitialized = false;

// Verifica accesso all'avvio
(function() {
  // Verifica che l'utente sia autenticato e abbia il ruolo richiesto
  const user = Auth.getCurrentUser();
  if (!user || user.ruolo !== "superadmin") {
    alert("Accesso riservato. Verrai reindirizzato.");
    window.location.href = "login.html";
  }
})();

// Inizializzazione al caricamento del DOM
document.addEventListener("DOMContentLoaded", function() {
  // Evita inizializzazioni multiple
  if (isInitialized) return;
  isInitialized = true;
  
  // Visualizza il ruolo dell'utente
  displayUserInfo();
  
  // Configura il pulsante di logout
  setupLogoutButton();
});

/**
 * Visualizza le informazioni dell'utente nell'interfaccia
 */
function displayUserInfo() {
  const user = Auth.getCurrentUser();
  const userRoleDisplay = document.getElementById('userRoleDisplay');
  
  if (userRoleDisplay && user) {
    userRoleDisplay.textContent = user.ruolo || 'sconosciuto';
  }
}

/**
 * Configura il pulsante di logout
 */
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
}

// Esporta per uso modulare
export default {
  displayUserInfo,
  setupLogoutButton
};