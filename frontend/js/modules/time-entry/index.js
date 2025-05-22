/**
 * modules/time-entry/index.js - Entry point per il modulo inserimento turni
 */
import { Auth, Notifications } from '../../main.js';
import timeEntryState from './state.js';
import TimeEntryAPI from './api.js';
import TimeEntryUI from './ui.js';
import TimeEntryEvents from './events.js';
import { TIME_ENTRY_CONFIG } from './config.js';

class TimeEntryManager {
  constructor() {
    this.state = timeEntryState;
    this.api = TimeEntryAPI;
    this.ui = TimeEntryUI;
    this.events = TimeEntryEvents;
  }

  async init() {
    console.log('Inizializzazione TimeEntry Manager...');
    
    // Verifica autenticazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadInitialData();
      
      // Configura gli event listener (che includeranno l'inizializzazione del preview)
      this.events.setupEventListeners();
      
    } catch (error) {
      console.error('Errore nell\'inizializzazione:', error);
      Notifications.error('Errore durante il caricamento dei dati iniziali');
    }
  }

  checkAuth() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      console.error('Utente non autenticato');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  async loadInitialData() {
    this.state.setLoading(true);
    
    try {
      // Carica dati in parallelo
      const [dipendenti, sedi] = await Promise.all([
        this.api.loadDipendenti(),
        this.api.loadSedi()
      ]);
      
      // Aggiorna lo stato
      this.state.setDipendenti(dipendenti);
      this.state.setSedi(sedi);
      
      console.log('TimeEntry: Caricati ' + dipendenti.length + ' dipendenti e ' + sedi.length + ' sedi');
      
      // Popola i select
      this.ui.populateDipendentiSelect();
      this.ui.populateSediSelect();
      
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per compatibilità con il codice esistente
  filtraDipendenti(filtro = '') {
    if (!filtro || filtro.length === 0) {
      // Se non c'è filtro, mostra tutti i dipendenti
      this.ui.populateDipendentiSelect(this.state.getDipendenti());
    } else if (filtro.length >= TIME_ENTRY_CONFIG.SEARCH_MIN_LENGTH) {
      const filteredDipendenti = this.state.getFilteredDipendenti(filtro);
      this.ui.populateDipendentiSelect(filteredDipendenti);
    }
  }

  async calcolaAnteprima() {
    await this.events.calculatePreview();
  }

  async handleSubmit(e) {
    await this.events.handleSubmit(e);
  }
}

// Crea l'istanza del manager
const timeEntryManager = new TimeEntryManager();

// Esporta il manager
export default timeEntryManager;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  timeEntryManager.init();
});

// Esponi le funzioni globalmente per compatibilità con il codice esistente
if (typeof window !== 'undefined') {
  window.timeEntryManager = timeEntryManager;
  window.filtraDipendenti = (filtro) => timeEntryManager.filtraDipendenti(filtro);
  window.calcolaAnteprima = () => timeEntryManager.calcolaAnteprima();
  window.handleSubmit = (e) => timeEntryManager.handleSubmit(e);
  
  console.log('Modulo time-entry caricato e funzioni esposte globalmente');
}