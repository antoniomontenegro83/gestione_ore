/**
 * state.js - Gestione dello stato dell'applicazione dipendenti
 */

class DipendentiState {
  constructor() {
    this.allEmployees = [];
    this.qualifiche = [];
    this.sedi = [];
    this.isLoading = false;
    this.dipendenteIdDaEliminare = null;
    this.currentFilter = '';
  }

  setEmployees(employees) {
    this.allEmployees = employees;
  }

  getEmployees() {
    return this.allEmployees;
  }

  setQualifiche(qualifiche) {
    this.qualifiche = qualifiche;
  }

  getQualifiche() {
    return this.qualifiche;
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

  setDipendenteToDelete(id) {
    this.dipendenteIdDaEliminare = id;
  }

  getDipendenteToDelete() {
    return this.dipendenteIdDaEliminare;
  }

  clearDipendenteToDelete() {
    this.dipendenteIdDaEliminare = null;
  }

  setCurrentFilter(filter) {
    this.currentFilter = filter;
  }

  getCurrentFilter() {
    return this.currentFilter;
  }

  findEmployeeById(id) {
    return this.allEmployees.find(emp => emp.id === id);
  }

  updateEmployee(updatedEmployee) {
    const index = this.allEmployees.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
      this.allEmployees[index] = { ...this.allEmployees[index], ...updatedEmployee };
    }
  }

  removeEmployee(id) {
    this.allEmployees = this.allEmployees.filter(emp => emp.id !== id);
  }
}

// Singleton pattern
const dipendentiState = new DipendentiState();

export default dipendentiState;