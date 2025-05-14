/**
 * modules/new-dipendente/index.js - Entry point per il modulo nuovo dipendente
 */
import { Auth, Notifications } from '../../main.js';
import newDipendenteState from './state.js';
import NewDipendenteAPI from './api.js';
import NewDipendenteUI from './ui.js';
import NewDipendenteEvents from './events.js';
import { NEW_DIPENDENTE_CONFIG } from './config.js';

class NewDipendenteManager {
  constructor() {
    this.state = newDipendenteState;
    this.api = NewDipendenteAPI;
    this.ui = NewDipendenteUI;
    this.events = NewDipendenteEvents;
  }

  async init() {
    console.log('Inizializzazione NewDipendente Manager...');
    
    // Verifica autenticazione
    if (!this.checkAuth()) return;
    
    try {
      // Carica i dati iniziali
      await this.loadInitialData();
      
      // Configura gli event listener
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
      console.log('Caricamento dati iniziali...');
      
      // Carica dati in parallelo
      const [qualifiche, sedi] = await Promise.all([
        this.api.loadQualifiche(),
        this.api.loadSedi()
      ]);
      
      // Verifica formato dati
      if (!Array.isArray(qualifiche)) {
        console.error('Formato qualifiche non valido:', qualifiche);
        throw new Error(NEW_DIPENDENTE_CONFIG.MESSAGES.INVALID_DATA_FORMAT);
      }
      
      if (!Array.isArray(sedi)) {
        console.error('Formato sedi non valido:', sedi);
        throw new Error(NEW_DIPENDENTE_CONFIG.MESSAGES.INVALID_DATA_FORMAT);
      }
      
      // Aggiorna lo stato
      this.state.setQualifiche(qualifiche);
      this.state.setSedi(sedi);
      
      console.log(`Caricate ${qualifiche.length} qualifiche e ${sedi.length} sedi`);
      
      // Popola i select
      this.ui.populateQualificheSelect();
      this.ui.populateSediSelect();
      
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      throw error;
    } finally {
      this.state.setLoading(false);
    }
  }
}

// Crea l'istanza del manager
const newDipendenteManager = new NewDipendenteManager();

// Esporta il manager
export default newDipendenteManager;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  newDipendenteManager.init();
});

// Esponi le funzioni globalmente per compatibilità con onclick nell'HTML
if (typeof window !== 'undefined') {
  window.newDipendenteManager = newDipendenteManager;
  
  // Compatibilità con le chiamate esistenti
  window.caricaQualifiche = () => newDipendenteManager.ui.populateQualificheSelect();
  window.caricaSedi = () => newDipendenteManager.ui.populateSediSelect();
  window.handleSubmit = (e) => newDipendenteManager.events.handleSubmit(e);
  
  console.log('Modulo new-dipendente caricato e funzioni esposte globalmente');
}