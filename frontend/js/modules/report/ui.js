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

  // Nuova funzione per convertire ore decimali in formato HH:MM
  convertToHoursMinutes(decimalHours) {
    if (isNaN(decimalHours) || decimalHours === null) return "0:00";
    
    // Converte il valore decimale in ore e minuti
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    
    // Gestisce il caso in cui i minuti arrivano a 60
    if (minutes === 60) {
      return `${hours + 1}:00`;
    }
    
    // Formatta l'output con 0 davanti ai minuti se necessario
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
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
    
    // Calcola la somma di feriali_notturne e festive_diurne per il sommario
    const ferialiFestiveNotturne = summary.feriali_notturne + summary.festive_diurne;
    
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
                  <td class="text-end"><strong>${this.convertToHoursMinutes(summary.feriali_diurne)}</strong></td>
                </tr>
                <tr>
                  <td>Ore Festive o Notturne:</td>
                  <td class="text-end"><strong>${this.convertToHoursMinutes(ferialiFestiveNotturne)}</strong></td>
                </tr>
                <tr>
                  <td>Ore Festive Notturne:</td>
                  <td class="text-end"><strong>${this.convertToHoursMinutes(summary.festive_notturne)}</strong></td>
                </tr>
                <tr class="table-info">
                  <td><strong>Totale Ore:</strong></td>
                  <td class="text-end"><strong>${this.convertToHoursMinutes(summary.totale_ore)}</strong></td>
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
              <th class="text-center">Feriali Diurne</th>
              <th class="text-center" style="min-width: 120px;">Festive o Notturne</th>
              <th class="text-center">Festive Notturne</th>
              <th class="text-center">Totale</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Aggiungo le righe
    reportData.forEach(item => {
      // Calcola la somma delle ore feriali notturne e festive diurne
      const ferialiFestiveNotturne = parseFloat(item.feriali_notturne) + parseFloat(item.festive_diurne);
      
      html += `
        <tr>
          <td>${item.cognome} ${item.nome}</td>
          <td>${item.qualifica || '-'}</td>
          <td>${item.sede || '-'}</td>
          <td>${this.formatDate(item.entry_date)}</td>
          <td>${this.formatTime(item.entry_time)}</td>
          <td>${this.formatTime(item.exit_time)}</td>
          <td class="text-center">${this.convertToHoursMinutes(parseFloat(item.feriali_diurne))}</td>
          <td class="text-center">${this.convertToHoursMinutes(ferialiFestiveNotturne)}</td>
          <td class="text-center">${this.convertToHoursMinutes(parseFloat(item.festive_notturne))}</td>
          <td class="text-center"><strong>${this.convertToHoursMinutes(parseFloat(item.totale_ore))}</strong></td>
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