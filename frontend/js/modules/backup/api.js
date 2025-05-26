// ============================================
// frontend/js/modules/backup/api.js
// ============================================
/**
 * api.js - API calls per il modulo backup
 */
import { Api } from '../../main.js';
import { BACKUP_CONFIG } from './config.js';

export const BackupAPI = {
  async createBackup() {
    try {
      console.log('BackupAPI: Avvio creazione backup...');
      
      const response = await fetch(BACKUP_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('BackupAPI: Risposta ricevuta:', result);
      
      return result;
    } catch (error) {
      console.error('BackupAPI: Errore durante il backup:', error);
      throw error;
    }
  },

  async getBackupHistory() {
    try {
      return await Api.get('backup/history.php');
    } catch (error) {
      console.error('BackupAPI: Errore nel caricamento cronologia:', error);
      return [];
    }
  }
};

export default BackupAPI;