/**
 * notifications.js - Modulo per la gestione delle notifiche e degli alert
 */

// Namespace del modulo
const Notifications = {
  /**
   * Mostra un messaggio di notifica
   * @param {string} message - Il messaggio da mostrare
   * @param {string} type - Il tipo di messaggio (success, danger, warning, info)
   * @param {number} duration - La durata in millisecondi (default: 3000ms)
   */
  show: function(message, type = 'info', duration = 3000) {
    // Crea un elemento di alert se non esiste già
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alert-container';
      alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
      alertContainer.style.zIndex = '1050';
      document.body.appendChild(alertContainer);
    }
    
    // Crea l'elemento alert
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    
    // Aggiungi icona in base al tipo (opzionale)
    let icon = '';
    switch(type) {
      case 'success': icon = '<i class="bi bi-check-circle me-2"></i>'; break;
      case 'danger': icon = '<i class="bi bi-exclamation-triangle me-2"></i>'; break;
      case 'warning': icon = '<i class="bi bi-exclamation-circle me-2"></i>'; break;
      case 'info': icon = '<i class="bi bi-info-circle me-2"></i>'; break;
    }
    
    alertEl.innerHTML = `
      ${icon}${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Aggiungi al container
    alertContainer.appendChild(alertEl);
    
    // Rimuovi l'alert dopo la durata specificata
    setTimeout(() => {
      alertEl.classList.remove('show');
      setTimeout(() => {
        alertEl.remove();
      }, 300); // tempo di transizione per l'effetto fade
    }, duration);
  },

  /**
   * Mostra un messaggio di successo
   * @param {string} message - Il messaggio da mostrare
   * @param {number} duration - La durata in millisecondi
   */
  success: function(message, duration = 3000) {
    this.show(message, 'success', duration);
  },

  /**
   * Mostra un messaggio di errore
   * @param {string} message - Il messaggio da mostrare
   * @param {number} duration - La durata in millisecondi
   */
  error: function(message, duration = 3000) {
    this.show(message, 'danger', duration);
  },

  /**
   * Mostra un messaggio di avviso
   * @param {string} message - Il messaggio da mostrare
   * @param {number} duration - La durata in millisecondi
   */
  warning: function(message, duration = 3000) {
    this.show(message, 'warning', duration);
  },

  /**
   * Mostra un messaggio informativo
   * @param {string} message - Il messaggio da mostrare
   * @param {number} duration - La durata in millisecondi
   */
  info: function(message, duration = 3000) {
    this.show(message, 'info', duration);
  },

  /**
   * Pulisce tutte le notifiche attualmente visibili
   */
  clearAll: function() {
    const container = document.getElementById('alert-container');
    if (container) {
      container.innerHTML = '';
    }
  },

  /**
   * Mostra una conferma con finestra di dialogo
   * @param {string} message - Il messaggio da mostrare
   * @param {Function} onConfirm - Callback da eseguire se confermato
   * @param {Function} [onCancel] - Callback opzionale da eseguire se annullato
   */
  confirm: function(message, onConfirm, onCancel) {
    if (confirm(message)) {
      if (typeof onConfirm === 'function') onConfirm();
    } else {
      if (typeof onCancel === 'function') onCancel();
    }
  }
};

// Per retrocompatibilità
window.Notifications = Notifications;

// Esporta il modulo
export default Notifications;