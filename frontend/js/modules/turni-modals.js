// frontend/js/modules/turni-modals.js
/**
 * Modulo per la gestione dei modali dei turni
 */

export const TurniModals = {
  turnoIdDaEliminare: null,

  /**
   * Apre il modale per modificare un turno
   */
  apriModifica(id, entryDate, entryTime, exitDate, exitTime) {
    const modificaId = document.getElementById("modificaId");
    const modificaIngresso = document.getElementById("modificaIngresso");
    const modificaUscita = document.getElementById("modificaUscita");
    
    if (!modificaId || !modificaIngresso || !modificaUscita) {
      console.error("Elementi modale non trovati");
      return;
    }
    
    modificaId.value = id;
    modificaIngresso.value = entryDate + "T" + entryTime;
    modificaUscita.value = exitDate + "T" + exitTime;
    
    const modaleModifica = document.getElementById("modaleModifica");
    if (modaleModifica) {
      new bootstrap.Modal(modaleModifica).show();
    }
  },

  /**
   * Prepara l'eliminazione di un turno mostrando il modale di conferma
   */
  preparaEliminazioneTurno(id) {
    this.turnoIdDaEliminare = id;
    const modaleConferma = new bootstrap.Modal(document.getElementById('modaleConfermaEliminazione'));
    modaleConferma.show();
  },

  /**
   * Chiude il modale di conferma eliminazione
   */
  chiudiModaleConferma() {
    const modaleConferma = bootstrap.Modal.getInstance(document.getElementById('modaleConfermaEliminazione'));
    if (modaleConferma) {
      modaleConferma.hide();
    }
  },

  /**
   * Chiude il modale di modifica
   */
  chiudiModaleModifica() {
    const modalElement = document.getElementById("modaleModifica");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  },

  /**
   * Ottiene l'ID del turno da eliminare
   */
  getTurnoIdDaEliminare() {
    return this.turnoIdDaEliminare;
  },

  /**
   * Resetta l'ID del turno da eliminare
   */
  resetTurnoIdDaEliminare() {
    this.turnoIdDaEliminare = null;
  }
};

export default TurniModals;