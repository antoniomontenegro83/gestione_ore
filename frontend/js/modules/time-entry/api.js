/**
 * modules/time-entry/api.js - API calls per l'inserimento turni
 */
import { Api } from '../../main.js';

export const TimeEntryAPI = {
  async loadDipendenti() {
    try {
      // Modificato per assicurarsi di caricare dalla tabella dipendenti
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

  async calculatePreview(turnoData) {
    try {
      return await Api.post('turni/preview.php', turnoData);
    } catch (error) {
      console.error('Errore nel calcolo preview:', error);
      throw error;
    }
  },

  async saveTurno(turnoData) {
    try {
      return await Api.post('turni/add.php', turnoData);
    } catch (error) {
      console.error('Errore nel salvataggio turno:', error);
      throw error;
    }
  }
};

export default TimeEntryAPI;