/**
 * modules/report/config.js - Configurazioni e costanti per il modulo report
 */

export const REPORT_CONFIG = {
  // Parametri generali
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  SEARCH_MIN_LENGTH: 3,
  
  // Messaggi di sistema
  MESSAGES: {
    LOADING: 'Caricamento report in corso...',
    NO_RESULTS: 'Nessun dato trovato per il periodo selezionato',
    NO_DATA: 'Nessun dato disponibile nel database',
    ERROR_LOADING: 'Errore nel caricamento dei dati',
    CONNECTION_ERROR: 'Errore di connessione al server',
    ACCESS_DENIED: 'Accesso riservato agli amministratori',
    SELECT_PERIOD: 'Seleziona un periodo valido',
    VALIDATION_ERROR: 'Verifica i parametri inseriti',
    SELECT_EMPLOYEE: 'Seleziona un dipendente',
    EXPORT_ERROR: 'Errore durante l\'esportazione',
    EXPORT_SUCCESS: 'Report esportato con successo',
    FILTER_APPLIED: 'Filtri applicati correttamente',
    PERIOD_INVALID: 'Il periodo selezionato non è valido'
  },
  
  // Configurazione colori per grafici e badge
  CHART_COLORS: {
    feriali_diurne: '#28a745',
    feriali_notturne: '#0d6efd',
    festive_diurne: '#fd7e14',
    festive_notturne: '#dc3545',
    totale: '#7b68ee'
  },
  
  // Periodo predefinito
  DEFAULT_PERIOD: {
    start: new Date().toISOString().split('T')[0], // oggi in formato YYYY-MM-DD
    end: new Date().toISOString().split('T')[0]    // oggi in formato YYYY-MM-DD
  },
  
  // Formato di esportazione
  EXPORT_FORMATS: {
    excel: {
      label: 'Excel',
      icon: 'bi-file-excel',
      color: 'success'
    },
    pdf: {
      label: 'PDF',
      icon: 'bi-file-pdf',
      color: 'danger'
    },
    csv: {
      label: 'CSV',
      icon: 'bi-file-text',
      color: 'primary'
    }
  }
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin',
  SUPERVISOR: 'supervisor'
};

export default REPORT_CONFIG;