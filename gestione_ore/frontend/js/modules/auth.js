/**
 * auth.js - Modulo per la gestione dell'autenticazione e degli utenti
 */

// Namespace del modulo
const Auth = {
  /**
   * Ottiene l'utente corrente dal localStorage
   * @returns {Object|null} L'utente corrente o null se non autenticato
   */
  getCurrentUser: function() {
    return JSON.parse(localStorage.getItem("user") || "null");
  },

  /**
   * Verifica se l'utente è autenticato
   * @returns {boolean} true se l'utente è autenticato
   */
  isAuthenticated: function() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Verifica se l'utente ha un ruolo specifico
   * @param {string|Array} roles - Ruolo o array di ruoli da verificare
   * @returns {boolean} true se l'utente ha uno dei ruoli specificati
   */
  hasRole: function(roles) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.ruolo);
    }
    
    return user.ruolo === roles;
  },

  /**
   * Salva i dati utente nel localStorage dopo il login
   * @param {Object} userData - Dati dell'utente da salvare
   */
  setUser: function(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  },

  /**
   * Effettua il logout rimuovendo i dati utente
   * @param {string} [redirectUrl="login.html"] - URL di reindirizzamento dopo logout
   */
  logout: function(redirectUrl = "login.html") {
    localStorage.removeItem("user");
    window.location.href = redirectUrl;
  },

  /**
   * Inizializza i listener per il logout nella pagina corrente
   */
  setupLogoutListener: function() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function() {
        Auth.logout();
      });
    }
  },

  /**
   * Visualizza il ruolo dell'utente nell'elemento con ID 'userRoleDisplay'
   */
  displayUserRole: function() {
    const user = this.getCurrentUser();
    const roleDisplay = document.getElementById('userRoleDisplay');
    if (roleDisplay && user) {
      roleDisplay.textContent = user.ruolo || 'sconosciuto';
    }
  },

  /**
   * Crea un badge che mostra le informazioni dell'utente
   * @param {string} className - Classe CSS per lo stile del badge
   * @returns {HTMLElement} - Elemento del badge
   */
  createUserBadge: function(className = "role-badge") {
    const user = this.getCurrentUser();
    const badge = document.createElement("div");
    badge.className = className;
    badge.textContent = "Ruolo: " + (user?.ruolo || "sconosciuto") + " - " + (user?.username || "utente");
    return badge;
  },

  /**
   * Reindirizza se l'utente non ha il ruolo richiesto
   * @param {string|Array} requiredRoles - Ruolo o array di ruoli richiesti
   * @param {string} [redirectUrl="login.html"] - URL di reindirizzamento
   * @param {string} [message="Accesso riservato. Verrai reindirizzato."] - Messaggio da mostrare
   */
  requireRole: function(requiredRoles, redirectUrl = "login.html", message = "Accesso riservato. Verrai reindirizzato.") {
    if (!this.hasRole(requiredRoles)) {
      alert(message);
      window.location.href = redirectUrl;
    }
  }
};

// Esporta il modulo
window.Auth = Auth;