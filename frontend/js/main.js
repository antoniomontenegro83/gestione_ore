/**
 * main.js - File principale che importa e inizializza tutti i moduli
 */
import Api from './modules/api.js';
import Auth from './modules/auth.js';
import Notifications from './modules/notifications.js';
import Utils from './modules/utils.js';

// Definisci una funzione di logout globale
function globalLogout() {
  console.log("Main: Esecuzione logout globale");
  localStorage.removeItem("user");
  window.location.href = "login.html";
  return false;
}

// Inizializzazione automatica dell'applicazione
function initApp() {
  console.log("Main: Inizializzazione applicazione principale");
  
  // Inizializzazioni comuni
  if (Auth.isAuthenticated()) {
    console.log("Main: Utente autenticato, ruolo:", Auth.getCurrentUser()?.ruolo);
  } else {
    console.log("Main: Utente non autenticato");
    
    // Verifica se siamo in una pagina protetta
    const currentPage = window.location.pathname;
    const pageName = currentPage.split('/').pop().toLowerCase();
    
    // Elenco delle pagine non protette
    const publicPages = ['login.html', 'admin-login.html', 'index.html', ''];
    
    // Se non è una pagina pubblica, reindirizza al login
    if (!publicPages.includes(pageName)) {
      console.log("Main: Reindirizzamento a login.html");
      window.location.href = 'login.html';
    }
  }
}

// Oggetto App globale che contiene le funzionalità principali
const App = {
  Api,
  Auth,
  Notifications,
  Utils,
  logout: globalLogout,
  init: initApp
};

// Rendi i moduli disponibili globalmente per retrocompatibilità
window.Api = Api;
window.Auth = Auth;
window.Notifications = Notifications;
window.Utils = Utils;
window.App = App;
window.logout = globalLogout;

// Esegui inizializzazione quando DOM è pronto
document.addEventListener('DOMContentLoaded', initApp);

// Esporta per uso esterno
export { Api, Auth, Notifications, Utils, App, globalLogout as logout };