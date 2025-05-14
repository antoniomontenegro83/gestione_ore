/**
 * modules/time-entry/calculator.js - Funzioni di calcolo per l'inserimento turni
 */

export const TimeEntryCalculator = {
  /**
   * Valida le date di ingresso/uscita
   */
  validateDates(entryDate, entryTime, exitDate, exitTime) {
    try {
      const entryDateTime = new Date(`${entryDate}T${entryTime}`);
      const exitDateTime = new Date(`${exitDate}T${exitTime}`);
      
      if (isNaN(entryDateTime.getTime()) || isNaN(exitDateTime.getTime())) {
        return { valid: false, message: 'Date o orari non validi' };
      }
      
      if (exitDateTime <= entryDateTime) {
        return { valid: false, message: 'La data/ora di uscita deve essere successiva all\'ingresso' };
      }
      
      // Verifica che il turno non superi le 48 ore
      const diffHours = (exitDateTime - entryDateTime) / (1000 * 60 * 60);
      if (diffHours > 48) {
        return { valid: false, message: 'Il turno non può durare più di 48 ore' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Errore nella validazione delle date' };
    }
  },

  /**
   * Calcola la durata in ore e minuti
   */
  calculateDuration(entryDate, entryTime, exitDate, exitTime) {
    try {
      const entryDateTime = new Date(`${entryDate}T${entryTime}`);
      const exitDateTime = new Date(`${exitDate}T${exitTime}`);
      
      const diffMs = exitDateTime - entryDateTime;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        hours: diffHours,
        minutes: diffMinutes,
        totalHours: diffHours + (diffMinutes / 60)
      };
    } catch (error) {
      console.error('Errore nel calcolo della durata:', error);
      return null;
    }
  },

  /**
   * Formatta ore decimali in formato HH:MM
   */
  formatHoursToHHMM(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  /**
   * Verifica se una data è festiva (domenica)
   */
  isFestivo(date) {
    const dateObj = new Date(date);
    return dateObj.getDay() === 0; // Domenica
  }
};

export default TimeEntryCalculator;