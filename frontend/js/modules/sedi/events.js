// frontend/js/modules/sedi/events.js
/**
 * events.js - Gestione eventi per sedi
 */
import sediState from './state.js';
import SediUI from './ui.js';
import SediAPI from './api.js';
import { Notifications } from '../../main.js';
import { SEDI_CONFIG } from './config.js';

export const SediEvents = {
  setupEventListeners() {
    // Listener per il form di aggiunta
    const addForm = document.getElementById('add-sede-form');
    if (addForm) {
      addForm.addEventListener('submit', this.handleAddSede.bind(this));
    }

    // Listener per la ricerca (se presente)
    const searchInput = document.getElementById('sede-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // Listener per il pulsante di conferma eliminazione
    const confirmDeleteBtn = document.getElementById('confirmDeleteSedeBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', this.handleConfirmDelete.bind(this));
    }
  },

  async handleAddSede(e) {
    e.preventDefault();
    
    if (sediState.isLoadingData()) return;
    
    const nomeInput = document.getElementById('sede-nome');
    const nome = nomeInput.value.trim();
    
    if (!nome) {
      Notifications.warning(SEDI_CONFIG.MESSAGES.VALIDATION_NAME_REQUIRED);
      nomeInput.focus();
      return;
    }
    
    // Verifica se esiste già una sede con lo stesso nome
    if (sediState.findSedeByName(nome)) {
      Notifications.warning(SEDI_CONFIG.MESSAGES.VALIDATION_NAME_DUPLICATE);
      nomeInput.focus();
      return;
    }
    
    sediState.setLoading(true);
    
    try {
      const result = await SediAPI.addSede(nome);
      
      if (result.success) {
        Notifications.success(SEDI_CONFIG.MESSAGES.SUCCESS_ADD);
        
        // Aggiungi la nuova sede allo stato
        const newSede = {
          id: result.id,
          nome: nome
        };
        sediState.addSede(newSede);
        
        // Aggiorna l'interfaccia
        SediUI.renderList(sediState.getCurrentFilter());
        SediUI.clearForm();
        SediUI.highlightAddedSede(result.id);
      } else {
        Notifications.error(SEDI_CONFIG.MESSAGES.ERROR_ADD + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'aggiunta:", error);
      Notifications.error(SEDI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      sediState.setLoading(false);
    }
  },

  handleSearch(e) {
    const searchValue = e.target.value.trim();
    sediState.setCurrentFilter(searchValue);
    SediUI.renderList(searchValue);
  },

  async handleConfirmDelete() {
    const idToDelete = sediState.getSedeToDelete();
    if (!idToDelete) return;
    
    // Chiudi il modale
    const modalElement = document.getElementById('confirmDeleteSedeModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (sediState.isLoadingData()) return;
    sediState.setLoading(true);
    
    try {
      const result = await SediAPI.deleteSede(idToDelete);
      
      if (result.success) {
        Notifications.success(SEDI_CONFIG.MESSAGES.SUCCESS_DELETE);
        
        // Rimuovi dall'interfaccia con animazione
        SediUI.removeSedeFromList(idToDelete);
        
        // Aggiorna lo stato
        sediState.removeSede(idToDelete);
      } else {
        Notifications.error(SEDI_CONFIG.MESSAGES.ERROR_DELETE + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Notifications.error(SEDI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      sediState.setLoading(false);
      sediState.clearSedeToDelete();
    }
  }
};

export default SediEvents;