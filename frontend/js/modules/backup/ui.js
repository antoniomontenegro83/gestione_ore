// ============================================
// frontend/js/modules/backup/ui.js
// ============================================
/**
 * ui.js - Gestione interfaccia utente per il backup
 */
import backupState from './state.js';
import { BACKUP_CONFIG } from './config.js';

export const BackupUI = {
  updateStatus(message, type = 'info') {
    const statusDiv = document.getElementById('backup-status');
    if (!statusDiv) return;

    const iconMap = {
      loading: 'bi-hourglass-split',
      success: 'bi-check-circle',
      error: 'bi-exclamation-circle',
      info: 'bi-info-circle'
    };

    const icon = iconMap[type] || iconMap.info;
    
    statusDiv.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
    statusDiv.className = `mt-2 backup-${type}`;
  },

  clearStatus(delay = 0) {
    setTimeout(() => {
      const statusDiv = document.getElementById('backup-status');
      if (statusDiv) {
        statusDiv.innerHTML = '';
        statusDiv.className = 'mt-2';
      }
    }, delay);
  },

  showLoading() {
    this.updateStatus(BACKUP_CONFIG.MESSAGES.LOADING, 'loading');
  },

  showSuccess(message = BACKUP_CONFIG.MESSAGES.SUCCESS) {
    this.updateStatus(message, 'success');
    this.clearStatus(BACKUP_CONFIG.STATUS_DURATION.SUCCESS);
  },

  showError(message = BACKUP_CONFIG.MESSAGES.ERROR) {
    this.updateStatus(message, 'error');
    this.clearStatus(BACKUP_CONFIG.STATUS_DURATION.ERROR);
  },

  triggerDownload(downloadUrl, filename) {
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`BackupUI: Download avviato per ${filename}`);
      return true;
    } catch (error) {
      console.error('BackupUI: Errore durante il download:', error);
      return false;
    }
  },

  updateCardInfo(backupInfo) {
    const card = document.querySelector('.card-backup');
    if (!card) return;

    // Aggiorna eventualmente informazioni sulla card
    const lastBackupElement = card.querySelector('.last-backup-info');
    if (lastBackupElement && backupInfo) {
      const date = new Date(backupInfo.timestamp);
      lastBackupElement.textContent = `Ultimo: ${date.toLocaleDateString()}`;
    }
  }
};

export default BackupUI;