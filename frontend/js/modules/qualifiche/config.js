// frontend/js/modules/qualifiche/config.js
/**
 * config.js - Configurazioni e costanti per la gestione qualifiche
 */

export const QUALIFICHE_CONFIG = {
  SEARCH_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MESSAGES: {
    CONFIRM_DELETE: 'Sei sicuro di voler eliminare la qualifica',
    DELETE_WARNING: 'Questa operazione non può essere annullata e potrebbe influenzare i dipendenti associati.',
    ACCESS_DENIED: 'Accesso riservato agli amministratori',
    LOADING: 'Caricamento qualifiche in corso...',
    NO_RESULTS: 'Nessuna qualifica trovata con i criteri di ricerca',
    NO_DATA: 'Nessuna qualifica presente nel database',
    SUCCESS_ADD: 'Qualifica aggiunta con successo!',
    SUCCESS_UPDATE: 'Qualifica modificata con successo!',
    SUCCESS_DELETE: 'Qualifica eliminata con successo!',
    ERROR_ADD: 'Errore nell\'aggiunta della qualifica',
    ERROR_UPDATE: 'Errore nella modifica della qualifica',
    ERROR_DELETE: 'Errore nell\'eliminazione della qualifica',
    CONNECTION_ERROR: 'Errore di connessione al server',
    VALIDATION_NAME_REQUIRED: 'Il nome della qualifica è obbligatorio',
    VALIDATION_NAME_DUPLICATE: 'Esiste già una qualifica con questo nome'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin'
};

export default QUALIFICHE_CONFIG;