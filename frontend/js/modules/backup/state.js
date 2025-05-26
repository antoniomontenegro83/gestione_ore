// ============================================
// frontend/js/modules/backup/state.js
// ============================================
/**
 * state.js - Gestione dello stato del modulo backup
 */

class BackupState {
  constructor() {
    this.isProcessing = false;
    this.lastBackup = null;
    this.backupHistory = [];
    this.autoBackupScheduled = false;
  }

  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;
  }

  isBackupProcessing() {
    return this.isProcessing;
  }

  setLastBackup(backupInfo) {
    this.lastBackup = {
      ...backupInfo,
      timestamp: new Date().toISOString()
    };
    this.addToHistory(this.lastBackup);
  }

  getLastBackup() {
    return this.lastBackup;
  }

  addToHistory(backupInfo) {
    this.backupHistory.unshift(backupInfo);
    // Mantieni solo gli ultimi 10 backup nella cronologia
    if (this.backupHistory.length > 10) {
      this.backupHistory = this.backupHistory.slice(0, 10);
    }
  }

  getBackupHistory() {
    return this.backupHistory;
  }

  setAutoBackupScheduled(scheduled) {
    this.autoBackupScheduled = scheduled;
  }

  isAutoBackupScheduled() {
    return this.autoBackupScheduled;
  }

  clearState() {
    this.isProcessing = false;
    this.lastBackup = null;
    this.backupHistory = [];
    this.autoBackupScheduled = false;
  }
}

// Singleton
const backupState = new BackupState();
export default backupState;