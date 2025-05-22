// frontend/js/modules/qualifiche/events.js
/**
 * events.js - Gestione eventi per qualifiche
 */
import qualificheState from './state.js';
import QualificheUI from './ui.js';
import QualificheAPI from './api.js';
import { Notifications } from '../../main.js';
import { QUALIFICHE_CONFIG } from './config.js';

export const QualificheEvents = {
  setupEventListeners() {
    // Listener per il form di aggiunta
    const addForm = document.getElementById('add-qualifica-form');
    if (addForm) {
      addForm.addEventListener('submit', this.handleAddQualifica.bind(this));
    }

    // Listener per la ricerca (se presente)
    const searchInput = document.getElementById('qualifica-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // Listener per il pulsante di conferma eliminazione
    const confirmDeleteBtn = document.getElementById('confirmDeleteQualificaBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', this.handleConfirmDelete.bind(this));
    }
  },

  async handleAddQualifica(e) {
    e.preventDefault();
    
    if (qualificheState.isLoadingData()) return;
    
    const nomeInput = document.getElementById('qualifica-nome');
    const nome = nomeInput.value.trim();
    
    if (!nome) {
      Notifications.warning(QUALIFICHE_CONFIG.MESSAGES.VALIDATION_NAME_REQUIRED);
      nomeInput.focus();
      return;
    }
    
    // Verifica se esiste già una qualifica con lo stesso nome
    if (qualificheState.findQualificaByName(nome)) {
      Notifications.warning(QUALIFICHE_CONFIG.MESSAGES.VALIDATION_NAME_DUPLICATE);
      nomeInput.focus();
      return;
    }
    
    qualificheState.setLoading(true);
    
    try {
      const result = await QualificheAPI.addQualifica(nome);
      
      if (result.success) {
        Notifications.success(QUALIFICHE_CONFIG.MESSAGES.SUCCESS_ADD);
        
        // Aggiungi la nuova qualifica allo stato
        const newQualifica = {
          id: result.id,
          qualifica: nome
        };
        qualificheState.addQualifica(newQualifica);
        
        // Aggiorna l'interfaccia
        QualificheUI.renderList(qualificheState.getCurrentFilter());
        QualificheUI.clearForm();
        QualificheUI.highlightAddedQualifica(result.id);
      } else {
        Notifications.error(QUALIFICHE_CONFIG.MESSAGES.ERROR_ADD + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'aggiunta:", error);
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      qualificheState.setLoading(false);
    }
  },

  handleSearch(e) {
    const searchValue = e.target.value.trim();
    qualificheState.setCurrentFilter(searchValue);
    QualificheUI.renderList(searchValue);
  },

  async handleConfirmDelete() {
    const idToDelete = qualificheState.getQualificaToDelete();
    if (!idToDelete) return;
    
    // Chiudi il modale
    const modalElement = document.getElementById('confirmDeleteQualificaModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (qualificheState.isLoadingData()) return;
    qualificheState.setLoading(true);
    
    try {
      const result = await QualificheAPI.deleteQualifica(idToDelete);
      
      if (result.success) {
        Notifications.success(QUALIFICHE_CONFIG.MESSAGES.SUCCESS_DELETE);
        
        // Rimuovi dall'interfaccia con animazione
        QualificheUI.removeQualificaFromList(idToDelete);
        
        // Aggiorna lo stato
        qualificheState.removeQualifica(idToDelete);
      } else {
        Notifications.error(QUALIFICHE_CONFIG.MESSAGES.ERROR_DELETE + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      qualificheState.setLoading(false);
      qualificheState.clearQualificaToDelete();
    }
  }
};

export default QualificheEvents;