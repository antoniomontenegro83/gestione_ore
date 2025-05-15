/**
 * modules/new-dipendente/api.js - API calls
 */
import { Api } from '../../main.js';

export const NewDipendenteAPI = {
  async loadQualifiche() {
    try {
      return await Api.get('qualifiche/list.php');
    } catch (error) {
      console.error('Errore nel caricamento delle qualifiche:', error);
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

  async saveDipendente(dipendenteData) {
    try {
      return await Api.post('dipendenti/add.php', dipendenteData);
    } catch (error) {
      console.error('Errore nel salvataggio del dipendente:', error);
      throw error;
    }
  }
};

export default NewDipendenteAPI;