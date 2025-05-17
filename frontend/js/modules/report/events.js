/**
 * modules/report/events.js - Gestione eventi per i report
 */
import reportState from './state.js';
import ReportUI from './ui.js';
import ReportAPI from './api.js';
import { Notifications, Utils } from '../../main.js';
import { REPORT_CONFIG } from './config.js';

export const ReportEvents = {
  debounceTimer: null,

  setupEventListeners() {
    console.log('ReportEvents: Setup event listeners...');
    
    // Form generate report
    const generaBtn = document.getElementById('generaReportBtn');
    if (generaBtn) {
      generaBtn.addEventListener('click', this.handleGenerateReport.bind(this));
    }
    
    // Pulisci filtri
    const pulisciBtn = document.getElementById('pulisciFiltriBtn');
    if (pulisciBtn) {
      pulisciBtn.addEventListener('click', this.handleClearFilters.bind(this));
    }
    
    // Evento per il cambio del mese
    const meseSelect = document.getElementById('meseSelezionato');
    if (meseSelect) {
      meseSelect.addEventListener('change', this.handleMonthSelect.bind(this));
    }
    
    // Ricerca dipendenti
    const searchInput = document.getElementById('dipendenteSearch');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleEmployeeSearch.bind(this));
    }

    // Cambio formato
    const formatoSelect = document.getElementById('formatoSelect');
    if (formatoSelect) {
      formatoSelect.addEventListener('change', this.handleFormatChange.bind(this));
    }

    // Cambio sede
    const sedeSelect = document.getElementById('sedeSelect');
    if (sedeSelect) {
      sedeSelect.addEventListener('change', this.handleSedeChange.bind(this));
    }

    // Cambio dipendente
    const dipendenteSelect = document.getElementById('dipendenteSelect');
    if (dipendenteSelect) {
      dipendenteSelect.addEventListener('change', this.handleEmployeeChange.bind(this));
    }

    // Date change
    const dataInizio = document.getElementById('dataInizio');
    const dataFine = document.getElementById('dataFine');
    
    if (dataInizio) {
      dataInizio.addEventListener('change', this.handleDateChange.bind(this));
    }
    
    if (dataFine) {
      dataFine.addEventListener('change', this.handleDateChange.bind(this));
    }
  },

  async handleGenerateReport() {
    if (reportState.isLoadingData()) return;
    
    // Raccogli filtri
    const filters = {
      employeeId: document.getElementById('dipendenteSelect')?.value || '',
      startDate: document.getElementById('dataInizio')?.value || '',
      endDate: document.getElementById('dataFine')?.value || '',
      sede: document.getElementById('sedeSelect')?.value || '',
      formato: document.getElementById('formatoSelect')?.value || 'html'
    };
    
    // Validazione date
    if (!filters.startDate || !filters.endDate) {
      Notifications.warning(REPORT_CONFIG.MESSAGES.SELECT_PERIOD);
      return;
    }

    // Verifica se la data di inizio è maggiore della data di fine
    if (filters.startDate > filters.endDate) {
      Notifications.warning(REPORT_CONFIG.MESSAGES.PERIOD_INVALID);
      return;
    }
    
    // Se il formato è diverso da HTML, esporta direttamente
    if (filters.formato !== 'html') {
      this.handleExportReport(filters.formato, filters);
      return;
    }
    
    // Aggiorna lo stato
    reportState.setCurrentFilters(filters);
    
    reportState.setLoading(true);
    ReportUI.showLoading();
    
    try {
      const data = await ReportAPI.loadReportData(filters);
      
      // Aggiorna lo stato
      reportState.setReportData(data);
      
      // Visualizza il report
      ReportUI.renderReport();
      
      // Mostra il messaggio di conferma solo se ci sono dati
      if (data && data.length > 0) {
        Notifications.success(REPORT_CONFIG.MESSAGES.FILTER_APPLIED);
      }
    } catch (error) {
      console.error('Errore nel caricamento del report:', error);
      Notifications.error(REPORT_CONFIG.MESSAGES.ERROR_LOADING);
      ReportUI.showError(REPORT_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      reportState.setLoading(false);
    }
  },

  handleClearFilters() {
    // Reset dei filtri
    reportState.clearFilters();
    
    // Resetta i campi del form
    const dipendenteSearchInput = document.getElementById('dipendenteSearch');
    if (dipendenteSearchInput) dipendenteSearchInput.value = '';
    
    const meseSelect = document.getElementById('meseSelezionato');
    if (meseSelect) meseSelect.value = '';
    
    const formatoSelect = document.getElementById('formatoSelect');
    if (formatoSelect) formatoSelect.selectedIndex = 0;
    
    // Ripristina i select
    ReportUI.populateDipendentiSelect();
    ReportUI.populateSedeSelect();
    
    // Imposta le date di default
    ReportUI.setFilterDates(
      REPORT_CONFIG.DEFAULT_PERIOD.start,
      REPORT_CONFIG.DEFAULT_PERIOD.end
    );
    
    // Pulisci il report container
    const reportContainer = document.getElementById('report-container');
    if (reportContainer) {
      reportContainer.innerHTML = `
        <div id="report-placeholder" class="text-center py-5 text-muted">
          <i class="bi bi-graph-up" style="font-size: 3rem;"></i>
          <p class="mt-3">Seleziona i parametri e clicca "Genera" per visualizzare il report</p>
        </div>
      `;
    }

    // Notifica utente
    Notifications.info("Filtri ripristinati");
  },

  handleMonthSelect(e) {
    const monthValue = e.target.value;
    
    if (monthValue) {
      // Formato: YYYY-MM
      const [year, month] = monthValue.split('-');
      
      // Calcola il primo e l'ultimo giorno del mese
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Formatta le date in YYYY-MM-DD
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Imposta le date nel form
      ReportUI.setFilterDates(startDateStr, endDateStr);

      // Aggiorna lo stato con le nuove date
      reportState.setCurrentFilters({
        startDate: startDateStr,
        endDate: endDateStr
      });
    }
  },

  handleEmployeeSearch(e) {
    const searchText = e.target.value;

    // Clear any existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the search to avoid too many UI updates
    this.debounceTimer = setTimeout(() => {
      // Update UI with filtered employees
      if (searchText.length >= REPORT_CONFIG.SEARCH_MIN_LENGTH || searchText.length === 0) {
        ReportUI.filterDipendentiSelect(searchText);
      }
    }, REPORT_CONFIG.DEBOUNCE_DELAY);
  },

  handleFormatChange(e) {
    const format = e.target.value;
    reportState.setCurrentFilters({ formato: format });
  },

  handleSedeChange(e) {
    const sede = e.target.value;
    reportState.setCurrentFilters({ sede: sede });
  },

  handleEmployeeChange(e) {
    const employeeId = e.target.value;
    reportState.setCurrentFilters({ employeeId: employeeId });
  },

  handleDateChange() {
    const startDate = document.getElementById('dataInizio').value;
    const endDate = document.getElementById('dataFine').value;
    
    if (startDate && endDate) {
      reportState.setCurrentFilters({
        startDate: startDate,
        endDate: endDate
      });
    }
  },

  async handleExportReport(format, filters) {
    try {
      await ReportAPI.exportReport(format, filters);
      Notifications.success(REPORT_CONFIG.MESSAGES.EXPORT_SUCCESS);
    } catch (error) {
      console.error('Errore nell\'esportazione del report:', error);
      Notifications.error(REPORT_CONFIG.MESSAGES.EXPORT_ERROR);
    }
  }
};

export default ReportEvents;