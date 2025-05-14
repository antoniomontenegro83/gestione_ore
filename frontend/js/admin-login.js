/**
 * admin-login.js - Gestione login amministratore
 */
import { Api, Notifications } from './main.js';

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Inizializzazione all'avvio
document.addEventListener("DOMContentLoaded", function() {
  // Configura il form di login
  setupLoginForm();
});

/**
 * Configura il form di login
 */
function setupLoginForm() {
  const form = document.getElementById("adminLoginForm");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }
}

/**
 * Gestisce il tentativo di login
 * @param {Event} e - Evento submit
 */
async function handleLogin(e) {
  e.preventDefault();
  
  // Evita invii multipli
  if (isLoading) return;
  isLoading = true;
  
  // Nascondi eventuali messaggi di errore precedenti
  const errorElement = document.getElementById("loginError");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
  
  try {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    
    // Validazione semplice
    if (!username || !password) {
      showLoginError("Inserisci username e password");
      return;
    }
    
    // Invia richiesta di login
    const result = await Api.post("admin-auth/login.php", { username, password });
    
    if (result.success && result.user && result.user.ruolo === "superadmin") {
      // Salva i dati utente e reindirizza
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = "users-management.html";
    } else {
      // Mostra errore di login
      showLoginError(result.message || "Accesso negato");
    }
  } catch (error) {
    console.error("Errore durante il login:", error);
    showLoginError("Errore di connessione al server");
  } finally {
    isLoading = false;
  }
}

/**
 * Mostra un messaggio di errore di login
 * @param {string} message - Messaggio di errore
 */
function showLoginError(message) {
  const errorElement = document.getElementById("loginError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

// Esporta per uso modulare
export default {
  handleLogin,
  setupLoginForm
};