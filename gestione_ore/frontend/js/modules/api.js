/**
 * api.js - Modulo per la gestione delle chiamate API
 */

// Namespace del modulo
const Api = {
  /**
   * URL base per le chiamate API
   * @type {string}
   */
  baseUrl: '../backend_gestione_ore',

  /**
   * Pulisce la risposta JSON da eventuali commenti PHP
   * @param {string} responseText - Testo della risposta
   * @returns {string} - Risposta pulita
   */
  cleanResponse: function(responseText) {
    const jsonStart = responseText.indexOf('[');
    if (jsonStart > 0) {
      return responseText.substring(jsonStart);
    }
    return responseText;
  },

  /**
   * Esegue una richiesta GET
   * @param {string} endpoint - Endpoint API (relativo a baseUrl)
   * @param {Object} [params={}] - Parametri query string (opzionali)
   * @returns {Promise<Object>} - Promise con i dati JSON della risposta
   */
  get: async function(endpoint, params = {}) {
    try {
      // Costruisci l'URL con i parametri
      let url = `${this.baseUrl}/${endpoint}`;
      
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
      }
      
      const response = await fetch(url);
      
      // Se la risposta non è OK, genera un errore
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      // Prima ottieni il testo della risposta
      const responseText = await response.text();
      
      // Pulisci la risposta da eventuali commenti
      const cleanedResponse = this.cleanResponse(responseText);
      
      try {
        // Parsa il JSON
        return JSON.parse(cleanedResponse);
      } catch (jsonError) {
        console.error("Errore nel parsing JSON:", jsonError);
        console.error("Risposta server:", responseText);
        throw new Error("Errore nel parsing della risposta dal server");
      }
    } catch (error) {
      console.error("Errore nella richiesta API:", error);
      throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
  },

  /**
   * Esegue una richiesta POST
   * @param {string} endpoint - Endpoint API (relativo a baseUrl)
   * @param {Object} data - Dati da inviare nel body
   * @returns {Promise<Object>} - Promise con i dati JSON della risposta
   */
  post: async function(endpoint, data) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Se la risposta non è OK, genera un errore
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      // Prima ottieni il testo della risposta
      const responseText = await response.text();
      
      // Pulisci la risposta da eventuali commenti
      const cleanedResponse = this.cleanResponse(responseText);
      
      try {
        // Parsa il JSON
        return JSON.parse(cleanedResponse);
      } catch (jsonError) {
        console.error("Errore nel parsing JSON:", jsonError);
        console.error("Risposta server:", responseText);
        throw new Error("Errore nel parsing della risposta dal server");
      }
    } catch (error) {
      console.error("Errore nella richiesta API:", error);
      throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
  },

  /**
   * Funzione di aiuto per gestire gli errori API
   * @param {Error} error - Oggetto errore
   * @param {string} [defaultMessage="Si è verificato un errore"] - Messaggio predefinito
   * @returns {string} - Messaggio di errore formattato
   */
  handleError: function(error, defaultMessage = "Si è verificato un errore") {
    if (error.message) {
      if (error.message.includes("Errore HTTP")) {
        return `Errore di comunicazione con il server (${error.message})`;
      }
      return error.message;
    }
    return defaultMessage;
  }
};

// Per retrocompatibilità
window.Api = Api;

// Esporta il modulo
export default Api;