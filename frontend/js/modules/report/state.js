/**
 * modules/report/state.js - Gestione dello stato per i report
 */

class ReportState {
  constructor() {
    this.dipendenti = [];
    this.sedi = [];
    this.qualifiche = [];
    this.reportData = [];
    this.isLoading = false;
    this.currentFilters = {
      employee_id: '',
      startDate: new Date().toISOString().split('T')[0], // oggi
      endDate: new Date().toISOString().split('T')[0],   // oggi
      sede: '',
      qualifica: ''
    };
    this.summary = {
      feriali_diurne: 0,
      feriali_notturne: 0,
      festive_diurne: 0,
      festive_notturne: 0,
      totale_ore: 0
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

  setQualifiche(qualifiche) {
    this.qualifiche = qualifiche;
  }

  getQualifiche() {
    return this.qualifiche;
  }

  setReportData(data) {
    this.reportData = data;
    // Aggiorna il summary
    this.calculateSummary();
  }

  getReportData() {
    return this.reportData;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setCurrentFilters(filters) {
    this.currentFilters = {...this.currentFilters, ...filters};
  }

  getCurrentFilters() {
    return this.currentFilters;
  }

  getSummary() {
    return this.summary;
  }

  calculateSummary() {
    // Reset del summary
    this.summary = {
      feriali_diurne: 0,
      feriali_notturne: 0,
      festive_diurne: 0,
      festive_notturne: 0,
      totale_ore: 0
    };

    // Calcola il summary dai dati del report
    this.reportData.forEach(item => {
      this.summary.feriali_diurne += parseFloat(item.feriali_diurne) || 0;
      this.summary.feriali_notturne += parseFloat(item.feriali_notturne) || 0;
      this.summary.festive_diurne += parseFloat(item.festive_diurne) || 0;
      this.summary.festive_notturne += parseFloat(item.festive_notturne) || 0;
      this.summary.totale_ore += parseFloat(item.totale_ore) || 0;
    });

    // Arrotonda i valori a 2 decimali
    for (const key in this.summary) {
      this.summary[key] = Math.round(this.summary[key] * 100) / 100;
    }
  }

  findDipendenteById(id) {
    if (!id) return null;
    return this.dipendenti.find(dip => dip.id === parseInt(id));
  }

  clearFilters() {
    this.currentFilters = {
      employee_id: '',
      startDate: new Date().toISOString().split('T')[0], // oggi
      endDate: new Date().toISOString().split('T')[0],   // oggi
      sede: '',
      qualifica: ''
    };
  }
}

// Singleton
const reportState = new ReportState();
export default reportState;