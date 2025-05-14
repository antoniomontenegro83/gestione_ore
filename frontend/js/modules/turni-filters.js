// frontend/js/modules/turni-filters.js
/**
 * Modulo per la gestione dei filtri dei turni
 */

export const TurniFilters = {
  /**
   * Imposta la data di oggi come valore predefinito per il filtro
   */
  setOggiFilterDate() {
    const today = new Date().toISOString().split('T')[0];
    
    const dataInizio = document.getElementById('dataInizio');
    const dataFine = document.getElementById('dataFine');
    
    if (dataInizio) dataInizio.value = today;
    if (dataFine) dataFine.value = today;
  },

  /**
   * Pulisce i filtri e mostra tutti i turni
   */
  pulisciFiltri(turniTotali, popolaDipendentiFunc, mostraTuttiTurniFunc) {
    const dipendenteSearch = document.getElementById("dipendenteSearch");
    const dipendenteSelect = document.getElementById("dipendenteSelect");
    const dataInizio = document.getElementById("dataInizio");
    const dataFine = document.getElementById("dataFine");
    
    // Pulisci tutti i campi
    if (dipendenteSearch) dipendenteSearch.value = "";
    if (dipendenteSelect) {
      dipendenteSelect.selectedIndex = 0;
      dipendenteSelect.value = "";
    }
    if (dataInizio) dataInizio.value = "";
    if (dataFine) dataFine.value = "";
    
    // Ripopola i dipendenti senza filtro
    popolaDipendentiFunc("");  // Passa stringa vuota invece di turniTotali
    
    // Mostra tutti i turni
    mostraTuttiTurniFunc();
  },

  /**
   * Ottieni i valori correnti dei filtri
   */
  getFiltriCorrente() {
    const dipendenteSelect = document.getElementById("dipendenteSelect");
    const dataInizio = document.getElementById("dataInizio");
    const dataFine = document.getElementById("dataFine");
    const dipendenteSearch = document.getElementById("dipendenteSearch");
    
    return {
      dipendente: dipendenteSelect ? dipendenteSelect.value : "",
      dataInizio: dataInizio ? dataInizio.value : "",
      dataFine: dataFine ? dataFine.value : "",
      ricerca: dipendenteSearch ? dipendenteSearch.value : ""
    };
  },

  /**
   * Ripristina i filtri salvati
   */
  ripristinaFiltri(filtri) {
    const dipendenteSelect = document.getElementById("dipendenteSelect");
    const dataInizio = document.getElementById("dataInizio");
    const dataFine = document.getElementById("dataFine");
    const dipendenteSearch = document.getElementById("dipendenteSearch");
    
    if (dipendenteSelect && filtri.dipendente) {
      dipendenteSelect.value = filtri.dipendente;
    }
    if (dataInizio && filtri.dataInizio) {
      dataInizio.value = filtri.dataInizio;
    }
    if (dataFine && filtri.dataFine) {
      dataFine.value = filtri.dataFine;
    }
    if (dipendenteSearch && filtri.ricerca) {
      dipendenteSearch.value = filtri.ricerca;
    }
  }
};

export default TurniFilters;