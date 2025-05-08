/**
 * utils.js - Modulo per funzioni di utilità comuni
 */

// Namespace del modulo
const Utils = {
  /**
   * Formatta una data in formato italiano (dd/mm/yyyy)
   * @param {string|Date} date - Data da formattare
   * @returns {string} - Data formattata
   */
  formatDate: function(date) {
    if (!date) return "";
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return String(date);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  },

  /**
   * Formatta un orario in formato HH:MM
   * @param {string|Date} time - Orario da formattare
   * @returns {string} - Orario formattato
   */
  formatTime: function(time) {
    if (!time) return "";
    
    let d;
    if (time instanceof Date) {
      d = time;
    } else if (time.includes(':')) {
      // Se è già in formato HH:MM
      const parts = time.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    } else {
      d = new Date(time);
    }
    
    if (isNaN(d.getTime())) return String(time);
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  },

  /**
   * Formatta una data e ora insieme
   * @param {string} date - Data in formato ISO
   * @param {string} time - Ora in formato ISO
   * @returns {string} - Data e ora formattate
   */
  formatDateTime: function(date, time) {
    if (!date || !time) return "-";
    
    try {
      const d = new Date(date + 'T' + time);
      if (isNaN(d.getTime())) return date + " " + time;
      
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch (e) {
      console.error("Errore nel formato data:", e);
      return date + " " + time;
    }
  },

  /**
   * Ottiene la data odierna in formato ISO (YYYY-MM-DD)
   * @returns {string} - Data in formato ISO
   */
  getTodayDate: function() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Verifica se una data/ora è valida
   * @param {string} dateTimeStr - Stringa data/ora da validare
   * @returns {boolean} - true se valida
   */
  isValidDateTime: function(dateTimeStr) {
    const d = new Date(dateTimeStr);
    return !isNaN(d.getTime());
  },

  /**
   * Calcola la differenza in minuti tra due date
   * @param {Date|string} startDate - Data di inizio
   * @param {Date|string} endDate - Data di fine
   * @returns {number} - Differenza in minuti
   */
  getMinutesDiff: function(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    return Math.floor((end - start) / (1000 * 60));
  },

  /**
   * Genera un ID univoco semplice
   * @returns {string} - ID univoco
   */
  generateId: function() {
    return Math.random().toString(36).substring(2, 11);
  },
  
  /**
   * Crea un elemento HTML con il testo specificato
   * @param {string} tag - Nome del tag HTML
   * @param {string} text - Testo contenuto
   * @param {string} className - Classi CSS
   * @returns {HTMLElement} - Elemento HTML creato
   */
  createElementWithText: function(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  },
  
  /**
   * Svuota un elemento HTML
   * @param {HTMLElement|string} element - Elemento o ID dell'elemento
   */
  emptyElement: function(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) el.innerHTML = '';
  }
};

// Esporta il modulo
window.Utils = Utils;