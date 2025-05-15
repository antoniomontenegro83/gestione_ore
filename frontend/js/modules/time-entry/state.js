/**
 * modules/time-entry/state.js - Gestione dello stato per l'inserimento turni
 */

class TimeEntryState {
  constructor() {
    this.dipendenti = [];
    this.sedi = [];
    this.isLoading = false;
    this.isCalculating = false;
    this.currentPreview = null;
    this.selectedEmployee = null;
    this.lastCalculation = null;
    this.filters = {
      employeeSearch: ''
    };
  }

  setDipendenti(dipendenti) {
    this.dipendenti = dipendenti;
  }

  getDipendenti() {
    return this.dipendenti;
  }

  setSedi(sedi) {
    this.sedi = sedi;
  }

  getSedi() {
    return this.sedi;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setCalculating(isCalculating) {
    this.isCalculating = isCalculating;
  }

  isCalculatingPreview() {
    return this.isCalculating;
  }

  setCurrentPreview(preview) {
    this.currentPreview = preview;
  }

  getCurrentPreview() {
    return this.currentPreview;
  }

  setSelectedEmployee(employeeId) {
    this.selectedEmployee = employeeId;
  }

  getSelectedEmployee() {
    return this.selectedEmployee;
  }

  setLastCalculation(calculation) {
    this.lastCalculation = calculation;
  }

  getLastCalculation() {
    return this.lastCalculation;
  }

  setEmployeeSearchFilter(search) {
    this.filters.employeeSearch = search;
  }

  getEmployeeSearchFilter() {
    return this.filters.employeeSearch;
  }

  findEmployeeById(id) {
    return this.dipendenti.find(dip => dip.id === parseInt(id));
  }

  getFilteredDipendenti(searchText = '') {
    if (!searchText || searchText.length < 3) return this.dipendenti;
    
    const lowerSearch = searchText.toLowerCase().trim();
    
    return this.dipendenti.filter(dip => {
      const searchableText = `${dip.cognome} ${dip.nome} ${dip.qualifica || ''} ${dip.sede || ''}`.toLowerCase();
      
      // Ricerca per testo completo
      if (searchableText.includes(lowerSearch)) return true;
      
      // Ricerca per parole separate
      const searchWords = lowerSearch.split(' ').filter(word => word.length > 0);
      return searchWords.every(word => searchableText.includes(word));
    });
  }

  clearState() {
    this.currentPreview = null;
    this.selectedEmployee = null;
    this.lastCalculation = null;
    this.filters.employeeSearch = '';
    // CORREZIONE: Assicurarsi che tutti i filtri siano ripristinati
    this.isCalculating = false;
  }
}

// Singleton
const timeEntryState = new TimeEntryState();
export default timeEntryState;