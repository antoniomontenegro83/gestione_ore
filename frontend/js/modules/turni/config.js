/**
 * modules/turni/config.js - Configurazioni e costanti per la gestione turni
 */

export const TURNI_CONFIG = {
  SEARCH_MIN_LENGTH: 3,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  TABLE_COLUMNS: 7, // Aggiornato da 6 a 7 per includere la colonna Sede
  MESSAGES: {
    CONFIRM_DELETE: 'Sei sicuro di voler eliminare questo turno?',
    DELETE_WARNING: 'Questa operazione non può essere annullata.',
    ACCESS_DENIED: 'Accesso riservato agli amministratori',
    LOADING: 'Caricamento turni in corso...',
    NO_RESULTS: 'Nessun turno da visualizzare',
    NO_DATA: 'Nessun turno disponibile nel database',
    VALIDATION_ERROR: 'La data/ora di uscita deve essere successiva alla data/ora di ingresso',
    SUCCESS_DELETE: 'Turno eliminato con successo!',
    SUCCESS_UPDATE: 'Turno modificato con successo!',
    ERROR_DELETE: 'Errore nell\'eliminazione',
    ERROR_UPDATE: 'Errore nella modifica',
    CONNECTION_ERROR: 'Errore di connessione'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin'
};

export default TURNI_CONFIG;