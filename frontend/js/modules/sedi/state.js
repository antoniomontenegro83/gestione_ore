// frontend/js/modules/sedi/state.js
/**
 * state.js - Gestione dello stato dell'applicazione sedi
 */

class SediState {
  constructor() {
    this.allSedi = [];
    this.isLoading = false;
    this.sedeIdDaEliminare = null;
    this.currentFilter = '';
  }

  setSedi(sedi) {
    this.allSedi = sedi;
  }

  getSedi() {
    return this.allSedi;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setSedeToDelete(id) {
    this.sedeIdDaEliminare = id;
  }

  getSedeToDelete() {
    return this.sedeIdDaEliminare;
  }

  clearSedeToDelete() {
    this.sedeIdDaEliminare = null;
  }

  setCurrentFilter(filter) {
    this.currentFilter = filter;
  }

  getCurrentFilter() {
    return this.currentFilter;
  }

  findSedeById(id) {
    return this.allSedi.find(sede => sede.id === id);
  }

  findSedeByName(nome) {
    return this.allSedi.find(sede => sede.nome.toLowerCase() === nome.toLowerCase());
  }

  addSede(newSede) {
    this.allSedi.push(newSede);
    // Riordina per nome
    this.allSedi.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  updateSede(updatedSede) {
    const index = this.allSedi.findIndex(sede => sede.id === updatedSede.id);
    if (index !== -1) {
      this.allSedi[index] = { ...this.allSedi[index], ...updatedSede };
      // Riordina per nome
      this.allSedi.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }

  removeSede(id) {
    this.allSedi = this.allSedi.filter(sede => sede.id !== id);
  }

  getFilteredSedi(filter = '') {
    if (!filter) return this.allSedi;
    
    const lowerFilter = filter.toLowerCase();
    return this.allSedi.filter(sede => 
      sede.nome.toLowerCase().includes(lowerFilter)
    );
  }
}

// Singleton pattern
const sediState = new SediState();

export default sediState;