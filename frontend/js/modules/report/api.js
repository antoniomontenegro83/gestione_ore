/**
 * modules/report/api.js - API calls per i report
 */
import { Api } from '../../main.js';

export const ReportAPI = {
  async loadDipendenti() {
    try {
      return await Api.get('dipendenti/list.php');
    } catch (error) {
      console.error('Errore nel caricamento dei dipendenti:', error);
      throw error;
    }
  },

  async loadSedi() {
    try {
      return await Api.get('sedi/list.php');
    } catch (error) {
      console.error('Errore nel caricamento delle sedi:', error);
      throw error;
    }
  },

  async loadQualifiche() {
    try {
      return await Api.get('qualifiche/list.php');
    } catch (error) {
      console.error('Errore nel caricamento delle qualifiche:', error);
      throw error;
    }
  },

  async loadReportData(filters) {
    try {
      return await Api.get('report/ore.php', filters);
    } catch (error) {
      console.error('Errore nel caricamento dei dati del report:', error);
      throw error;
    }
  },

  async exportReport(format, filters) {
    try {
      // Costruisci l'URL per l'esportazione
      const params = new URLSearchParams();
      for (const key in filters) {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      }
      
      // URL completa per l'esportazione
      const url = `../backend_gestione_ore/report/${format}.php?${params.toString()}`;
      
      // Apri in una nuova finestra
      window.open(url, '_blank');
      
      return { success: true };
    } catch (error) {
      console.error('Errore nell\'esportazione del report:', error);
      throw error;
    }
  }
};

export default ReportAPI;