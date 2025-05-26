// ============================================
// frontend/js/modules/backup/index.js
// ============================================
/**
 * index.js - Entry point per il modulo backup
 */
import { Auth, Notifications } from '../../main.js';
import backupState from './state.js';
import BackupAPI from './api.js';
import BackupUI from './ui.js';
import BackupEvents from './events.js';
import { BACKUP_CONFIG } from './config.js';

class BackupManager {
  constructor() {
    this.state = backupState;
    this.api = BackupAPI;
    this.ui = BackupUI;
    this.events = BackupEvents;
  }

  init() {
    console.log('BackupManager: Inizializzazione modulo backup...');
    
    // Verifica autenticazione
    if (!this.checkAuth()) return;
    
    // Setup backup automatico se abilitato
    this.events.setupAutoBackup();
    
    console.log('BackupManager: Modulo backup inizializzato');
  }

  checkAuth() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      console.error('BackupManager: Utente non autenticato');
      return false;
    }
    return true;
  }

  // Metodo pubblico per eseguire backup
  async executeBackup() {
    await this.events.handleBackupClick();
  }

  // Metodo per ottenere stato backup
  getBackupStatus() {
    return {
      isProcessing: this.state.isBackupProcessing(),
      lastBackup: this.state.getLastBackup(),
      history: this.state.getBackupHistory(),
      autoBackupEnabled: BACKUP_CONFIG.AUTO_BACKUP.ENABLED
    };
  }

  // Metodo per abilitare/disabilitare backup automatico
  toggleAutoBackup(enabled) {
    BACKUP_CONFIG.AUTO_BACKUP.ENABLED = enabled;
    if (enabled) {
      this.events.setupAutoBackup();
    }
  }
}

// Crea istanza del manager
const backupManager = new BackupManager();

// Esporta il manager
export default backupManager;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  backupManager.init();
});

// Esponi funzioni globalmente per compatibilità
if (typeof window !== 'undefined') {
  window.backupManager = backupManager;
  window.executeBackup = () => backupManager.executeBackup();
  
  console.log('Modulo backup caricato e funzioni esposte globalmente');
}