/**
 * config.js - Configurazioni e costanti per la gestione dipendenti
 */

export const DIPENDENTI_CONFIG = {
  SEARCH_MIN_LENGTH: 3,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MESSAGES: {
    CONFIRM_DELETE: 'Sei sicuro di voler eliminare il dipendente',
    DELETE_WARNING: 'Questa operazione non può essere annullata.',
    ACCESS_DENIED: 'Accesso riservato agli amministratori',
    LOADING: 'Caricamento in corso...',
    NO_RESULTS: 'Nessun dipendente trovato con i criteri di ricerca',
    NO_DATA: 'Nessun dipendente presente nel database'
  }
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin'
};

export default DIPENDENTI_CONFIG;