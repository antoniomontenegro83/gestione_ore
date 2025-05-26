// ============================================
// frontend/js/modules/backup/events.js
// ============================================
/**
 * events.js - Gestione eventi per il modulo backup
 */
import backupState from './state.js';
import BackupUI from './ui.js';
import BackupAPI from './api.js';
import { Notifications } from '../../main.js';
import { BACKUP_CONFIG } from './config.js';

export const BackupEvents = {
  async handleBackupClick() {
    // Previeni click multipli
    if (backupState.isBackupProcessing()) {
      console.log('BackupEvents: Backup già in corso, ignoro click');
      return;
    }

    try {
      console.log('BackupEvents: Avvio processo backup...');
      
      // Imposta stato di processing
      backupState.setProcessing(true);
      
      // Mostra loading nell'UI
      BackupUI.showLoading();
      
      // Chiama API di backup
      const result = await BackupAPI.createBackup();
      
      if (result.success) {
        // Backup riuscito
        console.log('BackupEvents: Backup completato con successo');
        
        // Salva informazioni nell'state
        backupState.setLastBackup({
          filename: result.filename,
          size: result.size_formatted || result.size,
          downloadUrl: result.download_url
        });
        
        // Aggiorna UI
        BackupUI.showSuccess();
        BackupUI.updateCardInfo(backupState.getLastBackup());
        
        // Avvia download
        if (BackupUI.triggerDownload(result.download_url, result.filename)) {
          Notifications.success(`${BACKUP_CONFIG.MESSAGES.DOWNLOAD_STARTED}: ${result.filename}`);
        }
        
      } else {
        throw new Error(result.error || BACKUP_CONFIG.MESSAGES.ERROR);
      }
      
    } catch (error) {
      console.error('BackupEvents: Errore durante il backup:', error);
      
      // Mostra errore nell'UI
      BackupUI.showError(error.message || BACKUP_CONFIG.MESSAGES.CONNECTION_ERROR);
      Notifications.error(error.message || BACKUP_CONFIG.MESSAGES.CONNECTION_ERROR);
      
    } finally {
      // Reset stato di processing
      backupState.setProcessing(false);
    }
  },

  setupAutoBackup() {
    if (!BACKUP_CONFIG.AUTO_BACKUP.ENABLED) {
      console.log('BackupEvents: Backup automatico disabilitato');
      return;
    }

    if (backupState.isAutoBackupScheduled()) {
      console.log('BackupEvents: Backup automatico già programmato');
      return;
    }

    const now = new Date();
    const scheduledTime = new Date(now);
    
    // Imposta l'orario del backup
    scheduledTime.setHours(BACKUP_CONFIG.AUTO_BACKUP.HOUR, BACKUP_CONFIG.AUTO_BACKUP.MINUTE, 0, 0);
    
    // Se l'orario è già passato oggi, programma per domani
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const msUntilBackup = scheduledTime.getTime() - now.getTime();
    
    console.log(`BackupEvents: Backup automatico programmato per ${scheduledTime.toLocaleString()}`);
    
    setTimeout(() => {
      console.log('BackupEvents: Esecuzione backup automatico');
      this.handleBackupClick();
      
      // Riprogramma per il giorno successivo
      setInterval(() => {
        console.log('BackupEvents: Esecuzione backup automatico giornaliero');
        this.handleBackupClick();
      }, 24 * 60 * 60 * 1000); // Ogni 24 ore
      
    }, msUntilBackup);
    
    backupState.setAutoBackupScheduled(true);
  }
};

export default BackupEvents;