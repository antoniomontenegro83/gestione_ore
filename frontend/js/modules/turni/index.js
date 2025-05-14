/**
 * modules/turni/index.js - Entry point per il modulo turni
 */
import { Auth, Notifications, Utils } from '../../main.js';
import turniState from './state.js';
import TurniAPI from './api.js';
import TurniUI from './ui.js';
import TurniEvents from './events.js';
import { ROLES, TURNI_CONFIG } from './config.js';

class TurniManager {
  constructor() {
    this.state = turniState;
    this.api = TurniAPI;
    this.ui = TurniUI;
    this.events = TurniEvents;
  }

  async init() {
    console.log("Inizializzazione modulo turni...");
    
    // Verifica autenticazione e configurazione
    if (!this.checkAuth()) return;
    
    // Imposta configurazioni iniziali
    this.setupInitialConfig();
    
    try {
      // Carica i dati iniziali
      await this.loadTurni();
      
      // Configura gli event listener
      this.events.setupEventListeners();
      
    } catch (error) {
      console.error("Errore nell'inizializzazione:", error);
      Notifications.error("Errore durante l'inizializzazione");
    }
  }

  checkAuth() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      console.error("Utente non autenticato");
      window.location.href = "login.html";
      return false;
    }
    
    // Imposta lo stato admin
    const isAdmin = currentUser.ruolo === ROLES.ADMIN || currentUser.ruolo === ROLES.SUPERADMIN;
    this.state.setAdminStatus(isAdmin);
    
    return true;
  }

  setupInitialConfig() {
    // Imposta la data di oggi come valore predefinito per i filtri
    const today = Utils.getTodayDate();
    this.ui.setFilterDate('dataInizio', today);
    this.ui.setFilterDate('dataFine', today);
    
    // Imposta i filtri iniziali
    this.state.setCurrentFilters({
      dataInizio: today,
      dataFine: today
    });
  }

  async loadTurni() {
    if (this.state.isLoadingData()) return;
    
    this.ui.showLoading();
    this.state.setLoading(true);
    
    try {
      const turni = await this.api.loadTurni();
      this.state.setTurni(turni);
      
      // Popola il select dipendenti
      this.ui.populateDipendenteSelect();
      
      // Applica i filtri e renderizza
      this.state.applyFilters();
      this.ui.renderTable();
      
    } catch (error) {
      this.ui.showError("Errore nel caricamento dei turni");
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per l'interfaccia globale
  apriModifica(id) {
    const turno = this.state.findTurnoById(id);
    if (!turno) {
      Notifications.error("Turno non trovato");
      return;
    }
    
    this.ui.populateModifyModal(turno);
    
    // Apri il modale
    const modaleModifica = new bootstrap.Modal(document.getElementById('modaleModifica'));
    modaleModifica.show();
  }

  preparaEliminazioneTurno(id) {
    const turno = this.state.findTurnoById(id);
    if (!turno) {
      Notifications.error("Turno non trovato");
      return;
    }
    
    this.state.setTurnoToDelete(id);
    
    // Mostra il modale di conferma
    const confirmModal = new bootstrap.Modal(document.getElementById('modaleConfermaEliminazione'));
    confirmModal.show();
  }

  filtraTurni() {
    this.events.handleFilter();
  }

  pulisciFiltri() {
    this.events.handleClearFilters();
  }
}

// Crea l'istanza del manager
const turniManager = new TurniManager();

// Esporta il manager
export default turniManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  turniManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.turniManager = turniManager;
  window.apriModifica = (id) => turniManager.apriModifica(id);
  window.preparaEliminazioneTurno = (id) => turniManager.preparaEliminazioneTurno(id);
  window.filtraTurni = () => turniManager.filtraTurni();
  window.pulisciFiltri = () => turniManager.pulisciFiltri();
  
  console.log("Modulo turni caricato e funzioni esposte globalmente");
}