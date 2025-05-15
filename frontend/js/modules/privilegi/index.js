// frontend/js/modules/privilegi/index.js
/**
 * index.js - Entry point per il modulo privilegi/utenti
 */
import { Auth, Notifications } from '../../main.js';
import privilegiState from './state.js';
import PrivilegiAPI from './api.js';
import PrivilegiUI from './ui.js';
import PrivilegiEvents from './events.js';
import { ROLES, PRIVILEGI_CONFIG } from './config.js';

class PrivilegiManager {
  constructor() {
    this.state = privilegiState;
    this.api = PrivilegiAPI;
    this.ui = PrivilegiUI;
    this.events = PrivilegiEvents;
  }

  async init() {
    console.log("Inizializzazione modulo privilegi...");
    
    // Verifica autenticazione e configurazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadUsers();
      
      // Configura gli event listener
      this.events.setupEventListeners();
      
      // Aggiorna i contatori
      this.ui.updateBadgeCounts();
      
    } catch (error) {
      console.error("Errore nell'inizializzazione:", error);
      Notifications.error("Errore durante l'inizializzazione");
    }
  }

  checkAuth() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      console.error("Utente non autenticato");
      window.location.href = "login.html";
      return false;
    }
    
    // Per la gestione privilegi, richiediamo solo ruolo superadmin
    if (currentUser.ruolo !== ROLES.SUPERADMIN) {
      Notifications.error(PRIVILEGI_CONFIG.MESSAGES.ACCESS_DENIED);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
      return false;
    }
    
    return true;
  }

  async loadUsers() {
    this.ui.showLoading();
    this.state.setLoading(true);
    
    try {
      const users = await this.api.loadUsers();
      console.log("Utenti caricati:", users.length);
      
      // Ordina per username
      users.sort((a, b) => a.username.localeCompare(b.username));
      
      this.state.setUsers(users);
      this.ui.renderTable();
      
    } catch (error) {
      this.ui.showError("Errore nel caricamento degli utenti");
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per l'interfaccia globale
  modificaUtente(id, username, ruolo) {
    console.log("Modifica utente:", id);
    
    const user = this.state.findUserById(id);
    if (!user) {
      Notifications.error("Utente non trovato");
      return;
    }
    
    this.state.setEditingUser(id);
    this.ui.populateForm(user);
  }

  eliminaUtente(id) {
    const user = this.state.findUserById(id);
    if (!user) {
      Notifications.error("Utente non trovato");
      return;
    }
    
    // Verifica se può essere eliminato
    if (!this.state.canDeleteUser(id)) {
      Notifications.error("Non puoi eliminare l'ultimo Super Admin del sistema!");
      return;
    }
    
    this.state.setUserToDelete(id);
    this.ui.populateDeleteModal(user);
    
    // Mostra il modale di conferma
    let confirmModal = document.getElementById('confirmDeleteUserModal');
    if (!confirmModal) {
      // Crea il modale se non esiste
      this.createDeleteModal();
      confirmModal = document.getElementById('confirmDeleteUserModal');
    }
    
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
  }

  resetForm() {
    this.ui.resetForm();
    this.state.clearEditingUser();
  }

  createDeleteModal() {
    const modalHTML = `
      <div class="modal fade" id="confirmDeleteUserModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>Conferma Eliminazione
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-2">
                Sei sicuro di voler eliminare l'utente <strong id="deleteUserName"></strong>?
              </p>
              <p class="text-muted mb-0">
                Ruolo: <span id="deleteUserRole" class="fw-bold"></span>
              </p>
              <div id="deleteWarning" class="mt-3"></div>
              <p class="text-danger mb-0 mt-3">
                <i class="bi bi-info-circle me-1"></i>${PRIVILEGI_CONFIG.MESSAGES.DELETE_WARNING}
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteUserBtn">
                <i class="bi bi-trash me-1"></i>Elimina
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Aggiungi l'event listener al pulsante di conferma
    const confirmBtn = document.getElementById('confirmDeleteUserBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.events.handleConfirmDelete());
    }
  }
}

// Crea l'istanza del manager
const privilegiManager = new PrivilegiManager();

// Esporta il manager
export default privilegiManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  privilegiManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.modificaUtente = (id, username, ruolo) => privilegiManager.modificaUtente(id, username, ruolo);
  window.eliminaUtente = (id) => privilegiManager.eliminaUtente(id);
  window.resetForm = () => privilegiManager.resetForm();
  
  console.log("Modulo privilegi caricato e funzioni esposte globalmente");
}