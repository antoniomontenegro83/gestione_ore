/**
 * modules/report/index.js - Entry point per il modulo report
 */
import { Auth, Notifications } from '../../main.js';
import reportState from './state.js';
import ReportAPI from './api.js';
import ReportUI from './ui.js';
import ReportEvents from './events.js';
import { REPORT_CONFIG, ROLES } from './config.js';

class ReportManager {
  constructor() {
    this.state = reportState;
    this.api = ReportAPI;
    this.ui = ReportUI;
    this.events = ReportEvents;
  }

  async init() {
    console.log('Inizializzazione Report Manager...');
    
    // Verifica autenticazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadInitialData();
      
      // Configura gli event listener
      this.events.setupEventListeners();
      
      // Imposta le date di default
      this.ui.setFilterDates(
        REPORT_CONFIG.DEFAULT_PERIOD.start,
        REPORT_CONFIG.DEFAULT_PERIOD.end
      );
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
      const [dipendenti, sedi, qualifiche] = await Promise.all([
        this.api.loadDipendenti(),
        this.api.loadSedi(),
        this.api.loadQualifiche()
      ]);
      
      // Aggiorna lo stato
      this.state.setDipendenti(dipendenti);
      this.state.setSedi(sedi);
      this.state.setQualifiche(qualifiche);
      
      console.log('Report: Caricati ' + dipendenti.length + ' dipendenti, ' + 
                  sedi.length + ' sedi e ' + qualifiche.length + ' qualifiche');
      
      // Popola i select
      this.ui.populateDipendentiSelect();
      this.ui.populateSedeSelect();
      
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per compatibilità con il codice esistente
  generaReport() {
    this.events.handleGenerateReport();
  }

  pulisciFiltri() {
    this.events.handleClearFilters();
  }

  stampaReport() {
    window.print();
  }

  esportaExcel() {
    const filters = this.state.getCurrentFilters();
    this.events.handleExportReport('excel', filters);
  }

  esportaPdf() {
    const filters = this.state.getCurrentFilters();
    this.events.handleExportReport('pdf', filters);
  }
}

// Crea l'istanza del manager
const reportManager = new ReportManager();

// Esporta il manager
export default reportManager;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  reportManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.reportManager = reportManager;
  window.generaReport = () => reportManager.generaReport();
  window.pulisciFiltri = () => reportManager.pulisciFiltri();
  window.stampaReport = () => reportManager.stampaReport();
  window.esportaExcel = () => reportManager.esportaExcel();
  window.esportaPdf = () => reportManager.esportaPdf();
  
  console.log('Modulo report caricato e funzioni esposte globalmente');
}