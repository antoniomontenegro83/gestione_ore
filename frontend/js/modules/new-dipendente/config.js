/**
 * modules/new-dipendente/config.js - Configurazioni e costanti
 */

export const NEW_DIPENDENTE_CONFIG = {
  MESSAGES: {
    LOADING: 'Caricamento in corso...',
    SAVE_SUCCESS: 'Dipendente aggiunto con successo!',
    SAVE_ERROR: 'Errore durante l\'inserimento',
    VALIDATION_REQUIRED: 'Nome e cognome sono obbligatori',
    VALIDATION_QUALIFICA: 'Seleziona una qualifica',
    VALIDATION_SEDE: 'Seleziona una sede',
    CONNECTION_ERROR: 'Errore di comunicazione con il server',
    INVALID_DATA_FORMAT: 'Formato dati non valido'
  },
  FEEDBACK_DURATION: 5000, // 5 secondi
  FORM_ID: 'add-form',
  RESULT_ID: 'result'
};

export default NEW_DIPENDENTE_CONFIG;