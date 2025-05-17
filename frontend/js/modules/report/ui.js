/**
 * modules/report/ui.js - Gestione interfaccia utente per i report
 */
import { Utils } from '../../main.js';
import reportState from './state.js';
import { REPORT_CONFIG } from './config.js';

export const ReportUI = {
  populateDipendentiSelect() {
    const select = document.getElementById('dipendenteSelect');
    if (!select) return;
    
    const dipendenti = reportState.getDipendenti();
    
    // Mantieni l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    
    if (defaultOption) {
      select.appendChild(defaultOption);
    } else {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '-- Seleziona dipendente --';
      select.appendChild(option);
    }
    
    // Aggiungi le opzioni
    dipendenti.forEach(dip => {
      const option = document.createElement('option');
      option.value = dip.id;
      const descrizione = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ''} - ${dip.sede || ''}`;
      option.textContent = descrizione;
      select.appendChild(option);
    });
    
    // Ripristina il valore selezionato
    const currentFilters = reportState.getCurrentFilters();
    if (currentFilters.employee_id) {
      select.value = currentFilters.employee_id;
    }
  },

  populateSedeSelect() {
    const select = document.getElementById('sedeSelect');
    if (!select) return;
    
    const sedi = reportState.getSedi();
    
    // Mantieni l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    
    if (defaultOption) {
      select.appendChild(defaultOption);
    } else {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '-- Tutte le sedi --';
      select.appendChild(option);
    }
    
    // Aggiungi le opzioni
    sedi.forEach(sede => {
      const option = document.createElement('option');
      option.value = sede.nome;
      option.textContent = sede.nome;
      select.appendChild(option);
    });
    
    // Ripristina il valore selezionato
    const currentFilters = reportState.getCurrentFilters();
    if (currentFilters.sede) {
      select.value = currentFilters.sede;
    }
  },

  setFilterDates(startDate, endDate) {
    const startDateInput = document.getElementById('dataInizio');
    const endDateInput = document.getElementById('dataFine');
    
    if (startDateInput && startDate) {
      startDateInput.value = startDate;
    }
    
    if (endDateInput && endDate) {
      endDateInput.value = endDate;
    }
  },

  showLoading() {
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;
    
    reportContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento...</span>
        </div>
        <p class="mt-3">${REPORT_CONFIG.MESSAGES.LOADING}</p>
      </div>
    `;
  },

  showError(message) {
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;
    
    reportContainer.innerHTML = `
      <div class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
        <p class="mt-3">${message}</p>
      </div>
    `;
  },

  showNoData(message = REPORT_CONFIG.MESSAGES.NO_DATA) {
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;
    
    reportContainer.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-bar-chart" style="font-size: 3rem;"></i>
        <p class="mt-3">${message}</p>
      </div>
    `;
  },

  renderReport() {
    const reportData = reportState.getReportData();
    const summary = reportState.getSummary();
    
    if (!reportData || reportData.length === 0) {
      this.showNoData(REPORT_CONFIG.MESSAGES.NO_RESULTS);
      return;
    }
    
    const reportContainer = document.getElementById('report-container');
    if (!reportContainer) return;
    
    // Costruisco l'HTML del report
    let html = `
      <div class="mb-4">
        <h5>Riepilogo Ore</h5>
        <div class="row">
          <div class="col-md-6">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Ore Feriali Diurne:</td>
                  <td class="text-end"><strong>${summary.feriali_diurne.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Ore Feriali Notturne:</td>
                  <td class="text-end"><strong>${summary.feriali_notturne.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Ore Festive Diurne:</td>
                  <td class="text-end"><strong>${summary.festive_diurne.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Ore Festive Notturne:</td>
                  <td class="text-end"><strong>${summary.festive_notturne.toFixed(2)}</strong></td>
                </tr>
                <tr class="table-info">
                  <td><strong>Totale Ore:</strong></td>
                  <td class="text-end"><strong>${summary.totale_ore.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead class="table-primary">
            <tr>
              <th>Dipendente</th>
              <th>Qualifica</th>
              <th>Sede</th>
              <th>Data</th>
              <th>Ingresso</th>
              <th>Uscita</th>
              <th class="text-center">Feriali D.</th>
              <th class="text-center">Feriali N.</th>
              <th class="text-center">Festive D.</th>
              <th class="text-center">Festive N.</th>
              <th class="text-center">Totale</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Aggiungo le righe
    reportData.forEach(item => {
      html += `
        <tr>
          <td>${item.cognome} ${item.nome}</td>
          <td>${item.qualifica || '-'}</td>
          <td>${item.sede || '-'}</td>
          <td>${this.formatDate(item.entry_date)}</td>
          <td>${this.formatTime(item.entry_time)}</td>
          <td>${this.formatTime(item.exit_time)}</td>
          <td class="text-center">${parseFloat(item.feriali_diurne).toFixed(2)}</td>
          <td class="text-center">${parseFloat(item.feriali_notturne).toFixed(2)}</td>
          <td class="text-center">${parseFloat(item.festive_diurne).toFixed(2)}</td>
          <td class="text-center">${parseFloat(item.festive_notturne).toFixed(2)}</td>
          <td class="text-center"><strong>${parseFloat(item.totale_ore).toFixed(2)}</strong></td>
        </tr>
      `;
    });
    
    // Chiudo la tabella
    html += `
          </tbody>
        </table>
      </div>
      <div class="mt-3 text-end">
        <button onclick="stampaReport()" class="btn btn-outline-secondary">
          <i class="bi bi-printer"></i> Stampa
        </button>
        <button onclick="esportaExcel()" class="btn btn-success ms-2">
          <i class="bi bi-file-excel"></i> Excel
        </button>
        <button onclick="esportaPdf()" class="btn btn-danger ms-2">
          <i class="bi bi-file-pdf"></i> PDF
        </button>
      </div>
    `;
    
    reportContainer.innerHTML = html;
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Errore nella formattazione della data:', error);
      return dateStr;
    }
  },

  formatTime(timeStr) {
    if (!timeStr) return '-';
    
    // Se è già in formato HH:MM, ritorni solo le prime 5 cifre
    if (timeStr.includes(':')) {
      return timeStr.substring(0, 5);
    }
    
    return timeStr;
  }
};

export default ReportUI;