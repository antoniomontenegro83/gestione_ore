// frontend/js/modules/qualifiche/state.js
/**
 * state.js - Gestione dello stato dell'applicazione qualifiche
 */

class QualificheState {
  constructor() {
    this.allQualifiche = [];
    this.isLoading = false;
    this.qualificaIdDaEliminare = null;
    this.currentFilter = '';
  }

  setQualifiche(qualifiche) {
    this.allQualifiche = qualifiche;
  }

  getQualifiche() {
    return this.allQualifiche;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setQualificaToDelete(id) {
    this.qualificaIdDaEliminare = id;
  }

  getQualificaToDelete() {
    return this.qualificaIdDaEliminare;
  }

  clearQualificaToDelete() {
    this.qualificaIdDaEliminare = null;
  }

  setCurrentFilter(filter) {
    this.currentFilter = filter;
  }

  getCurrentFilter() {
    return this.currentFilter;
  }

  findQualificaById(id) {
    return this.allQualifiche.find(qualifica => qualifica.id === id);
  }

  findQualificaByName(nome) {
    return this.allQualifiche.find(qualifica => qualifica.qualifica.toLowerCase() === nome.toLowerCase());
  }

  addQualifica(newQualifica) {
    this.allQualifiche.push(newQualifica);
    // Riordina per nome
    this.allQualifiche.sort((a, b) => a.qualifica.localeCompare(b.qualifica));
  }

  updateQualifica(updatedQualifica) {
    const index = this.allQualifiche.findIndex(qualifica => qualifica.id === updatedQualifica.id);
    if (index !== -1) {
      this.allQualifiche[index] = { ...this.allQualifiche[index], ...updatedQualifica };
      // Riordina per nome
      this.allQualifiche.sort((a, b) => a.qualifica.localeCompare(b.qualifica));
    }
  }

  removeQualifica(id) {
    this.allQualifiche = this.allQualifiche.filter(qualifica => qualifica.id !== id);
  }

  getFilteredQualifiche(filter = '') {
    if (!filter) return this.allQualifiche;
    
    const lowerFilter = filter.toLowerCase();
    return this.allQualifiche.filter(qualifica => 
      qualifica.qualifica.toLowerCase().includes(lowerFilter)
    );
  }
}

// Singleton pattern
const qualificheState = new QualificheState();

export default qualificheState;