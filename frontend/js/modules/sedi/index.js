// frontend/js/modules/sedi/index.js
/**
 * index.js - Entry point per il modulo sedi
 */
import { Auth, Notifications } from '../../main.js';
import sediState from './state.js';
import SediAPI from './api.js';
import SediUI from './ui.js';
import SediEvents from './events.js';
import { ROLES, SEDI_CONFIG } from './config.js';

class SediManager {
  constructor() {
    this.state = sediState;
    this.api = SediAPI;
    this.ui = SediUI;
    this.events = SediEvents;
  }

  async init() {
    console.log("Inizializzazione modulo sedi...");
    
    // Verifica autenticazione e configurazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadSedi();
      
      // Configura gli event listener
      this.events.setupEventListeners();
      
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
    
    // Per la gestione sedi, richiediamo almeno ruolo admin
    if (currentUser.ruolo !== ROLES.ADMIN && currentUser.ruolo !== ROLES.SUPERADMIN) {
      Notifications.error(SEDI_CONFIG.MESSAGES.ACCESS_DENIED);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
      return false;
    }
    
    return true;
  }

  async loadSedi() {
    this.ui.showLoading();
    this.state.setLoading(true);
    
    try {
      const sedi = await this.api.loadSedi();
      console.log("Sedi caricate:", sedi.length);
      
      // Ordina per nome
      sedi.sort((a, b) => a.nome.localeCompare(b.nome));
      
      this.state.setSedi(sedi);
      this.ui.renderList();
      
    } catch (error) {
      this.ui.showError("Errore nel caricamento delle sedi");
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per l'interfaccia globale
  eliminaSede(id) {
    const sede = this.state.findSedeById(id);
    if (!sede) {
      Notifications.error("Sede non trovata");
      return;
    }
    
    this.state.setSedeToDelete(id);
    this.ui.populateDeleteModal(sede);
    
    // Mostra il modale di conferma
    let confirmModal = document.getElementById('confirmDeleteSedeModal');
    if (!confirmModal) {
      // Crea il modale se non esiste
      this.createDeleteModal();
      confirmModal = document.getElementById('confirmDeleteSedeModal');
    }
    
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
  }

  createDeleteModal() {
    const modalHTML = `
      <div class="modal fade" id="confirmDeleteSedeModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>Conferma Eliminazione
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">Sei sicuro di voler eliminare la sede <strong id="deleteSedeName"></strong>?</p>
              <p class="text-danger mb-0 mt-2">
                <i class="bi bi-info-circle me-1"></i>${SEDI_CONFIG.MESSAGES.DELETE_WARNING}
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteSedeBtn">
                <i class="bi bi-trash me-1"></i>Elimina
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Aggiungi l'event listener al pulsante di conferma
    const confirmBtn = document.getElementById('confirmDeleteSedeBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.events.handleConfirmDelete());
    }
  }
}

// Crea l'istanza del manager
const sediManager = new SediManager();

// Esporta il manager
export default sediManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  sediManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.eliminaSede = (id) => sediManager.eliminaSede(id);
  
  console.log("Modulo sedi caricato e funzioni esposte globalmente");
}