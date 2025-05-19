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
    
    // Aggiungi le opzioni ordinate
    const sortedDipendenti = [...dipendenti].sort((a, b) => {
      const cognomeA = a.cognome || '';
      const cognomeB = b.cognome || '';
      return cognomeA.localeCompare(cognomeB) || 
             (a.nome || '').localeCompare(b.nome || '');
    });
    
    // Aggiungi le opzioni
    sortedDipendenti.forEach(dip => {
      const option = document.createElement('option');
      option.value = dip.employee_id || dip.id;
      const qualifica = dip.qualifica ? ` - ${dip.qualifica}` : '';
      const sede = dip.sede ? ` - ${dip.sede}` : '';
      const descrizione = `${dip.cognome} ${dip.nome}${qualifica}${sede}`;
      option.textContent = descrizione;
      option.dataset.searchable = descrizione.toLowerCase();
      select.appendChild(option);
    });
    
    // Ripristina il valore selezionato
    const currentFilters = reportState.getCurrentFilters();
    if (currentFilters.employeeId) {
      select.value = currentFilters.employeeId;
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
      option.value = sede.nome || sede.sede; // Supporto per entrambi i formati
      option.textContent = sede.nome || sede.sede;
      select.appendChild(option);
    });
    
    // Ripristina il valore selezionato
    const currentFilters = reportState.getCurrentFilters();
    if (currentFilters.sede) {
      select.value = currentFilters.sede;
    }
  },

  filterDipendentiSelect(searchText) {
    const select = document.getElementById('dipendenteSelect');
    if (!select) return;
    
    const searchLower = searchText.toLowerCase();
    
    // Mostra/nascondi le opzioni in base alla ricerca
    Array.from(select.options).forEach(option => {
      if (option.value === '') return; // Mantieni sempre l'opzione predefinita
      
      const searchable = option.dataset.searchable || option.textContent.toLowerCase();
      const visible = !searchText || searchable.includes(searchLower);
      
      // Utilizziamo la manipolazione diretta del DOM per performance migliori
      option.style.display = visible ? '' : 'none';
    });
    
    // Se c'è un solo risultato visibile, selezionalo automaticamente
    if (searchText.length >= REPORT_CONFIG.SEARCH_MIN_LENGTH) {
      const visibleOptions = Array.from(select.options).filter(opt => 
        opt.value !== '' && opt.style.display !== 'none'
      );
      
      if (visibleOptions.length === 1) {
        select.value = visibleOptions[0].value;
        
        // Aggiorna lo stato
        reportState.setCurrentFilters({
          employeeId: visibleOptions[0].value
        });
      }
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
                  <td>Ore Festive e Notturne:</td>
                  <td class="text-end"><strong>${(summary.feriali_notturne + summary.festive_diurne).toFixed(2)}</strong></td>
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
              <th style="width: 8%;">Qualifica</th>
              <th style="width: 18%;">Dipendente</th>
              <th style="width: 12%;">Sede</th>
              <th style="width: 10%;">Data</th>
              <th style="width: 7%;">Ingresso</th>
              <th style="width: 7%;">Uscita</th>
              <th class="text-center" style="width: 12%"><div style="line-height: 1.2;">Feriali<br>Diurne</div></th>
              <th class="text-center" style="width: 12%"><div style="line-height: 1.2;">Festive e<br>Notturne</div></th>
              <th class="text-center" style="width: 12%"><div style="line-height: 1.2;">Festive<br>Notturne</div></th>
              <th class="text-center" style="width: 9%">Totale</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Aggiungo le righe
    reportData.forEach(item => {
      // Calcola la somma delle feriali notturne e festive diurne
      const festivoENotturno = parseFloat(item.feriali_notturne) + parseFloat(item.festive_diurne);
      
      html += `
        <tr>
          <td>${item.qualifica || '-'}</td>
          <td>${item.cognome} ${item.nome}</td>
          <td>${item.sede || '-'}</td>
          <td>${this.formatDate(item.entry_date)}</td>
          <td>${this.formatTime(item.entry_time)}</td>
          <td>${this.formatTime(item.exit_time)}</td>
          <td class="text-center">${parseFloat(item.feriali_diurne).toFixed(2)}</td>
          <td class="text-center">${festivoENotturno.toFixed(2)}</td>
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