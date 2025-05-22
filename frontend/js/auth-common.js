/**
 * auth-common.js - Funzionalità di autenticazione comuni
 * 
 * Questo modulo gestisce l'autenticazione comune a diverse pagine
 * Si occupa di visualizzare informazioni utente e gestire il logout
 */
import { Auth } from './main.js';

// Classe per gestire l'autenticazione comune
class AuthCommon {
  /**
   * Inizializza il modulo di autenticazione comune
   */
  static init() {
    console.log("Inizializzazione AuthCommon...");
    
    // Se il DOM è già pronto, inizializza subito
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.setupUI();
    } else {
      // Altrimenti, attendi il caricamento del DOM
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    }
  }
  
  /**
   * Configura l'interfaccia utente relativa all'autenticazione
   */
  static setupUI() {
    console.log("AuthCommon: Setup UI...");
    this.displayUserInfo();
    this.setupLogoutHandlers();
  }
  
  /**
   * Mostra le informazioni dell'utente nell'interfaccia
   */
  static displayUserInfo() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    
    const badgeContainer = document.querySelector('.user-role-badge');
    if (badgeContainer) {
      // Modifica il testo per includere l'username
      const username = currentUser.username || 'utente';
      const role = currentUser.ruolo || 'utente';
      
      // Aggiorna il badge con il nuovo formato
      badgeContainer.innerHTML = `<strong>${username}</strong> | Ruolo: <span id="userRoleDisplay">${role}</span>`;
      
      console.log("AuthCommon: Badge utente aggiornato con username e ruolo");
    } else {
      // Fallback al vecchio metodo se non trova il container
      const roleDisplay = document.getElementById('userRoleDisplay');
      if (roleDisplay) {
        roleDisplay.textContent = currentUser.ruolo || 'utente';
        console.log("AuthCommon: Visualizzato solo ruolo utente (fallback)");
      }
    }
  }
  
  /**
   * Configura i gestori per il logout
   */
  static setupLogoutHandlers() {
    console.log("AuthCommon: Setup logout handlers...");
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
      console.log("AuthCommon: Pulsante logout trovato, configurazione...");
      
      // Rimuovi tutti i gestori di eventi esistenti clonando il pulsante
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      
      // Aggiungi il gestore di eventi
      newLogoutBtn.addEventListener('click', this.handleLogout);
      
      // Aggiungi anche l'attributo onclick come backup
      newLogoutBtn.setAttribute('onclick', 'AuthCommon.handleLogout(); return false;');
      
      console.log("AuthCommon: Pulsante logout configurato con successo");
    } else {
      console.warn("AuthCommon: Pulsante logout non trovato");
    }
  }
  
  /**
   * Gestore dell'evento di logout
   */
  static handleLogout(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("AuthCommon: Esecuzione logout...");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return false;
  }
}

// Inizializza immediatamente
AuthCommon.init();

// Esponi la classe per uso globale
window.AuthCommon = AuthCommon;

// Esporta per uso modulare
export default AuthCommon;