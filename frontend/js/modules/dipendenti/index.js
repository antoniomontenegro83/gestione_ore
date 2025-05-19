/**
 * index.js - Entry point per il modulo dipendenti
 */
import { Auth, Notifications } from '../../main.js';
import dipendentiState from './state.js';
import DipendentiAPI from './api.js';
import DipendentiUI from './ui.js';
import DipendentiEvents from './events.js';
import { ROLES, DIPENDENTI_CONFIG } from './config.js';

class DipendentiManager {
  constructor() {
    this.state = dipendentiState;
    this.api = DipendentiAPI;
    this.ui = DipendentiUI;
    this.events = DipendentiEvents;
  }

  async init() {
    console.log("Inizializzazione modulo dipendenti...");
    
    // Verifica autenticazione e autorizzazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadInitialData();
      
      // Configura gli event listener
      this.events.setupEventListeners();
      
      // Render iniziale
      this.ui.renderTable();
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
    
    if (currentUser.ruolo !== ROLES.ADMIN && currentUser.ruolo !== ROLES.SUPERADMIN) {
      Notifications.error(DIPENDENTI_CONFIG.MESSAGES.ACCESS_DENIED);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
      return false;
    }
    
    return true;
  }

  async loadInitialData() {
    this.ui.showLoading();
    
    try {
      // Carica dati in parallelo
      const [qualifiche, sedi, employees] = await Promise.all([
        this.api.loadQualifiche(),
        this.api.loadSedi(),
        this.api.loadEmployees()
      ]);
      
      // Aggiorna lo stato
      this.state.setQualifiche(qualifiche);
      this.state.setSedi(sedi);
      
      // Ordina i dipendenti
      employees.sort((a, b) => {
        const cognomeCompare = (a.cognome || '').localeCompare(b.cognome || '');
        if (cognomeCompare !== 0) return cognomeCompare;
        return (a.nome || '').localeCompare(b.nome || '');
      });
      
      this.state.setEmployees(employees);
    } catch (error) {
      this.ui.showError("Errore nel caricamento dei dati");
      throw error;
    }
  }

  // Metodi pubblici per l'interfaccia globale
  apriModifica(id) {
    console.log("Apertura modifica per dipendente ID:", id);
    
    const dipendente = this.state.findEmployeeById(id);
    if (!dipendente) {
      Notifications.error("Dipendente non trovato");
      return;
    }
    
    this.ui.populateModifyModal(dipendente);
    
    // Apri il modale
    const modaleModifica = new bootstrap.Modal(document.getElementById('modaleModifica'));
    modaleModifica.show();
  }

  eliminaDipendente(id) {
    const dipendente = this.state.findEmployeeById(id);
    if (!dipendente) {
      Notifications.error("Dipendente non trovato");
      return;
    }
    
    this.state.setDipendenteToDelete(id);
    this.ui.populateDeleteModal(dipendente);
    
    // Mostra il modale di conferma
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmModal.show();
  }
}

// Crea l'istanza del manager
const dipendentiManager = new DipendentiManager();

// Esporta il manager
export default dipendentiManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  dipendentiManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.apriModifica = (id) => dipendentiManager.apriModifica(id);
  window.eliminaDipendente = (id) => dipendentiManager.eliminaDipendente(id);
  
  console.log("Modulo dipendenti caricato e funzioni esposte globalmente");
}