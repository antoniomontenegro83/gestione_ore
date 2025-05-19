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
      employeeId: '',
      startDate: this.getTodayString(),
      endDate: this.getTodayString(),
      sede: '',
      qualifica: '',
      formato: 'html'
    };
    this.summary = {
      feriali_diurne: 0,
      feriali_notturne: 0,
      festive_diurne: 0,
      festive_notturne: 0,
      totale_ore: 0
    };
  }

  getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    this.reportData = data || [];
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
    // Aggiorna i filtri in modo immutabile
    this.currentFilters = {...this.currentFilters, ...filters};
    console.log('Filtri aggiornati:', this.currentFilters);
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
    return this.dipendenti.find(dip => {
      const dipId = dip.id || dip.employee_id;
      return dipId === parseInt(id) || dipId === id;
    });
  }

  clearFilters() {
    this.currentFilters = {
      employeeId: '',
      startDate: this.getTodayString(),
      endDate: this.getTodayString(),
      sede: '',
      qualifica: '',
      formato: 'html'
    };
    this.reportData = [];
    this.calculateSummary();
  }
}

// Singleton
const reportState = new ReportState();
export default reportState;