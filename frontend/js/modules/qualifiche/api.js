// frontend/js/modules/qualifiche/api.js
/**
 * api.js - API calls per la gestione qualifiche
 */
import { Api } from '../../main.js';

export const QualificheAPI = {
  async loadQualifiche() {
    try {
      console.log('QualificheAPI: Caricamento qualifiche...');
      const result = await Api.get("qualifiche/list.php");
      console.log('QualificheAPI: Qualifiche caricate:', result);
      return result;
    } catch (error) {
      console.error("Errore nel caricamento delle qualifiche:", error);
      throw error;
    }
  },

  async addQualifica(qualifica) {
    try {
      console.log('QualificheAPI: Aggiunta qualifica:', qualifica);
      const result = await Api.post("qualifiche/add.php", { qualifica });
      console.log('QualificheAPI: Risposta aggiunta:', result);
      return result;
    } catch (error) {
      console.error("Errore nell'aggiunta della qualifica:", error);
      throw error;
    }
  },

  async updateQualifica(qualificaData) {
    try {
      console.log('QualificheAPI: Modifica qualifica:', qualificaData);
      const result = await Api.post("qualifiche/update.php", qualificaData);
      console.log('QualificheAPI: Risposta modifica:', result);
      return result;
    } catch (error) {
      console.error("Errore nella modifica della qualifica:", error);
      throw error;
    }
  },

  async deleteQualifica(id) {
    try {
      console.log('QualificheAPI: Eliminazione qualifica ID:', id);
      const result = await Api.post("qualifiche/delete.php", { id });
      console.log('QualificheAPI: Risposta eliminazione:', result);
      return result;
    } catch (error) {
      console.error("Errore nell'eliminazione della qualifica:", error);
      throw error;
    }
  },

  async countDipendentiPerQualifica(qualifica) {
    try {
      const result = await Api.get(`qualifiche/count-dipendenti.php?qualifica=${encodeURIComponent(qualifica)}`);
      return result.count || 0;
    } catch (error) {
      console.error("Errore nel conteggio dipendenti:", error);
      return 0;
    }
  }
};

export default QualificheAPI;