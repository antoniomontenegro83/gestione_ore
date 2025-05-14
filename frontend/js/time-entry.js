/**
 * time-entry.js - Script per l'inserimento turni con calcolo istantaneo
 */
import { Auth, Api, Notifications, Utils } from './main.js';
import AuthCommon from './auth-common.js';
import PreviewCalculator from './modules/preview-calculator.js';
import PreviewRenderer from './modules/preview-renderer.js';

// Variabili globali
let dipendenti = [];
let sedi = [];
let isLoading = false;
let calcoloTimeout = null;

// Istanze dei moduli
const previewRenderer = new PreviewRenderer();

// Inizializzazione al caricamento del DOM
document.addEventListener('DOMContentLoaded', async function() {
  console.log("Time Entry: DOM caricato");
  
  try {
    // Carica dati iniziali
    await Promise.all([
      caricaDipendenti(),
      caricaSedi()
    ]);
    
    // Inizializza il renderer dell'anteprima
    const form = document.getElementById('shift-form');
    previewRenderer.init(form);
    
    // Configura gli eventi
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
  // Form submit
  const form = document.getElementById('shift-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Ricerca dipendenti
  const employeeSearch = document.getElementById('employee-search');
  if (employeeSearch) {
    employeeSearch.addEventListener('input', function(e) {
      const valore = e.target.value;
      if (valore.length >= 3) {
        filtraDipendenti(valore);
      } else if (valore.length === 0) {
        popolaSelectDipendenti();
      }
    });
  }
  
  // Eventi per il calcolo automatico
  const campiTurno = ['entry_date', 'entry_time', 'exit_date', 'exit_time'];
  campiTurno.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.addEventListener('change', () => {
        calcolaAnteprimaConDebounce();
      });
      elemento.addEventListener('input', () => {
        calcolaAnteprimaConDebounce();
      });
    }
  });
}

/**
 * Calcola l'anteprima con debounce
 */
function calcolaAnteprimaConDebounce() {
  if (calcoloTimeout) {
    clearTimeout(calcoloTimeout);
  }
  
  calcoloTimeout = setTimeout(() => {
    calcolaAnteprima();
  }, 300);
}

/**
 * Calcola l'anteprima delle ore
 */
async function calcolaAnteprima() {
  const entryDate = document.getElementById('entry_date')?.value;
  const entryTime = document.getElementById('entry_time')?.value;
  const exitDate = document.getElementById('exit_date')?.value;
  const exitTime = document.getElementById('exit_time')?.value;
  
  if (!entryDate || !entryTime || !exitDate || !exitTime) {
    previewRenderer.mostraVuoto();
    return;
  }
  
  previewRenderer.setLoading(true);
  
  try {
    const datiCalcolo = {
      entry_date: entryDate,
      entry_time: entryTime,
      exit_date: exitDate,
      exit_time: exitTime
    };
    
    // Calcola usando il modulo dedicato
    const risultato = await PreviewCalculator.calcola(datiCalcolo);
    
    // Formatta il risultato
    const risultatoFormattato = PreviewCalculator.formatRisultato(risultato);
    
    // Mostra il risultato
    previewRenderer.mostraRisultato(risultatoFormattato);
    
  } catch (error) {
    console.error("Errore nel calcolo dell'anteprima:", error);
    previewRenderer.mostraErrore(error.message || "Errore di connessione");
  } finally {
    previewRenderer.setLoading(false);
  }
}

/**
 * Filtra i dipendenti
 */
function filtraDipendenti(filtro = '') {
  const filtroLower = filtro.toLowerCase().trim();
  
  const dipendentiFiltrati = dipendenti.filter(d => {
    const testoCompleto = `${d.cognome} ${d.nome} ${d.qualifica || ''} ${d.sede || ''}`.toLowerCase();
    
    if (testoCompleto.includes(filtroLower)) {
      return true;
    }
    
    const parole = filtroLower.split(' ').filter(p => p.length > 0);
    return parole.every(parola => testoCompleto.includes(parola));
  });
  
  popolaSelectDipendenti(dipendentiFiltrati);
  
  if (dipendentiFiltrati.length === 1) {
    const select = document.getElementById('employee_id');
    if (select) {
      select.value = dipendentiFiltrati[0].id;
      calcolaAnteprimaConDebounce();
    }
  }
}

/**
 * Carica i dipendenti
 */
async function caricaDipendenti() {
  try {
    dipendenti = await Api.get("dipendenti/list.php");
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
    const sediData = await Api.get("sedi/list.php");
    sedi = sediData;
    
    const select = document.getElementById('entry_sede');
    if (select) {
      const defaultOption = select.options[0];
      select.innerHTML = '';
      select.appendChild(defaultOption);
      
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
function popolaSelectDipendenti(listaDipendenti = dipendenti) {
  const select = document.getElementById('employee_id');
  if (!select) return;
  
  const defaultOption = select.options[0];
  select.innerHTML = '';
  select.appendChild(defaultOption);
  
  listaDipendenti.sort((a, b) => {
    const cognomeComp = a.cognome.localeCompare(b.cognome);
    return cognomeComp !== 0 ? cognomeComp : a.nome.localeCompare(b.nome);
  });
  
  listaDipendenti.forEach(dip => {
    const option = document.createElement('option');
    option.value = dip.id;
    option.textContent = `${dip.cognome} ${dip.nome} - ${dip.qualifica} - ${dip.sede}`;
    select.appendChild(option);
  });
}

/**
 * Gestisce l'invio del form
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  if (isLoading) return;
  isLoading = true;
  
  try {
    const formData = {
      employee_id: document.getElementById('employee_id').value,
      entry_date: document.getElementById('entry_date').value,
      entry_time: document.getElementById('entry_time').value,
      exit_date: document.getElementById('exit_date').value,
      exit_time: document.getElementById('exit_time').value,
      sede: document.getElementById('entry_sede').value
    };
    
    if (!formData.employee_id) {
      Notifications.warning("Seleziona un dipendente");
      isLoading = false;
      return;
    }
    
    const result = await Api.post("turni/add.php", formData);
    
    if (result.success) {
      Notifications.success("Turno inserito con successo!");
      
      document.getElementById('shift-form').reset();
      previewRenderer.mostraVuoto();
      
      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();
      
    } else {
      Notifications.error("Errore durante l'inserimento: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante l'inserimento:", error);
    Notifications.error("Errore di connessione: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

// Esporta per uso modulare
export default {
  caricaDipendenti,
  caricaSedi,
  filtraDipendenti,
  popolaSelectDipendenti,
  calcolaAnteprima,
  handleSubmit
};