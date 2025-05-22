/**
 * events.js - Gestione eventi per qualifiche con errori corretti
 */
import qualificheState from './state.js';
import QualificheUI from './ui.js';
import QualificheAPI from './api.js';
import { Notifications } from '../../main.js';
import { QUALIFICHE_CONFIG } from './config.js';

export const QualificheEvents = {
  setupEventListeners() {
    console.log('QualificheEvents: Setup event listeners...');
    
    // Listener per la ricerca
    const searchInput = document.getElementById('qualifica-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchValue = e.target.value;
        qualificheState.setCurrentFilter(searchValue);
        QualificheUI.renderTable(searchValue);
      });
    }
    
    // Form di aggiunta qualifica
    const addForm = document.getElementById('add-qualifica-form');
    if (addForm) {
      addForm.addEventListener('submit', this.handleAddQualifica.bind(this));
    }
    
    // Form di modifica qualifica
    const modifyForm = document.getElementById('formModificaQualifica');
    if (modifyForm) {
      modifyForm.addEventListener('submit', this.handleModifyQualifica.bind(this));
    }
    
    // Pulsante di conferma eliminazione
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', this.confermaEliminazione.bind(this));
    }
  },

  async handleAddQualifica(e) {
    e.preventDefault();
    
    if (qualificheState.isLoadingData()) return;
    
    const nomeInput = document.getElementById('qualifica-nome');
    const nome = nomeInput.value.trim().toUpperCase();
    
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
      console.log('QualificheEvents: Aggiunta qualifica:', nome);
      
      const result = await QualificheAPI.addQualifica(nome);
      console.log('QualificheEvents: Risposta server:', result);
      
      if (result && result.success) {
        Notifications.success(QUALIFICHE_CONFIG.MESSAGES.SUCCESS_ADD);
        
        // Aggiungi la nuova qualifica allo stato
        const newQualifica = {
          id: result.id || Math.max(...qualificheState.getQualifiche().map(q => q.id), 0) + 1,
          qualifica: nome
        };
        qualificheState.addQualifica(newQualifica);
        
        // Aggiorna l'interfaccia COMPLETAMENTE
        QualificheUI.renderTable(qualificheState.getCurrentFilter());
        QualificheUI.updateQualificheBadges(); // Aggiorna anche i badge
        QualificheUI.clearForm();
        QualificheUI.highlightAddedQualifica(newQualifica.id);
        
        console.log('QualificheEvents: Qualifica aggiunta e interfaccia aggiornata');
      } else {
        const errorMsg = result?.error || QUALIFICHE_CONFIG.MESSAGES.ERROR_ADD;
        Notifications.error(errorMsg);
      }
    } catch (error) {
      console.error('QualificheEvents: Errore durante l\'aggiunta:', error);
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      qualificheState.setLoading(false);
    }
  },

  async handleModifyQualifica(e) {
    e.preventDefault();
    
    if (qualificheState.isLoadingData()) return;
    
    const id = parseInt(document.getElementById('modificaId').value);
    const nome = document.getElementById('modificaNome').value.trim().toUpperCase();
    
    if (!nome) {
      Notifications.warning(QUALIFICHE_CONFIG.MESSAGES.VALIDATION_NAME_REQUIRED);
      return;
    }
    
    // Verifica se esiste già una qualifica con lo stesso nome (esclusa quella corrente)
    const existing = qualificheState.findQualificaByName(nome);
    if (existing && existing.id !== id) {
      Notifications.warning(QUALIFICHE_CONFIG.MESSAGES.VALIDATION_NAME_DUPLICATE);
      return;
    }
    
    qualificheState.setLoading(true);
    
    try {
      console.log('QualificheEvents: Modifica qualifica ID:', id, 'Nome:', nome);
      
      const result = await QualificheAPI.updateQualifica({ id, qualifica: nome });
      console.log('QualificheEvents: Risposta modifica:', result);
      
      if (result && result.success) {
        Notifications.success(QUALIFICHE_CONFIG.MESSAGES.SUCCESS_UPDATE);
        
        // Chiudi il modale
        const modalElement = document.getElementById('modaleModifica');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        
        // Aggiorna lo stato
        qualificheState.updateQualifica({ id, qualifica: nome });
        
        // Ricarica COMPLETAMENTE l'interfaccia
        QualificheUI.renderTable(qualificheState.getCurrentFilter());
        QualificheUI.updateQualificheBadges(); // Aggiorna anche i badge
        
        console.log('QualificheEvents: Qualifica modificata e interfaccia aggiornata');
      } else {
        const errorMsg = result?.error || QUALIFICHE_CONFIG.MESSAGES.ERROR_UPDATE;
        Notifications.error(errorMsg);
      }
    } catch (error) {
      console.error('QualificheEvents: Errore durante la modifica:', error);
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      qualificheState.setLoading(false);
    }
  },

  async confermaEliminazione() {
    const idToDelete = qualificheState.getQualificaToDelete();
    if (!idToDelete) return;
    
    // Chiudi il modale
    const modalElement = document.getElementById('confirmDeleteModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (qualificheState.isLoadingData()) return;
    qualificheState.setLoading(true);
    
    try {
      console.log('QualificheEvents: Eliminazione qualifica ID:', idToDelete);
      
      const result = await QualificheAPI.deleteQualifica(idToDelete);
      console.log('QualificheEvents: Risposta eliminazione:', result);
      
      if (result && result.success) {
        Notifications.success(QUALIFICHE_CONFIG.MESSAGES.SUCCESS_DELETE);
        
        // Rimuovi dall'interfaccia con animazione
        QualificheUI.removeQualificaFromList(idToDelete);
        
        // Aggiorna lo stato
        qualificheState.removeQualifica(idToDelete);
        
        // Ricarica la tabella
        QualificheUI.renderTable(qualificheState.getCurrentFilter());
      } else {
        const errorMsg = result?.error || QUALIFICHE_CONFIG.MESSAGES.ERROR_DELETE;
        Notifications.error(errorMsg);
      }
    } catch (error) {
      console.error('QualificheEvents: Errore durante l\'eliminazione:', error);
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      qualificheState.setLoading(false);
      qualificheState.clearQualificaToDelete();
    }
  }
};

export default QualificheEvents;