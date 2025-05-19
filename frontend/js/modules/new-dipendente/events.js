/**
 * modules/new-dipendente/events.js - Gestione eventi
 */
import newDipendenteState from './state.js';
import NewDipendenteUI from './ui.js';
import NewDipendenteAPI from './api.js';
import { Notifications } from '../../main.js';
import { NEW_DIPENDENTE_CONFIG } from './config.js';

export const NewDipendenteEvents = {
  setupEventListeners() {
    console.log('NewDipendenteEvents: Setup event listeners...');
    
    // Form submit
    const form = document.getElementById(NEW_DIPENDENTE_CONFIG.FORM_ID);
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    } else {
      console.error('Form non trovato!');
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    if (newDipendenteState.isLoadingData()) return;
    
    // Raccogli i dati del form
    const formData = NewDipendenteUI.getFormData();
    
    // Validazione
    const validation = this.validateFormData(formData);
    if (!validation.valid) {
      Notifications.warning(validation.message);
      return;
    }
    
    newDipendenteState.setLoading(true);
    
    try {
      console.log('Invio form nuovo dipendente...', formData);
      
      const result = await NewDipendenteAPI.saveDipendente(formData);
      console.log('Risposta server:', result);
      
      if (result && result.success) {
        Notifications.success(NEW_DIPENDENTE_CONFIG.MESSAGES.SAVE_SUCCESS);
        
        // Mostra feedback visivo
        const message = `Dipendente ${formData.cognome} ${formData.nome} aggiunto correttamente.`;
        NewDipendenteUI.showFeedback(message, 'success');
        
        // Salva l'ultima submission per eventuale riferimento
        newDipendenteState.setLastSubmission(formData);
        
        // Pulisci il form
        NewDipendenteUI.clearForm();
      } else {
        const errorMsg = result?.error || NEW_DIPENDENTE_CONFIG.MESSAGES.SAVE_ERROR;
        Notifications.error(errorMsg);
        NewDipendenteUI.showFeedback(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      Notifications.error(NEW_DIPENDENTE_CONFIG.MESSAGES.CONNECTION_ERROR);
      NewDipendenteUI.showFeedback(NEW_DIPENDENTE_CONFIG.MESSAGES.CONNECTION_ERROR, 'error');
    } finally {
      newDipendenteState.setLoading(false);
    }
  },

  validateFormData(formData) {
    if (!formData.cognome || !formData.nome) {
      return { valid: false, message: NEW_DIPENDENTE_CONFIG.MESSAGES.VALIDATION_REQUIRED };
    }
    
    if (!formData.qualifica || formData.qualifica === '') {
      return { valid: false, message: NEW_DIPENDENTE_CONFIG.MESSAGES.VALIDATION_QUALIFICA };
    }
    
    if (!formData.sede || formData.sede === '') {
      return { valid: false, message: NEW_DIPENDENTE_CONFIG.MESSAGES.VALIDATION_SEDE };
    }
    
    return { valid: true };
  }
};

export default NewDipendenteEvents;