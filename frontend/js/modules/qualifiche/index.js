// frontend/js/modules/qualifiche/index.js
/**
 * index.js - Entry point per il modulo qualifiche
 */
import { Auth, Notifications } from '../../main.js';
import qualificheState from './state.js';
import QualificheAPI from './api.js';
import QualificheUI from './ui.js';
import QualificheEvents from './events.js';
import { ROLES, QUALIFICHE_CONFIG } from './config.js';

class QualificheManager {
  constructor() {
    this.state = qualificheState;
    this.api = QualificheAPI;
    this.ui = QualificheUI;
    this.events = QualificheEvents;
  }

  async init() {
    console.log("Inizializzazione modulo qualifiche...");
    
    // Verifica autenticazione e configurazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadQualifiche();
      
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
    
    // Per la gestione qualifiche, richiediamo almeno ruolo admin
    if (currentUser.ruolo !== ROLES.ADMIN && currentUser.ruolo !== ROLES.SUPERADMIN) {
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.ACCESS_DENIED);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
      return false;
    }
    
    return true;
  }

  async loadQualifiche() {
    this.ui.showLoading();
    this.state.setLoading(true);
    
    try {
      const qualifiche = await this.api.loadQualifiche();
      console.log("Qualifiche caricate:", qualifiche.length);
      
      // Ordina per nome
      qualifiche.sort((a, b) => a.qualifica.localeCompare(b.qualifica));
      
      this.state.setQualifiche(qualifiche);
      this.ui.renderList();
      
    } catch (error) {
      this.ui.showError("Errore nel caricamento delle qualifiche");
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per l'interfaccia globale
  eliminaQualifica(id) {
    const qualifica = this.state.findQualificaById(id);
    if (!qualifica) {
      Notifications.error("Qualifica non trovata");
      return;
    }
    
    this.state.setQualificaToDelete(id);
    this.ui.populateDeleteModal(qualifica);
    
    // Mostra il modale di conferma
    let confirmModal = document.getElementById('confirmDeleteQualificaModal');
    if (!confirmModal) {
      // Crea il modale se non esiste
      this.createDeleteModal();
      confirmModal = document.getElementById('confirmDeleteQualificaModal');
    }
    
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
  }

  createDeleteModal() {
    const modalHTML = `
      <div class="modal fade" id="confirmDeleteQualificaModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>Conferma Eliminazione
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">Sei sicuro di voler eliminare la qualifica <strong id="deleteQualificaName"></strong>?</p>
              <p class="text-danger mb-0 mt-2">
                <i class="bi bi-info-circle me-1"></i>${QUALIFICHE_CONFIG.MESSAGES.DELETE_WARNING}
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteQualificaBtn">
                <i class="bi bi-trash me-1"></i>Elimina
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Aggiungi l'event listener al pulsante di conferma
    const confirmBtn = document.getElementById('confirmDeleteQualificaBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.events.handleConfirmDelete());
    }
  }
}

// Crea l'istanza del manager
const qualificheManager = new QualificheManager();

// Esporta il manager
export default qualificheManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  qualificheManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.eliminaQualifica = (id) => qualificheManager.eliminaQualifica(id);
  
  console.log("Modulo qualifiche caricato e funzioni esposte globalmente");
}