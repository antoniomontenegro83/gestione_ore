/**
 * modules/turni/api.js - API calls per la gestione turni
 */
import { Api } from '../../main.js';

export const TurniAPI = {
  async loadTurni() {
    try {
      return await Api.get("turni/list.php");
    } catch (error) {
      console.error("Errore nel caricamento dei turni:", error);
      throw error;
    }
  },

  async updateTurno(turnoData) {
    return await Api.post("turni/update.php", turnoData);
  },

  async deleteTurno(id) {
    return await Api.post("turni/delete.php", { id });
  }
};

export default TurniAPI;