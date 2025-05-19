/**
 * modules/turni/state.js - Gestione dello stato dell'applicazione turni
 */

class TurniState {
  constructor() {
    this.allTurni = [];
    this.filteredTurni = [];
    this.isLoading = false;
    this.turnoIdDaEliminare = null;
    this.currentFilters = {
      dipendente: '',
      dataInizio: '',
      dataFine: '',
      searchText: ''
    };
    this.isAdmin = false;
  }

  setTurni(turni) {
    this.allTurni = turni;
    this.filteredTurni = turni;
  }

  getTurni() {
    return this.allTurni;
  }

  getFilteredTurni() {
    return this.filteredTurni;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setTurnoToDelete(id) {
    this.turnoIdDaEliminare = id;
  }

  getTurnoToDelete() {
    return this.turnoIdDaEliminare;
  }

  clearTurnoToDelete() {
    this.turnoIdDaEliminare = null;
  }

  setCurrentFilters(filters) {
    this.currentFilters = { ...this.currentFilters, ...filters };
  }

  getCurrentFilters() {
    return this.currentFilters;
  }

  setSearchText(text) {
    this.currentFilters.searchText = text;
  }

  getSearchText() {
    return this.currentFilters.searchText;
  }

  findTurnoById(id) {
    return this.allTurni.find(turno => turno.id === id);
  }

  applyFilters() {
    let filtered = [...this.allTurni];
    
    // Applica filtro dipendente
    if (this.currentFilters.dipendente) {
      filtered = filtered.filter(turno => {
        const nomeCompleto = `${turno.cognome} ${turno.nome}`;
        return nomeCompleto === this.currentFilters.dipendente;
      });
    }
    
    // Applica filtro date
    if (this.currentFilters.dataInizio) {
      filtered = filtered.filter(turno => 
        turno.entry_date >= this.currentFilters.dataInizio
      );
    }
    
    if (this.currentFilters.dataFine) {
      filtered = filtered.filter(turno => 
        turno.entry_date <= this.currentFilters.dataFine
      );
    }
    
    this.filteredTurni = filtered;
    return filtered;
  }

  updateTurno(updatedTurno) {
    const index = this.allTurni.findIndex(t => t.id === updatedTurno.id);
    if (index !== -1) {
      this.allTurni[index] = { ...this.allTurni[index], ...updatedTurno };
      // Riapplica i filtri per aggiornare anche la lista filtrata
      this.applyFilters();
    }
  }

  removeTurno(id) {
    this.allTurni = this.allTurni.filter(t => t.id !== id);
    this.filteredTurni = this.filteredTurni.filter(t => t.id !== id);
  }

  setAdminStatus(isAdmin) {
    this.isAdmin = isAdmin;
  }

  getAdminStatus() {
    return this.isAdmin;
  }

  getDipendentiUnici() {
    const dipendenteMap = new Map();
    
    this.allTurni.forEach(turno => {
      if (turno.nome && turno.cognome) {
        const nomeCompleto = `${turno.cognome} ${turno.nome}`;
        if (!dipendenteMap.has(nomeCompleto)) {
          dipendenteMap.set(nomeCompleto, {
            nome: turno.nome,
            cognome: turno.cognome,
            qualifica: turno.qualifica,
            sede: turno.sede
          });
        }
      }
    });
    
    return Array.from(dipendenteMap.entries())
      .map(([nome, dip]) => ({ nomeCompleto: nome, ...dip }))
      .sort((a, b) => 
        a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome)
      );
  }
}

// Singleton pattern
const turniState = new TurniState();

export default turniState;