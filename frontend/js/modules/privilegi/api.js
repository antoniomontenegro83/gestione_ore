// frontend/js/modules/privilegi/api.js
/**
 * api.js - API calls per la gestione privilegi/utenti
 */
import { Api } from '../../main.js';

export const PrivilegiAPI = {
  async loadUsers() {
    try {
      return await Api.get("users/list.php");
    } catch (error) {
      console.error("Errore nel caricamento degli utenti:", error);
      throw error;
    }
  },

  async addUser(userData) {
    try {
      return await Api.post("users/add.php", userData);
    } catch (error) {
      console.error("Errore nell'aggiunta dell'utente:", error);
      throw error;
    }
  },

  async updateUser(userData) {
    try {
      return await Api.post("users/update.php", userData);
    } catch (error) {
      console.error("Errore nella modifica dell'utente:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      return await Api.get(`users/delete.php?id=${id}`);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'utente:", error);
      throw error;
    }
  }
};

export default PrivilegiAPI;