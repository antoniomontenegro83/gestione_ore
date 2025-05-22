/**
 * modules/time-entry/events.js - Gestione eventi per l'inserimento turni
 */
import timeEntryState from './state.js';
import TimeEntryUI from './ui.js';
import TimeEntryAPI from './api.js';
import TimeEntryCalculator from './calculator.js';
import PreviewCalculator from './preview-calculator.js';
import PreviewRenderer from './preview-renderer.js';
import { Notifications } from '../../main.js';
import { TIME_ENTRY_CONFIG } from './config.js';

export const TimeEntryEvents = {
  debounceTimer: null,
  calculationTimer: null,
  previewRenderer: null,

  setupEventListeners() {
    console.log('TimeEntryEvents: Setup event listeners...');
    
    // Inizializza il preview renderer
    this.previewRenderer = new PreviewRenderer();
    const form = document.getElementById('shift-form');
    
    if (form) {
      console.log('TimeEntryEvents: Form trovato, inizializzo preview');
      this.previewRenderer.init(form);
    } else {
      console.error('TimeEntryEvents: Form non trovato!');
    }

    // Inizializza le date con la data odierna
    this.initializeDates();

    // Form submit
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    // Ricerca dipendenti
    const searchInput = document.getElementById('employee-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleEmployeeSearch.bind(this));
    }
    
    // Cambio dipendente
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
      employeeSelect.addEventListener('change', this.handleEmployeeChange.bind(this));
    }
    
    // Cambio sede
    const sedeSelect = document.getElementById('entry_sede');
    if (sedeSelect) {
      sedeSelect.addEventListener('change', this.handleSedeChange.bind(this));
    }
    
    // Eventi per il calcolo automatico
    this.setupDateTimeListeners();
  },

  initializeDates() {
    // Ottieni la data odierna
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    // Imposta i campi data con la data odierna
    const entryDateInput = document.getElementById('entry_date');
    const exitDateInput = document.getElementById('exit_date');
    
    if (entryDateInput && !entryDateInput.value) {
      entryDateInput.value = todayString;
    }
    
    if (exitDateInput && !exitDateInput.value) {
      exitDateInput.value = todayString;
    }
    
    console.log('TimeEntryEvents: Date inizializzate con oggi:', todayString);
  },

  setupDateTimeListeners() {
    const fields = ['entry_date', 'entry_time', 'exit_date', 'exit_time'];
    
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.addEventListener('change', () => this.handleDateTimeChange());
        element.addEventListener('input', () => this.handleDateTimeChange());
      }
    });
  },

  handleEmployeeSearch(e) {
    const searchText = e.target.value;
    timeEntryState.setEmployeeSearchFilter(searchText);
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      if (searchText.length >= TIME_ENTRY_CONFIG.SEARCH_MIN_LENGTH || searchText.length === 0) {
        const filteredDipendenti = timeEntryState.getFilteredDipendenti(searchText);
        TimeEntryUI.populateDipendentiSelect(filteredDipendenti);
      }
    }, TIME_ENTRY_CONFIG.DEBOUNCE_DELAY);
  },

  handleEmployeeChange(e) {
    const employeeId = e.target.value;
    timeEntryState.setSelectedEmployee(employeeId);
    
    // Trigger calcolo se ci sono già date inserite
    this.handleDateTimeChange();
  },

  handleSedeChange(e) {
    // Trigger calcolo se necessario
    this.handleDateTimeChange();
  },

  handleDateTimeChange() {
    if (this.calculationTimer) {
      clearTimeout(this.calculationTimer);
    }
    
    this.calculationTimer = setTimeout(() => {
      this.calculatePreview();
    }, TIME_ENTRY_CONFIG.PREVIEW_UPDATE_DELAY);
  },

  async calculatePreview() {
    console.log('TimeEntryEvents: calculatePreview chiamato');
    
    const entryDate = document.getElementById('entry_date')?.value;
    const entryTime = document.getElementById('entry_time')?.value;
    const exitDate = document.getElementById('exit_date')?.value;
    const exitTime = document.getElementById('exit_time')?.value;
    
    // Se non ci sono tutti i dati necessari, mostra preview vuota
    if (!entryDate || !entryTime || !exitDate || !exitTime) {
      console.log('TimeEntryEvents: Campi mancanti, mostro preview vuota');
      this.previewRenderer.mostraVuoto();
      return;
    }
    
    console.log('TimeEntryEvents: Dati completi, procedo con il calcolo', {
      entryDate, entryTime, exitDate, exitTime
    });
    
    // Valida le date
    const validation = TimeEntryCalculator.validateDates(entryDate, entryTime, exitDate, exitTime);
    if (!validation.valid) {
      console.log('TimeEntryEvents: Validazione fallita', validation.message);
      this.previewRenderer.mostraErrore(validation.message);
      return;
    }
    
    // Se già in calcolo, evita richieste multiple
    if (timeEntryState.isCalculatingPreview()) {
      console.log('TimeEntryEvents: Già in calcolo, esco');
      return;
    }
    
    timeEntryState.setCalculating(true);
    this.previewRenderer.setLoading(true);
    
    try {
      const previewData = {
        entry_date: entryDate,
        entry_time: entryTime,
        exit_date: exitDate,
        exit_time: exitTime
      };
      
      console.log('TimeEntryEvents: Invio richiesta calcolo', previewData);
      
      // Usa PreviewCalculator per il calcolo
      const calcolo = await PreviewCalculator.calcola(previewData);
      console.log('TimeEntryEvents: Calcolo ricevuto', calcolo);
      
      const risultatoFormattato = PreviewCalculator.formatRisultato(calcolo);
      console.log('TimeEntryEvents: Risultato formattato', risultatoFormattato);
      
      timeEntryState.setCurrentPreview(calcolo);
      this.previewRenderer.mostraRisultato(risultatoFormattato);
      
    } catch (error) {
      console.error('TimeEntryEvents: Errore nel calcolo preview:', error);
      this.previewRenderer.mostraErrore(error.message || TIME_ENTRY_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      timeEntryState.setCalculating(false);
      this.previewRenderer.setLoading(false);
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    if (timeEntryState.isLoadingData()) return;
    
    // Raccogli i dati del form
    const formData = {
      employee_id: document.getElementById('employee_id').value,
      entry_date: document.getElementById('entry_date').value,
      entry_time: document.getElementById('entry_time').value,
      exit_date: document.getElementById('exit_date').value,
      exit_time: document.getElementById('exit_time').value,
      sede: document.getElementById('entry_sede').value
    };
    
    // Validazione
    const validation = this.validateFormData(formData);
    if (!validation.valid) {
      Notifications.warning(validation.message);
      return;
    }
    
    timeEntryState.setLoading(true);
    
    try {
      const result = await TimeEntryAPI.saveTurno(formData);
      
      if (result.success) {
        Notifications.success(TIME_ENTRY_CONFIG.MESSAGES.SAVE_SUCCESS);
        
        // Pulisci il form e mantieni la data di oggi
        this.clearFormAndReinitialize();
        
        // Mostra il modale di successo
        const successModal = document.getElementById('successModal');
        if (successModal) {
          const modalInstance = new bootstrap.Modal(successModal);
          modalInstance.show();
        }
      } else {
        // Gestione errori specifici
        if (result.errorType === 'duplicate_shift') {
          Notifications.error(TIME_ENTRY_CONFIG.MESSAGES.DUPLICATE_SHIFT);
        } else {
          Notifications.error(result.error || TIME_ENTRY_CONFIG.MESSAGES.SAVE_ERROR);
        }
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      Notifications.error(TIME_ENTRY_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      timeEntryState.setLoading(false);
    }
  },

  clearFormAndReinitialize() {
    // Pulisci il form
    TimeEntryUI.clearForm();
    
    // Reinizializza le date con la data odierna
    this.initializeDates();
    
    // Mostra preview vuota
    this.previewRenderer.mostraVuoto();
    
    // CORREZIONE: Ricarica la lista completa dei dipendenti e ripristina la search
    const searchInput = document.getElementById('employee-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Ripopola il select con tutti i dipendenti
    TimeEntryUI.populateDipendentiSelect();
    
    // Resetta anche lo stato della ricerca
    timeEntryState.setEmployeeSearchFilter('');
    timeEntryState.setSelectedEmployee(null);
  },

  validateFormData(formData) {
    if (!formData.employee_id) {
      return { valid: false, message: TIME_ENTRY_CONFIG.MESSAGES.VALIDATION_EMPLOYEE };
    }
    
    if (!formData.entry_date || !formData.entry_time || !formData.exit_date || !formData.exit_time) {
      return { valid: false, message: TIME_ENTRY_CONFIG.MESSAGES.VALIDATION_DATES };
    }
    
    // Valida la sequenza delle date
    const dateValidation = TimeEntryCalculator.validateDates(
      formData.entry_date,
      formData.entry_time,
      formData.exit_date,
      formData.exit_time
    );
    
    if (!dateValidation.valid) {
      return { valid: false, message: dateValidation.message };
    }
    
    return { valid: true };
  }
};

export default TimeEntryEvents;