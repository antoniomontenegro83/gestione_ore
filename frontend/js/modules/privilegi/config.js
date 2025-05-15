// frontend/js/modules/privilegi/config.js
/**
 * config.js - Configurazioni e costanti per la gestione privilegi/utenti
 */

export const PRIVILEGI_CONFIG = {
  SEARCH_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MESSAGES: {
    CONFIRM_DELETE: 'Sei sicuro di voler eliminare l\'utente',
    DELETE_WARNING: 'Questa operazione non può essere annullata. L\'utente perderà l\'accesso al sistema.',
    ACCESS_DENIED: 'Accesso riservato ai superadmin',
    LOADING: 'Caricamento utenti in corso...',
    NO_RESULTS: 'Nessun utente trovato con i criteri di ricerca',
    NO_DATA: 'Nessun utente presente nel database',
    SUCCESS_ADD: 'Utente aggiunto con successo!',
    SUCCESS_UPDATE: 'Utente modificato con successo!',
    SUCCESS_DELETE: 'Utente eliminato con successo!',
    ERROR_ADD: 'Errore nell\'aggiunta dell\'utente',
    ERROR_UPDATE: 'Errore nella modifica dell\'utente',
    ERROR_DELETE: 'Errore nell\'eliminazione dell\'utente',
    CONNECTION_ERROR: 'Errore di connessione al server',
    VALIDATION_USERNAME_REQUIRED: 'Username obbligatorio',
    VALIDATION_PASSWORD_REQUIRED: 'Password obbligatoria per i nuovi utenti',
    VALIDATION_USERNAME_EXISTS: 'Username già esistente',
    VALIDATION_USERNAME_MIN_LENGTH: 'Username deve avere almeno 3 caratteri',
    PASSWORD_UPDATE_NOTE: 'Lascia vuoto per mantenere la password attuale',
    DEFAULT_ROLE: 'user'
  },
  ROLES_HIERARCHY: {
    user: { label: 'Utente', level: 1, color: 'secondary' },
    admin: { label: 'Amministratore', level: 2, color: 'primary' },
    supervisor: { label: 'Supervisore', level: 3, color: 'warning' },
    superadmin: { label: 'Super Admin', level: 4, color: 'danger' }
  }
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  SUPERADMIN: 'superadmin'
};

export default PRIVILEGI_CONFIG;