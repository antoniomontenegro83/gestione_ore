// frontend/js/modules/sedi/config.js
/**
 * config.js - Configurazioni e costanti per la gestione sedi
 */

export const SEDI_CONFIG = {
  SEARCH_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MESSAGES: {
    CONFIRM_DELETE: 'Sei sicuro di voler eliminare la sede',
    DELETE_WARNING: 'Questa operazione non può essere annullata e potrebbe influenzare i turni associati.',
    ACCESS_DENIED: 'Accesso riservato agli amministratori',
    LOADING: 'Caricamento sedi in corso...',
    NO_RESULTS: 'Nessuna sede trovata con i criteri di ricerca',
    NO_DATA: 'Nessuna sede presente nel database',
    SUCCESS_ADD: 'Sede aggiunta con successo!',
    SUCCESS_UPDATE: 'Sede modificata con successo!',
    SUCCESS_DELETE: 'Sede eliminata con successo!',
    ERROR_ADD: 'Errore nell\'aggiunta della sede',
    ERROR_UPDATE: 'Errore nella modifica della sede',
    ERROR_DELETE: 'Errore nell\'eliminazione della sede',
    CONNECTION_ERROR: 'Errore di connessione al server',
    VALIDATION_NAME_REQUIRED: 'Il nome della sede è obbligatorio',
    VALIDATION_NAME_DUPLICATE: 'Esiste già una sede con questo nome'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin'
};

export default SEDI_CONFIG;