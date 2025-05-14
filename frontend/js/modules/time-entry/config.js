/**
 * modules/time-entry/config.js - Configurazioni e costanti per l'inserimento turni
 */

export const TIME_ENTRY_CONFIG = {
  SEARCH_MIN_LENGTH: 3,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  PREVIEW_UPDATE_DELAY: 500,
  MESSAGES: {
    LOADING: 'Caricamento in corso...',
    SAVE_SUCCESS: 'Turno inserito con successo!',
    SAVE_ERROR: 'Errore durante l\'inserimento',
    VALIDATION_EMPLOYEE: 'Seleziona un dipendente',
    VALIDATION_DATES: 'Tutti i campi data/ora sono obbligatori',
    VALIDATION_SEQUENCE: 'La data/ora di uscita deve essere successiva all\'ingresso',
    CALCULATION_ERROR: 'Errore nel calcolo delle ore',
    CONNECTION_ERROR: 'Errore di connessione',
    DUPLICATE_SHIFT: 'Il dipendente ha già un turno registrato in questo periodo'
  },
  SEDE_DEFAULT: '-- Facoltativa --',
  EMPLOYEE_DEFAULT: '-- Seleziona --'
};

export default TIME_ENTRY_CONFIG;