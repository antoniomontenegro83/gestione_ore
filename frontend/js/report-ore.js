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
      caricaDipendenti(),
      caricaSedi()
    ]);
    
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
  // Pulsante Genera
  const generaReportBtn = document.getElementById('generaReportBtn');
  if (generaReportBtn) {
    generaReportBtn.addEventListener('click', generaReport);
  }
  
  // Pulsante Pulisci
  const pulisciFiltriBtn = document.getElementById('pulisciFiltriBtn');
  if (pulisciFiltriBtn) {
    pulisciFiltriBtn.addEventListener('click', pulisciFiltri);
  }
  
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
}

/**
 * Carica i dipendenti
 */
async function caricaDipendenti() {
  try {
    console.log("Caricamento dipendenti...");
    dipendenti = await Api.get("dipendenti/list.php");
    console.log("Dipendenti caricati:", dipendenti.length);
    
    // Popola il select
    popolaSelectDipendenti();
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    throw error;
  }
}

/**
 * Carica le sedi
 */
async function caricaSedi() {
  try {
    console.log("Caricamento sedi...");
    const sediData = await Api.get("sedi/list.php");
    sedi = sediData;
    console.log("Sedi caricate:", sedi.length);
    
    const select = document.getElementById('sedeSelect');
    if (select) {
      // Mantieni l'opzione predefinita
      const defaultOption = select.options[0];
      select.innerHTML = '';
      select.appendChild(defaultOption);
      
      // Aggiungi le sedi
      sedi.forEach(sede => {
        const option = document.createElement('option');
        option.value = sede.nome;
        option.textContent = sede.nome;
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
      option.value = dip.id;
      option.textContent = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ''}`;
      select.appendChild(option);
    });
    
  // Se c'è un solo risultato, selezionalo automaticamente
  if (dipendentiFiltrati.length === 1) {
    select.value = dipendentiFiltrati[0].id;
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
    
    // Carica il preview del report
    const result = await caricaPreviewReport(dataInizio, dataFine, employeeId, sede);
    
    // Visualizza i risultati
    if (result.success) {
      visualizzaReport(result.turni, result.sommario);
    } else {
      throw new Error(result.error || "Errore nel caricamento del report");
    }
    
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
 * Carica il preview del report dal server
 */
async function caricaPreviewReport(startDate, endDate, employeeId = '', sede = '') {
  try {
    // Prepara i parametri per la richiesta
    const params = { startDate, endDate };
    if (employeeId) params.employeeId = employeeId;
    if (sede) params.sede = sede;
    
    // Usa l'API per ottenere il preview
    const result = await Api.get("turni/preview.php", params);
    console.log("Preview caricato:", result.totale_turni, "turni");
    
    return result;
  } catch (error) {
    console.error("Errore nel caricamento del preview:", error);
    throw error;
  }
}

/**
 * Visualizza il report
 */
function visualizzaReport(turni, sommario) {
  const reportContainer = document.getElementById('report-container');
  if (!reportContainer) return;
  
  // Se non ci sono dati
  if (!turni || turni.length === 0) {
    reportContainer.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-exclamation-circle" style="font-size: 3rem;"></i>
        <p class="mt-3">Nessun dato disponibile per i filtri selezionati</p>
      </div>
    `;
    return;
  }
  
  // Costruisci la tabella
  let tableHTML = `
    <div class="mb-4">
      <h5>Riepilogo Ore</h5>
      <div class="row">
        <div class="col-md-6">
          <table class="table table-sm">
            <tbody>
              <tr>
                <td>Ore Feriali Diurne:</td>
                <td class="text-end"><strong>${sommario.feriali_diurne.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Ore Feriali Notturne:</td>
                <td class="text-end"><strong>${sommario.feriali_notturne.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Ore Festive Diurne:</td>
                <td class="text-end"><strong>${sommario.festive_diurne.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Ore Festive Notturne:</td>
                <td class="text-end"><strong>${sommario.festive_notturne.toFixed(2)}</strong></td>
              </tr>
              <tr class="table-info">
                <td><strong>Totale Ore:</strong></td>
                <td class="text-end"><strong>${sommario.totale_ore.toFixed(2)}</strong></td>
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
  
  // Aggiungi le righe
  turni.forEach(turno => {
    const feriali_diurne = parseFloat(turno.feriali_diurne) || 0;
    const feriali_notturne = parseFloat(turno.feriali_notturne) || 0;
    const festive_diurne = parseFloat(turno.festive_diurne) || 0;
    const festive_notturne = parseFloat(turno.festive_notturne) || 0;
    const totale_ore = parseFloat(turno.totale_ore) || 0;
    
    tableHTML += `
      <tr>
        <td>${turno.cognome} ${turno.nome}</td>
        <td>${turno.qualifica || '-'}</td>
        <td>${turno.sede || '-'}</td>
        <td>${Utils.formatDate(turno.entry_date)}</td>
        <td>${turno.entry_time.substring(0, 5)}</td>
        <td>${turno.exit_time.substring(0, 5)}</td>
        <td class="text-center">${feriali_diurne.toFixed(2)}</td>
        <td class="text-center">${feriali_notturne.toFixed(2)}</td>
        <td class="text-center">${festive_diurne.toFixed(2)}</td>
        <td class="text-center">${festive_notturne.toFixed(2)}</td>
        <td class="text-center"><strong>${totale_ore.toFixed(2)}</strong></td>
      </tr>
    `;
  });
  
  // Aggiungi i totali
  tableHTML += `
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
  
  reportContainer.innerHTML = tableHTML;
}

/**
 * Pulisce i filtri
 */
function pulisciFiltri() {
  const dipendenteSearch = document.getElementById('dipendenteSearch');
  const dipendenteSelect = document.getElementById('dipendenteSelect');
  const sedeSelect = document.getElementById('sedeSelect');
  const formatoSelect = document.getElementById('formatoSelect');
  const meseSelezionato = document.getElementById('meseSelezionato');
  const dataInizio = document.getElementById('dataInizio');
  const dataFine = document.getElementById('dataFine');
  
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
  generaReport,
  visualizzaReport,
  pulisciFiltri,
  stampaReport,
  esportaExcel,
  esportaPdf
};

// Esponi le funzioni per onclick
window.generaReport = generaReport;
window.pulisciFiltri = pulisciFiltri;
window.stampaReport = stampaReport;
window.esportaExcel = esportaExcel;
window.esportaPdf = esportaPdf;