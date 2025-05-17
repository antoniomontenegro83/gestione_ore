/**
 * modules/report/events.js - Gestione eventi per i report
 */
import reportState from './state.js';
import ReportUI from './ui.js';
import ReportAPI from './api.js';
import { Notifications } from '../../main.js';
import { REPORT_CONFIG } from './config.js';

export const ReportEvents = {
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
  },

  async handleGenerateReport() {
    if (reportState.isLoadingData()) return;
    
    // Raccogli filtri
    const filters = {
      employee_id: document.getElementById('dipendenteSelect')?.value || '',
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
        <div class="text-center py-5 text-muted">
          <i class="bi bi-graph-up" style="font-size: 3rem;"></i>
          <p class="mt-3">Seleziona i parametri e clicca "Genera" per visualizzare il report</p>
        </div>
      `;
    }
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
    }
  },

  handleEmployeeSearch(e) {
    // Implementa la ricerca dipendenti se necessario
    // (per ora possiamo lasciare vuoto)
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