// frontend/js/modules/sedi/api.js
/**
 * api.js - API calls per la gestione sedi
 */
import { Api } from '../../main.js';

export const SediAPI = {
  async loadSedi() {
    try {
      return await Api.get("sedi/list.php");
    } catch (error) {
      console.error("Errore nel caricamento delle sedi:", error);
      throw error;
    }
  },

  async addSede(nome) {
    try {
      return await Api.post("sedi/add.php", { nome });
    } catch (error) {
      console.error("Errore nell'aggiunta della sede:", error);
      throw error;
    }
  },

  async updateSede(sedeData) {
    try {
      return await Api.post("sedi/update.php", sedeData);
    } catch (error) {
      console.error("Errore nella modifica della sede:", error);
      throw error;
    }
  },

  async deleteSede(id) {
    try {
      return await Api.post("sedi/delete.php", { id });
    } catch (error) {
      console.error("Errore nell'eliminazione della sede:", error);
      throw error;
    }
  }
};

export default SediAPI;