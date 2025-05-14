/**
 * api.js - API calls per la gestione dipendenti
 */
import { Api } from '../../main.js';

export const DipendentiAPI = {
  async loadQualifiche() {
    try {
      return await Api.get("qualifiche/list.php");
    } catch (error) {
      console.error("Errore nel caricamento delle qualifiche:", error);
      return [];
    }
  },

  async loadSedi() {
    try {
      return await Api.get("sedi/list.php");
    } catch (error) {
      console.error("Errore nel caricamento delle sedi:", error);
      return [];
    }
  },

  async loadEmployees() {
    try {
      return await Api.get("dipendenti/list.php");
    } catch (error) {
      console.error("Errore nel caricamento dei dipendenti:", error);
      throw error;
    }
  },

  async updateEmployee(employeeData) {
    return await Api.post("dipendenti/update-full.php", employeeData);
  },

  async deleteEmployee(id) {
    return await Api.post("dipendenti/delete.php", { id });
  }
};

export default DipendentiAPI;