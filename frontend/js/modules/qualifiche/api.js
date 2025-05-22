// frontend/js/modules/qualifiche/api.js
/**
 * api.js - API calls per la gestione qualifiche
 */
import { Api } from '../../main.js';

export const QualificheAPI = {
  async loadQualifiche() {
    try {
      return await Api.get("qualifiche/list.php");
    } catch (error) {
      console.error("Errore nel caricamento delle qualifiche:", error);
      throw error;
    }
  },

  async addQualifica(qualifica) {
    try {
      return await Api.post("qualifiche/add.php", { qualifica });
    } catch (error) {
      console.error("Errore nell'aggiunta della qualifica:", error);
      throw error;
    }
  },

  async updateQualifica(qualificaData) {
    try {
      return await Api.post("qualifiche/update.php", qualificaData);
    } catch (error) {
      console.error("Errore nella modifica della qualifica:", error);
      throw error;
    }
  },

  async deleteQualifica(id) {
    try {
      return await Api.post("qualifiche/delete.php", { id });
    } catch (error) {
      console.error("Errore nell'eliminazione della qualifica:", error);
      throw error;
    }
  }
};

export default QualificheAPI;