// ============================================
// frontend/js/modules/backup/config.js
// ============================================
/**
 * config.js - Configurazioni per il modulo backup
 */

export const BACKUP_CONFIG = {
  API_ENDPOINT: '../backend_gestione_ore/backup/create.php',
  MESSAGES: {
    LOADING: 'Creazione backup in corso...',
    SUCCESS: 'Backup completato con successo!',
    ERROR: 'Errore durante il backup',
    CONNECTION_ERROR: 'Errore di connessione al server',
    DOWNLOAD_STARTED: 'Download del backup avviato'
  },
  STATUS_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000
  },
  AUTO_BACKUP: {
    ENABLED: false, // Cambia a true per abilitare backup automatico
    HOUR: 2,        // Ora del backup automatico (2:00 AM)
    MINUTE: 0
  }
};

export default BACKUP_CONFIG;