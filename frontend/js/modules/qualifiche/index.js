/**
 * index.js - Entry point per il modulo qualifiche completo
 */
import { Auth, Notifications } from '../../main.js';
import qualificheState from './state.js';
import QualificheAPI from './api.js';
import QualificheUI from './ui.js';
import QualificheEvents from './events.js';
import { ROLES, QUALIFICHE_CONFIG } from './config.js';

class QualificheManager {
  constructor() {
    this.state = qualificheState;
    this.api = QualificheAPI;
    this.ui = QualificheUI;
    this.events = QualificheEvents;
  }

  async init() {
    console.log("Inizializzazione modulo qualifiche...");
    
    // Verifica autenticazione e autorizzazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadQualifiche();
      
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
    
    // Per la gestione qualifiche, richiediamo almeno ruolo admin
    if (currentUser.ruolo !== ROLES.ADMIN && currentUser.ruolo !== ROLES.SUPERADMIN) {
      Notifications.error(QUALIFICHE_CONFIG.MESSAGES.ACCESS_DENIED);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);
      return false;
    }
    
    return true;
  }

  async loadQualifiche() {
    this.ui.showLoading();
    this.state.setLoading(true);
    
    try {
      const qualifiche = await this.api.loadQualifiche();
      console.log("Qualifiche caricate:", qualifiche.length);
      
      // Ordina per nome
      qualifiche.sort((a, b) => a.qualifica.localeCompare(b.qualifica));
      
      this.state.setQualifiche(qualifiche);
      this.ui.renderTable();
      
    } catch (error) {
      this.ui.showError("Errore nel caricamento delle qualifiche");
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }

  // Metodi pubblici per l'interfaccia globale
  apriModifica(id) {
    console.log("Apertura modifica per qualifica ID:", id);
    
    const qualifica = this.state.findQualificaById(id);
    if (!qualifica) {
      Notifications.error("Qualifica non trovata");
      return;
    }
    
    this.ui.populateModifyModal(qualifica);
    
    // Apri il modale
    const modaleModifica = new bootstrap.Modal(document.getElementById('modaleModifica'));
    modaleModifica.show();
  }

  eliminaQualifica(id) {
    const qualifica = this.state.findQualificaById(id);
    if (!qualifica) {
      Notifications.error("Qualifica non trovata");
      return;
    }
    
    this.state.setQualificaToDelete(id);
    this.ui.populateDeleteModal(qualifica);
    
    // Mostra il modale di conferma
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmModal.show();
  }

  // Metodo per ricaricare i dati (utile per refresh)
  async reload() {
    await this.loadQualifiche();
  }

  // Metodo per ottenere le statistiche
  getStats() {
    const qualifiche = this.state.getQualifiche();
    return {
      total: qualifiche.length,
      filtered: this.state.getFilteredQualifiche(this.state.getCurrentFilter()).length,
      mostUsed: this.getMostUsedQualifiche(5)
    };
  }

  getMostUsedQualifiche(limit = 5) {
    const qualifiche = this.state.getQualifiche();
    
    // Simula il conteggio dei dipendenti per qualifica
    const withCounts = qualifiche.map(q => ({
      ...q,
      dipendentiCount: this.ui.getDipendentiPerQualifica(q.qualifica)
    }));
    
    return withCounts
      .sort((a, b) => b.dipendentiCount - a.dipendentiCount)
      .slice(0, limit);
  }
}

// Crea l'istanza del manager
const qualificheManager = new QualificheManager();

// Esporta il manager
export default qualificheManager;

// Esegui l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  qualificheManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.qualificheManager = qualificheManager;
  window.apriModifica = (id) => qualificheManager.apriModifica(id);
  window.eliminaQualifica = (id) => qualificheManager.eliminaQualifica(id);
  
  // Funzioni di utilità globali
  window.reloadQualifiche = () => qualificheManager.reload();
  window.getQualificheStats = () => qualificheManager.getStats();
  
  console.log("Modulo qualifiche caricato e funzioni esposte globalmente");
}