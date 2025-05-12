/**
 * report-ore.js - Logica per la pagina di report ore lavorate
 */
import { Auth, Api, Notifications, Utils } from './main.js';
import AuthCommon from './auth-common.js';

// Variabili globali
let dipendenti = [];
let sedi = [];
let isLoading = false;

// Inizializzazione al caricamento del DOM
document.addEventListener('DOMContentLoaded', async function() {
  console.log("Report Ore: DOM caricato");
  
  // Caricamento dati iniziali
  try {
    await Promise.all([
      caricaDipendentiDaCalcolo(),
      caricaSediDaCalcolo()
    ]);
    
    // Non impostiamo date di default al caricamento
    
    // Configurazione degli eventi
    setupEventListeners();
    
  } catch (error) {
    console.error("Errore durante l'inizializzazione:", error);
    Notifications.error("Errore durante il caricamento dei dati iniziali");
  }
});

/**
 * Configura i gestori degli eventi
 */
function setupEventListeners() {
  // Evento per il cambio del mese
  const meseSelezionato = document.getElementById('meseSelezionato');
  if (meseSelezionato) {
    meseSelezionato.addEventListener('change', function() {
      if (this.value) {
        // Quando si seleziona un mese, aggiorna le date di inizio e fine
        const [anno, mese] = this.value.split('-');
        const annoInt = parseInt(anno);
        const meseInt = parseInt(mese);
        
        // Primo giorno del mese selezionato
        const primoDelMese = new Date(annoInt, meseInt - 1, 1);
        // Ultimo giorno del mese selezionato
        const ultimoDelMese = new Date(annoInt, meseInt, 0);
        
        // Formatta le date in YYYY-MM-DD
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const dataInizioInput = document.getElementById('dataInizio');
        const dataFineInput = document.getElementById('dataFine');
        
        if (dataInizioInput) dataInizioInput.value = formatDate(primoDelMese);
        if (dataFineInput) dataFineInput.value = formatDate(ultimoDelMese);
        
        console.log('Date impostate:', formatDate(primoDelMese), formatDate(ultimoDelMese));
      }
    });
  }
  
  // Evento per il cambio delle date manuali
  const dataInizio = document.getElementById('dataInizio');
  const dataFine = document.getElementById('dataFine');
  
  if (dataInizio) {
    dataInizio.addEventListener('change', function() {
      // Quando si cambiano le date manualmente, resetta il mese
      const meseInput = document.getElementById('meseSelezionato');
      if (meseInput) meseInput.value = '';
    });
  }
  
  if (dataFine) {
    dataFine.addEventListener('change', function() {
      // Quando si cambiano le date manualmente, resetta il mese
      const meseInput = document.getElementById('meseSelezionato');
      if (meseInput) meseInput.value = '';
    });
  }
  
  // Configurazione della ricerca dipendenti
  const dipendenteSearch = document.getElementById('dipendenteSearch');
  if (dipendenteSearch) {
    dipendenteSearch.addEventListener('input', function(e) {
      const valore = e.target.value;
      if (valore.length >= 3) {
        popolaSelectDipendenti(valore);
      } else if (valore.length === 0) {
        popolaSelectDipendenti();
      }
    });
  }
  
  // Evento per il cambio del dipendente selezionato
  const dipendenteSelect = document.getElementById('dipendenteSelect');
  if (dipendenteSelect) {
    dipendenteSelect.addEventListener('change', function() {
      if (this.value) {
        // Se è stato selezionato un dipendente, genera automaticamente il report
        generaReport();
      }
    });
  }
  
  // Evento per il cambio della sede
  const sedeSelect = document.getElementById('sedeSelect');
  if (sedeSelect) {
    sedeSelect.addEventListener('change', function() {
      // Se c'è già un dipendente selezionato o una data valida, rigenera il report
      const dipendenteSelezionato = document.getElementById('dipendenteSelect').value;
      const dataInizio = document.getElementById('dataInizio').value;
      const dataFine = document.getElementById('dataFine').value;
      
      if ((dipendenteSelezionato || this.value) && dataInizio && dataFine) {
        generaReport();
      }
    });
  }
}

/**
 * Carica i dipendenti dalla tabella calcolo_ore
 */
async function caricaDipendentiDaCalcolo() {
  try {
    console.log("Caricamento dipendenti dalla tabella calcolo_ore...");
    dipendenti = await Api.get("report/ore.php?action=dipendenti");
    console.log("Dipendenti caricati da calcolo_ore:", dipendenti.length);
    
    // Popola il select
    popolaSelectDipendenti();
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    throw error;
  }
}

/**
 * Carica le sedi dalla tabella calcolo_ore
 */
async function caricaSediDaCalcolo() {
  try {
    console.log("Caricamento sedi dalla tabella calcolo_ore...");
    const sediData = await Api.get("report/ore.php?action=sedi");
    sedi = sediData.map(s => s.sede).filter(s => s);
    console.log("Sedi caricate da calcolo_ore:", sedi.length);
    
    const select = document.getElementById('sedeSelect');
    if (select) {
      // Mantieni l'opzione predefinita
      const defaultOption = select.options[0];
      select.innerHTML = '';
      select.appendChild(defaultOption);
      
      // Aggiungi le sedi
      sedi.forEach(sede => {
        const option = document.createElement('option');
        option.value = sede;
        option.textContent = sede;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Errore nel caricamento delle sedi:", error);
    throw error;
  }
}

/**
 * Popola il select dei dipendenti
 */
function popolaSelectDipendenti(filtro = '') {
  const select = document.getElementById('dipendenteSelect');
  if (!select) return;
  
  // Mantieni l'opzione predefinita
  const defaultOption = select.options[0];
  select.innerHTML = '';
  select.appendChild(defaultOption);
  
  // Filtra i dipendenti se necessario
  let dipendentiFiltrati = dipendenti;
  if (filtro) {
    dipendentiFiltrati = dipendenti.filter(d => {
      const testo = `${d.cognome} ${d.nome}`.toLowerCase();
      return testo.includes(filtro.toLowerCase());
    });
  }
  
  // Aggiungi i dipendenti ordinati per cognome
  dipendentiFiltrati
    .sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome))
    .forEach(dip => {
      const option = document.createElement('option');
      option.value = dip.employee_id;
      option.textContent = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ''}`;
      select.appendChild(option);
    });
    
  // Se c'è un solo risultato, selezionalo automaticamente
  if (dipendentiFiltrati.length === 1) {
    select.value = dipendentiFiltrati[0].employee_id;
    // Genera automaticamente il report
    generaReport();
  }
}

/**
 * Genera il report
 */
async function generaReport() {
  // Evita operazioni multiple
  if (isLoading) return;
  isLoading = true;
  
  try {
    // Ottieni i valori dei filtri
    const employeeId = document.getElementById('dipendenteSelect')?.value || '';
    const dataInizio = document.getElementById('dataInizio')?.value || '';
    const dataFine = document.getElementById('dataFine')?.value || '';
    const sede = document.getElementById('sedeSelect')?.value || '';
    const formato = document.getElementById('formatoSelect')?.value || 'html';
    
    // Validazione date
    if (!dataInizio || !dataFine) {
      Notifications.warning("Seleziona un periodo valido");
      isLoading = false;
      return;
    }
    
    // Se formato non è HTML, gestisci l'esportazione
    if (formato !== 'html') {
      handleDirectExport(formato, {
        employeeId,
        startDate: dataInizio,
        endDate: dataFine,
        sede
      });
      isLoading = false;
      return;
    }
    
    // Mostra loading
    const reportContainer = document.getElementById('report-container');
    if (reportContainer) {
      reportContainer.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Caricamento...</span>
          </div>
          <p class="mt-3">Generazione report in corso...</p>
        </div>
      `;
    }
    
    // Carica i turni dalla tabella calcolo_ore
    const turni = await caricaTurni(dataInizio, dataFine, employeeId, sede);
    
    // Visualizza i risultati
    visualizzaReport(turni);
    
  } catch (error) {
    console.error("Errore nella generazione del report:", error);
    Notifications.error("Errore nella generazione del report: " + Api.handleError(error));
    
    const reportContainer = document.getElementById('report-container');
    if (reportContainer) {
      reportContainer.innerHTML = `
        <div class="text-center py-5 text-danger">
          <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
          <p class="mt-3">Si è verificato un errore. Riprova più tardi.</p>
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

/**
 * Carica i turni dal server (dalla tabella calcolo_ore)
 */
async function caricaTurni(startDate, endDate, employeeId = '', sede = '') {
  try {
    // Prepara i parametri per la richiesta
    const params = { startDate, endDate };
    if (employeeId) params.employeeId = employeeId;
    if (sede) params.sede = sede;
    
    // Usa l'API per ottenere i turni dalla tabella calcolo_ore
    const turni = await Api.get("report/ore.php", params);
    console.log("Turni caricati dalla tabella calcolo_ore:", turni.length);
    
    return turni;
  } catch (error) {
    console.error("Errore nel caricamento dei turni:", error);
    throw error;
  }
}

/**
 * Visualizza il report
 */
function visualizzaReport(turni) {
  const reportContainer = document.getElementById('report-container');
  if (!reportContainer) return;
  
  // Se non ci sono dati
  if (turni.length === 0) {
    reportContainer.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-exclamation-circle" style="font-size: 3rem;"></i>
        <p class="mt-3">Nessun dato disponibile per i filtri selezionati</p>
      </div>
    `;
    return;
  }
  
  // Calcola i totali
  const sommario = {
    feriali_diurne: 0,
    feriali_notturne: 0,
    festive_diurne: 0,
    festive_notturne: 0,
    totale_ore: 0
  };
  
  // Costruisci la tabella
  let tableHTML = `
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
            <th>Feriali D.</th>
            <th>Feriali N.</th>
            <th>Festive D.</th>
            <th>Festive N.</th>
            <th>Totale</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Aggiungi le righe
  turni.forEach(turno => {
    const feriali_diurne = parseFloat(turno.feriali_diurne) || 0;
    const feriali_notturne = parseFloat(turno.feriali_notturne) || 0;
    const festive_diurne = parseFloat(turno.festive_diurne) || 0;
    const festive_notturne = parseFloat(turno.festive_notturne) || 0;
    const totale_ore = parseFloat(turno.totale_ore) || 0;
    
    sommario.feriali_diurne += feriali_diurne;
    sommario.feriali_notturne += feriali_notturne;
    sommario.festive_diurne += festive_diurne;
    sommario.festive_notturne += festive_notturne;
    sommario.totale_ore += totale_ore;
    
    tableHTML += `
      <tr>
        <td>${turno.cognome} ${turno.nome}</td>
        <td>${turno.qualifica || '-'}</td>
        <td>${turno.sede || '-'}</td>
        <td>${Utils.formatDate(turno.entry_date)}</td>
        <td>${turno.entry_time.substring(0, 5)}</td>
        <td>${turno.exit_time.substring(0, 5)}</td>
        <td>${feriali_diurne.toFixed(2)}</td>
        <td>${feriali_notturne.toFixed(2)}</td>
        <td>${festive_diurne.toFixed(2)}</td>
        <td>${festive_notturne.toFixed(2)}</td>
        <td><strong>${totale_ore.toFixed(2)}</strong></td>
      </tr>
    `;
  });
  
  // Aggiungi i totali
  tableHTML += `
        </tbody>
        <tfoot class="table-info">
          <tr>
            <td colspan="6" class="text-end"><strong>Totali:</strong></td>
            <td><strong>${sommario.feriali_diurne.toFixed(2)}</strong></td>
            <td><strong>${sommario.feriali_notturne.toFixed(2)}</strong></td>
            <td><strong>${sommario.festive_diurne.toFixed(2)}</strong></td>
            <td><strong>${sommario.festive_notturne.toFixed(2)}</strong></td>
            <td><strong>${sommario.totale_ore.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
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
  
  reportContainer.innerHTML = tableHTML;
}

/**
 * Pulisce i filtri
 */
function pulisciFiltri() {
  // Ottieni tutti gli elementi
  const dipendenteSearch = document.getElementById('dipendenteSearch');
  const dipendenteSelect = document.getElementById('dipendenteSelect');
  const sedeSelect = document.getElementById('sedeSelect');
  const formatoSelect = document.getElementById('formatoSelect');
  const meseSelezionato = document.getElementById('meseSelezionato');
  const dataInizio = document.getElementById('dataInizio');
  const dataFine = document.getElementById('dataFine');
  
  // Pulisci tutti i campi
  if (dipendenteSearch) dipendenteSearch.value = '';
  if (dipendenteSelect) dipendenteSelect.selectedIndex = 0;
  if (sedeSelect) sedeSelect.selectedIndex = 0;
  if (formatoSelect) formatoSelect.selectedIndex = 0;
  if (meseSelezionato) meseSelezionato.value = '';
  if (dataInizio) dataInizio.value = '';
  if (dataFine) dataFine.value = '';
  
  // Ripopola i select con tutti i dati
  popolaSelectDipendenti();
  
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
}

/**
 * Gestisce l'esportazione diretta del report
 */
function handleDirectExport(formato, filtri) {
  const params = new URLSearchParams();
  for (const key in filtri) {
    if (filtri[key]) {
      params.append(key, filtri[key]);
    }
  }
  
  const url = `../backend_gestione_ore/report/${formato}.php?${params.toString()}`;
  window.open(url, '_blank');
  
  Notifications.info(`Esportazione in ${formato.toUpperCase()} in fase di sviluppo`);
}

/**
 * Stampa il report
 */
function stampaReport() {
  window.print();
}

/**
 * Esporta in Excel
 */
function esportaExcel() {
  const employeeId = document.getElementById('dipendenteSelect')?.value || '';
  const dataInizio = document.getElementById('dataInizio')?.value || '';
  const dataFine = document.getElementById('dataFine')?.value || '';
  const sede = document.getElementById('sedeSelect')?.value || '';
  
  handleDirectExport('excel', {
    employeeId,
    startDate: dataInizio,
    endDate: dataFine,
    sede
  });
}

/**
 * Esporta in PDF
 */
function esportaPdf() {
  const employeeId = document.getElementById('dipendenteSelect')?.value || '';
  const dataInizio = document.getElementById('dataInizio')?.value || '';
  const dataFine = document.getElementById('dataFine')?.value || '';
  const sede = document.getElementById('sedeSelect')?.value || '';
  
  handleDirectExport('pdf', {
    employeeId,
    startDate: dataInizio,
    endDate: dataFine,
    sede
  });
}

// Esporta per uso modulare
export default {
  caricaDipendentiDaCalcolo,
  caricaSediDaCalcolo,
  generaReport,
  visualizzaReport,
  pulisciFiltri,
  stampaReport,
  esportaExcel,
  esportaPdf
};

// Esponi le funzioni globalmente per onclick
window.generaReport = generaReport;
window.pulisciFiltri = pulisciFiltri;
window.stampaReport = stampaReport;
window.esportaExcel = esportaExcel;
window.esportaPdf = esportaPdf;