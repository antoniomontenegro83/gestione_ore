/**
 * Script per la gestione dei turni di lavoro
 * Questo file gestisce le funzionalità dell'inserimento turni
 */
import { Auth, Api, Notifications, Utils } from './main.js';
import AuthCommon from './auth-common.js';

// Array per memorizzare i dipendenti caricati
let dipendenti = [];

document.addEventListener("DOMContentLoaded", function () {
  console.log("TimeEntry: DOM caricato");
  
  // Inizializzazione dell'interfaccia utente
  initUI();
  
  // Caricamento dati iniziali
  caricaDipendenti();
  caricaSedi();
  setTodayDate();
  
  // Configurazione event listeners
  setupEventListeners();
});

/**
 * Inizializza l'interfaccia utente con i dati dell'utente corrente
 */
function initUI() {
  // Visualizza il ruolo dell'utente
  const currentUser = Auth.getCurrentUser();
  const userRoleDisplay = document.getElementById('userRoleDisplay');
  if (userRoleDisplay) {
    userRoleDisplay.textContent = currentUser.ruolo || 'user';
  }
  
  // Inizializza il div di stato come vuoto
  clearStatus();
}

/**
 * Configura gli event listeners per gli elementi della pagina
 */
function setupEventListeners() {
  // Gestione invio form
  const shiftForm = document.getElementById("shift-form");
  if (shiftForm) {
    shiftForm.addEventListener("submit", handleFormSubmit);
  }
}

/**
 * Carica l'elenco dei dipendenti dal server
 */
async function caricaDipendenti() {
  try {
    console.log("Caricamento dipendenti...");
    // Usa il percorso specifico per il file list.php nella cartella dipendenti
    dipendenti = await Api.get("dipendenti/list.php");
    console.log("Dipendenti caricati:", dipendenti.length);
    
    aggiornaSelect("");
    
    // Configura il filtro di ricerca dipendenti
    const searchInput = document.getElementById("employee-search");
    if (searchInput) {
      searchInput.addEventListener("input", function(e) {
        aggiornaSelect(e.target.value);
      });
    }
  } catch (err) {
    console.error("Errore nel caricamento dipendenti:", err);
    updateStatus("Impossibile caricare l'elenco dei dipendenti: " + Api.handleError(err), "danger");
  }
}

/**
 * Aggiorna il select dei dipendenti in base al filtro di ricerca
 * @param {string} filtro - Testo di ricerca
 */
function aggiornaSelect(filtro) {
  const select = document.getElementById("employee_id");
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Seleziona --</option>';

  if (filtro.length > 0 && filtro.length < 3) return;

  const filtroLower = filtro.toLowerCase();
  const risultati = dipendenti.filter(function(emp) {
    const descrizione = emp.cognome + " " + emp.nome + " – " + (emp.qualifica || "") + " – " + (emp.sede || "");
    return descrizione.toLowerCase().includes(filtroLower);
  });

  risultati.forEach(function(emp) {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.cognome + " " + emp.nome + " – " + (emp.qualifica || "") + " – " + (emp.sede || "");
    select.appendChild(opt);
  });

  // Seleziona automaticamente se c'è un solo risultato
  if (risultati.length === 1) {
    select.value = risultati[0].id;
  }
}

/**
 * Carica l'elenco delle sedi dal server
 */
async function caricaSedi() {
  try {
    console.log("Caricamento sedi...");
    // Usa l'API per ottenere le sedi
    const sedi = await Api.get("sedi/list.php");
    console.log("Sedi caricate:", sedi.length);
    
    const select = document.getElementById("entry_sede");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Facoltativa --</option>';
    
    sedi.forEach(function(s) {
      const opt = document.createElement("option");
      opt.value = s.nome;
      opt.textContent = s.nome;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Errore nel caricamento sedi:", err);
    updateStatus("Impossibile caricare l'elenco delle sedi. Le funzionalità del form potrebbero essere limitate.", "warning");
  }
}

/**
 * Imposta la data odierna nei campi data
 */
function setTodayDate() {
  const today = Utils.getTodayDate();
  
  const entryDateInput = document.getElementById('entry_date');
  const exitDateInput = document.getElementById('exit_date');
  
  if (entryDateInput) entryDateInput.value = today;
  if (exitDateInput) exitDateInput.value = today;
}

/**
 * Gestisce l'invio del form con validazioni aggiuntive
 * @param {Event} e - Evento submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Ottieni i valori dal form
  const employeeId = document.getElementById('employee_id').value;
  const entryDate = document.getElementById('entry_date').value;
  const entryTime = document.getElementById('entry_time').value;
  const exitDate = document.getElementById('exit_date').value;
  const exitTime = document.getElementById('exit_time').value;
  
  // Pulisci eventuali messaggi di stato precedenti
  clearStatus();
  
  // Validazione campi obbligatori
  if (!employeeId || !entryDate || !entryTime || !exitDate || !exitTime) {
    updateStatus("Errore: Tutti i campi sono obbligatori", "danger");
    return;
  }
  
  // Validazione data/ora
  const entryDateTime = new Date(`${entryDate}T${entryTime}`);
  const exitDateTime = new Date(`${exitDate}T${exitTime}`);
  
  if (isNaN(entryDateTime.getTime()) || isNaN(exitDateTime.getTime())) {
    updateStatus("Errore: Date o orari non validi", "danger");
    return;
  }
  
  // Confronto solo le date (senza considerare l'ora)
  const entryDateOnly = new Date(entryDate);
  const exitDateOnly = new Date(exitDate);
  
  if (exitDateOnly < entryDateOnly) {
    updateStatus("Errore: La data di uscita deve essere uguale o successiva alla data di ingresso", "danger");
    return;
  }
  
  // Confronto data e ora insieme
  if (exitDateTime <= entryDateTime) {
    updateStatus("Errore: L'orario di uscita deve essere successivo all'orario di ingresso", "danger");
    return;
  }
  
  // Verifica durata minima (es. 30 minuti)
  const diffMinutes = Utils.getMinutesDiff(entryDateTime, exitDateTime);
  if (diffMinutes < 30) {
    updateStatus("Errore: La durata del turno deve essere di almeno 30 minuti", "danger");
    return;
  }
  
  // Preparazione dati per l'invio
  const shift = {
    employee_id: employeeId,
    entry_date: entryDate,
    entry_time: entryTime,
    exit_date: exitDate,
    exit_time: exitTime
  };
  
  // Visualizzazione stato di invio
  updateStatus("Invio in corso...", "info");
  
  try {
    console.log("Invio dati turno:", shift);
    // Usa l'API per inviare i dati
    const result = await Api.post("turni/add.php", shift);
    
    if (result.success) {
      // Pulisci il messaggio "Invio in corso..."
      clearStatus();
      
      // Mostra il modale di successo invece di un alert
      showSuccessModal();
      resetForm();
    } else {
      // Gestione migliorata dei messaggi di errore dal server
      const errorMsg = result.error || "Errore sconosciuto";
      let userMessage = "Errore nell'inserimento: " + errorMsg;
      
      // Messaggi personalizzati per errori specifici
      if (errorMsg.includes("La data/ora di uscita deve essere successiva")) {
        userMessage = "Errore di validazione: " + errorMsg;
      } else if (errorMsg.includes("Esiste già un turno")) {
        userMessage = "Errore: " + errorMsg;
      }
      
      updateStatus(userMessage, "danger");
    }
  } catch (error) {
    console.error('Errore:', error);
    updateStatus("Errore durante il salvataggio: " + Api.handleError(error), "danger");
  }
}

/**
 * Mostra il modale di successo
 */
function showSuccessModal() {
  const successModalElement = document.getElementById('successModal');
  if (!successModalElement) return;
  
  const successModal = new bootstrap.Modal(successModalElement);
  successModal.show();
  
  // Quando il modale viene chiuso, pulisci lo stato
  successModalElement.addEventListener('hidden.bs.modal', function () {
    clearStatus();
  });
}

/**
 * Aggiorna il messaggio di stato
 * @param {string} message - Messaggio da visualizzare
 * @param {string} type - Tipo di messaggio (success, danger, info, warning)
 */
function updateStatus(message, type) {
  const statusElement = document.getElementById('status');
  if (!statusElement) return;
  
  statusElement.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${message}</div>`;
}

/**
 * Pulisce il messaggio di stato
 */
function clearStatus() {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.innerHTML = '';
  }
}

/**
 * Resetta il form dopo un invio riuscito
 */
function resetForm() {
  const searchInput = document.getElementById('employee-search');
  const employeeSelect = document.getElementById('employee_id');
  const entryTimeInput = document.getElementById('entry_time');
  const exitTimeInput = document.getElementById('exit_time');
  
  if (searchInput) searchInput.value = "";
  if (employeeSelect) employeeSelect.selectedIndex = 0;
  if (entryTimeInput) entryTimeInput.value = "";
  if (exitTimeInput) exitTimeInput.value = "";
  
  setTodayDate();
}

// Esporta per uso modulare
export default {
  caricaDipendenti,
  caricaSedi,
  handleFormSubmit,
  showSuccessModal,
  setTodayDate
};

// Esponi le funzioni per l'utilizzo nell'HTML
window.handleFormSubmit = handleFormSubmit;
window.showSuccessModal = showSuccessModal;
window.caricaDipendenti = caricaDipendenti;
window.caricaSedi = caricaSedi;
window.setTodayDate
window.handleFormSubmit = handleFormSubmit;
window.showSuccessModal = showSuccessModal;
window.caricaDipendenti = caricaDipendenti;
window.caricaSedi = caricaSedi;
window.setTodayDate = setTodayDate;
window.aggiornaSelect = aggiornaSelect;
window.updateStatus = updateStatus;
window.clearStatus = clearStatus;
window.resetForm = resetForm;