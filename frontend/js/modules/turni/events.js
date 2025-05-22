/**
 * modules/turni/events.js - Gestione eventi per turni
 */
import turniState from './state.js';
import TurniUI from './ui.js';
import TurniAPI from './api.js';
import { Notifications, Utils } from '../../main.js';
import { TURNI_CONFIG } from './config.js';

export const TurniEvents = {
  setupEventListeners() {
    // Listener per il pulsante di filtro
    this.setupFilterButton();
    
    // Listener per il pulsante di pulizia filtri
    this.setupClearButton();
    
    // Listener per il cambio del dipendente selezionato
    this.setupDipendenteSelect();
    
    // Listener per la ricerca dipendenti
    this.setupDipendenteSearch();
    
    // Listener per il form di modifica
    this.setupModifyForm();
    
    // Listener per il pulsante di conferma eliminazione
    this.setupDeleteConfirmation();
  },

  setupFilterButton() {
    const filterBtn = document.querySelector('.btn-primary[onclick*="filtraTurni"]');
    if (filterBtn) {
      filterBtn.removeAttribute('onclick');
      filterBtn.addEventListener('click', this.handleFilter.bind(this));
    }
  },

  setupClearButton() {
    const clearBtn = document.querySelector('.btn-outline-secondary[onclick*="pulisciFiltri"]');
    if (clearBtn) {
      clearBtn.removeAttribute('onclick');
      clearBtn.addEventListener('click', this.handleClearFilters.bind(this));
    }
  },

  setupDipendenteSelect() {
    const select = document.getElementById('dipendenteSelect');
    if (select) {
      select.addEventListener('change', this.handleFilter.bind(this));
    }
  },

  setupDipendenteSearch() {
    const searchInput = document.getElementById('dipendenteSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length >= TURNI_CONFIG.SEARCH_MIN_LENGTH || value.length === 0) {
          TurniUI.populateDipendenteSelect(value);
          
          // Se c'è un solo risultato, selezionalo automaticamente
          if (value.length >= TURNI_CONFIG.SEARCH_MIN_LENGTH) {
            setTimeout(() => {
              const select = document.getElementById('dipendenteSelect');
              if (select && select.options.length === 2) {
                select.selectedIndex = 1;
                this.handleFilter();
              }
            }, 100);
          }
        }
      });
    }
  },

  setupModifyForm() {
    const form = document.getElementById('formModificaTurno');
    if (form) {
      form.addEventListener('submit', this.handleModifyTurno.bind(this));
    }
  },

  setupDeleteConfirmation() {
    const confirmBtn = document.getElementById('confermaEliminazioneBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', this.handleDeleteConfirmation.bind(this));
    }
  },

  handleFilter() {
    const filters = {
      dipendente: document.getElementById('dipendenteSelect')?.value || '',
      dataInizio: document.getElementById('dataInizio')?.value || '',
      dataFine: document.getElementById('dataFine')?.value || ''
    };
    
    turniState.setCurrentFilters(filters);
    turniState.applyFilters();
    TurniUI.renderTable();
  },

  handleClearFilters() {
    turniState.setCurrentFilters({
      dipendente: '',
      dataInizio: '',
      dataFine: '',
      searchText: ''
    });
    
    TurniUI.clearFilters();
    TurniUI.populateDipendenteSelect();
    turniState.applyFilters();
    TurniUI.renderTable();
  },

  async handleModifyTurno(e) {
    e.preventDefault();
    
    if (turniState.isLoadingData()) return;
    
    const id = parseInt(document.getElementById('modificaId').value);
    const ingresso = document.getElementById('modificaIngresso').value;
    const uscita = document.getElementById('modificaUscita').value;
    const sede = document.getElementById('modificaSede').value;
    
    // Valida le date
    if (!this.validateDates(ingresso, uscita)) {
      return;
    }
    
    turniState.setLoading(true);
    
    try {
      const result = await TurniAPI.updateTurno({ 
        id, 
        ingresso, 
        uscita,
        sede: sede || null
      });
      
      if (result.success) {
        Notifications.success(TURNI_CONFIG.MESSAGES.SUCCESS_UPDATE);
        
        // Chiudi il modale
        const modalElement = document.getElementById('modaleModifica');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        
        // Aggiorna il turno localmente per un refresh istantaneo
        const [entry_date, entry_time] = ingresso.split('T');
        const [exit_date, exit_time] = uscita.split('T');
        
        turniState.updateTurno({
          id: id,
          entry_date: entry_date,
          entry_time: entry_time + ':00',
          exit_date: exit_date,
          exit_time: exit_time + ':00',
          sede: sede || null
        });
        
        // Ricarica la vista immediatamente
        TurniUI.renderTable();
        
        // Poi ricarica i dati dal server per sincronizzazione
        const turniManager = window.turniManager;
        if (turniManager) {
          await turniManager.loadTurni();
        }
      } else {
        Notifications.error(TURNI_CONFIG.MESSAGES.ERROR_UPDATE + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante la modifica:", error);
      Notifications.error(TURNI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      turniState.setLoading(false);
    }
  },

  async handleDeleteConfirmation() {
    const idToDelete = turniState.getTurnoToDelete();
    if (!idToDelete) return;
    
    // Chiudi il modale
    const modalElement = document.getElementById('modaleConfermaEliminazione');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (turniState.isLoadingData()) return;
    turniState.setLoading(true);
    
    try {
      const result = await TurniAPI.deleteTurno(idToDelete);
      
      if (result.success) {
        Notifications.success(TURNI_CONFIG.MESSAGES.SUCCESS_DELETE);
        
        // Aggiorna lo stato
        turniState.removeTurno(idToDelete);
        
        // Ricarica la tabella
        TurniUI.renderTable();
      } else {
        Notifications.error(TURNI_CONFIG.MESSAGES.ERROR_DELETE + ': ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Notifications.error(TURNI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      turniState.setLoading(false);
      turniState.clearTurnoToDelete();
    }
  },

  validateDates(ingresso, uscita) {
    const dataIngresso = new Date(ingresso);
    const dataUscita = new Date(uscita);
    
    if (dataUscita <= dataIngresso) {
      Notifications.warning(TURNI_CONFIG.MESSAGES.VALIDATION_ERROR);
      return false;
    }
    
    return true;
  }
};

export default TurniEvents;